import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './enum/task-status.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateTaskDto } from './dto/update-task.dto';

describe('TasksService', () => {
  let service: TasksService;
  let repo: Repository<Task>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest
        .fn()
        .mockResolvedValue([[{ id: '1', title: 'Task 1' }], 1]),
    })),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repo = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTask', () => {
    it('should create a task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Task title',
        status: TaskStatus.TODO,
        deadline: '2023-12-31',
      };
      const userId = '1';
      const task = {
        id: '1',
        ...createTaskDto,
        user: { id: userId },
        deadline: new Date('2023-12-31'),
      };

      mockRepository.create.mockReturnValue(task);
      mockRepository.save.mockResolvedValue(task);

      const result = await service.createTask(createTaskDto, userId);

      expect(result).toEqual(task);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        user: { id: userId },
        categories: [],
        deadline: new Date('2023-12-31'),
      });

      expect(mockRepository.save).toHaveBeenCalledWith(task);
    });

    it('should create a task without deadline', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Task title',
        status: TaskStatus.TODO,
      };
      const userId = '1';
      const task = {
        id: '1',
        ...createTaskDto,
        user: { id: userId },
        deadline: null,
      };

      mockRepository.create.mockReturnValue(task);
      mockRepository.save.mockResolvedValue(task);

      const result = await service.createTask(createTaskDto, userId);

      expect(result).toEqual(task);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        user: { id: userId },
        categories: [],
        deadline: null,
      });

      expect(mockRepository.save).toHaveBeenCalledWith(task);
    });

    it('should throw BadRequestException if save fails', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test task',
        status: TaskStatus.TODO,
      };
      const userId = '1';

      mockRepository.save.mockRejectedValue(new Error('save failed'));

      await expect(service.createTask(createTaskDto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('listAllTasks', () => {
    it('should return an array of tasks', async () => {
      const tasks = [
        { id: '1', title: 'Task 1' },
        { id: '2', title: 'Task 2' },
      ];
      mockRepository.find.mockResolvedValue(tasks);

      const result = await service.listAllTasks();

      expect(result).toEqual(tasks);
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'categories'],
      });
    });
  });

  describe('findTaskById', () => {
    it('should return a task if found', async () => {
      const task = { id: '1', title: 'Task 1' };
      mockRepository.findOne.mockResolvedValue(task);

      const result = await service.findTaskById('1');

      expect(result).toEqual(task);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['user', 'categories'],
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findTaskById('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findTasksByUserId', () => {
    it('should return tasks for a user', async () => {
      const mockTasks = [{ id: '1', title: 'Task 1' }];
      const mockTotal = 1;

      mockRepository
        .createQueryBuilder()
        .getManyAndCount.mockResolvedValue([mockTasks, mockTotal]);

      const result = await service.findTasksByUserId(
        '123',
        1,
        10,
        '2023-01-01',
        '2023-12-31',
      );

      expect(result).toEqual({ tasks: mockTasks, total: mockTotal });
    });

    // it('should throw NotFoundException if no tasks found', async () => {
    //   mockRepository
    //     .createQueryBuilder()
    //     .getManyAndCount.mockResolvedValue([[], 0]);

    //   await expect(service.findTasksByUserId('123', 1, 10)).rejects.toThrow(
    //     NotFoundException,
    //   );
    // });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      const task = { id: '1', title: 'Task 1', status: TaskStatus.TODO };
      mockRepository.findOne.mockResolvedValue(task);
      mockRepository.save.mockResolvedValue({
        ...task,
        status: TaskStatus.DONE,
        archived: true,
      });

      const result = await service.updateTaskStatus('1', TaskStatus.DONE);

      expect(result.status).toBe(TaskStatus.DONE);
      expect(result.archived).toBe(true);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateTaskStatus('1', TaskStatus.DONE),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchTaskByTerm', () => {
    it('should return tasks matching the search term', async () => {
      const tasks = [{ id: '1', title: 'Test Task' }];
      mockRepository.find.mockResolvedValue(tasks);

      const result = await service.searchTaskByTerm('Test', '123');

      expect(result).toEqual(tasks);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: [{ title: expect.any(Object), user: { id: '123' } }],
        relations: ['categories'],
      });
    });
  });

  describe('setReminder', () => {
    it('should set a reminder for a task', async () => {
      const task = {
        id: '1',
        title: 'Task 1',
        deadline: new Date('2023-12-31'),
      };
      const reminderTime = new Date('2023-12-30');
      mockRepository.findOne.mockResolvedValue(task);
      mockRepository.save.mockResolvedValue({ ...task, reminderTime });

      const result = await service.setReminder('1', { reminderTime });

      expect(result.reminderTime).toEqual(reminderTime);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.setReminder('1', { reminderTime: new Date() }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if task has no deadline', async () => {
      const task = { id: '1', title: 'Task 1' };
      mockRepository.findOne.mockResolvedValue(task);

      await expect(
        service.setReminder('1', { reminderTime: new Date() }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if reminder time is after deadline', async () => {
      const task = {
        id: '1',
        title: 'Task 1',
        deadline: new Date('2023-12-31'),
      };
      mockRepository.findOne.mockResolvedValue(task);

      await expect(
        service.setReminder('1', { reminderTime: new Date('2024-01-01') }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const task = { id: '1', title: 'Task 1' };
      const updateTaskDto: UpdateTaskDto = { title: 'Updated Task' };
      mockRepository.findOne.mockResolvedValue(task);
      mockRepository.save.mockResolvedValue({ ...task, ...updateTaskDto });

      const result = await service.updateTask('1', updateTaskDto);

      expect(result.title).toBe('Updated Task');
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateTask('1', { title: 'Updated Task' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if deadline is in the past', async () => {
      const task = { id: '1', title: 'Task 1' };
      mockRepository.findOne.mockResolvedValue(task);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await expect(
        service.updateTask('1', { deadline: pastDate.toString() }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.deleteTask('1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteTask('1')).rejects.toThrow(NotFoundException);
    });
  });
});
