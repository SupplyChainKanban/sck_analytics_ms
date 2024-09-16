import { Injectable } from '@nestjs/common';
import { DataAnalysisDto, ProcessDataDto } from './dto';

@Injectable()
export class AnalyticsService {

  processData(processDataDto: ProcessDataDto) {
    return processDataDto;
  }

  runAnalysis(dataAnalysisDto: DataAnalysisDto) {
    return dataAnalysisDto;
  }

}
