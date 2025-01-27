import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({ message: 'Username is required' })
    username: string;

    @IsString()
    @IsNotEmpty({ message: 'First name is required' })
    firstName: string;

    @IsString()
    @IsNotEmpty({ message: 'Last name is required' })
    lastName: string;

    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;
}

export class LoginDto {
    @IsString()
    @IsNotEmpty({ message: 'Email/Username is required' })
    emailOrUsername: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
} 