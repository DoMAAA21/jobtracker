import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CacheService } from '@/common/cache/cache.service';
import type { SortOrder } from '@/common/dto/pagination-query.dto';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
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
const USER_LIST_CACHE_TTL_MS = 30_000;
const USERS_LIST_VERSION_KEY = 'users:list:version';

const userCacheKey = (id: number) => `user:${id}`;

const usersListCacheKey = (
  version: number,
  page: number,
  perPage: number,
  sortBy: UserSortField,
  sortOrder: SortOrder,
  email?: string,
  name?: string,
) =>
  `users:list:v${version}:${page}:${perPage}:${sortBy}:${sortOrder}:${email ?? ''}:${name ?? ''}`;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
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

    const listVersion = await this.cache.getVersion(USERS_LIST_VERSION_KEY);
    const cacheKey = usersListCacheKey(
      listVersion,
      page,
      perPage,
      sortBy,
      sortOrder,
      query.email,
      query.name,
    );

    return this.cache.getOrSet(
      cacheKey,
      async () => {
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
      },
      USER_LIST_CACHE_TTL_MS,
    );
  }

  async findOne(id: number): Promise<PublicUser> {
    return this.cache.getOrSet(
      userCacheKey(id),
      async () => {
        const user = await this.prisma.user.findUnique({
          where: { id },
          select: userSelect,
        });

        if (!user) {
          throw new NotFoundException(`User #${id} not found`);
        }

        return user;
      },
      USER_CACHE_TTL_MS,
    );
  }

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException('Email already in use');
    }

    const password = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password,
      },
      select: userSelect,
    });

    await this.cache.bumpVersion(USERS_LIST_VERSION_KEY);
    return user;
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
    await this.cache.bumpVersion(USERS_LIST_VERSION_KEY);
    return updated;
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);

    await this.prisma.user.delete({ where: { id } });
    await this.cache.del(userCacheKey(id));
    await this.cache.bumpVersion(USERS_LIST_VERSION_KEY);

    return { message: 'User deleted' };
  }
}
