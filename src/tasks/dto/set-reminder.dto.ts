import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class SetReminderDto {
  @ApiProperty({ description: 'The reminder time for the task' })
  @IsDate()
  @Type(() => Date)
  reminderTime: Date;
}
