import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: MongoRepository<User>,
  ) {}

  async create(createUserDto: any) {
    console.log('create');
    if (createUserDto.name) {
      console.log('register new user', createUserDto);
      const salt = await bcrypt?.genSalt(10);
      createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
      return this.usersRepository.save(createUserDto);
    } else {
      console.log('found login for', createUserDto);
      const saltRounds = 10;
      bcrypt
        .hash(createUserDto.password, saltRounds)
        .then(async (hashedPassword) => {
          console.log(`Hash: ${hashedPassword}`);
          // get the user by ???
          const user = await this.usersRepository.findOne(createUserDto.name);
          console.log('found user', user);
          bcrypt
            .compare(user.password, hashedPassword)
            .then((res) => {
              console.log('compared', res);
              return res;
            })
            .catch((err) => console.error(err.message));
        })
        .then((hash) => {
          console.log(`Hash: ${hash}`);
          // Store hash in your password DB.
        });
    }
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: any) {
    return this.usersRepository.findOne(id);
  }

  update(id: any, updateUserDto: UpdateUserDto) {
    return this.usersRepository.update(id, updateUserDto);
  }

  remove(id: any) {
    return this.usersRepository.delete(id);
  }
}
