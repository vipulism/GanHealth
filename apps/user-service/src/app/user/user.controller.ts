import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, CreateUserSchema, UserResponseDto } from '@ganhealth/validation';
import { ZodValidationPipe } from '../../../common/pipes/zod.pipe';
import { JWTAuthGuard } from '../auth/jwt.auth.gaurd';
import { GetUser } from '../common/decorators/get.user.decorator';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { ROLE } from '@ganhealth/types';

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

  @UseGuards(JWTAuthGuard)
  @Get('profile')
  getUser(@GetUser() user: UserResponseDto) {
    return user
  }


  @UseGuards(JWTAuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN)
  @Get('all')
  findAllUsers() {
    return this.userService.findAll();
  }

}
