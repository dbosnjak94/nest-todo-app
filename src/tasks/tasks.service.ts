import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './enum/task-status.enum';
import { SetReminderDto } from './dto/set-reminder.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
  ) {}

  async createTask(
    createTaskDto: CreateTaskDto,
    userId: string,
  ): Promise<Task> {
    const { categoryIds, ...taskData } = createTaskDto;

    const task = this.taskRepository.create({
      ...taskData,
      user: { id: userId },
      categories: categoryIds ? categoryIds.map((id) => ({ id })) : [],
    });

    try {
      return await this.taskRepository.save(task);
    } catch (error) {
      throw new BadRequestException('Failed to create task');
    }
  }

  async listAllTasks(): Promise<Task[]> {
    return await this.taskRepository.find({
      relations: ['user', 'categories'],
    });
  }

  async findTaskById(taskId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['user', 'categories'],
    });

    if (!task) {
      throw new NotFoundException(`Task not found`);
    }

    return task;
  }

  async findTasksByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
    startDate: string,
    endDate: string,
  ): Promise<{ tasks: Task[]; total: number }> {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .where('task.user.id = :userId', { userId })
      .leftJoinAndSelect('task.categories', 'category');

    if (startDate && endDate) {
      query.andWhere('task.deadline BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('task.deadline >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('task.deadline <= :endDate', { endDate });
    }

    const [tasks, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    if (!tasks.length) {
      throw new NotFoundException(`No tasks found for the specified criteria`);
    }

    return { tasks, total };
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    const task = await this.findTaskById(taskId);

    task.status = status;

    if (status === 'DONE') {
      task.archived = true;
    }

    try {
      return await this.taskRepository.save(task);
    } catch (error) {
      throw new BadRequestException(`Failed to update task status`);
    }
  }

  async searchTaskByTerm(searchTerm: string, userId: string): Promise<Task[]> {
    try {
      const tasks = await this.taskRepository.find({
        where: [{ title: Like(`%${searchTerm}%`), user: { id: userId } }],
        relations: ['categories'],
      });
      return tasks;
    } catch (error) {
      throw error;
    }
  }

  async setReminder(
    taskId: string,
    setReminderDto: SetReminderDto,
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });

    if (!task) {
      throw new NotFoundException(`Task not found`);
    }

    if (!task.deadline) {
      throw new BadRequestException(
        `Cannot set a reminder for a task without a deadline`,
      );
    }

    if (setReminderDto.reminderTime > task.deadline) {
      throw new BadRequestException(
        `Reminder time cannot be after the deadline`,
      );
    }

    task.reminderTime = setReminderDto.reminderTime;
    return this.taskRepository.save(task);
  }

  async updateTask(
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.findTaskById(taskId);

    if (!task) {
      throw new NotFoundException(`Task not found`);
    }

    // check if deadline is in the past
    if (updateTaskDto.deadline) {
      const now = new Date();
      if (new Date(updateTaskDto.deadline) < now) {
        throw new BadRequestException('Deadline cannot be in the past');
      }
    }

    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  async deleteTask(taskId: string): Promise<void> {
    const result = await this.taskRepository.delete(taskId);

    if (result.affected === 0) {
      throw new NotFoundException(`Task not found`);
    }
  }
}
