import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../services/auth.service';
import { User } from '../entities/user.entity';
import { Vendor } from '../entities/vendor.entity';
import { LegalConsent } from '../entities/legal-consent.entity';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConsentType } from '../types/legal-consent';
import { RegisterDto } from '../dtos/register.dto';
import { createMockRepository } from '../utils/typeorm-test-utils';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let vendorRepository: jest.Mocked<Repository<Vendor>>;
  let legalConsentRepository: jest.Mocked<Repository<LegalConsent>>;

  beforeEach(async () => {
    // Создаем моки репозиториев с помощью нашей утилиты
    userRepository = createMockRepository<User>();
    vendorRepository = createMockRepository<Vendor>();
    legalConsentRepository = createMockRepository<LegalConsent>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(Vendor),
          useValue: vendorRepository,
        },
        {
          provide: getRepositoryToken(LegalConsent),
          useValue: legalConsentRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    
    // Очищаем все моки перед каждым тестом
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
      const mockUser = { id: 1, email: registerDto.email, role: 'vendor', passwordHash: 'hashedPassword' } as User;
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
      userRepository.findOne.mockResolvedValue({ id: 1, email: registerDto.email } as User);

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
      const mockUser = { id: 1, email: registerDto.email } as User;
      
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
});
