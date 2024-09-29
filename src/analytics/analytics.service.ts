import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SCK_NATS_SERVICE } from 'src/config';
import { DataSourceInterface, handleExceptions, ProcessedDataInterface } from 'src/common';
import { CreateProcessedDataDto, DataAnalysisDto, ProcessDataDto } from './dto';
import { RawDataPriority, SourceType, ValidationStatus } from './enums/data.enum';
import { PrismaClient, SourceTypes } from '@prisma/client';
import { getProcessedData } from 'src/common/helpers/processData';
import { sum } from 'simple-statistics';
import { ProcessedDataToAnalysisInterface, LastRegisterInterface, DataAnalysisInterface } from 'src/common/interfaces';
import { calculateAverageDailyUsed, calculateAverageTimeBetweenPurchases, calculateDaysSinceLastPurchase, detectUsedTrend, getRecommendation } from 'src/common/helpers';

@Injectable()
export class AnalyticsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AnalyticsService');

  constructor(@Inject(SCK_NATS_SERVICE) private readonly client: ClientProxy) {
    super()
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Data Analytics DB connected')
  }

  async processData(processDataDto: ProcessDataDto) {
    const { validationResultId, rawDataId, validatedData, priority } = processDataDto;
    try {
      const rawData = await firstValueFrom(this.client.send({ cmd: 'findOneRawData' }, { id: rawDataId }))
      const dataSource: DataSourceInterface = rawData.dataSource;
      const processedData: ProcessedDataInterface = await getProcessedData(dataSource, validatedData)
      console.log({ processedData })
      const id = await this.createProcessedData(rawDataId, dataSource, priority, processedData)

      this.client.emit('update.validationResult.status', { id: validationResultId, status: ValidationStatus.PROCESSED })
      this.emitDataAnalysis(id, dataSource, processedData)
      return;
    } catch (error) {
      this.client.emit('update.validationResult.status', { id: validationResultId, status: ValidationStatus.NOT_PROCESSED })
      handleExceptions(error, this.logger)
    }
  }

  async runAnalysis(dataAnalysisDto: DataAnalysisDto) {
    const { materialID, materialName, processedDate, dataSource, processedDataId } = dataAnalysisDto;
    const totalData: ProcessedDataToAnalysisInterface[] = await this.findManyProcessedData(materialID)
    const lastRegister: LastRegisterInterface = await this.findLastRegister(materialID);
    const dataToAnalyze: DataAnalysisInterface = {
      totalQuantityUsed: lastRegister?.totalQuantityUsed || 0,
      totalQuantityPurchased: lastRegister?.totalQuantityPurchased || 0,
      lastPurchasedDate: lastRegister?.lastPurchasedDate || null,
      avgDailyUsed: lastRegister?.avgDailyUsed || 0,
      usedTrend: lastRegister?.usedTrend || 'Not enough data to calculate trend',
      avgTimeBetweenPurchases: lastRegister?.avgTimeBetweenPurchases || 0,
      recommendation: lastRegister?.recommendation || '',
      daysSinceLastPurchase: lastRegister?.daysSinceLastPurchase || null,
    }
    let prevLastPurchasedDate: Date;

    switch (dataSource) {
      case SourceType.MANUAL:
        prevLastPurchasedDate = dataToAnalyze.lastPurchasedDate;
        dataToAnalyze.totalQuantityPurchased = await this.calculateTotalQuantity(materialID, dataSource);
        dataToAnalyze.lastPurchasedDate = await this.findLastPurchasedDate(materialID);
        dataToAnalyze.avgTimeBetweenPurchases = calculateAverageTimeBetweenPurchases(totalData);
        dataToAnalyze.daysSinceLastPurchase = !!prevLastPurchasedDate ? calculateDaysSinceLastPurchase(prevLastPurchasedDate, dataToAnalyze.lastPurchasedDate) : 0;
        break;
      case SourceType.MES:
        prevLastPurchasedDate = dataToAnalyze.lastPurchasedDate;
        dataToAnalyze.totalQuantityUsed = await this.calculateTotalQuantity(materialID, dataSource);
        dataToAnalyze.avgDailyUsed = calculateAverageDailyUsed(totalData, dataToAnalyze.totalQuantityUsed)
        dataToAnalyze.usedTrend = detectUsedTrend(totalData);
        dataToAnalyze.recommendation = getRecommendation(dataToAnalyze.usedTrend, dataToAnalyze.avgDailyUsed);
        dataToAnalyze.daysSinceLastPurchase = !!prevLastPurchasedDate ? calculateDaysSinceLastPurchase(prevLastPurchasedDate, processedDate) : 0;
        break;
      case SourceType.PROJECT:
        prevLastPurchasedDate = dataToAnalyze.lastPurchasedDate;
        dataToAnalyze.totalQuantityUsed = await this.calculateTotalQuantity(materialID, dataSource);
        dataToAnalyze.avgDailyUsed = calculateAverageDailyUsed(totalData, dataToAnalyze.totalQuantityUsed)
        dataToAnalyze.usedTrend = detectUsedTrend(totalData);
        dataToAnalyze.recommendation = getRecommendation(dataToAnalyze.usedTrend, dataToAnalyze.avgDailyUsed);
        dataToAnalyze.daysSinceLastPurchase = !!prevLastPurchasedDate ? calculateDaysSinceLastPurchase(prevLastPurchasedDate, processedDate) : 0;
        break;
      default:
        break;
    }

    await this.createDataAnalytics(materialID, materialName, processedDate, processedDataId, dataToAnalyze);
    this.client.emit('generate.prediction', { materialID, dataToAnalyze })
  }


  private async calculateTotalQuantity(materialID: string, dataSource: SourceTypes): Promise<number> {
    try {
      const sourceTypes = (dataSource === SourceType.MANUAL) ? [SourceType.MANUAL] : [SourceType.MES, SourceType.PROJECT]
      const quantity = await this.processedData.aggregate({
        _sum: { processedQuantity: true },
        where: { materialID, sourceType: { in: sourceTypes } }
      })

      return quantity._sum.processedQuantity;
      // const totalquantity = sum(quantity.map((data) => data.processedQuantity))
    } catch (error) {
      handleExceptions(error, this.logger)
    }
  }

  private async findLastRegister(materialID: string): Promise<LastRegisterInterface> {
    try {
      return await this.dataAnalytics.findFirst({
        where: { materialID: materialID },
        orderBy: { analysisDate: 'desc' },
        select: {
          totalQuantityUsed: true,
          totalQuantityPurchased: true,
          lastPurchasedDate: true,
          avgDailyUsed: true,
          usedTrend: true,
          avgTimeBetweenPurchases: true,
          recommendation: true,
          daysSinceLastPurchase: true,
        }
      })
    } catch (error) {
      handleExceptions(error, this.logger)
    }
  }

  private async findManyProcessedData(materialID: string): Promise<ProcessedDataToAnalysisInterface[]> {
    try {
      return await this.processedData.findMany({
        where: { materialID },
        orderBy: { processedDate: 'desc' },
        select: { id: true, sourceType: true, materialID: true, processedQuantity: true, processedDate: true }
      })
    } catch (error) {
      handleExceptions(error, this.logger)
    }
  }

  private async findLastPurchasedDate(materialID: string): Promise<Date> {
    try {
      const lastPurchased = await this.processedData.findFirst({
        where: { materialID },
        orderBy: { processedDate: 'desc' },
        select: { processedDate: true }
      })
      const lastPurchasedDate = lastPurchased.processedDate;
      return lastPurchasedDate
    } catch (error) {
      handleExceptions(error, this.logger)
    }
  }

  private async createDataAnalytics(materialID: string, materialName: string, processedDate: Date, processedDataId: string, dataToAnalyze: DataAnalysisInterface): Promise<void> {
    try {
      await this.dataAnalytics.create({
        data: {
          materialID,
          materialName,
          processedDate,
          ...dataToAnalyze,
          processedData: {
            connect: { id: processedDataId }
          }
        }
      })
    } catch (error) {
      handleExceptions(error, this.logger)
    }
  }

  private async createProcessedData(rawDataId: string, dataSource: DataSourceInterface, priority: RawDataPriority, processedData: ProcessedDataInterface): Promise<string> {
    try {
      const { id } = await this.processedData.create({
        data: {
          rawDataId,
          sourceType: dataSource.sourceType,
          priority,
          ...processedData,
        },
        select: {
          id: true,
        }
      })
      return id;
    } catch (error) {
      handleExceptions(error, this.logger)
    }
  }

  private emitDataAnalysis(id: string, dataSource: DataSourceInterface, processedData: ProcessedDataInterface) {
    try {
      this.client.emit('dataAnalysis', {
        processedDataId: id,
        dataSource: dataSource.sourceType,
        materialID: processedData.materialID,
        materialName: processedData.materialName,
        processedDate: processedData.processedDate,
      });
    } catch (error) {
      handleExceptions(error, this.logger)
    }
  }

















}
