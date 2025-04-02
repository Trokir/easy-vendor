import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Query, ParseIntPipe } from '@nestjs/common';
import { LegalConsentService } from '../../services/legalConsent.service';
import {
  CreateConsentDto,
  ConsentResponse,
  ConsentType,
} from '../../types/consent.types';

@Controller('legal-consent')
export class LegalConsentController {
  constructor(private readonly legalConsentService: LegalConsentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createConsent(@Body() createConsentDto: CreateConsentDto): Promise<ConsentResponse> {
    const consent = await this.legalConsentService.recordConsent(
      createConsentDto.userId,
      createConsentDto.consentType,
      createConsentDto.version,
      createConsentDto.metadata
    );
    
    // Преобразуем LegalConsent в ConsentResponse
    const response: ConsentResponse = {
      id: consent.id,
      userId: consent.userId,
      consentType: consent.consentType,
      version: consent.version,
      acceptedAt: consent.acceptedAt,
      metadata: consent.metadata ? { timestamp: Date.now(), ...consent.metadata } : { timestamp: Date.now() }
    };
    
    return response;
  }

  @Get(':userId')
  async getConsentHistory(@Param('userId', ParseIntPipe) userId: number): Promise<ConsentResponse[]> {
    const consents = await this.legalConsentService.getConsentHistory(userId);
    
    // Преобразуем LegalConsent[] в ConsentResponse[]
    return consents.map(consent => ({
      id: consent.id,
      userId: consent.userId,
      consentType: consent.consentType,
      version: consent.version,
      acceptedAt: consent.acceptedAt,
      metadata: consent.metadata ? { timestamp: Date.now(), ...consent.metadata } : { timestamp: Date.now() }
    }));
  }

  @Get(':userId/valid')
  async checkConsentValidity(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('consentType') consentType: ConsentType,
    @Query('version') version: string
  ): Promise<{ isValid: boolean }> {
    const isValid = await this.legalConsentService.hasValidConsent(userId, consentType, version);
    return { isValid };
  }
}
