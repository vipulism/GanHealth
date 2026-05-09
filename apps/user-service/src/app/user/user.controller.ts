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
import { ROLE } from '@ganhealth/types';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';


/** HTTP API for user registration, profile, and admin user listing. */
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }


  @Post('create')
  createUser(
    @Body(new ZodValidationPipe(CreateUserSchema))
    body: CreateUserDto
  ) {
    return this.userService.create(body);
  }

  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Get('profile')
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
