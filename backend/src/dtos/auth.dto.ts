import { IsString, IsEmail, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../enums/UserRole';

@Exclude()
export class RegisterResponseDto {
    @Expose()
    @ApiProperty({ description: 'User ID' })
    id: number;

    @Expose()
    @ApiProperty({ description: 'Username' })
    username: string;

    @Expose()
    @ApiProperty({ description: 'Email address' })
    email: string;

    @Expose()
    @ApiPropertyOptional({ description: 'First name' })
    firstName?: string;

    @Expose()
    @ApiPropertyOptional({ description: 'Last name' })
    lastName?: string;

    @Expose()
    @ApiProperty({ description: 'User role', enum: UserRole })
    role: UserRole;

    @Expose()
    @ApiProperty({ description: 'Account creation date' })
    createdAt: Date;
}

export class RegisterDto {
    @IsString()
    @MinLength(3)
    @ApiProperty({ 
        description: 'Username',
        minLength: 3,
        example: 'johndoe'
    })
    username: string;

    @IsEmail()
    @ApiProperty({ 
        description: 'Email address',
        example: 'john@example.com'
    })
    email: string;

    @IsString()
    @MinLength(6)
    @ApiProperty({ 
        description: 'Password',
        minLength: 6,
        example: 'password123'
    })
    password: string;

    @IsEnum(UserRole)
    @ApiProperty({ 
        description: 'User role',
        enum: UserRole,
        example: UserRole.FREELANCER,
        enumName: 'UserRole'
    })
    role: UserRole;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ 
        description: 'First name',
        example: 'John'
    })
    firstName?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ 
        description: 'Last name',
        example: 'Doe'
    })
    lastName?: string;
}

export class LoginDto {
    @IsString()
    @ApiProperty({ 
        description: 'Email or username',
        example: 'john@example.com'
    })
    emailOrUsername: string;

    @IsString()
    @MinLength(6)
    @ApiProperty({ 
        description: 'Password',
        minLength: 6,
        example: 'password123'
    })
    password: string;
}

export class TokenResponseDto {
    @ApiProperty({
        description: 'User information',
        type: 'object',
        properties: {
            id: { type: 'number', example: 1 },
            username: { type: 'string', example: 'johndoe' },
            email: { type: 'string', example: 'john@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            role: { type: 'string', enum: UserRole, example: UserRole.FREELANCER },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
        }
    })
    user: {
        id: number;
        username: string;
        email: string;
        firstName?: string;
        lastName?: string;
        role: UserRole;
        createdAt: Date;
        updatedAt: Date;
    };

    @ApiProperty({
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    accessToken: string;

    @ApiProperty({
        description: 'Token expiration time in seconds',
        example: 900
    })
    expiresIn: number;
}

export class RefreshTokenDto {
    @IsString()
    @ApiProperty({
        description: 'Refresh token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    refreshToken: string;
}

export class TokensResponseDto {
    @ApiProperty({
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    accessToken: string;
} 