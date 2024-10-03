import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDate, IsUUID, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @ApiProperty({ description: 'The title of the task' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'The description of the task' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The status of the task',
    enum: ['TODO', 'IN_PROGRESS', 'DONE'],
  })
  @IsString()
  status: string;

  @ApiPropertyOptional({ description: 'The deadline of the task' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  deadline?: Date;

  @ApiPropertyOptional({ description: 'The reminder time for the task' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  reminderTime?: Date;

  @ApiProperty({ description: 'The ID of the user who owns this task' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    description: 'The IDs of the categories this task belongs to',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  categoryIds?: string[];
}
