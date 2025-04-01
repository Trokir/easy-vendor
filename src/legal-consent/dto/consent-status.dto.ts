import { ApiProperty } from '@nestjs/swagger';

export class ConsentStatusDto {
  @ApiProperty({ description: 'Whether the consent is currently valid' })
  isValid: boolean;

  @ApiProperty({ description: 'The version of consent that was accepted' })
  version: string;

  @ApiProperty({ description: 'When the consent was accepted' })
  acceptedAt: Date;

  @ApiProperty({ description: 'When the consent will expire' })
  expiresAt: Date;

  @ApiProperty({ description: 'IP address from which the consent was given' })
  ip: string;
} 