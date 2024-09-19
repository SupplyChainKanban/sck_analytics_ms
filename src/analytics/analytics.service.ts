import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SCK_NATS_SERVICE } from 'src/config';
import { DataSourceInterface, handleExceptions, ManualDataInterface, MesDataInterface, ProcessedData, ProjectDataInterface } from 'src/common';
import { CreateProcessedDataDto, DataAnalysisDto, ProcessDataDto } from './dto';
import { SourceType, ValidationStatus } from './enums/data.enum';
import { PrismaClient, SourceTypes } from '@prisma/client';
import { getProcessedData } from 'src/common/helpers/processData';
import { sum } from 'simple-statistics';
import { ProcessedDataToAnalysisInterface } from 'src/common/interfaces';
import { calculateAverageDailyUsed, calculateAverageTimeBetweenPurchases, detectUsedTrend } from 'src/common/helpers';

@Injectable()
export class AnalyticsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AnalyticsService');

  constructor(
    @Inject(SCK_NATS_SERVICE) private readonly client: ClientProxy
  ) {
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
      const processedData: ProcessedData = await getProcessedData(dataSource, validatedData)

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

      this.client.emit('update.validationResult.status', { id: validationResultId, status: ValidationStatus.PROCESSED })
      this.client.emit('dataAnalysis', {
        processedDataId: id,
        dataSource: dataSource.sourceType,
        materialID: processedData.materialID,
        materialName: processedData.materialName,
        processedDate: processedData.processedDate,
      });
      return;
    } catch (error) {
      this.client.emit('update.validationResult.status', { id: validationResultId, status: ValidationStatus.NOT_PROCESSED })
      handleExceptions(error, this.logger)
    }
  }

  async runAnalysis(dataAnalysisDto: DataAnalysisDto) {
    const { materialID, materialName, processedDate, dataSource, processedDataId } = dataAnalysisDto;

    const lastRegister = await this.dataAnalytics.findFirst({
      where: {
        materialID: materialID,
      },
      orderBy: {
        processedDate: 'desc'
      },
      select: {
        totalQuantityUsed: true,
        totalQuantityPurchased: true,
        lastPurchasedDate: true,
        avgDailyUsed: true,
        usedTrend: true,
        avgTimeBetweenPurchases: true,
      }
    })
    console.log({ lastRegister });
    let totalQuantityUsed: number = lastRegister?.totalQuantityUsed || 0;
    let totalQuantityPurchased: number = lastRegister?.totalQuantityPurchased || 0;
    let lastPurchasedDate: Date | null = lastRegister?.lastPurchasedDate || null;
    let avgDailyUsed: number = lastRegister?.avgDailyUsed || 0;
    let usedTrend: string | null = lastRegister?.usedTrend || null;
    let avgTimeBetweenPurchases: number = lastRegister?.avgTimeBetweenPurchases || 0;


    console.log({ totalQuantityUsed, totalQuantityPurchased, lastPurchasedDate, avgDailyUsed, usedTrend, avgTimeBetweenPurchases });

    //* 1. Obtener los registros históricos del material
    const totalData: ProcessedDataToAnalysisInterface[] = await this.processedData.findMany({
      where: { materialID },
      orderBy: { processedDate: 'desc' },
      select: { id: true, sourceType: true, materialID: true, processedQuantity: true, processedDate: true }
    })

    //* 5. 

    switch (dataSource) {
      case SourceType.MANUAL:
        totalQuantityPurchased = await this.calculateTotalQuantity(materialID, dataSource);
        lastPurchasedDate = (await this.processedData.findFirst({
          where: { materialID },
          orderBy: { processedDate: 'desc' },
          select: { processedDate: true }
        })).processedDate
        //* 4. Calcular la frecuencia promedio de compras 
        avgTimeBetweenPurchases = calculateAverageTimeBetweenPurchases(totalData);
        console.log({ avgTimeBetweenPurchases })
        break;
      case SourceType.MES:
        totalQuantityUsed = await this.calculateTotalQuantity(materialID, dataSource);
        //* 2. Calcular el consumo promedio diario
        avgDailyUsed = calculateAverageDailyUsed(totalData, totalQuantityUsed)

        //* 3. Calcular la tendencia de consumo
        usedTrend = detectUsedTrend(totalData);

        break;
      case SourceType.PROJECT:
        totalQuantityUsed = await this.calculateTotalQuantity(materialID, dataSource);
        //* 2. Calcular el consumo promedio diario
        avgDailyUsed = calculateAverageDailyUsed(totalData, totalQuantityUsed)
        //* 3. Calcular la tendencia de consumo
        usedTrend = detectUsedTrend(totalData);

        break;
      default:
        break;
    }

    console.log({ totalQuantityUsed, totalQuantityPurchased, lastPurchasedDate, avgDailyUsed, usedTrend, avgTimeBetweenPurchases });
    //* 3. Se creará el registro de la tabla de DataAnalysis
    await this.dataAnalytics.create({
      data: {
        materialID,
        materialName,
        processedDate,


        totalQuantityUsed,
        totalQuantityPurchased,
        lastPurchasedDate,
        avgDailyUsed,
        usedTrend,

        processedData: {
          connect: {
            id: processedDataId,
          }
        }
      }
    })

    //* 4. Se enviará el emit para poder realizar la predicción dándole las variables necesarias para poder realizar la predicción





    return dataAnalysisDto;
  }


  //* Cálculo de la cantidad comprada
  private async calculateTotalQuantity(materialID: number, dataSource: SourceTypes): Promise<number> {
    const quantity = await this.processedData.aggregate({
      _sum: {
        processedQuantity: true,
      },
      where: { materialID, sourceType: dataSource }
    })
    // const totalquantity = sum(quantity.map((data) => data.processedQuantity))
    return quantity._sum.processedQuantity;
  }
























}
