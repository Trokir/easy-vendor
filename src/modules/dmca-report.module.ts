import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DmcaReportController } from '../controllers/dmca-report.controller';
import { DmcaReportService } from '../services/dmca-report.service';
import { DmcaReport } from '../entities/dmca-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DmcaReport])],
  controllers: [DmcaReportController],
  providers: [DmcaReportService],
})
export class DmcaReportModule {}
