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
    const salt = await bcrypt?.genSalt(10);
    if (createUserDto.name) {
      console.log('register new user', createUserDto);
      createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
      return this.usersRepository.save(createUserDto);
    } else {
      console.log('found login for', createUserDto);
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
      const user = await this.usersRepository.findOne(createUserDto.id);
      const match = await bcrypt.compare(user.password, hashedPassword);
      if (user && match) {
        console.log('pw match');
        const token = jwt.sign(createUserDto.id, process.env.JWT_SECRET, {
          expiresIn: '12h',
        });
        const response = {
          _id: createUserDto.id,
          firstName: createUserDto.name,
          email: user.email,
          userToken: token,
        };
        console.log('login success', response);
        return response;
      } else {
        return { error: 'login failed'}
      }
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
