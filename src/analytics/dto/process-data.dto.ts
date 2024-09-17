// import { RawDataPriority } from "@prisma/client";
import { HttpStatus } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, IsUUID, ValidateNested } from "class-validator";
import { priorityList, RawDataPriority } from "../enums/data.enum";
import { CreateProcessedDataDto } from "./create-processed-data.dto";

export class ProcessDataDto {

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    public validationResultId: string;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    public rawDataId: string;

    @IsObject()
    @IsNotEmptyObject()
    @Transform(({ value }) => {
        try {
            if (typeof value === 'object') {
                return value;
            }
            return JSON.parse(value);
        } catch (error) {
            console.log({ error })
            throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: 'Invalid JSON format for dataPayload' })
        }
    })
    @ValidateNested({ each: true })
    @Type(() => CreateProcessedDataDto)
    public validatedData: CreateProcessedDataDto;

    @IsEnum(priorityList, {
        message: `Possible priority levels are ${priorityList}`
    })
    public priority: RawDataPriority;
}