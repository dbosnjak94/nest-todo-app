import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './enum/task-status.enum';

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

    try {
      return await this.taskRepository.save(task);
    } catch (error) {
      throw new BadRequestException(`Failed to update task status`);
    }
  }

  async searchTask(searchTerm: string, userId: string): Promise<Task[]> {
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

  async updateTask(
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.taskRepository.update(taskId, updateTaskDto);

    if (!task) {
      throw new NotFoundException(`Task not found`);
    }

    return this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['user', 'categories'],
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    const result = await this.taskRepository.delete(taskId);

    if (result.affected === 0) {
      throw new NotFoundException(`Task not found`);
    }
  }
}
