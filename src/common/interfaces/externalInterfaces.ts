import { SourceType } from "src/analytics/enums/data.enum";

export interface DataSourceInterface {
    "name": string,
    "description": string,
    "sourceType": SourceType
}

export interface MesDataInterface {
    materialID: number,
    materialCategory: string,
    materialName: string,
    materialQuantity: number,// Cantidad de material consumido en la operación
    consumptionDate: Date, //Fecha y hora de consumo de material
    remainingStock: number, // Cantidad de stock restante después del consumo registrado
    unitOfMeasure: string, // Unidad de medida del material
    // lotNumber: string, // Identificador del lote del material para trazabilidad
    // supplierLotNumber: string, // Número de lote asignado por el proveedor
}

export interface ProjectDataInterface {
    projectID: number,// Identificador de proyecto asociado al uso del material
    materialID: number,
    materialUsed: string,// Es materialName
    materialCategory: string,
    usedQuantity: number,// Cantidad de material usada en el proyecto
    costPerUnit: number,// Costo por unidad del material utilizado
    usageDate: Date,// Fecha y hora de uso del material
    budgetAllocated: number,// Presupuesto asignado para el material del proyecto
}

export interface ManualDataInterface {
    materialID: number,
    materialCategory: string,
    materialName: string,
    purchaseDate: Date,// Fecha y hora de la compra
    purchaseQuantity: number, // Cantidad comprada del material
    purchaseID: number,// Identificador único de la compra realizada
    // supplierName: string,// Nombre del proveedor que suministró el material
    // purchaseLocation: string, // Ubicación de la compra
    // paymentMethod: string, // Método de pago utilizado
}

export interface ProcessedData {
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
