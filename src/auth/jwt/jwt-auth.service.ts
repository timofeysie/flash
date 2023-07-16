import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from './jwt-auth.strategy';

@Injectable()
export class JwtAuthService {
  constructor(private jwtService: JwtService) {}

  login(user: User) {
    const numericId = parseInt(user.id.toHexString(), 16); // Convert hexadecimal string to a number
    const payload: JwtPayload = { username: user.username, sub: numericId };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
