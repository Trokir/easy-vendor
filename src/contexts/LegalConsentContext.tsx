import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLegalConsentService } from './ServiceContext';
import { useAuth } from './AuthContext';

// Consent types
export enum ConsentType {
  TERMS_OF_SERVICE = 'TERMS_OF_SERVICE',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  COOKIE_POLICY = 'COOKIE_POLICY',
}

// Interface for consent record
export interface ConsentRecord {
  id: number;
  userId: number;
  consentType: string;
  version: string;
  acceptedAt: Date;
  ipAddress?: string;
}

// Interface for consent state
export interface LegalConsentState {
  consents: {
    [key in ConsentType]?: boolean;
  };
  history: ConsentRecord[];
  loading: boolean;
  error: string | null;
}

// Interface for legal consent context
export interface LegalConsentContextType extends LegalConsentState {
  checkConsent: (type: ConsentType) => Promise<boolean>;
  recordConsent: (type: ConsentType, version: string) => Promise<ConsentRecord>;
  loadConsentHistory: () => Promise<ConsentRecord[]>;
  clearError: () => void;
}

// Create context with initial values
const initialState: LegalConsentState = {
  consents: {},
  history: [],
  loading: false,
  error: null,
};

export const LegalConsentContext = createContext<LegalConsentContextType>({
  ...initialState,
  checkConsent: async () => false,
  recordConsent: async () => ({} as ConsentRecord),
  loadConsentHistory: async () => [],
  clearError: () => {},
});

// Hook for using legal consent context
export const useLegalConsent = (): LegalConsentContextType => {
  return useContext(LegalConsentContext);
};

// Legal consent context provider
interface LegalConsentProviderProps {
  children: ReactNode;
  initialConsentState?: Partial<LegalConsentState>;
}

export const LegalConsentProvider: React.FC<LegalConsentProviderProps> = ({ 
  children,
  initialConsentState = {} 
}) => {
  // Get legal consent service
  const legalConsentService = useLegalConsentService();
  // Get authentication data
  const { isAuthenticated, user } = useAuth();
  
  // Consent state
  const [state, setState] = useState<LegalConsentState>({
    ...initialState,
    ...initialConsentState,
  });

  // Check consents when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setState(prev => ({ ...prev, loading: true }));
      
      // Check all consent types
      try {
        Promise.all(
          Object.values(ConsentType).map(async type => {
            try {
              const isValid = await legalConsentService.hasValidConsent(user.id, type);
              return { type, isValid };
            } catch (error) {
              return { type, isValid: false };
            }
          })
        )
          .then(results => {
            const consents = results.reduce((acc, { type, isValid }) => {
              acc[type as ConsentType] = isValid;
              return acc;
            }, {} as { [key in ConsentType]: boolean });
            
            setState(prev => ({
              ...prev,
              consents,
              loading: false,
            }));
          })
          .catch(error => {
            setState(prev => ({ 
              ...prev, 
              loading: false, 
              error: error.message || 'Error checking consents' 
            }));
          });
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message || 'Error checking consents' 
        }));
      }
    }
  }, [isAuthenticated, user, legalConsentService]);

  // Function to check if consent exists
  const checkConsent = async (type: ConsentType): Promise<boolean> => {
    // Для неаутентифицированных пользователей проверяем localStorage
    if (!isAuthenticated || !user) {
      const localConsent = localStorage.getItem(`consent_${type}`);
      return localConsent === 'true';
    }
    
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const isValid = await legalConsentService.hasValidConsent(user.id, type);
      
      setState(prev => ({
        ...prev,
        consents: {
          ...prev.consents,
          [type]: isValid,
        },
        loading: false,
      }));
      
      return isValid;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Error checking consent' 
      }));
      return false;
    }
  };

  // Function to record consent
  const recordConsent = async (type: ConsentType, version: string): Promise<ConsentRecord> => {
    // Для неаутентифицированных пользователей сохраняем в localStorage
    if (!isAuthenticated || !user) {
      // Сохраняем согласие в localStorage
      localStorage.setItem(`consent_${type}`, 'true');
      // Возвращаем фиктивную запись согласия
      const mockConsent: ConsentRecord = {
        id: 0,
        userId: 0, // 0 для неаутентифицированных пользователей
        consentType: type,
        version: version,
        acceptedAt: new Date()
      };
      
      setState(prev => ({
        ...prev,
        consents: {
          ...prev.consents,
          [type]: true,
        },
        loading: false,
      }));
      
      return mockConsent;
    }
    
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const consent = await legalConsentService.recordConsent(user.id, type, version);
      
      setState(prev => ({
        ...prev,
        consents: {
          ...prev.consents,
          [type]: true,
        },
        history: [consent, ...prev.history],
        loading: false,
      }));
      
      return consent;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Error recording consent' 
      }));
      throw error;
    }
  };

  // Function to load consent history
  const loadConsentHistory = async (): Promise<ConsentRecord[]> => {
    if (!isAuthenticated || !user) {
      // Для неаутентифицированных пользователей возвращаем пустой массив
      // или можно собрать историю из localStorage
      const history: ConsentRecord[] = [];
      
      Object.values(ConsentType).forEach(type => {
        const consent = localStorage.getItem(`consent_${type}`);
        if (consent === 'true') {
          history.push({
            id: 0,
            userId: 0,
            consentType: type,
            version: '1.0', // Предполагаемая версия
            acceptedAt: new Date(), // Фиктивная дата
          });
        }
      });
      
      return history;
    }
    
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const history = await legalConsentService.getConsentHistory(user.id);
      
      setState(prev => ({
        ...prev,
        history,
        loading: false,
      }));
      
      return history;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Error loading consent history' 
      }));
      return [];
    }
  };

  // Function to clear errors
  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Context value
  const contextValue: LegalConsentContextType = {
    ...state,
    checkConsent,
    recordConsent,
    loadConsentHistory,
    clearError,
  };

  return (
    <LegalConsentContext.Provider value={contextValue}>
      {children}
    </LegalConsentContext.Provider>
  );
};

export default LegalConsentProvider; 