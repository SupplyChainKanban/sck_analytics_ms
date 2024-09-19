import { SourceType } from "src/analytics/enums/data.enum";

export interface DataSourceInterface {
    "name": string,
    "description": string,
    "sourceType": SourceType
}

export interface ProcessedDataInterface {
    materialID: number,
    materialCategory: string,
    materialName: string,
    processedQuantity: number, //* Cantidad procesada: Comprada o consumida
    processedDate: Date, //* Fecha de compra o de consumo de material

    purchaseID?: number,
    remainingStock?: number,
    unitOfMeasure?: string,
    costPerUnit?: number,
    projectID?: number,
    budgetAllocated?: number,
}
