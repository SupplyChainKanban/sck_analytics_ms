import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SCK_NATS_SERVICE } from 'src/config';
import { DataSourceInterface, handleExceptions, ManualDataInterface, MesDataInterface, ProcessedData, ProjectDataInterface } from 'src/common';
import { CreateProcessedDataDto, DataAnalysisDto, ProcessDataDto } from './dto';
import { SourceType, ValidationStatus } from './enums/data.enum';
import { PrismaClient } from '@prisma/client';

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
      let processedData: ProcessedData;

      switch (dataSource.sourceType) {
        case SourceType.MANUAL:
          processedData = await this.processManualData(validatedData);
          break;
        case SourceType.MES:
          processedData = await this.processMesData(validatedData);
          break;
        case SourceType.PROJECT:
          processedData = await this.processProjectData(validatedData);
          break;
        default:
          console.log('There is no a correct sourceType')
          break;
      }

      await this.processedData.create({
        data: {
          rawDataId,
          sourceType: dataSource.sourceType,
          priority,
          ...processedData,
        }
      })
      this.client.emit('update.validationResult.status', { id: validationResultId, status: ValidationStatus.PROCESSED })
    } catch (error) {
      this.client.emit('update.validationResult.status', { id: validationResultId, status: ValidationStatus.NOT_PROCESSED })
      handleExceptions(error, this.logger)
    }
    //TODO: Emitir una solicitud para análisis
    return;
  }

  private async processManualData(manualData: CreateProcessedDataDto): Promise<ProcessedData> {
    const { materialID, materialName, materialCategory, purchaseQuantity, purchaseDate, purchaseID, purchaseLocation, supplierName, paymentMethod } = manualData

    const manualDataProcessed: ProcessedData = {
      materialID,
      materialCategory,
      materialName,
      processedQuantity: purchaseQuantity,
      processedDate: new Date(purchaseDate),
      purchaseID,
    }

    return manualDataProcessed
  }

  private async processMesData(mesData: CreateProcessedDataDto): Promise<ProcessedData> {
    const { materialID, materialName, materialCategory, materialQuantity, consumptionDate, remainingStock, unitOfMeasure, lotNumber, supplierLotNumber } = mesData

    const mesDataProcessed: ProcessedData = {
      materialID,
      materialCategory,
      materialName,
      processedQuantity: materialQuantity,
      processedDate: new Date(consumptionDate),
      remainingStock,
      unitOfMeasure,
    }

    return mesDataProcessed;
  }

  private async processProjectData(projectData: CreateProcessedDataDto): Promise<ProcessedData> {
    const { materialID, materialUsed, materialCategory, usedQuantity, usageDate, projectID, costPerUnit, budgetAllocated } = projectData

    const projectDataProcessed: ProcessedData = {
      materialID,
      materialCategory,
      materialName: materialUsed,
      processedQuantity: usedQuantity,
      processedDate: new Date(usageDate),
      costPerUnit,
      projectID,
      budgetAllocated,
    }

    return projectDataProcessed;
  }

  runAnalysis(dataAnalysisDto: DataAnalysisDto) {
    return dataAnalysisDto;
  }
}
