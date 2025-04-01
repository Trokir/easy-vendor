export type ConsentType = 'terms' | 'privacy' | 'cookies' | 'marketing';

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