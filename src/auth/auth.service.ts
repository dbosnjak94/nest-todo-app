import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    console.log('email', email);
    console.log('password', password);
    const user = await this.userService.findUserByEmail(email);
    console.log('user', user);
    console.log('bcrypt', await bcrypt.compare(password, user.password));
    //TODO: impelemnt propper compare
    // if (user && (await bcrypt.compare(password, user.password))) {
    //   const { password, ...result } = user;
    //   return result;
    // }
    if (user && password === user.password) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }
}
