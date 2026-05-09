import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, CreateUserSchema, UserResponseDto } from '@ganhealth/validation';
import { ZodValidationPipe } from '../../../common/pipes/zod.pipe';
import { JWTAuthGuard } from '../auth/jwt.auth.gaurd';
import { GetUser } from '../common/decorators/get.user.decorator';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { ROLE, STATUS } from '@ganhealth/types';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';


/** HTTP API for user registration, profile, and admin user listing. */
@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }


  @Post('create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ schema: { example: { email: 'test@example.com', password: 'password', name: 'John Doe'} }})
  createUser(
    @Body(new ZodValidationPipe(CreateUserSchema))
    body: CreateUserDto
  ) {
    return this.userService.create(body);
  }

  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Get('profile')
  @ApiOkResponse({
    description: 'Current authenticated user',
    schema: {
      example: {
        email: 'user@example.com',
        name: 'Jane Doe',
        id: '550e8400-e29b-41d4-a716-446655440000',
        role: 'USER',
        status: 'ACTIVE',
        isEmailVerified: true,
        lastLoginAt: '2025-01-01T12:00:00.000Z',
        profileImage: 'https://example.com/avatar.png',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T12:00:00.000Z',
      },
    },
  })
  getUser(@GetUser() user: UserResponseDto) {
    return user
  }


  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  @ApiQuery({ name: 'page', required: false, type: Number, description: '1-based page index', example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Page size (max 100)',
    example: 10,
  })
  @Get('all')
  findAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.userService.findAll(page, limit);
  }

}
