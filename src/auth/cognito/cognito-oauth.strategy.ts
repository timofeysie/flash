import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CognitoOauthStrategy extends PassportStrategy(
  Strategy,
  'cognito',
) {
  private domain: string;

  constructor(configService: ConfigService) {
    super({
      authorizationURL: CognitoOauthStrategy.authorizationUrl(
        configService.get<string>('OAUTH_COGNITO_DOMAIN') as string,
      ),
      tokenURL: CognitoOauthStrategy.tokenUrl(
        configService.get<string>('OAUTH_COGNITO_DOMAIN') as string,
      ),
      clientID: configService.get<string>('OAUTH_COGNITO_ID'),
      clientSecret: configService.get<string>('OAUTH_COGNITO_SECRET'),
      callbackURL: configService.get<string>('OAUTH_COGNITO_REDIRECT_URL'),
    });
    this.domain = configService.get<string>('OAUTH_COGNITO_DOMAIN') as string;
  }

  static oAuthBaseUrl(domain: string): string {
    return `${domain}/oauth2`;
  }

  static authorizationUrl(domain: string): string {
    return `${this.oAuthBaseUrl(domain)}/authorize`;
  }

  static tokenUrl(domain: string): string {
    return `${this.oAuthBaseUrl(domain)}/token`;
  }

  static userInfoUrl(domain: string): string {
    return `${this.oAuthBaseUrl(domain)}/userInfo`;
  }

  static logoutUrl(domain: string, clientId: string, redirect: string): string {
    return `${domain}/logout?client_id=${clientId}&logout_uri=${redirect}`;
  }

  async validate(accessToken: string) {
    // Here the `id_token` is also received: https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html
    // But it's not supported by passport-oauth2, only `access_token` is received
    // Therefore another call is made to the userinfo endpoint
    const userinfo = (
      await axios.get(CognitoOauthStrategy.userInfoUrl(this.domain), {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    ).data;

    // Here a custom User object is returned. In the the repo I'm using a UsersService with repository pattern, learn more here: https://docs.nestjs.com/techniques/database
    return {
      provider: 'cognito',
      providerId: userinfo.username,
      name: userinfo.name,
      username: userinfo.email,
    };
  }
}
