import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';

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
