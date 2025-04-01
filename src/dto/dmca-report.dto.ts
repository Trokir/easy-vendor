import { IsString, IsEmail, IsUrl, IsNotEmpty } from 'class-validator';

export class CreateDmcaReportDto {
  @IsUrl()
  @IsNotEmpty()
  contentUrl: string;

  @IsString()
  @IsNotEmpty()
  complainantName: string;

  @IsEmail()
  @IsNotEmpty()
  complainantEmail: string;

  @IsString()
  @IsNotEmpty()
  complainantPhone: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateDmcaReportDto {
  @IsString()
  @IsNotEmpty()
  processingNotes: string;
} 