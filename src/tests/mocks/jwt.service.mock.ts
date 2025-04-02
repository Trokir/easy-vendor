import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MockJwtService extends JwtService {
  private error: Error | null = null;

  setError(error: Error) {
    this.error = error;
  }

  sign(payload: any): string {
    if (this.error) {
      throw this.error;
    }
    return 'mock.jwt.token';
  }

  verify<T>(token: string): T {
    if (this.error) {
      throw this.error;
    }
    if (token === 'invalid.token') {
      throw new Error('Invalid token');
    }
    return {
      sub: 1,
      email: 'test@example.com',
    } as T;
  }
} 