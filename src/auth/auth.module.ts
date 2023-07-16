import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthModule } from './jwt/jwt-auth.module';
import { AuthController } from './auth.controller';
import { CognitoOauthModule } from './cognito/cognito-oauth.module';

@Module({
  controllers: [AuthController],
  imports: [UsersModule, PassportModule, JwtAuthModule, CognitoOauthModule],
})
export class AuthModule {}
