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
   * Get all users
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Get user by id
   */
  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Create a new user
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
   * Update user data
   */
  async update(id: number, data: Partial<User>): Promise<User> {
    // Don't allow direct password hash updates
    if (data.passwordHash) {
      delete data.passwordHash;
    }
    
    await this.userRepository.update(id, data);
    return this.findById(id);
  }

  /**
   * Update user password
   */
  async updatePassword(id: number, newPassword: string): Promise<User> {
    const user = await this.findById(id);
    
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newPassword, salt);
    
    user.passwordHash = passwordHash;
    return this.userRepository.save(user);
  }

  /**
   * Delete user
   */
  async remove(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected > 0;
  }

  /**
   * Verify password
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
} 