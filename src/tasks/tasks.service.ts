import { Injectable, NotFoundException } from '@nestjs/common';
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
    const task = this.taskRepository.create({
      ...createTaskDto,
      user: { id: userId },
    });
    return await this.taskRepository.save(task);
  }

  async listAllTasks(): Promise<Task[]> {
    return await this.taskRepository.find();
  }

  async findTaskById(taskId: string): Promise<Task> {
    return await this.taskRepository.findOne({ where: { id: taskId } });
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
      throw new NotFoundException(`No tasks found for user with ID ${userId}`);
    }

    return { tasks, total };
  }

  async updateTask(
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.taskRepository.update(taskId, updateTaskDto);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return this.taskRepository.findOne({ where: { id: taskId } });
  }

  async deleteTask(taskId: string): Promise<void> {
    const result = await this.taskRepository.delete(taskId);
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
  }
}
