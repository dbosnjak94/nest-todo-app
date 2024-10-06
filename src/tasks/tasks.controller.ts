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
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { SetReminderDto } from './dto/set-reminder.dto';

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

  @Get('search')
  @ApiOperation({ summary: 'Search tasks by title or description' })
  @ApiQuery({ name: 'term', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Return matching tasks.' })
  searchTasks(@Query('term') term: string, @GetUser() user: JwtPayload) {
    return this.taskService.searchTaskByTerm(term, user.userId);
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

  @Get('user/deadline')
  @ApiOperation({
    summary: 'Get all tasks for the authenticated user with deadline filter',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all tasks for the authenticated user',
  })
  @ApiResponse({
    status: 404,
    description: 'No tasks found for the user',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    example: '2024-12-31',
  })
  findTasksByUserId(
    @GetUser() user: JwtPayload,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('startDate')
    startDate: string = new Date().toISOString().split('T')[0],
    @Query('endDate')
    endDate: string = new Date(
      new Date().setFullYear(new Date().getFullYear() + 1),
    )
      .toISOString()
      .split('T')[0],
  ) {
    return this.taskService.findTasksByUserId(
      user.userId,
      page,
      limit,
      startDate,
      endDate,
    );
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

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiResponse({
    status: 200,
    description: 'Task status updated successfully.',
  })
  updateTaskStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ) {
    return this.taskService.updateTaskStatus(id, updateTaskStatusDto.status);
  }

  @Patch(':id/reminder')
  @ApiOperation({ summary: 'Set a reminder for a task' })
  @ApiResponse({ status: 200, description: 'Reminder set successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  setReminder(
    @Param('id') taskId: string,
    @Body() setReminderDto: SetReminderDto,
  ) {
    return this.taskService.setReminder(taskId, setReminderDto);
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
