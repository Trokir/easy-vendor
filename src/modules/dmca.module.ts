import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DmcaReport } from '../entities/dmca-report.entity';
import { DmcaReportService } from '../services/dmca-report.service';
import { DmcaReportController } from '../controllers/dmca-report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DmcaReport])],
  controllers: [DmcaReportController],
  providers: [DmcaReportService],
  exports: [DmcaReportService],
})
export class DmcaModule {} 