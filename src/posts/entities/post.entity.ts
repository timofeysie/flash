import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class Post {
  @ObjectIdColumn()
  id: ObjectID;
  @Column({ default: '' })
  title: string;
  @Column({ default: '' })
  content: string;
  @Column({ default: '' })
  user: string;
  @Column({ default: '' })
  date: string;
  @Column({ default: '' })
  reactions: string;
}
