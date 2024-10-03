import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private taskRespository: Repository<Task>,
  ) {}

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRespository.create(createTaskDto);
    return await this.taskRespository.save(task);
  }

  async listAllTasks(): Promise<Task[]> {
    return await this.taskRespository.find();
  }

  async findTaskById(taskId: string): Promise<Task> {
    return await this.taskRespository.findOne({ where: { id: taskId } });
  }

  async updateTask(
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.taskRespository.update(taskId, updateTaskDto);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return this.taskRespository.findOne({ where: { id: taskId } });
  }

  async deleteTask(taskId: string): Promise<void> {
    const result = await this.taskRespository.delete(taskId);
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
  }
}
