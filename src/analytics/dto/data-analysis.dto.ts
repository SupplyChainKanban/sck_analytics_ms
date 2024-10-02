import { SourceTypes } from "@prisma/client";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { sourceTypesList } from "../enums/data.enum";
import { Type } from "class-transformer";

export class DataAnalysisDto {

    @IsEnum(sourceTypesList, {
        message: `Possible priority levels are ${sourceTypesList}`
    })
    public dataSource: SourceTypes;

    @IsNotEmpty()
    @IsString()
    public materialID: string;

    @IsNotEmpty()
    @IsString()
    public materialName: string;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    public processedDataId: string;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    public processedDate: Date;

    @IsNotEmpty()
    @IsNumber()
    public purchaseInEvent: number;

    @IsNotEmpty()
    @IsNumber()
    public usageInEvent: number;

}