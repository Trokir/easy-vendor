import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { DmcaReportStatus } from './dmca-report.dto';

export class UpdateDmcaReportDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  respondentEmail?: string;

  @IsOptional()
  @IsEnum(DmcaReportStatus)
  status?: DmcaReportStatus;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  assignedTo?: string;
}
