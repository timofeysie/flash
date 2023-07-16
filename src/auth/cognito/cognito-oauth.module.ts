import { Module } from '@nestjs/common';
import { CognitoOauthController } from './cognito-oauth.controller';
import { CognitoOauthStrategy } from './cognito-oauth.strategy';

@Module({
  imports: [],
  controllers: [CognitoOauthController],
  providers: [CognitoOauthStrategy],
})
export class CognitoOauthModule {}
