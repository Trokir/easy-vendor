import { Injectable } from '@nestjs/common';
import { UserService } from '../../services/user.service';
import { User } from '../../entities/user.entity';

@Injectable()
export class MockUserService extends UserService {
  private existingUser: User | null = null;
  private error: Error | null = null;

  setExistingUser(user: User) {
    this.existingUser = user;
  }

  setError(error: Error) {
    this.error = error;
  }

  async findByEmail(email: string): Promise<User | null> {
    if (this.error) {
      throw this.error;
    }
    return this.existingUser;
  }

  async create(userData: Partial<User>): Promise<User> {
    if (this.error) {
      throw this.error;
    }
    return {
      id: 1,
      email: userData.email || 'test@example.com',
      passwordHash: 'hashed-password',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData,
    } as User;
  }

  async findById(id: number): Promise<User | null> {
    if (this.error) {
      throw this.error;
    }
    return this.existingUser;
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    if (this.error) {
      throw this.error;
    }
    return {
      id,
      email: userData.email || 'test@example.com',
      passwordHash: 'hashed-password',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData,
    } as User;
  }

  async delete(id: number): Promise<void> {
    if (this.error) {
      throw this.error;
    }
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return user.passwordHash === password; // В тестах просто сравниваем строки
  }
} 