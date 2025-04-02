import { Repository, EntityTarget, EntityManager, EntityMetadata, FindManyOptions, FindOneOptions, DeepPartial } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../services/email.service';

/**
 * Тип базовой сущности с обязательными полями id и updatedAt
 */
export interface BaseEntity {
  id: number | string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Создает полностью реализованный мок репозитория TypeORM для использования в тестах
 * @returns Мок репозитория с реализованными методами и свойствами
 */
export function createMockRepository<T extends BaseEntity>(): jest.Mocked<Repository<T>> {
  const mockData: T[] = [];
  let nextId = 1;

  return {
    find: jest.fn().mockImplementation((options?: FindManyOptions<T>) => {
      if (!options) return [...mockData];
      if (options.where) {
        return mockData.filter(item => {
          for (const [key, value] of Object.entries(options.where)) {
            if (item[key] !== value) return false;
          }
          return true;
        });
      }
      return [...mockData];
    }),
    findOne: jest.fn().mockImplementation((options?: FindOneOptions<T>) => {
      if (!options) return null;
      if (options.where) {
        const result = mockData.find(item => {
          for (const [key, value] of Object.entries(options.where)) {
            if (item[key] !== value) return false;
          }
          return true;
        });
        return result || null;
      }
      return null;
    }),
    save: jest.fn().mockImplementation((entity: DeepPartial<T>) => {
      if (!entity) return null;
      
      if (Array.isArray(entity)) {
        return entity.map(e => {
          const newEntity = { ...e };
          if (!newEntity.id) {
            // Генерируем id в зависимости от типа (number или string/uuid)
            if (typeof mockData[0]?.id === 'string') {
              newEntity.id = `test-id-${nextId++}`;
            } else {
              newEntity.id = nextId++;
            }
            newEntity.createdAt = new Date();
          }
          newEntity.updatedAt = new Date();
          return newEntity;
        });
      }
      
      const newEntity = { ...entity } as any;
      if (!newEntity.id) {
        // Генерируем id в зависимости от типа (number или string/uuid)
        if (mockData.length > 0 && typeof mockData[0].id === 'string') {
          newEntity.id = `test-id-${nextId++}`;
        } else {
          newEntity.id = nextId++;
        }
        newEntity.createdAt = new Date();
      }
      newEntity.updatedAt = new Date();
      
      const index = mockData.findIndex(item => item.id === newEntity.id);
      if (index >= 0) {
        mockData[index] = { ...mockData[index], ...newEntity };
        return mockData[index];
      }
      
      mockData.push(newEntity);
      return newEntity;
    }),
    update: jest.fn().mockImplementation((id: number | string, partialEntity: DeepPartial<T>) => {
      const entity = mockData.find(item => item.id === id);
      if (!entity) return { affected: 0 };
      
      Object.assign(entity, partialEntity);
      entity.updatedAt = new Date();
      
      return { affected: 1 };
    }),
    delete: jest.fn().mockImplementation((id: number | string) => {
      const index = mockData.findIndex(item => item.id === id);
      if (index === -1) return { affected: 0 };
      
      mockData.splice(index, 1);
      return { affected: 1 };
    }),
    remove: jest.fn().mockImplementation((entity: T) => {
      const index = mockData.findIndex(item => item.id === entity.id);
      if (index === -1) return null;
      
      const removed = mockData[index];
      mockData.splice(index, 1);
      return removed;
    }),
    create: jest.fn().mockImplementation((entityLike: DeepPartial<T>) => {
      const newEntity = { ...entityLike } as any;
      return newEntity;
    }),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockReturnValue(mockData),
      getOne: jest.fn().mockReturnValue(mockData[0] || null),
    }),
    metadata: {
      columns: [],
      relations: []
    },
    manager: {} as any,
    target: {} as any,
  } as unknown as jest.Mocked<Repository<T>>;
}

/**
 * Создает мок ConfigService для использования в тестах
 * @returns Мок ConfigService с реализованным методом get
 */
export function createMockConfigService(): jest.Mocked<ConfigService> {
  const configs = {
    'database.host': 'localhost',
    'database.port': 5432,
    'database.username': 'test',
    'database.password': 'test',
    'database.name': 'test',
    'email.host': 'smtp.test.com',
    'email.port': 587,
    'email.user': 'test@test.com',
    'email.password': 'test',
    'email.from': 'noreply@test.com',
    'jwt.secret': 'test-jwt-secret',
    'jwt.expiresIn': '1d',
    'app.url': 'http://localhost:3000',
    'app.apiUrl': 'http://localhost:3000/api',
  };

  return {
    get: jest.fn().mockImplementation((key: string) => {
      return configs[key] || null;
    }),
    getOrThrow: jest.fn().mockImplementation((key: string) => {
      if (!configs[key]) {
        throw new Error(`Config ${key} not found`);
      }
      return configs[key];
    })
  } as unknown as jest.Mocked<ConfigService>;
}

/**
 * Создает базовый мок сервиса для отправки email
 * @returns Мок EmailService
 */
export function createMockEmailService(): jest.Mocked<EmailService> {
  return {
    sendEmail: jest.fn().mockResolvedValue(true),
    sendPasswordReset: jest.fn().mockResolvedValue(true),
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  } as unknown as jest.Mocked<EmailService>;
}

// -------------------------------------------------------------------------
// Шаблоны для тестирования TypeORM сервисов
// -------------------------------------------------------------------------

/**
 * Шаблон для тестирования TypeORM сервиса с использованием подхода мок-классов
 * 
 * Пример использования:
 * ```typescript
 * import { typeormServiceTestTemplate } from '../utils/typeorm-test-utils';
 * import { UserService } from './user.service';
 * import { User } from '../entities/user.entity';
 * 
 * // Создаем мок-класс сервиса
 * class MockUserService {
 *   async findByEmail(email: string): Promise<User> {
 *     return { id: 1, email, name: 'Test User', createdAt: new Date() } as User;
 *   }
 *   
 *   async create(data: any): Promise<User> {
 *     return { id: 1, ...data, createdAt: new Date() } as User;
 *   }
 * }
 * 
 * // Используем шаблон для создания тестов
 * typeormServiceTestTemplate<MockUserService>({
 *   serviceName: 'UserService',
 *   mockServiceClass: MockUserService,
 *   tests: [
 *     {
 *       name: 'should find user by email',
 *       method: 'findByEmail',
 *       args: ['test@example.com'],
 *       expectedResult: { id: 1, email: 'test@example.com', name: 'Test User' },
 *       matcher: 'toMatchObject'
 *     },
 *     {
 *       name: 'should create user',
 *       method: 'create',
 *       args: [{ email: 'new@example.com', name: 'New User' }],
 *       expectedResult: { id: 1, email: 'new@example.com', name: 'New User' },
 *       matcher: 'toMatchObject'
 *     }
 *   ]
 * });
 * ```
 */
export function typeormServiceTestTemplate<T>({
  serviceName,
  mockServiceClass,
  tests
}: {
  serviceName: string;
  mockServiceClass: new () => T;
  tests: Array<{
    name: string;
    method: keyof T;
    args: any[];
    expectedResult: any;
    matcher?: 'toBe' | 'toEqual' | 'toMatchObject' | 'toHaveBeenCalled' | 'toHaveBeenCalledWith';
    setup?: (service: T) => void;
  }>;
}) {
  describe(serviceName, () => {
    let service: T;

    beforeEach(() => {
      service = new mockServiceClass();
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    tests.forEach(test => {
      it(test.name, async () => {
        if (test.setup) {
          test.setup(service);
        }

        const method = service[test.method] as any;
        const result = await method.apply(service, test.args);

        switch (test.matcher || 'toEqual') {
          case 'toBe':
            expect(result).toBe(test.expectedResult);
            break;
          case 'toEqual':
            expect(result).toEqual(test.expectedResult);
            break;
          case 'toMatchObject':
            expect(result).toMatchObject(test.expectedResult);
            break;
          case 'toHaveBeenCalled':
            expect(method).toHaveBeenCalled();
            break;
          case 'toHaveBeenCalledWith':
            expect(method).toHaveBeenCalledWith(...test.args);
            break;
          default:
            expect(result).toEqual(test.expectedResult);
        }
      });
    });
  });
}

/**
 * Шаблон класса для мокирования сервиса, работающего с TypeORM репозиториями
 */
export class TypeOrmServiceMockTemplate<T extends BaseEntity> {
  private mockData: T[] = [];
  private nextId = 1;

  constructor() {}

  /**
   * Устанавливает тестовые данные
   * @param data Тестовые данные
   */
  setMockData(data: T[]): void {
    this.mockData = [...data];
    
    // Установка nextId на максимальный id + 1
    const maxId = data.reduce((max, item) => {
      const id = typeof item.id === 'number' ? item.id : 0;
      return Math.max(max, id);
    }, 0);
    
    this.nextId = maxId + 1;
  }

  /**
   * Возвращает все тестовые данные
   */
  getMockData(): T[] {
    return [...this.mockData];
  }

  /**
   * Поиск сущностей по условиям
   * @param conditions Условия поиска
   */
  async find(conditions?: Partial<T>): Promise<T[]> {
    if (!conditions) return [...this.mockData];
    
    return this.mockData.filter(item => {
      for (const [key, value] of Object.entries(conditions)) {
        if ((item as any)[key] !== value) return false;
      }
      return true;
    });
  }

  /**
   * Поиск одной сущности по id или условиям
   * @param idOrConditions Id или условия поиска
   */
  async findOne(idOrConditions: number | string | Partial<T>): Promise<T | null> {
    if (typeof idOrConditions === 'number' || typeof idOrConditions === 'string') {
      return this.mockData.find(item => item.id === idOrConditions) || null;
    }
    
    return this.mockData.find(item => {
      for (const [key, value] of Object.entries(idOrConditions)) {
        if ((item as any)[key] !== value) return false;
      }
      return true;
    }) || null;
  }

  /**
   * Создание или обновление сущности
   * @param entity Сущность
   */
  async save(entity: Partial<T>): Promise<T> {
    const newEntity = { ...entity } as any;
    
    if (!newEntity.id) {
      if (this.mockData.length > 0 && typeof this.mockData[0].id === 'string') {
        newEntity.id = `test-id-${this.nextId++}`;
      } else {
        newEntity.id = this.nextId++;
      }
      newEntity.createdAt = new Date();
    }
    newEntity.updatedAt = new Date();
    
    const index = this.mockData.findIndex(item => item.id === newEntity.id);
    if (index >= 0) {
      this.mockData[index] = { ...this.mockData[index], ...newEntity };
      return this.mockData[index];
    }
    
    this.mockData.push(newEntity);
    return newEntity;
  }

  /**
   * Обновление сущности по id
   * @param id Id сущности
   * @param partialEntity Частичная сущность
   */
  async update(id: number | string, partialEntity: Partial<T>): Promise<T | null> {
    const entity = this.mockData.find(item => item.id === id);
    if (!entity) return null;
    
    const updatedEntity = { ...entity, ...partialEntity, updatedAt: new Date() };
    const index = this.mockData.findIndex(item => item.id === id);
    this.mockData[index] = updatedEntity;
    
    return updatedEntity;
  }

  /**
   * Удаление сущности по id
   * @param id Id сущности
   */
  async remove(id: number | string): Promise<boolean> {
    const index = this.mockData.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this.mockData.splice(index, 1);
    return true;
  }
}

/**
 * Пример использования TypeOrmServiceMockTemplate:
 * 
 * ```typescript
 * import { TypeOrmServiceMockTemplate } from '../utils/typeorm-test-utils';
 * import { User } from '../entities/user.entity';
 * 
 * // Создаем мок-класс для сервиса пользователей
 * class MockUserService extends TypeOrmServiceMockTemplate<User> {
 *   // Добавляем специфичные для сервиса методы
 *   async findByEmail(email: string): Promise<User | null> {
 *     const users = await this.find({ email });
 *     return users[0] || null;
 *   }
 *   
 *   async authenticate(email: string, password: string): Promise<User | null> {
 *     const user = await this.findByEmail(email);
 *     if (!user) return null;
 *     // В реальном приложении здесь была бы проверка пароля
 *     return user;
 *   }
 * }
 * 
 * describe('UserService', () => {
 *   let service: MockUserService;
 *   
 *   beforeEach(() => {
 *     service = new MockUserService();
 *     // Добавляем тестовые данные
 *     service.setMockData([
 *       { id: 1, email: 'test@example.com', passwordHash: 'hash', createdAt: new Date() } as User,
 *       { id: 2, email: 'admin@example.com', passwordHash: 'hash', createdAt: new Date() } as User
 *     ]);
 *   });
 *   
 *   it('should find user by email', async () => {
 *     const user = await service.findByEmail('test@example.com');
 *     expect(user).not.toBeNull();
 *     expect(user.email).toBe('test@example.com');
 *   });
 *   
 *   it('should authenticate user with valid credentials', async () => {
 *     const user = await service.authenticate('test@example.com', 'password');
 *     expect(user).not.toBeNull();
 *     expect(user.email).toBe('test@example.com');
 *   });
 * });
 * ```
 */

/**
 * Мок для ConfigService NestJS
 */
export const mockConfigService = {
  get: jest.fn((key: string) => {
    const config = {
      'SENDGRID_API_KEY': 'test-api-key',
      'JWT_SECRET': 'test-jwt-secret',
      'APP_URL': 'http://localhost:3000',
      'API_URL': 'http://localhost:3000/api',
      'DB_HOST': 'localhost',
      'DB_PORT': 5432,
      'DB_USERNAME': 'postgres',
      'DB_PASSWORD': 'postgres',
      'DB_DATABASE': 'test'
    };
    return config[key];
  })
}; 