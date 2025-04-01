import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { LegalConsentService } from '../../services/legal-consent/legal-consent.service';
import { CreateConsentDto, ConsentResponse, ConsentType } from '../../services/legal-consent/legal-consent.types';

@Controller('legal-consent')
export class LegalConsentController {
  constructor(private readonly legalConsentService: LegalConsentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createConsent(@Body() createConsentDto: CreateConsentDto): Promise<ConsentResponse> {
    return this.legalConsentService.recordConsent(
      createConsentDto.userId,
      createConsentDto.consentType,
      createConsentDto.version,
      createConsentDto.metadata,
    );
  }

  @Get(':userId')
  async getConsentHistory(@Param('userId') userId: string): Promise<ConsentResponse[]> {
    return this.legalConsentService.getConsentHistory(userId);
  }

  @Get(':userId/valid')
  async checkConsentValidity(
    @Param('userId') userId: string,
    @Query('consentType') consentType: ConsentType,
    @Query('version') version: string,
  ): Promise<{ isValid: boolean }> {
    const isValid = await this.legalConsentService.hasValidConsent(userId, consentType, version);
    return { isValid };
  }
} 