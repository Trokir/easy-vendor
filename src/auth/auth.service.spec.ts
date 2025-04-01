import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { Vendor } from '../entities/vendor.entity';
import { LegalConsent } from '../entities/legal-consent.entity';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let vendorRepository: Repository<Vendor>;
  let legalConsentRepository: Repository<LegalConsent>;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockVendorRepository = {
    save: jest.fn(),
  };

  const mockLegalConsentRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Vendor),
          useValue: mockVendorRepository,
        },
        {
          provide: getRepositoryToken(LegalConsent),
          useValue: mockLegalConsentRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    vendorRepository = module.get<Repository<Vendor>>(getRepositoryToken(Vendor));
    legalConsentRepository = module.get<Repository<LegalConsent>>(getRepositoryToken(LegalConsent));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      termsAccepted: true,
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    });

    it('should successfully register a new user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue({ id: 1, email: registerDto.email });
      mockVendorRepository.save.mockResolvedValue({ id: 1, userId: 1 });
      mockLegalConsentRepository.findOne.mockResolvedValue({
        id: 1,
        documentType: 'terms',
        version: '1.0',
      });

      const result = await service.register(registerDto);

      expect(result).toBe(1);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockVendorRepository.save).toHaveBeenCalled();
      expect(mockLegalConsentRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1, email: registerDto.email });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw Error if terms are not accepted', async () => {
      const dtoWithoutTerms = { ...registerDto, termsAccepted: false };

      await expect(service.register(dtoWithoutTerms)).rejects.toThrow('Terms must be accepted');
    });
  });
}); 