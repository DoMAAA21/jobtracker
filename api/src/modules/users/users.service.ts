import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedUsers, PublicUser } from './types';

const userSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: userSelect,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
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
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

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

    return this.prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);

    await this.prisma.user.delete({ where: { id } });

    return { message: 'User deleted' };
  }
}
