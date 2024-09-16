import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { SCK_NATS_SERVICE } from 'src/config';
import { DataSourceInterface, ManualDataInterface, MesDataInterface, ProjectDataInterface } from 'src/common';
import { DataAnalysisDto, ProcessDataDto } from './dto';
import { SourceType } from './enums/data.enum';

@Injectable()
export class AnalyticsService {

  constructor(
    @Inject(SCK_NATS_SERVICE) private readonly client: ClientProxy
  ) {

  }

  async processData(processDataDto: ProcessDataDto) {
    const { rawDataId, validatedData, priority } = processDataDto;
    const rawData = await firstValueFrom(this.client.send({ cmd: 'findOneRawData' }, { id: rawDataId }))
    const dataSource: DataSourceInterface = rawData.dataSource;

    switch (dataSource.sourceType) {
      case SourceType.MANUAL:
        const processedManualData = await this.processManualData(validatedData as ManualDataInterface);
        console.log('Entré a Manual')
        break;
      case SourceType.MES:
        const processedMesData = await this.processMesData(validatedData as MesDataInterface);
        console.log('Entré a Mes')
        break;
      case SourceType.PROJECT:
        const processedProjectData = await this.processProjectData(validatedData as ProjectDataInterface);
        console.log('Entré a Project')
        break;
      default:
        console.log('No entré a ninguno')
        break;
    }




    // console.log(rawData.dataSource.sourceType)


    //Me van a enviar el rawDataId, el payload y 
    // id, rawId, materialId, materialName, processedQuantity, processedDate, avgConsumption{}, lastUpdate
    //** budgetAllocated, costPerUnit, materialCategory, usageDate, materialUsed, materialID, usedQuantity, projectID
    //** remainingStock, supplierLotNumber, materialQuantity, lotNumber, consumptionDate, materialName, unitOfMeasure
    //** supplierName, purchaseDate, purchaseLocation, purchaseID, paymentMethod, purchaseQuantity




    return processDataDto;
  }

  private async processManualData(manualData: ManualDataInterface): Promise<any> {
    const { materialID, materialName, materialCategory, purchaseQuantity, purchaseDate, purchaseID, purchaseLocation, supplierName, paymentMethod } = manualData


    // return mesDataInterface;
  }

  private async processMesData(mesData: MesDataInterface): Promise<any> {
    const { materialID, materialName, materialCategory, materialQuantity, consumptionDate, remainingStock, unitOfMeasure, lotNumber, supplierLotNumber } = mesData



  }

  private async processProjectData(projectData: ProjectDataInterface): Promise<any> {
    const { materialID, materialUsed, materialCategory, usedQuantity, usageDate, projectID, costPerUnit, budgetAllocated } = projectData

  }

  runAnalysis(dataAnalysisDto: DataAnalysisDto) {
    return dataAnalysisDto;
  }

}
