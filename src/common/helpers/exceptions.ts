import { HttpStatus, type Logger } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

export const handleExceptions = (error: any, logger: Logger) => {
    if (error.message.includes('Unique constraint failed')) {
        logger.error('DB Unique constrain is not satisfied')
        throw new RpcException({ status: HttpStatus.CONFLICT, message: 'Conflicto con los datos enviados. Ya hay una entrada similar' });
    }

    logger.error(error);
    throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: error.message });
}