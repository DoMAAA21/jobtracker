import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsString()
    @IsNotEmpty()
    name: string;
    @IsString()
    @MinLength(8)
    @MaxLength(32)
    @IsNotEmpty()
    password: string;
}