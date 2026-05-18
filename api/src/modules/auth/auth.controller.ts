import { Controller, Post, Get, Body, Req } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthUser } from './types/auth-user.type';

type RequestWithUser = Request & { user: AuthUser };

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Get('me')
    async me(@Req() req: RequestWithUser) {
        return req.user;
    }
}
