import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

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
  ): Promise<{ tasks: Task[]; total: number }> {
    const [tasks, total] = await this.taskRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['categories'],
      skip: (page - 1) * limit,
      take: limit,
    });

    if (!tasks.length) {
      throw new NotFoundException(`No tasks found`);
    }

    return { tasks, total };
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
