export enum ConsentType {
  COOKIE_POLICY = 'cookie_policy',
  PRIVACY_POLICY = 'privacy_policy',
  TERMS_OF_SERVICE = 'terms_of_service',
  MARKETING = 'marketing',
  DATA_PROCESSING = 'data_processing',
}

export interface ConsentMetadata {
  timestamp: number;
  [key: string]: any;
}

export interface ConsentResponse {
  success: boolean;
  message?: string;
}

export interface ConsentHistoryItem {
  type: ConsentType;
  version: string;
  accepted: boolean;
  timestamp: number;
  metadata?: ConsentMetadata;
}
