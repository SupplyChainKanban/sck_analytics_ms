import { SourceType } from "src/analytics/enums/data.enum";

export interface DataSourceInterface {
    "name": string,
    "description": string,
    "sourceType": SourceType
}

export interface MesDataInterface {
    materialID: number,
    materialName: string,
    materialCategory: string,
    materialQuantity: number,// Cantidad de material consumido en la operación
    lotNumber: string, // Identificador del lote del material para trazabilidad
    consumptionDate: Date, //Fecha y hora de consumo de material
    remainingStock: number, // Cantidad de stock restante después del consumo registrado
    unitOfMeasure: string, // Unidad de medida del material
    supplierLotNumber: string, // Número de lote asignado por el proveedor
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
    purchaseID: number,// Identificador único de la compra realizada
    materialID: number,
    materialName: string,
    materialCategory: string,
    supplierName: string,// Nombre del proveedor que suministró el material
    purchaseQuantity: number, // Cantidad comprada del material
    purchaseDate: Date,// Fecha y hora de la compra
    purchaseLocation: string, // Ubicación de la compra
    paymentMethod: string, // Método de pago utilizado
}
