import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AnalyticsService } from './analytics.service';
import { DataAnalysisDto, PaginationDto, ProcessDataDto } from './dto';

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @MessagePattern('processData')
  processData(@Payload() processDataDto: ProcessDataDto) {
    return this.analyticsService.processData(processDataDto);
  }

  @MessagePattern('dataAnalysis')
  runAnalysis(@Payload() dataAnalysisDto: DataAnalysisDto) {
    return this.analyticsService.runAnalysis(dataAnalysisDto);
  }

  @MessagePattern('findAllDataAnalytics')
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.analyticsService.findAll(paginationDto);
  }


}
