import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConsentHistoryDto {
  @ApiProperty({ description: 'Type of consent', enum: ['terms', 'privacy', 'cookies'] })
  type: string;

  @ApiProperty({ description: 'Version of the document that was accepted' })
  version: string;

  @ApiProperty({ description: 'When the consent was accepted' })
  acceptedAt: Date;

  @ApiProperty({ description: 'IP address from which the consent was given' })
  ip: string;

  @ApiPropertyOptional({ description: 'Additional metadata stored with the consent' })
  metadata?: Record<string, any>;
} 