import { CreateUserDto, UserResponseDto } from '@ganhealth/validation';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLE, STATUS } from '@ganhealth/types';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  private toUserResponse(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    isEmailVerified: boolean;
    lastLoginAt: Date | null;
    profileImage: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as ROLE,
      status: user.status as STATUS,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ...(user.lastLoginAt ? { lastLoginAt: user.lastLoginAt } : {}),
      ...(user.profileImage ? { profileImage: user.profileImage } : {}),
    };
  }

  async create(body: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: body.email },
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

    return this.toUserResponse(user)
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }



  async findOne(id: string): Promise<UserResponseDto> {
    const userRow = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userRow) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const { passwordHash, ...user } = userRow;
    void passwordHash;
    return this.toUserResponse(user)

  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
