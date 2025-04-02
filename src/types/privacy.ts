export interface PrivacySettings {
  doNotSell: boolean;
  email: string;
  lastUpdated: string;
}

export interface CCPAOptOutRequest {
  doNotSell: boolean;
  email: string;
}

export interface CCPAOptOutResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface PrivacySettingsResponse {
  settings: PrivacySettings;
  isCaliforniaUser: boolean;
}

export interface PrivacySettingsError {
  code: string;
  message: string;
  details?: unknown;
} 