import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entity/category.entity';
import { Task } from '../tasks/entity/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Task])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
