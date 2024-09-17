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
      this.client.emit('dataAnalysis', { processedDataId: id, dataSource: dataSource.sourceType, materialID: validatedData.materialID });
      return;
    } catch (error) {
      this.client.emit('update.validationResult.status', { id: validationResultId, status: ValidationStatus.NOT_PROCESSED })
      handleExceptions(error, this.logger)
    }
  }

  async runAnalysis(dataAnalysisDto: DataAnalysisDto) {
    console.log({ dataAnalysisDto })
    const { materialID, dataSource, processedDataId } = dataAnalysisDto;
    let trend: string;
    let totalPurchases: number | null = null;

    //* 1. Consultar el último registro del material ID ordenado por processedDate y extraer totalUsed, total_purchased, lastPurchasedDate por ahora


    //* 2. Dependiendo de la fuente, se va a construir la nueva entrada. 
    //* Si es la fuente manual, se calculará las compras, osea los purchasesquantity, y se actualiza el lastPurchasedDate, el resto se deja igual
    //* Si es la fuente MES, se calculará el totalUsado y nada más por ahora.
    //* Si es la fuente PROJECT, se calculará el total el totalusado y nada más por ahora
    switch (dataSource) {
      case SourceType.MANUAL:
        totalPurchases = await this.calculateTotalQuantity(materialID, dataSource);

        break;
      case SourceType.MES:

        break;
      case SourceType.PROJECT:

        break;
      default:
        break;
    }

    //* 3. Se creará el registro de la tabla de DataAnalysis

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
    console.log({ quantity })
    // const totalquantity = sum(quantity.map((data) => data.processedQuantity))
    return quantity._sum.processedQuantity;
  }
}
