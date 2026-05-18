import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService
    ) { }

    async register(dto: RegisterDto) {
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (exists) throw new ConflictException('Email already in use');

        const hashed = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                password: hashed,
            },
        });

        return this.signToken(user.id, user.email);
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
          });
          if (!user) throw new UnauthorizedException('Invalid credentials');
      
          const match = await bcrypt.compare(dto.password, user.password);
          if (!match) throw new UnauthorizedException('Invalid credentials');
      
          return this.signToken(user.id, user.email);
    }


    private signToken(userId: number, email: string) {
        const payload = { sub: userId, email };
        return {
            access_token: this.jwt.sign(payload),
        };
    }

}
