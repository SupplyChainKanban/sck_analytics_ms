import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TransportsModule } from 'src/transports/transports.module';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  imports: [TransportsModule]
})
export class AnalyticsModule { }
