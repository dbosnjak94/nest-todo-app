import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Repository } from 'typeorm';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Task) private taskRepository: Repository<Task>,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAllCategories(): Promise<Category[]> {
    return await this.categoryRepository.find();
  }

  async findCategoryById(categoryId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category not found`);
    }
    return category;
  }

  async getTasksForCategory(
    categoryId: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category not found`);
    }

    const [tasks, total] = await this.taskRepository.findAndCount({
      where: {
        categories: { id: categoryId },
        user: { id: userId },
      },
      relations: ['categories'],
      skip: (page - 1) * limit,
      take: limit,
    });

    if (!tasks.length) {
      throw new NotFoundException(
        `No tasks were found for category ${category.name}`,
      );
    }
    return { tasks, total };
  }

  async updateCategory(
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.findCategoryById(categoryId);

    if (!category) {
      throw new NotFoundException(`Category not found`);
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async deleteCategory(categoryId: string) {
    const result = await this.categoryRepository.delete(categoryId);
    if (result.affected === 0) {
      throw new NotFoundException(`Category not found`);
    }
  }
}
