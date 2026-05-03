import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, CreateUserSchema } from '@ganhealth/validation';
import { ZodValidationPipe } from '../../common/pipes/zod.pipe';

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

  @Get('all')
  findAllUsers() {
    return this.userService.findAll();
  }

}
