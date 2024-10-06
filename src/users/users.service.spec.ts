import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should successfully create a user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const hashedPassword = 'hashedPassword';
      const user = {
        id: '1',
        email: createUserDto.email,
        password: hashedPassword,
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(user);
      mockRepository.save.mockResolvedValue(user);

      const result = await service.createUser(createUserDto);
      expect(result).toEqual(user);
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockRepository.findOne.mockResolvedValue({
        id: '1',
        ...createUserDto,
      });

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if save fails', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.save.mockRejectedValue(new Error('Save failed'));

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAllUsers', () => {
    it('should return an array of users', async () => {
      const users = [
        {
          id: '1',
          email: 'test1@example.com',
        },
        {
          id: '2',
          email: 'test2@example.com',
        },
      ];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAllUsers();
      expect(result).toEqual(users);
    });
  });

  describe('findUserById', () => {
    it('should return a user if found', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
      };
      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findUserById('1');
      expect(result).toEqual(user);
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user if found', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
      };
      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findUserByEmail('test@example.com');
      expect(result).toEqual(user);
    });
  });

  describe('updateUser', () => {
    it('should successfully update a user', async () => {
      const userId = '1';
      const updateUserDto = {
        email: 'updated@example.com',
      };
      const existingUser = {
        id: userId,
        email: 'old@example.com',
      };
      const updatedUser = {
        ...existingUser,
        ...updateUserDto,
      };

      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUser(userId, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateUser('1', {
          email: 'test@example.com',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete a user', async () => {
      mockRepository.delete.mockResolvedValue({
        affected: 1,
      });

      await expect(service.deleteUser('1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.delete.mockResolvedValue({
        affected: 0,
      });

      await expect(service.deleteUser('1')).rejects.toThrow(NotFoundException);
    });
  });
});
