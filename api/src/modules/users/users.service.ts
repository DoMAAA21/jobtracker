import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { SortOrder } from '@/common/dto/pagination-query.dto';
import { QueryUsersDto, type UserSortField } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedUsers, PublicUser } from './types';

const userSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

const userOrderBy: Record<
  UserSortField,
  (order: SortOrder) => Prisma.UserOrderByWithRelationInput
> = {
  id: (order) => ({ id: order }),
  name: (order) => ({ name: order }),
  email: (order) => ({ email: order }),
  createdAt: (order) => ({ createdAt: order }),
};

const USER_CACHE_TTL_MS = 60_000;

const userCacheKey = (id: number) => `user:${id}`;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async findAll(query: QueryUsersDto): Promise<PaginatedUsers> {
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 10;
    const skip = (page - 1) * perPage;

    const where: Prisma.UserWhereInput = {
      ...(query.email && {
        email: { contains: query.email, mode: 'insensitive' },
      }),
      ...(query.name && {
        name: { contains: query.name, mode: 'insensitive' },
      }),
    };

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const orderBy = userOrderBy[sortBy](sortOrder);

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: userSelect,
        skip,
        take: perPage,
        orderBy,
      }),
    ]);

    return {
      data: users,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.max(1, Math.ceil(total / perPage)),
      },
    };
  }

  async findOne(id: number): Promise<PublicUser> {
    const key = userCacheKey(id);
    const cached = await this.cache.get<PublicUser>(key);
    if (cached) {
      return cached;
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    await this.cache.set(key, user, USER_CACHE_TTL_MS);
    return user;
  }

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException('Email already in use');
    }

    const password = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password,
      },
      select: userSelect,
    });
  }

  async update(id: number, dto: UpdateUserDto): Promise<PublicUser> {
    await this.findOne(id);

    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id } },
      });

      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    const data: Prisma.UserUpdateInput = {
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.password !== undefined && {
        password: await bcrypt.hash(dto.password, 10),
      }),
    };

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });

    await this.cache.del(userCacheKey(id));
    return updated;
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);

    await this.prisma.user.delete({ where: { id } });
    await this.cache.del(userCacheKey(id));

    return { message: 'User deleted' };
  }
}
