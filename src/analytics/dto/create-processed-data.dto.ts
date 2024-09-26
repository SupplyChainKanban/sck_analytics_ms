// import { RawDataPriority } from "@prisma/client";

import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateProcessedDataDto {
    // @IsNotEmpty()
    // @IsString()
    // @IsUUID()
    // public rawDataId: string;

    @IsNotEmpty()
    @IsNumber()
    public materialID: string;

    @IsNotEmpty()
    @IsString()
    public materialCategory: string;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    public materialName?: string;
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    public materialUsed?: string;// Es materialName

    @IsNotEmpty()
    @IsOptional()
    @IsNumber()
    public materialQuantity?: number;// Cantidad de material consumido en la operación

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    public lotNumber?: string; // Identificador del lote del material para trazabilidad

    @IsNotEmpty()
    @IsOptional()
    @IsNumber()
    public remainingStock?: number; // Cantidad de stock restante después del consumo registrado

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    public unitOfMeasure?: string; // Unidad de medida del material

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    public supplierLotNumber?: string; // Número de lote asignado por el proveedor

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    public supplierName: string;// Nombre del proveedor que suministró el material

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    public purchaseLocation?: string; // Ubicación de la compra

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    public paymentMethod?: string; // Método de pago utilizado

    @IsNotEmpty()
    @IsOptional()
    @IsNumber()
    public projectID?: number;// Identificador de proyecto asociado al uso del material

    @IsNotEmpty()
    @IsOptional()
    @IsNumber()
    public usedQuantity?: number;// Cantidad de material usada en el proyecto

    @IsNotEmpty()
    @IsOptional()
    @IsNumber()
    public costPerUnit?: number;// Costo por unidad del material utilizado

    @IsNotEmpty()
    @IsOptional()
    @IsNumber()
    public totalCost?: number;// Costo por unidad del material utilizado

    @IsNotEmpty()
    @IsOptional()
    @IsNumber()
    public budgetAllocated?: number;// Presupuesto asignado para el material del proyecto

    @IsNotEmpty()
    @IsOptional()
    @IsNumber()
    public purchaseID?: number;// Identificador único de la compra realizada

    @IsNotEmpty()
    @IsOptional()
    @IsNumber()
    public purchaseQuantity?: number; // Cantidad comprada del material

    @IsNotEmpty()
    @IsOptional()
    @IsDate()
    public consumptionDate?: string; //Fecha y hora de consumo de material

    @IsNotEmpty()
    @IsOptional()
    @IsDate()
    public usageDate?: string;// Fecha y hora de uso del material

    @IsNotEmpty()
    @IsOptional()
    @IsDate()
    public purchaseDate?: string;// Fecha y hora de la compra

    // @IsNotEmpty()
    // @IsString()
    // public priority: string;
}