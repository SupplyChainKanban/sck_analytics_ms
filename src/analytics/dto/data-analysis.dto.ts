import { SourceTypes } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { sourceTypesList } from "../enums/data.enum";

export class DataAnalysisDto {

    @IsEnum(sourceTypesList, {
        message: `Possible priority levels are ${sourceTypesList}`
    })
    public dataSource: SourceTypes;

    @IsNotEmpty()
    @IsNumber()
    public materialID: number;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    public processedDataId: string;
}