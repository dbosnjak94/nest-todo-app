import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Between, In, IsNull, LessThan, Not, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from '../email/email.service';
import { TaskStatus } from './enum/task-status.enum';

@Injectable()
export class TasksSchedulerService {
  private readonly logger = new Logger(TasksSchedulerService.name);

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async archivePastDueDateTasks() {
    this.logger.log('Archiving past due tasks');

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const tasksToArchive = await this.taskRepository.find({
      where: [
        // tasks with reminder that are past due for more than 3 days
        {
          status: In([TaskStatus.TODO, TaskStatus.IN_PROGRESS]),
          deadline: LessThan(threeDaysAgo),
          reminderTime: Not(IsNull()),
          archived: false,
        },
        // tasks without reminder that are just past deadline
        {
          status: In([TaskStatus.TODO, TaskStatus.IN_PROGRESS]),
          deadline: LessThan(now),
          reminderTime: IsNull(),
          archived: false,
        },
      ],
    });

    for (let task of tasksToArchive) {
      task.archived = true;
      await this.taskRepository.save(task);
    }

    this.logger.log(`Archived ${tasksToArchive.length} tasks.`);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkTasksAndSendReminders() {
    this.logger.log(`Checking for task reminders...`);

    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

    const tasksWithReminders = await this.taskRepository.find({
      where: {
        reminderTime: Between(now, fiveMinutesFromNow),
        reminderSent: false,
        archived: false,
      },
      relations: ['user'],
    });

    for (const task of tasksWithReminders) {
      await this.emailService.sendReminderEmail(task.user.email, task);

      task.reminderSent = true;
      await this.taskRepository.save(task);

      this.logger.log(`Sent reminder email for task: ${task.title}`);
    }
  }
}
