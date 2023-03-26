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
