import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'frodo.baggins@email.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  @IsString()
  @MaxLength(20, { message: 'Password must be not longer than 20 characters' })
  @MinLength(6, { message: 'Password must be at least 8 characters long' })
  password: string;
}
