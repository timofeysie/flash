# Failed auth attempt

These are notes from work that was reverted because of the "Nest can't resolve dependencies of the JWT_MODULE_OPTIONS" described at the end of this file.

Started with the official docs, I understand the error and how to solve it now.  But it's good to start off fresh from a working app that you understand instead of skipping ahead with code from a tutorial that's over your head (at the moment, you'll get there!).  Sometimes it pays off to read the official docs.

## Current status

So where am I at with this work?  There are currently three branches on my local:

```txt
> git branch
  develop
* failed-auth
  main
PS C:\Users\timof\repos\node\flash> git log      
Date:   Mon Jul 17 21:35:13 2023 +0900
    added npm install @nestjs/config
Date:   Mon Jul 17 21:26:57 2023 +0900
    remove jwtAuthService constructor
Date:   Mon Jul 17 08:39:57 2023 +0900
    added passport
```

But what branch is deployed and current?  The last commit on NF is has the log comment: "added vscode extensions file".  So all these notes need to go there.  I think I am only on this branch to add this file.

## The solution to 'Nest can't resolve dependencies of the AuthGuard'

### Using a config service

We can get secrets from the process.env method like this:

```js
secretOrPrivateKey: process.env.JWT_SECRET
```

It works locally, but when deployed to Northflank and other services, we need to use the Nest config service.  It is set up like this:

Step 1: In the main app.module:

```js
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
})
export class AppModule {}
```

Step 2: I a sub-module, just import it, but not 'forRoot':

```js
@Module({
  imports: [ConfigModule],
  ...
});
```

Step 3: Then, actually using a value from the config:

```js
import { ConfigService } from '@nestjs/config';

constructor(private configService: ConfigService) {

        const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
}
```

If you skip step 2, you get this ERROR: *[ExceptionHandler] Nest can't resolve dependencies of the AuthGuard (JwtService, ?). Please make sure that the argument ConfigService at index [1] is available in the AuthModule context.*

```txt
Potential solutions:
- Is AuthModule a valid NestJS module?
- If ConfigService is a provider, is it part of the current AuthModule?
- If ConfigService is exported from a separate @Module, is that module imported within AuthModule?
  @Module({
    imports: [ /* the Module containing ConfigService */ ]
  })
```

## Failed JWT attempt

Despite the ease of use in create CRUD APIs, creating an authentication system with JWTs has not been so smooth.

A user can be registered, but the hash created to compare to the stored hash always comes out different:

```txt
2023-06-09T08:01:19.795675742Z stdout F found user [
2023-06-09T08:01:19.795727222Z stdout F   User {
2023-06-09T08:01:19.795734284Z stdout F     id: 6482dc39f4ca5b00037d95f5,
2023-06-09T08:01:19.795737957Z stdout F     name: 'asdffdsa',
2023-06-09T08:01:19.795741237Z stdout F     email: 'fdsa@fdsa.com',
2023-06-09T08:01:19.795744694Z stdout F     password: '$2b$10$GMDbQ4/AcHaQVYdA8Du8h.bsF6.rWt43Wqtz07flWLrS759TvhutC'
2023-06-09T08:01:19.795747804Z stdout F   }
2023-06-09T08:01:19.7957508Z stdout F ]
2023-06-09T08:01:19.79595855Z stdout F pw do not match return false
2023-06-09T08:01:19.795978691Z stdout F Hash 2: false
```

Time to look at both hash creation code sections to see what's going on there.

### Next steps

There two more steps to make this a complete authentication flow:

1. Issue a JWT token in the redirect endpoint so that we can handle the user session in the app. You can see how to do that in my OAuth2 in NestJS for social login article.
2. Find or store user data in the validate callback. I’m using a DB with TypeORM Repository in the nestjs-starter repo. You can also learn more from the official docs.

### Issue a JWT token in the redirect endpoint

There is a whole nother [article for this](https://javascript.plainenglish.io/oauth2-in-nestjs-for-social-login-google-facebook-twitter-etc-8b405d570fd2).

## AWS Cognito

To accomplish this, I found someone describing the kind of thing we want.

Using OAuth with Nest.js and TypeORM.  [The article](https://javascript.plainenglish.io/oauth2-in-nestjs-for-social-login-google-facebook-twitter-etc-8b405d570fd2) by Csaba Apagyi seems worth a try.  It's a little terse, but giving it a shot here.

[The source code](https://github.com/thisismydesign/nestjs-starter/tree/master/src/server/app/auth/cognito).

To Setup Cognito we need to create:

- a User Pool
- an App Client
- configure the Hosted UI

Here is [the AWS docs link](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-integration.html).

Here is my [user pool](https://ap-southeast-2.console.aws.amazon.com/cognito/v2/idp/user-pools/ap-southeast-2_W0XqkTFtm/users?region=ap-southeast-2#).

Add the config details to the .env file.  It was not easy to work out what data related to the key values.

OAUTH_COGNITO_Id is usually referred to as the "App client ID"

OAUTH_COGNITO_REDIRECT_URL is known as a Allowed callback URL

OAUTH_COGNITO_REDIRECT_URL=https://radiant-springs-38893.herokuapp.com/

OAUTH_COGNITO_DOMAIN=https://test-app.auth.us-east-1.amazoncognito.com

OAUTH_COGNITO_DOMAIN represents the base URL of your Amazon Cognito User Pool domain. This domain is used to construct the complete URLs for the authorization and token endpoints required for the OAuth flow.

Based on the example code, the OAUTH_COGNITO_DOMAIN should be the base URL of the Amazon Cognito User Pool domain, something like https://your-user-pool-domain.auth.region.amazonaws.com.

The base URL of the Amazon Cognito User Pool domain is not directly visible in the AWS Management Console. Instead, you can construct the base URL based on your region and user pool ID.

The base URL for the Amazon Cognito User Pool domain follows this format: https://your-user-pool-id.auth.region.amazonaws.com

To find the base URL of your Amazon Cognito User Pool domain, you need to know the following:

Your User Pool ID: You can find this in the AWS Management Console under Amazon Cognito > Manage User Pools > (Select your user pool) > Pool details > Pool Id.

The AWS region where your User Pool is located: You can find this in the AWS Management Console's top-right corner. The region will be something like us-east-1, eu-west-2, etc.

For this app, it's ap-southeast-2 (Asia Pacific: Sydney).

With these two pieces of information, you can construct the base URL for your Amazon Cognito User Pool domain. For example, if your User Pool ID is us-west-2_abcdefghi and your AWS region is us-west-2, then your base URL would be:

```txt
User pool ID: ap-southeast-2_W0XqkTFtm
AWS region: ap-southeast-2
```

So if my User pool name: flash.
AWS region: ap-southeast-2

Then the base URL for the Amazon Cognito User Pool domain: https://flash.auth.ap-southeast-2.amazonaws.com

### The server setup

The server setup shows [these four files](https://github.com/thisismydesign/nestjs-starter/tree/master/src/server/app/auth/cognito):

```txt
cognito-oauth.controller.ts
cognito-oauth.guard.ts
cognito-oauth.module.ts
cognito-oauth.strategy.ts
```

Actually, the files in the repo are quite different from the ones [in the article](https://github.com/thisismydesign/nestjs-starter/tree/master/src/server/app/auth/cognito).  I will use the files from the article, because the repo is a model for all kinds of things such as GraphQL and not just Oauth with Cognito.

Some packages will need to be installed with npm:

```txt
@nestjs/passport
passport-oauth2
passport
axios
```

After this there is still an issue in the controller:

```js
@Controller('auth/cognito')
export class CognitoOauthController {
  constructor(private jwtAuthService: JwtAuthService) {}
```

The error is: ***Cannot find name 'JwtAuthService'.ts(2304) Parameter 'jwtAuthService' of constructor from exported class has or is using private name 'JwtAuthService'.ts(4063)***

There is no other mention of the JwtAuthService, so for this we must go to the repo.  The [jwt-auth.service.ts](https://github.com/thisismydesign/nestjs-starter/blob/master/src/server/app/auth/jwt/jwt-auth.service.ts)

But to use this, we will need a whole nother four files:

```txt
jwt-auth.guard.ts
jwt-auth.module.ts
jwt-auth.service.ts
jwt-auth.strategy.ts
```

These will also require some libraries to also be installed with npm (or yarn or whatever):

```txt
@nestjs/jwt
passport-jwt
```

But this rabbit hole doesn't stop there.  We will also need these files to support those files:

```txt
src/server/config/constants
../../users/user.entity
```

We have a user.entity file already, but in this location:

```txt
import { User } from '../../users/entities/user.entity';
```

One problem is it doesn't have a username property: *Property 'username' does not exist on type 'User'.ts(2339)*

```js
@Entity()
export class User {
  @ObjectIdColumn()
  id: ObjectID;
  @Column()
  name: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column()
  username: string; <-- add this
}
```

After this, there is still an error on the *sub*: *Type 'ObjectID' is not assignable to type 'number'.ts(2322) jwt-auth.strategy.ts(7, 28): The expected type comes from property 'sub' which is declared here on type 'JwtPayload'*

```js
  login(user: User) {
    const payload: JwtPayload = { username: user.username, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
```

It took about ten minutes with ChatGPT to get something that solved this error:

```js
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
```

Next, the constants.  I put it in a slightly different location:

```js
import { SESSION_COOKIE_KEY } from '../config/constants';
```

Next, the Nest.js controller:

```js
@Get('redirect')
  @UseGuards(CognitoOauthGuard)
  async cognitoAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // Here we can issue a JWT token to manage the user session from the app
    // For now, we'll just show the user object
    return req.user;
  }
```

It has the following error on 'user': *Property 'user' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.ts(2339)*

ChatGPT recommended this the User object, but *Module '"@nestjs/jwt"' has no exported member 'User'.ts(2305)*.

After a bit, this works: *create a custom decorator to extend the Request object and provide access to the authenticated user.*

```js
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

@Controller('auth/cognito')
export class CognitoOauthController {
  constructor(private jwtAuthService: JwtAuthService) {}
  ...
  @Get('redirect')
  @UseGuards(CognitoOauthGuard)
  async cognitoAuthRedirect(@User() user: any) {
    // Now you can access the user object from the CognitoOauthGuard
    return user;
  }
```

There are two more files needed not mentioned in the article.  I suppose they assume we know how to add modules to a nest app.

In the auth directory, add these:

```txt
auth.controller.ts
auth.module.ts
```

This includes the /google/google-oauth.module.   Do we need that?  Lets leave that out for now.

Next, add the module file to the main app.module.ts file:

```js
import { AuthModule } from './auth/auth.module';
```

Now it's time to test it out.  The big tragedy of this backend is that, based on Northflanks bd service, I was unable to setup mongo locally to test things, so everything must be pushed to the server for testing.

### The errors

Error: Cannot find module 'passport'
2023-07-16T23:14:01.865318681Z stderr F Require stack:
2023-07-16T23:14:01.865322305Z stderr F - /usr/src/app/node_modules/@nestjs/passport/dist/auth.guard.js
2023-07-16T23:14:01.865325341Z stderr F - /usr/src/app/node_modules/@nestjs/passport/dist/index.js

I think I installed the types but not the package itself.  Add that now:  ```npm i passport --save```

Next error:

[Nest] 3  - 07/16/2023, 11:42:46 PM
ERROR [ExceptionHandler] Nest can't resolve dependencies of the JWT_MODULE_OPTIONS (?). Please make sure that the argument ConfigService at index [0] is available in the JwtModule context.
2023-07-16T23:42:46.506815418Z stderr F
2023-07-16T23:42:46.506819548Z stderr F Potential solutions:
2023-07-16T23:42:46.506823379Z stderr F - Is JwtModule a valid NestJS module?
2023-07-16T23:42:46.50682665Z stderr F - If ConfigService is a provider, is it part of the current JwtModule?
2023-07-16T23:42:46.506830391Z stderr F - If ConfigService is exported from a separate @Module, is that module imported within JwtModule?
2023-07-16T23:42:46.506833674Z stderr F   @Module({
2023-07-16T23:42:46.506836851Z stderr F     imports: [ /* the Module containing ConfigService */ ]
2023-07-16T23:42:46.50684042Z stderr F   })

I'm not sure where the JwtModule needs to be configured.

There are actually two how-to articles on this subject by Csaba Apagyi:

- [Cognito via OAuth2 in NestJS: Outsourcing Authentication Without Vendor Lock-in](https://javascript.plainenglish.io/cognito-via-oauth2-in-nestjs-outsourcing-authentication-without-vendor-lock-in-ce908518f547)
- [OAuth2 in NestJS for Social Login (Google, Facebook, Twitter, etc)](https://javascript.plainenglish.io/oauth2-in-nestjs-for-social-login-google-facebook-twitter-etc-8b405d570fd2)

The JwtModule only appears in the second article.  I was initially following the first one.  I only included the files from the repo with the JwtModule because the JwtAuthService appears in the cognito-oath.controller constructor.  However, looking at that again, I see it's not actually used.  But since I do want social login, I guess it's OK to have a look at the second article and see what I missed by going directly to the repo.

npm install @nestjs/config