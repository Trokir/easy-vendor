export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

export const CONSENT_EXPIRY_DAYS = 365;

export const CONSENT_TYPES = {
  TERMS: 'terms',
  PRIVACY: 'privacy',
  COOKIES: 'cookies',
  MARKETING: 'marketing',
} as const;

export const CONSENT_VERSIONS = {
  TERMS: '1.0',
  PRIVACY: '1.0',
  COOKIES: '1.0',
  MARKETING: '1.0',
} as const;

export const STORAGE_KEYS = {
  COOKIE_CONSENT: 'cookie_consent',
  TERMS_CONSENT: 'terms_consent',
  PRIVACY_CONSENT: 'privacy_consent',
  MARKETING_CONSENT: 'marketing_consent',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  CONSENT_REQUIRED: 'You must accept the terms to continue.',
  CONSENT_FAILED: 'Failed to record consent. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  CONSENT_RECORDED: 'Consent recorded successfully.',
  CONSENT_REVOKED: 'Consent revoked successfully.',
} as const;

export const API_PREFIX = 'api';

export const API_VERSION = 'v1';

export const API_BASE_URL = `/${API_PREFIX}/${API_VERSION}`; 