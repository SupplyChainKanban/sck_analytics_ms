import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {

  const logger = new Logger('Main Data Analytics')

  const app = await NestFactory.create(AppModule);
  await app.listen(3003);

  logger.log(`Data Analytics Microservice running on port ${3003}`)

}
bootstrap();
