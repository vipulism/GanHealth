import { CreateUserDto, UserResponseDto } from '@ganhealth/validation';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PublicUser, PublicUserSelect, ROLE, STATUS } from '@ganhealth/types';
import { toUserResponse } from '@ganhealth/common';


@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async create(body: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const createdUser = await this.prisma.user.create({
      data: {
        email: body.email,
        passwordHash: hashedPassword,
        name: body.name,
        role: ROLE.USER,
        status: STATUS.ACTIVE,
        isEmailVerified: false,
      },
    });

    const { passwordHash, ...user } = createdUser;
    void passwordHash;

    return toUserResponse(user);
  }

  async findAll(): Promise<PublicUser[]> {
    return await this.prisma.user.findMany({
      take:10,
      select: PublicUserSelect
    });
  }


  async findOne(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: PublicUserSelect
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
