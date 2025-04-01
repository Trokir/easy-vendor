import { IsNotEmpty, IsString, IsNumber, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordConsentDto {
  @ApiProperty({ description: 'User ID' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'Type of consent', enum: ['terms', 'privacy', 'cookies'] })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Version of the document being accepted' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiPropertyOptional({ description: 'Additional metadata for the consent' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
} 