import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksSchedulerService } from './task-scheduler.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), EmailModule],
  controllers: [TasksController],
  providers: [TasksService, TasksSchedulerService],
})
export class TasksModule {}
