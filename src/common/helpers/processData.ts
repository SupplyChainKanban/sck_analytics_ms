import { CreateProcessedDataDto } from "src/analytics/dto"
import { DataSourceInterface, ProcessedDataInterface } from "../interfaces/externalInterfaces"
import { SourceType } from "src/analytics/enums/data.enum";

export const getProcessedData = async (dataSource: DataSourceInterface, validatedData: CreateProcessedDataDto) => {
    let processedData: ProcessedDataInterface;

    switch (dataSource.sourceType) {
        case SourceType.MANUAL:
            processedData = await processManualData(validatedData);
            break;
        case SourceType.MES:
            processedData = await processMesData(validatedData);
            break;
        case SourceType.PROJECT:
            processedData = await processProjectData(validatedData);
            break;
        default:
            console.log('There is no a correct sourceType')
            break;
    }

    return processedData;
}

const processManualData = async (manualData: CreateProcessedDataDto): Promise<ProcessedDataInterface> => {
    const { materialID, materialName, materialCategory, purchaseQuantity, purchaseDate, purchaseID, purchaseLocation, supplierName, paymentMethod } = manualData
    const processedDate = purchaseDate.split('/');

    const manualDataProcessed: ProcessedDataInterface = {
        materialID,
        materialCategory,
        materialName,
        processedQuantity: purchaseQuantity,
        processedDate: new Date(+processedDate[2], +processedDate[1] - 1, +processedDate[0]),
        purchaseID,
    }

    return manualDataProcessed
}

const processMesData = async (mesData: CreateProcessedDataDto): Promise<ProcessedDataInterface> => {
    const { materialID, materialName, materialCategory, materialQuantity, consumptionDate, remainingStock, unitOfMeasure, lotNumber, supplierLotNumber } = mesData
    const processedDate = consumptionDate.split('/');


    const mesDataProcessed: ProcessedDataInterface = {
        materialID,
        materialCategory,
        materialName,
        processedQuantity: materialQuantity,
        processedDate: new Date(+processedDate[2], +processedDate[1] - 1, +processedDate[0]),
        remainingStock,
        unitOfMeasure,
    }

    return mesDataProcessed;
}

const processProjectData = async (projectData: CreateProcessedDataDto): Promise<ProcessedDataInterface> => {
    const { materialID, materialUsed, materialCategory, usedQuantity, usageDate, projectID, costPerUnit, budgetAllocated } = projectData
    const processedDate = usageDate.split('/');

    const projectDataProcessed: ProcessedDataInterface = {
        materialID,
        materialCategory,
        materialName: materialUsed,
        processedQuantity: usedQuantity,
        processedDate: new Date(+processedDate[2], +processedDate[1] - 1, +processedDate[0]),
        costPerUnit,
        projectID,
        budgetAllocated,
    }

    return projectDataProcessed;
}