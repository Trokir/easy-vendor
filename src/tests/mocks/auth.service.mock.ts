import { Injectable } from '@nestjs/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../entities/user.entity';
import { RegisterDto } from '../../dtos/register.dto';

interface LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class MockAuthService extends AuthService {
  private users: User[] = [];

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email);
    if (!user || user.passwordHash !== password) {
      return null;
    }
    return user;
  }

  async login(loginDto: LoginDto): Promise<{ id: number; email: string; token: string }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email,
      token: 'mock.jwt.token'
    };
  }

  async register(dto: RegisterDto, ip: string): Promise<{ id: number }> {
    if (!dto.acceptedTerms) {
      throw new Error('Terms of Service must be accepted');
    }

    const existingUser = this.users.find(u => u.email === dto.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = {
      id: Math.floor(Math.random() * 1000),
      email: dto.email,
      passwordHash: dto.password, // В тестах не хешируем пароль
      role: 'vendor',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;

    this.users.push(user);
    return { id: user.id };
  }

  async validateToken(token: string): Promise<any> {
    if (token === 'valid.token') {
      return { sub: 1, email: 'test@example.com' };
    }
    throw new Error('Invalid token');
  }

  async getCurrentUser(userId: number): Promise<User> {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
} 