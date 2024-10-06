import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { comparePassword, hashPassword } from '../utils/password.util';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, inputPassword: string): Promise<any> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(inputPassword, user.password);

    if (user && !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async registerUser(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existingUser = await this.userService.findUserByEmail(email);

    if (existingUser) {
      throw new ConflictException(`User with this email already exists`);
    }

    const hashedPassword = await hashPassword(password);

    try {
      const newUser = await this.userService.createUser({
        email,
        password: hashedPassword,
      });

      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      throw new BadRequestException(`Something went wrong`);
    }
  }
}
