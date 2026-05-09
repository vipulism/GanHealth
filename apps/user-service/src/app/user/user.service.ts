import { CreateUserDto, UserResponseDto } from '@ganhealth/validation';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PublicUser, PublicUserSelect, ROLE, STATUS } from '@ganhealth/types';
import { toUserResponse } from '@ganhealth/common';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

/**
 * Paginated list of public user fields returned by {@link UserService.findAll}.
 */
export interface PaginatedPublicUsers {
  data: PublicUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** User persistence and profile operations backed by Prisma. */
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

  /**
   * Returns a page of users with total count metadata.
   *
   * @param page - 1-based page index
   * @param limit - page size, clamped to {@link MAX_PAGE_SIZE}
   */
  async findAll(page: number, limit: number): Promise<PaginatedPublicUsers> {
    const safePage = Math.max(1, Math.floor(Number.isFinite(page) ? page : 1));
    const rawLimit = Math.floor(Number.isFinite(limit) ? limit : DEFAULT_PAGE_SIZE);
    const safeLimit = Math.min(Math.max(1, rawLimit), MAX_PAGE_SIZE);
    const skip = (safePage - 1) * safeLimit;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        skip,
        take: safeLimit,
        select: PublicUserSelect,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / safeLimit),
      },
    };
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
