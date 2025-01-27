import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../enums/UserRole';

export class CreateRoleDto {
    @ApiProperty({ enum: UserRole, example: UserRole.FREELANCER })
    @IsEnum(UserRole)
    name: UserRole;

    @ApiProperty({ example: 'Users who can take on projects and submit proposals' })
    @IsString()
    description: string;
}

export class UpdateRoleDto {
    @ApiProperty({ example: 'Updated description for the role' })
    @IsString()
    description: string;
} 