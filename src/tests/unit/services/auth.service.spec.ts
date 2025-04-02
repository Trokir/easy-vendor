import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../entities/user.entity';
import { Vendor } from '../../../entities/vendor.entity';
import { LegalConsent } from '../../../entities/legal-consent.entity';
import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConsentType } from '../../../types/legal-consent';
import { RegisterDto } from '../../../dtos/register.dto';
import { createMockRepository } from '../../../utils/typeorm-test-utils';
import { createAuthServiceTestModule } from '../../utils/test-helpers';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

jest.mock('bcrypt');
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
  verify: jest.fn().mockImplementation((token, secret) => {
    if (token === 'valid.token') {
      return { sub: 1, email: 'test@example.com' };
    }
    throw new Error('Invalid token');
  })
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let vendorRepository: jest.Mocked<Repository<Vendor>>;
  let legalConsentRepository: jest.Mocked<Repository<LegalConsent>>;
  let configService: ConfigService;

  beforeEach(async () => {
    // Создаем модуль тестирования с необходимыми моками
    const module = await createAuthServiceTestModule();

    // Получаем сервис и репозитории
    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    vendorRepository = module.get(getRepositoryToken(Vendor));
    legalConsentRepository = module.get(getRepositoryToken(LegalConsent));
    configService = module.get<ConfigService>(ConfigService);

    // Сбрасываем моки перед каждым тестом
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      businessName: 'Test Business',
      domain: 'test.com',
      acceptedTerms: true,
    };

    const ip = '127.0.0.1';

    it('should register a new user successfully', async () => {
      // Arrange
      const mockUser = { 
        id: 1, 
        email: registerDto.email, 
        role: 'vendor', 
        passwordHash: 'hashedPassword',
        vendors: [],
        consents: [],
        createdAt: new Date(),
        updatedAt: new Date()
      } as User;
      
      const mockVendor = { id: 1, userId: 1, businessName: registerDto.businessName, domain: registerDto.domain } as Vendor;
      const mockConsent = { id: 'uuid-1', userId: 1, consentType: ConsentType.TERMS_OF_SERVICE, version: '1.0' } as LegalConsent;

      userRepository.findOne.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(mockUser);
      
      vendorRepository.save.mockResolvedValue(mockVendor);
      
      legalConsentRepository.save.mockResolvedValue(mockConsent);
      
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Act
      const result = await service.register(registerDto, ip);

      // Assert
      expect(result).toEqual({ id: 1 });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 'salt');
      expect(userRepository.save).toHaveBeenCalledWith({
        email: registerDto.email,
        passwordHash: 'hashedPassword',
        role: 'vendor',
      });
      
      expect(vendorRepository.save).toHaveBeenCalledWith({
        userId: 1,
        businessName: registerDto.businessName,
        domain: registerDto.domain,
        templateType: 'default',
        config: {},
      });
      
      expect(legalConsentRepository.save).toHaveBeenCalledWith({
        userId: 1,
        consentType: ConsentType.TERMS_OF_SERVICE,
        version: '1.0',
        metadata: { ip },
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      // Arrange
      const mockUser = { 
        id: 1, 
        email: registerDto.email,
        passwordHash: 'hashedPassword',
        role: 'vendor',
        vendors: [],
        consents: [],
        createdAt: new Date(),
        updatedAt: new Date()
      } as User;
      
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.register(registerDto, ip)).rejects.toThrow(ConflictException);
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(vendorRepository.save).not.toHaveBeenCalled();
      expect(legalConsentRepository.save).not.toHaveBeenCalled();
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if terms not accepted', async () => {
      // Arrange
      const dtoWithoutTerms = { ...registerDto, acceptedTerms: false };

      // Act & Assert
      await expect(service.register(dtoWithoutTerms, ip)).rejects.toThrow(ForbiddenException);
      expect(userRepository.findOne).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(vendorRepository.save).not.toHaveBeenCalled();
      expect(legalConsentRepository.save).not.toHaveBeenCalled();
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
    
    it('should handle errors during user creation', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);
      userRepository.save.mockRejectedValue(new Error('Database error'));
      
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Act & Assert
      await expect(service.register(registerDto, ip)).rejects.toThrow('Database error');
      expect(vendorRepository.save).not.toHaveBeenCalled();
      expect(legalConsentRepository.save).not.toHaveBeenCalled();
    });
    
    it('should handle errors during vendor creation', async () => {
      // Arrange
      const mockUser = { 
        id: 1, 
        email: registerDto.email,
        passwordHash: 'hashedPassword',
        role: 'vendor',
        vendors: [],
        consents: [],
        createdAt: new Date(),
        updatedAt: new Date()
      } as User;
      
      userRepository.findOne.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(mockUser);
      vendorRepository.save.mockRejectedValue(new Error('Vendor creation failed'));
      
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Act & Assert
      await expect(service.register(registerDto, ip)).rejects.toThrow('Vendor creation failed');
      expect(legalConsentRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return user and token when credentials are valid', async () => {
      // Arrange
      const loginDto = { email: 'test@example.com', password: 'Password123!' };
      const mockUser = {
        id: 1,
        email: loginDto.email,
        passwordHash: 'hashedPassword',
        role: 'vendor',
        vendors: [],
        consents: [],
        createdAt: new Date(),
        updatedAt: new Date()
      } as User;

      // Мокаем findOne для имитации существующего пользователя
      userRepository.findOne.mockResolvedValue(mockUser);

      // Мокаем bcrypt.compare для успешной проверки пароля
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Перезаписываем мок для jwt.sign чтобы возвращал значение
      (jwt.sign as jest.Mock).mockReturnValue('mock.jwt.token');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toMatchObject({
        id: mockUser.id,
        email: mockUser.email
      });
      expect(result.token).toBeDefined();
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.passwordHash);
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const loginDto = { email: 'nonexistent@example.com', password: 'Password123!' };

      // Мокаем findOne для имитации отсутствующего пользователя
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      const loginDto = { email: 'test@example.com', password: 'WrongPassword123!' };
      const mockUser = {
        id: 1,
        email: loginDto.email,
        passwordHash: 'hashedPassword',
        role: 'vendor',
        vendors: [],
        consents: [],
        createdAt: new Date(),
        updatedAt: new Date()
      } as User;

      // Мокаем findOne для имитации существующего пользователя
      userRepository.findOne.mockResolvedValue(mockUser);

      // Мокаем bcrypt.compare для неуспешной проверки пароля
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.passwordHash);
    });
  });

  describe('validateToken', () => {
    it('should return user data when token is valid', async () => {
      const result = await service.validateToken('valid.token');
      expect(result).toEqual({
        sub: 1,
        email: 'test@example.com'
      });
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      // Исправляем мок для jwt.verify для этого конкретного случая
      (jwt.verify as jest.Mock).mockImplementationOnce((token, secret) => {
        throw new Error('Invalid token');
      });
  
      await expect(service.validateToken('invalid.token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data when user exists', async () => {
      // Arrange
      const userId = 1;
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        role: 'vendor',
        passwordHash: 'hashedPassword',
        vendors: [],
        consents: [],
        createdAt: new Date(),
        updatedAt: new Date()
      } as User;

      // Мокаем findOne для имитации существующего пользователя
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.getCurrentUser(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const userId = 999;

      // Мокаем findOne для имитации отсутствующего пользователя
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getCurrentUser(userId)).rejects.toThrow(UnauthorizedException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });
  });
}); 