import { ConsentType } from '../legal-consent/legal-consent.types';

export interface EmailTemplateData {
  consentType: ConsentType;
  version: string;
  acceptedAt: string;
  userEmail: string;
}

export const getEmailSubject = (consentType: ConsentType): string => {
  const subjects = {
    terms: 'Terms of Service Agreement',
    privacy: 'Privacy Policy Agreement',
    cookies: 'Cookie Policy Agreement',
  };
  return subjects[consentType] || 'Legal Agreement';
}; 