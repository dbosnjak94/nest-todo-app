import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Task } from '../tasks/entities/task.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryRepo: Repository<Category>;
  let taskRepo: Repository<Task>;

  const mockCategoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockTaskRepository = {
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    categoryRepo = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
    taskRepo = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
      };
      const category = {
        id: '1',
        ...createCategoryDto,
      };

      mockCategoryRepository.create.mockReturnValue(category);
      mockCategoryRepository.save.mockResolvedValue(category);

      const result = await service.createCategory(createCategoryDto);

      expect(result).toEqual(category);
      expect(mockCategoryRepository.create).toHaveBeenCalledWith(
        createCategoryDto,
      );
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(category);
    });
  });

  describe('findAllCategories', () => {
    it('should return an array of categories', async () => {
      const categories = [
        {
          id: '1',
          name: 'Category 1',
        },
        {
          id: '2',
          name: 'Category 2',
        },
      ];
      mockCategoryRepository.find.mockResolvedValue(categories);

      const result = await service.findAllCategories();

      expect(result).toEqual(categories);
      expect(mockCategoryRepository.find).toHaveBeenCalled();
    });
  });

  describe('findCategoryById', () => {
    it('should return a category if found', async () => {
      const category = {
        id: '1',
        name: 'Test Category',
      };
      mockCategoryRepository.findOne.mockResolvedValue(category);

      const result = await service.findCategoryById('1');

      expect(result).toEqual(category);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.findCategoryById('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTasksForCategory', () => {
    it('should return tasks for a category', async () => {
      const category = {
        id: '1',
        name: 'Test Category',
      };
      const tasks = [
        {
          id: '1',
          title: 'Task 1',
        },
        {
          id: '2',
          title: 'Task 2',
        },
      ];
      mockCategoryRepository.findOne.mockResolvedValue(category);
      mockTaskRepository.findAndCount.mockResolvedValue([tasks, 2]);

      const result = await service.getTasksForCategory('1', 'user1', 1, 10);

      expect(result).toEqual({
        tasks,
        total: 2,
      });
      expect(mockTaskRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          categories: {
            id: '1',
          },
          user: {
            id: 'user1',
          },
        },
        relations: ['categories'],
        skip: 0,
        take: 10,
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getTasksForCategory('1', 'user1', 1, 10),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if no tasks found', async () => {
      const category = {
        id: '1',
        name: 'Test Category',
      };
      mockCategoryRepository.findOne.mockResolvedValue(category);
      mockTaskRepository.findAndCount.mockResolvedValue([[], 0]);

      await expect(
        service.getTasksForCategory('1', 'user1', 1, 10),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const category = {
        id: '1',
        name: 'Old Name',
      };
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'New Name',
      };
      const updatedCategory = {
        ...category,
        ...updateCategoryDto,
      };

      mockCategoryRepository.findOne.mockResolvedValue(category);
      mockCategoryRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.updateCategory('1', updateCategoryDto);

      expect(result).toEqual(updatedCategory);
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(updatedCategory);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateCategory('1', {
          name: 'New Name',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      mockCategoryRepository.delete.mockResolvedValue({
        affected: 1,
      });

      await expect(service.deleteCategory('1')).resolves.not.toThrow();
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if category not found', async () => {
      mockCategoryRepository.delete.mockResolvedValue({
        affected: 0,
      });

      await expect(service.deleteCategory('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
