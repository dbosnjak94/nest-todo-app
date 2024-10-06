import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDate,
  IsUUID,
  IsArray,
  MinLength,
  MaxLength,
  IsEnum,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '../enum/task-status.enum';

export class CreateTaskDto {
  @ApiProperty({ description: 'The title of the task' })
  @IsString()
  @MinLength(1, { message: 'Title cannot be empty' })
  @MaxLength(100, { message: 'Title cannot be longer than 100 characters' })
  title: string;

  @ApiPropertyOptional({ description: 'The description of the task' })
  @IsString()
  @IsOptional()
  @MaxLength(200, {
    message: 'Description cannot be longer than 200 characters',
  })
  description?: string;

  @ApiProperty({
    description: 'The status of the task',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiPropertyOptional({
    description: 'The deadline of the task',
    example: '2024-12-15T10:00:00.000Z',
  })
  @IsISO8601({ strict: true })
  @IsOptional()
  deadline?: string;

  // @ApiPropertyOptional({ description: 'The reminder time for the task' })
  // @IsDate()
  // @Type(() => Date)
  // @IsOptional()
  // reminderTime?: Date;

  @ApiPropertyOptional({
    description: 'The IDs of the categories this task belongs to',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each category ID must be a valid UUID' })
  @IsOptional()
  categoryIds?: string[];
}
