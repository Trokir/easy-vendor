import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { LegalConsentService } from '../services/legalConsent.service';
import { AuthGuard } from '../middleware/auth.guard';
import { Request } from 'express';
import { ConsentType } from '../types/legal-consent';

@Controller('api/legal/consent')
@UseGuards(AuthGuard)
export class LegalConsentController {
  constructor(private readonly legalConsentService: LegalConsentService) {}

  @Post()
  async recordConsent(@Req() req: Request, @Body() body: { consentType: string; version: string }) {
    const userId = Number(req.user.id);
    return this.legalConsentService.recordConsent(userId, body.consentType as ConsentType, body.version);
  }

  @Get('status')
  async getConsentStatus(@Req() req: Request) {
    const userId = Number(req.user.id);
    const hasValidConsent = await this.legalConsentService.hasValidConsent(userId);
    return { hasValidConsent };
  }

  @Get('history')
  async getConsentHistory(@Req() req: Request) {
    const userId = Number(req.user.id);
    return this.legalConsentService.getConsentHistory(userId);
  }
}
