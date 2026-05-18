import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResult } from './types';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
    ) { }

    async register(dto: RegisterDto): Promise<AuthResult> {
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (exists) {
            throw new ConflictException('Email already in use');
        }

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

    async login(dto: LoginDto): Promise<AuthResult> {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const match = await bcrypt.compare(dto.password, user.password);
        if (!match) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.signToken(user.id, user.email);
    }

    private signToken(userId: number, email: string): AuthResult {
        const payload = { sub: userId, email };
        return {
            accessToken: this.jwt.sign(payload),
            user: { id: userId, email },
        };
    }
}
