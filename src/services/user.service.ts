import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  /**
   * Получить всех пользователей
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Получить пользователя по id
   */
  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Получить пользователя по email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Создать нового пользователя
   */
  async create(data: { email: string; password: string; role?: string }): Promise<User> {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(data.password, salt);
    
    const user = this.userRepository.create({
      email: data.email,
      passwordHash,
      role: data.role || 'user'
    });
    
    return this.userRepository.save(user);
  }

  /**
   * Обновить данные пользователя
   */
  async update(id: number, data: Partial<User>): Promise<User> {
    // Не позволяем обновлять хеш пароля напрямую
    if (data.passwordHash) {
      delete data.passwordHash;
    }
    
    await this.userRepository.update(id, data);
    return this.findById(id);
  }

  /**
   * Обновить пароль пользователя
   */
  async updatePassword(id: number, newPassword: string): Promise<User> {
    const user = await this.findById(id);
    
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newPassword, salt);
    
    user.passwordHash = passwordHash;
    return this.userRepository.save(user);
  }

  /**
   * Удалить пользователя
   */
  async remove(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected > 0;
  }

  /**
   * Проверка пароля
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
} 