import 'reflect-metadata';
import { User } from '../entities/user.entity';
import { TypeOrmServiceMockTemplate } from '../utils/typeorm-test-utils';

/**
 * Шаблон для тестирования сервиса, работающего с TypeORM
 * 
 * Инструкция по использованию:
 * 1. Скопируйте этот файл и переименуйте его в <имя-сервиса>.spec.ts
 * 2. Замените UserService на имя вашего сервиса
 * 3. Замените User на имя вашей сущности
 * 4. Добавьте необходимые методы в MockUserService
 * 5. Измените или добавьте тесты в describe('UserService', ...)
 */

// Пример мок-класса для сервиса пользователей
class MockUserService extends TypeOrmServiceMockTemplate<User> {
  // Добавляем специфичные для сервиса методы
  async findByEmail(email: string): Promise<User | null> {
    const users = await this.find({ email });
    return users[0] || null;
  }
  
  async authenticate(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    // В реальном приложении здесь была бы проверка пароля
    return user;
  }
  
  async changePassword(userId: number, newPassword: string): Promise<User | null> {
    // В реальном приложении пароль был бы захэширован
    return this.update(userId, { 
      passwordHash: `hash_of_${newPassword}` 
    } as Partial<User>);
  }
}

describe('UserService', () => {
  let service: MockUserService;
  
  beforeEach(() => {
    service = new MockUserService();
    // Добавляем тестовые данные
    service.setMockData([
      { id: 1, email: 'test@example.com', passwordHash: 'hash', createdAt: new Date() } as User,
      { id: 2, email: 'admin@example.com', passwordHash: 'hash', createdAt: new Date() } as User
    ]);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  it('should find user by email', async () => {
    const user = await service.findByEmail('test@example.com');
    expect(user).not.toBeNull();
    expect(user.email).toBe('test@example.com');
  });
  
  it('should return null for non-existent user', async () => {
    const user = await service.findByEmail('nonexistent@example.com');
    expect(user).toBeNull();
  });
  
  it('should authenticate user with valid credentials', async () => {
    const user = await service.authenticate('test@example.com', 'password');
    expect(user).not.toBeNull();
    expect(user.email).toBe('test@example.com');
  });
  
  it('should change user password', async () => {
    const updatedUser = await service.changePassword(1, 'newpassword');
    expect(updatedUser).not.toBeNull();
    expect(updatedUser.passwordHash).toBe('hash_of_newpassword');
  });
  
  it('should return null when changing password for non-existent user', async () => {
    const result = await service.changePassword(999, 'newpassword');
    expect(result).toBeNull();
  });
  
  it('should create a new user', async () => {
    const newUser = {
      email: 'new@example.com',
      passwordHash: 'hash',
    } as User;
    
    const createdUser = await service.save(newUser);
    expect(createdUser).toMatchObject({
      email: 'new@example.com',
      passwordHash: 'hash',
    });
    expect(createdUser.id).toBeDefined();
    expect(createdUser.createdAt).toBeDefined();
    expect(createdUser.updatedAt).toBeDefined();
    
    // Проверяем, что пользователь добавлен в "базу данных"
    const allUsers = service.getMockData();
    expect(allUsers.length).toBe(3);
  });
  
  it('should delete a user', async () => {
    const result = await service.remove(1);
    expect(result).toBe(true);
    
    const deletedUser = await service.findOne(1);
    expect(deletedUser).toBeNull();
    
    const allUsers = service.getMockData();
    expect(allUsers.length).toBe(1);
  });
}); 