import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'The name of the category' })
  @IsString()
  @MinLength(1, { message: 'Category name cannot be empty' })
  @MaxLength(50, {
    message: 'Category name cannot be longer than 50 characters',
  })
  name: string;
}
