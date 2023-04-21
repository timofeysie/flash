import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

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
