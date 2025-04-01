import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { LegalConsentService } from '../services/legalConsent.service';

@Injectable()
export class LegalConsentGuard implements CanActivate {
  constructor(private legalConsentService: LegalConsentService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasConsent = await this.legalConsentService.hasValidConsent(userId);
    
    if (!hasConsent) {
      throw new ForbiddenException({
        message: 'Legal consent required',
        code: 'LEGAL_CONSENT_REQUIRED',
        redirectUrl: '/legal/terms'
      });
    }

    return true;
  }
} 