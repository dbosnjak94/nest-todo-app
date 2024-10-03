import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // Since we have register user endpoint, we do not need to have create user endpoint in user module.
  // It can be introduced later when we will have somehind of admin dashboard and then admin can create and delete and search for users
  // @Post()
  // @ApiOperation({ summary: 'Create a new user' })
  // @ApiResponse({
  //   status: 409,
  //   description: 'Email already exists',
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'The User has been successfully created',
  // })
  // createUser(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.createUser(createUserDto);
  // }

  //This endpoint should be protected, but for the simplicity of the example and searching through the users
  // I will leave it unprotected for now
  @Get('')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  getAllUsers() {
    return this.userService.findAllUsers();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Return the user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiOperation({ summary: 'Get user by ID' })
  getUserById(@Param('id') userId: string) {
    return this.userService.findUserById(userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been suffessfully deleted',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  deleteUser(@Param('id') userId: string) {
    return this.userService.deleteUser(userId);
  }
}
