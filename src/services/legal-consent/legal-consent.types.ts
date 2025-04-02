export type ConsentType = 'terms' | 'privacy' | 'cookies';

export interface CreateConsentDto {
  userId: string;
  consentType: ConsentType;
  version: string;
  metadata?: Record<string, any>;
}

export interface ConsentResponse {
  id: string;
  userId: string;
  consentType: ConsentType;
  version: string;
  acceptedAt: Date;
  metadata?: Record<string, any>;
}
