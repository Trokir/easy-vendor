// src/services/api.ts
// Реальные реализации сервисов для использования в приложении

// Типы для сервисов
interface User {
  id: number;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LoginResponse {
  accessToken: string;
  user: User;
}

interface ConsentRecord {
  id: number;
  userId: number;
  consentType: string;
  version: string;
  acceptedAt: Date;
  ipAddress: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Базовая функция для выполнения API запросов
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка при выполнении запроса');
  }
  
  return response.json();
}

// Реализация AuthService
export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  async register(data: any): Promise<User> {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async validateToken(token: string): Promise<boolean> {
    try {
      await apiRequest('/auth/validate-token', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      return true;
    } catch (error) {
      return false;
    }
  },
  
  async getCurrentUser(): Promise<User> {
    return apiRequest('/auth/me');
  }
};

// Реализация LegalConsentService
export const legalConsentService = {
  async recordConsent(userId: number, consentType: string, version: string, metadata?: any): Promise<ConsentRecord> {
    return apiRequest('/legal-consent/record', {
      method: 'POST',
      body: JSON.stringify({ userId, type: consentType, version, metadata }),
    });
  },
  
  async hasValidConsent(userId: number, consentType: string): Promise<boolean> {
    try {
      const response = await apiRequest(`/legal-consent/check`, {
        method: 'POST',
        body: JSON.stringify({ userId, type: consentType }),
      });
      return response.accepted;
    } catch (error) {
      return false;
    }
  },
  
  async getConsentHistory(userId: number): Promise<ConsentRecord[]> {
    return apiRequest(`/legal-consent/history/${userId}`);
  }
};

// Реализация UserService
export const userService = {
  async findAll(): Promise<User[]> {
    return apiRequest('/users');
  },
  
  async findById(id: number): Promise<User> {
    return apiRequest(`/users/${id}`);
  },
  
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await apiRequest(`/users/email/${email}`);
    } catch (error) {
      return null;
    }
  },
  
  async update(id: number, data: any): Promise<User> {
    return apiRequest(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  
  async remove(id: number): Promise<boolean> {
    try {
      await apiRequest(`/users/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      return false;
    }
  }
};

// Реализация EmailService
export const emailService = {
  async sendLegalConsentConfirmation(email: string, consentType: string, version: string, date: Date): Promise<any> {
    return apiRequest('/email/legal-consent-confirmation', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        consentType, 
        version, 
        date: date.toISOString() 
      }),
    });
  }
};

// Экспорт всех сервисов
export const services = {
  authService,
  legalConsentService,
  userService,
  emailService
}; 