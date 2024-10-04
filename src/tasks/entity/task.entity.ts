import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Category } from '../../categories/entity/category.entity';
import { TaskStatus } from '../enum/task-status.enum';

@Entity({ schema: 'todo_app', name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({ nullable: true })
  deadline: Date;

  @Column({ nullable: true })
  reminderTime: Date;

  @ManyToOne(() => User, (user) => user.tasks)
  user: User;

  @ManyToMany(() => Category)
  @JoinTable()
  categories: Category[];

  @Column({ nullable: false, default: false })
  archived: Boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
