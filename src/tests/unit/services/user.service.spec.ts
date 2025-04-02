import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../../services/user.service';
import { User } from '../../../entities/user.entity';
import { createMockRepository } from '../../../utils/typeorm-test-utils';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    // Создаем мок репозитория с помощью нашей утилиты
    userRepository = createMockRepository<User>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    
    // Очищаем все моки перед каждым тестом
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, email: 'user1@example.com' },
        { id: 2, email: 'user2@example.com' },
      ] as User[];
      userRepository.find.mockResolvedValue(mockUsers);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(userRepository.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      // Arrange
      const mockUser = { id: 1, email: 'test@example.com' } as User;
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findById(1);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockUser = { id: 1, email } as User;
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email } });
    });

    it('should return null if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      // Arrange
      const createUserDto = { email: 'new@example.com', password: 'password123', role: 'user' };
      const mockUser = { id: 1, email: createUserDto.email, role: 'user' } as User;
      
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 'salt');
      expect(userRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        passwordHash: 'hashedPassword',
        role: 'user',
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should use default role if not provided', async () => {
      // Arrange
      const createUserDto = { email: 'new@example.com', password: 'password123' };
      const mockUser = { id: 1, email: createUserDto.email, role: 'user' } as User;
      
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(userRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        passwordHash: 'hashedPassword',
        role: 'user',
      });
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto = { email: 'updated@example.com' };
      const mockUser = { id: userId, email: 'updated@example.com' } as User;
      
      const updateResult: UpdateResult = { 
        affected: 1, 
        raw: {},
        generatedMaps: []
      };
      userRepository.update.mockResolvedValue(updateResult);
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.update(userId, updateUserDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should not allow updating passwordHash directly', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto = { email: 'updated@example.com', passwordHash: 'hackedPassword' } as Partial<User>;
      const mockUser = { id: userId, email: 'updated@example.com' } as User;
      
      const updateResult: UpdateResult = { 
        affected: 1, 
        raw: {},
        generatedMaps: []
      };
      userRepository.update.mockResolvedValue(updateResult);
      userRepository.findOne.mockResolvedValue(mockUser);

      // Act
      await service.update(userId, updateUserDto);

      // Assert
      expect(userRepository.update).toHaveBeenCalledWith(userId, { email: 'updated@example.com' });
      expect(updateUserDto.passwordHash).toBeUndefined();
    });

    it('should throw NotFoundException if user not found after update', async () => {
      // Arrange
      const userId = 999;
      const updateUserDto = { email: 'updated@example.com' };
      
      const updateResult: UpdateResult = { 
        affected: 0, 
        raw: {},
        generatedMaps: []
      };
      userRepository.update.mockResolvedValue(updateResult);
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      // Arrange
      const userId = 1;
      const newPassword = 'newPassword123';
      const mockUser = { id: userId, passwordHash: 'oldHash' } as User;
      
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({ ...mockUser, passwordHash: 'newHash' });
      
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHash');

      // Act
      const result = await service.updatePassword(userId, newPassword);

      // Assert
      expect(result.passwordHash).toBe('newHash');
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 'salt');
      expect(userRepository.save).toHaveBeenCalledWith({ ...mockUser, passwordHash: 'newHash' });
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      userRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updatePassword(999, 'newPassword')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the user and return true', async () => {
      // Arrange
      const deleteResult: DeleteResult = { 
        affected: 1, 
        raw: {}
      };
      userRepository.delete.mockResolvedValue(deleteResult);

      // Act
      const result = await service.remove(1);

      // Assert
      expect(result).toBe(true);
      expect(userRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return false if user not found', async () => {
      // Arrange
      const deleteResult: DeleteResult = { 
        affected: 0, 
        raw: {}
      };
      userRepository.delete.mockResolvedValue(deleteResult);

      // Act
      const result = await service.remove(999);

      // Assert
      expect(result).toBe(false);
      expect(userRepository.delete).toHaveBeenCalledWith(999);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      // Arrange
      const mockUser = { passwordHash: 'hashedPassword' } as User;
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.verifyPassword(mockUser, 'correctPassword');

      // Assert
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('correctPassword', 'hashedPassword');
    });

    it('should return false for incorrect password', async () => {
      // Arrange
      const mockUser = { passwordHash: 'hashedPassword' } as User;
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await service.verifyPassword(mockUser, 'wrongPassword');

      // Assert
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
    });
  });
}); 