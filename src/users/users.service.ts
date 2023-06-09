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
    const saltRounds = 10;
    console.log('create function');
    if (createUserDto.name) {
      console.log('register new user', createUserDto);
      const newHash = await bcrypt?.genSalt(saltRounds);
      createUserDto.password = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );
      console.log('newHash', newHash);
      return this.usersRepository.save(createUserDto);
    } else {
      console.log('found login for', createUserDto); // found login for { email: 'lala@hotmail.com', password: 'lala' }
      bcrypt
        .hash(createUserDto.password, saltRounds)
        .then(async (hashedPassword) => {
          console.log(`Hash: ${hashedPassword}`); // Hash: "$2b$10$ub7oBFmsPtUniVBcvtijiORbUmywJylgy5c7KvqpBVRfwaWt3fwkq"
          // get the user by ???
          const user = await this.usersRepository.find({
            where: {
              email: createUserDto.email,
            },
          });
          console.log('found user', user); // found user User { id: 6415b54443a21a00036532af, name: 'tim' }

          if (user[0]?.password === hashedPassword) {
            console.log('pw match return JWT');
            // return JWT
            return true;
          } else {
            console.log('pw do not match return false');
            return false;
          }
        })
        .then((hash) => {
          console.log(`Hash 2: ${hash}`); // undefined
          // Store hash in your password DB.
          if (hash === true) {
            return { jwt: 'example' };
          } else {
            return { jwt: null };
          }
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
