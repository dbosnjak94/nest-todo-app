import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Category } from '../categories/category.entity';

@Entity({ schema: 'todo_app', name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  deadline: Date;

  @Column({ nullable: true })
  reminderTime: Date;

  @ManyToOne(() => User, (user) => user.tasks)
  user: User;

  @ManyToMany(() => Category)
  @JoinTable()
  categories: Category[];
}
