<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# NestJS with TypeScript and MongoDB on Northflank

This app was started following along with the following two-part Northflank guides.

It uses [TypeORM](https://typeorm.io/entities) with NestJS as a pure Typescript backend.

[Part 1: Deploy NestJS with TypeScript on Northflank](https://northflank.com/guides/deploy-nest-js-with-typescript-on-northflank)

[Part 2: Deploy NestJS with TypeScript and MongoDB on Northflank](https://northflank.com/guides/deploy-nest-js-with-typescript-and-mongodb-on-northflank)

The author, Thomas Smyth does a good job of creating a demo destinations checklist API that can be used to keep track of places to visit and updated the list when a destination has been visited.

I will take this base approach and add CRUD endpoints to support the [Redux Essentials](https://redux.js.org/tutorials/essentials/part-4-using-data) social media feed demo app to support a Typescript backend to replace the Javascript fakeApi used in the tutorial.

The [clent.js issue](https://github.com/reduxjs/redux-essentials-example-app/issues/51) with the original Javascript backend was the beginning of this project.

## Getting started

Similar to the above step 1, we install the nest cli, create a new project, install the prerequisites and generate a REST API.

```txt
npm install -g @nestjs/cli
nest new flash
cd flash
npm install --save @nestjs/typeorm typeorm mongodb@3.7.3
```

## Scaffold the Posts API

The steps to create the posts API would be like this:

- Run ```nest generate resource```.
- When prompted enter the resource name ```posts```.
- Select REST API.
- Finally enter ```Y``` when asked whether or not we want to “generate CRUD entry points”.

Then we need to edit these four files:

```txt
posts.entity.ts
posts.module.ts
posts.service.ts
posts.controller.ts
```

Here are the modifications made to the pre-generated files to fill out the API endpoints.

### posts.entity.ts

We start out with an emptry posts.entity.ts file:

```js
export class Post {}
```

Our post interface looks like this:

```js
export interface Post {
    id: string;
    title: string;
    content: string;
    user: string;
    date: string;
    reactions: any;
}
```

So our entity should look like this:

```js
import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class Post {
  @ObjectIdColumn()
  id: ObjectID;
  @Column()
  title: string;
  @Column()
  content: string;
  @Column()
  user: string;
  @Column()
  date: string;
  @Column()
  reactions: string;
}
```

### posts.module.ts

Import the psots entity to defined a new modal in the resource.

Oringinally, the module file looks like this.

```js
import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';

@Module({
  controllers: [PostsController],
  providers: [PostsService]
})
export class PostsModule {}
```

Next import TypeOrmModule and the Post entity and add the feature using TypeORM:

```js
...
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  ...

})
```

### posts.service.ts

This starts off as dummy responses.

```js
import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  create(createPostDto: CreatePostDto) {
    return 'This action adds a new post';
  }

  findAll() {
    return `This action returns all posts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
```

Should be something like this:

```js
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: MongoRepository<Post>,
  ) {}

    create(createPostDto: CreatePostDto) {
    const post: CreatePostDto = {
      ...createPostDto,
      date: new Date().toISOString(),
      reactions: {
        thumbsUp: 0,
        hooray: 0,
        heart: 0,
        rocket: 0,
        eyes: 0,
      },
    };
    return this.postsRepository.save(post);
  }

  findAll() {
    return this.postsRepository.find();
  }

  findOne(id: any) {
    return this.postsRepository.findOne(id);
  }

  update(id: any, updatePostDto: UpdatePostDto) {
    return this.postsRepository.update(id, updatePostDto);
  }

  remove(id: string) {
    return this.postsRepository.delete(id);
  }
}
```

### posts.controller.ts

Originally the controller uses numerical ids generated by the NestJS CLI.

```js
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
```

Update the posts controller with MongoDB’s object ids

```js
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
```

## Testing with Postman

The article for part 2 shows some screenshots of how to test each API endpoint using [Postman](https://www.postman.com/).

Make sure the body of the request for POST or PATH is set to raw and JSON, not raw and Text.  If you don't then all you will wind up with is the id and nothing else.

## Running locally

Create a .env file like this:

```txt
DB_PORT=27017
DB_USERNAME=f473cfc7c226ede4
DB_PASSWORD=19dd6fb5f55d75c6325090185f0d8b2c
DB_DATABASE=499eee9281a8
```

Normally we would install the dotenv package to support this:

```shell
npm install dotenv --save
```

But Nestjs has it's [own config technique](https://docs.nestjs.com/techniques/configuration)

```shell
npm i --save @nestjs/config
```

In src\app.module.ts

```js
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ... etc
  ]
});
```

Now, variables like the ```process.env.DB_USERNAME``` will be available locally.

But, the app will still not connect with the cloud db when run locally.

There will be an error like this:

```txt
[Nest] 19332  - 18/03/2023, 9:24:23 am   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (6)...
MongoNetworkError: failed to connect to server [mongo-0.mongo--sk649jwvvmyk.addon.code.run:27017] on first connect [Error: getaddrinfo ENOTFOUND mongo-0.mongo--sk649jwvvmyk.addon.code.run
    at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:69:26) {
  name: 'MongoNetworkError'
}]
    at Pool.<anonymous> (C:\Users\timof\repos\timofeysie\node\flash\node_modules\mongodb\lib\core\topologies\server.js:441:11)
    at Pool.emit (node:events:365:28)
```

## Scaffold the Users API

The steps to create the users API is similar to the posts API.

- Run ```nest generate resource```.
- When prompted enter the resource name ```users```.
- Select REST API.
- Finally enter ```Y``` when asked whether or not we want to “generate CRUD entry points”.

Then we need to edit these four files:

1. post.entity.ts
2. posts.module.ts
3. posts.service.ts
4. posts.controller.ts

The user interface is super simple:

```js
export interface User {
  id: any;
  name: string;
}
```

## Scaffold the Notifications API

The steps to create the notifications API is similar to the posts and user APIs.

- Run ```nest generate resource```.
- When prompted enter the resource name ```notifications```.
- Select REST API.
- Finally enter ```Y``` when asked whether or not we want to “generate CRUD entry points”.

Then we need to edit these four files:

1. notification.entity.ts
2. notifications.module.ts
3. notifications.service.ts
4. notifications.controller.ts

The user interface for notifications looks like this:

```js
interface Notification {
    id: any;
    user: string;
    date: string;
    message: string;
}
```

The notification.entity.ts will look like this:

```js
@Entity()
export class Notification {
  @ObjectIdColumn()
  id: ObjectID;
  @Column()
  user: string;
  @Column()
  date: string;
  @Column()
  message: string;
  @Column()
  read: boolean;
  @Column()
  isNew: boolean;
}
```

Notice Nestjs is smart enough to make it a singular notification.  Very cool.  The same is true for the DTO objects in the controller:

```js
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: any) {
    return this.notificationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: any,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: any) {
    return this.notificationsService.remove(+id);
  }
}
```

The notifications.service.ts looks like this:

```js
@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: MongoRepository<Notification>,
  ) {}
  create(createNotificationDto: CreateNotificationDto) {
    const notification: CreateNotificationDto = {
      ...createNotificationDto,
      date: new Date().toISOString(),
    };
    return this.notificationsRepository.save(notification);
  }

  findAll() {
    return this.notificationsRepository.find();
  }

  findOne(id: any) {
    return this.notificationsRepository.findOne(id);
  }

  update(id: any, updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsRepository.update(id, updateNotificationDto);
  }

  remove(id: any) {
    return this.notificationsRepository.delete(id);
  }
}
```

Import the TypeOrm feature to the notifications.module.ts file like this:

```js
imports: [TypeOrmModule.forFeature([Notification])],
```

And we are pretty much done.  Create some notifications in Postman to test out the CRUD endpoints and see how it goes.

You can find the full changes done in [this commit](https://github.com/timofeysie/flash/commit/c9d5ce28dc528f4b0aea81c13ca51a7b35a21568).

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

## Original Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
