import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiBearerAuth()
@ApiTags('tasks')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created',
  })
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.taskService.createTask(createTaskDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, description: 'Return all Tasks' })
  listAllTasks() {
    return this.taskService.listAllTasks();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find tasks by ID' })
  @ApiResponse({ status: 200, description: 'Return the task' })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  findTaskById(@Param('id') taskId: string) {
    return this.taskService.findTaskById(taskId);
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get all tasks for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'Return all tasks for the specific user',
  })
  @ApiResponse({
    status: 404,
    description: 'No tasks forund for specific user',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findTasksByUserId(
    @GetUser() user: JwtPayload,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.taskService.findTasksByUserId(user.userId, page, limit);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({
    status: 200,
    description: 'The Task has been successfully updated',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  updateTask(
    @Param('id') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(taskId, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({
    status: 200,
    description: 'The task has been successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  deleteTask(@Param('id') taskId: string) {
    return this.taskService.deleteTask(taskId);
  }
}
