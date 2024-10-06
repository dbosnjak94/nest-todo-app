import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as passwordUtil from '../utils/password.util';

jest.mock('../utils/password.util');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      mockUsersService.findUserByEmail.mockResolvedValue(user);
      (passwordUtil.comparePassword as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual({ id: '1', email: 'test@example.com' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findUserByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      mockUsersService.findUserByEmail.mockResolvedValue(user);
      (passwordUtil.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      const user = { id: '1', email: 'test@example.com' };
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await service.login(user);
      expect(result).toEqual({ access_token: 'jwt_token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
    });
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const registerDto = { email: 'new@example.com', password: 'password123' };
      const hashedPassword = 'hashedPassword';
      const newUser = { id: '2', ...registerDto, password: hashedPassword };

      mockUsersService.findUserByEmail.mockResolvedValue(null);
      (passwordUtil.hashPassword as jest.Mock).mockResolvedValue(
        hashedPassword,
      );
      mockUsersService.createUser.mockResolvedValue(newUser);

      const result = await service.registerUser(registerDto);
      expect(result).toEqual({ id: '2', email: 'new@example.com' });
      expect(usersService.createUser).toHaveBeenCalledWith({
        email: registerDto.email,
        password: hashedPassword,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
      };
      mockUsersService.findUserByEmail.mockResolvedValue({
        id: '1',
        email: 'existing@example.com',
      });

      await expect(service.registerUser(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if user creation fails', async () => {
      const registerDto = { email: 'new@example.com', password: 'password123' };
      mockUsersService.findUserByEmail.mockResolvedValue(null);
      (passwordUtil.hashPassword as jest.Mock).mockResolvedValue(
        'hashedPassword',
      );
      mockUsersService.createUser.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.registerUser(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
