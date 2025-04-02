import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export enum DmcaReportStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  VALID = 'valid',
  INVALID = 'invalid',
  COUNTER_NOTICE = 'counter_notice',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

export class CreateDmcaReportDto {
  @IsNotEmpty({ message: 'Имя заявителя обязательно' })
  @IsString()
  @MaxLength(255)
  claimantName: string;

  @IsNotEmpty({ message: 'Email заявителя обязателен' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  @MaxLength(255)
  claimantEmail: string;

  @IsOptional()
  @IsEmail({}, { message: 'Некорректный формат email' })
  @MaxLength(255)
  respondentEmail?: string;

  @IsNotEmpty({ message: 'URL содержимого обязателен' })
  @IsUrl({}, { message: 'Некорректный формат URL' })
  @MaxLength(500)
  contentUrl: string;

  @IsNotEmpty({ message: 'URL оригинального произведения обязателен' })
  @IsUrl({}, { message: 'Некорректный формат URL' })
  @MaxLength(500)
  originalWorkUrl: string;

  @IsNotEmpty({ message: 'Описание обязательно' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: 'Подтверждение под присягой обязательно' })
  @IsBoolean()
  isSwornStatement: boolean;

  @IsOptional()
  @IsEnum(DmcaReportStatus)
  status?: DmcaReportStatus = DmcaReportStatus.PENDING;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  assignedTo?: string;
}

export class UpdateDmcaReportDto {
  @IsOptional()
  @IsEnum(DmcaReportStatus, { message: 'Некорректный статус отчета' })
  status?: DmcaReportStatus;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}

export class DmcaReportResponseDto {
  id: string;
  claimantName: string;
  claimantEmail: string;
  respondentEmail: string;
  contentUrl: string;
  originalWorkUrl: string;
  description: string;
  isSwornStatement: boolean;
  status: DmcaReportStatus;
  adminNotes?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}
