import { CONSENT_EXPIRY_DAYS } from './constants';

export const isConsentExpired = (acceptedAt: Date, expiryDays: number = CONSENT_EXPIRY_DAYS): boolean => {
  const expiryDate = new Date(acceptedAt);
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  return new Date() > expiryDate;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getConsentStatus = (isAccepted: boolean, isExpired: boolean): 'active' | 'expired' | 'none' => {
  if (!isAccepted) return 'none';
  return isExpired ? 'expired' : 'active';
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const getStorageValue = <T>(key: string, defaultValue: T): T => {
  const storedValue = localStorage.getItem(key);
  if (!storedValue) return defaultValue;
  try {
    return JSON.parse(storedValue) as T;
  } catch {
    return defaultValue;
  }
};

export const setStorageValue = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeStorageValue = (key: string): void => {
  localStorage.removeItem(key);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const generateConsentId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}; 