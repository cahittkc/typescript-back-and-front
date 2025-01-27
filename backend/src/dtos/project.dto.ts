import { IsString, IsNumber, IsEnum, IsArray, IsOptional, IsDateString, Min, MaxLength, ArrayMinSize, IsUUID, Max, IsISO8601 } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectCategory } from '../enums/ProjectCategory';
import { ProjectStatus } from '../enums/ProjectStatus';
import { Type, Transform } from 'class-transformer';

export class CreateProjectDto {
    @ApiProperty({ example: 'E-commerce Website Development' })
    @IsString()
    @MaxLength(100)
    title: string;

    @ApiProperty({ example: 'Need a full-stack developer to build an e-commerce website...' })
    @IsString()
    @MaxLength(2000)
    description: string;

    @ApiProperty({ enum: ProjectCategory, example: 'web_development', enumName: 'ProjectCategory' })
    @IsEnum(ProjectCategory, {
        message: 'category must be one of the following values: web_development, mobile_development, ui_ux_design, graphic_design, content_writing, digital_marketing, seo, data_science, blockchain, other'
    })
    @Transform(({ value }) => value?.toLowerCase())
    category: ProjectCategory;

    @ApiProperty({ example: 5000, description: 'Project budget in USD' })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    budget: number;

    @ApiProperty({ example: '2024-12-31', description: 'Project deadline (YYYY-MM-DD)' })
    @IsISO8601({ strict: false })
    @Type(() => String)
    deadline: string;

    @ApiProperty({ example: ['React', 'Node.js', 'PostgreSQL'] })
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    requiredSkills: string[];

    @ApiPropertyOptional({ example: 'project-requirements.pdf' })
    @IsOptional()
    @IsString()
    attachments?: string;
}

export class UpdateProjectDto {
    @ApiPropertyOptional({ example: 'Updated E-commerce Website Development' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    title?: string;

    @ApiPropertyOptional({ example: 'Updated project description...' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;

    @ApiPropertyOptional({ enum: ProjectCategory, example: 'web_development', enumName: 'ProjectCategory' })
    @IsOptional()
    @IsEnum(ProjectCategory, {
        message: 'category must be one of the following values: web_development, mobile_development, ui_ux_design, graphic_design, content_writing, digital_marketing, seo, data_science, blockchain, other'
    })
    @Transform(({ value }) => value?.toLowerCase())
    category?: ProjectCategory;

    @ApiPropertyOptional({ example: 6000 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    budget?: number;

    @ApiPropertyOptional({ example: '2024-12-31', description: 'Project deadline (YYYY-MM-DD)' })
    @IsOptional()
    @IsISO8601({ strict: false })
    @Type(() => String)
    deadline?: string;

    @ApiPropertyOptional({ example: ['React', 'Node.js', 'PostgreSQL', 'AWS'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    requiredSkills?: string[];

    @ApiPropertyOptional({ example: 'updated-requirements.pdf' })
    @IsOptional()
    @IsString()
    attachments?: string;

    @ApiPropertyOptional({ enum: ProjectStatus, example: 'in_progress', enumName: 'ProjectStatus' })
    @IsOptional()
    @IsEnum(ProjectStatus, {
        message: 'status must be one of the following values: open, in_progress, completed, cancelled'
    })
    @Transform(({ value }) => value?.toLowerCase())
    status?: ProjectStatus;
}

export class AssignFreelancerDto {
    @ApiProperty({ example: 1, description: 'Freelancer ID to assign to the project' })
    @IsNumber()
    freelancerId: number;
}

export class CompleteProjectDto {
    @ApiProperty({ example: 'Project completed successfully with all requirements met.' })
    @IsString()
    @MaxLength(1000)
    completionNotes: string;

    @ApiProperty({ example: 4.5, description: 'Rating for the freelancer (0-5)' })
    @IsNumber()
    @Min(0)
    @Max(5)
    freelancerRating: number;

    @ApiProperty({ example: 'Great work! The freelancer delivered everything on time.' })
    @IsString()
    @MaxLength(1000)
    freelancerReview: string;
}

export class CancelProjectDto {
    @ApiProperty({ example: 'Project requirements have changed significantly.' })
    @IsString()
    @MaxLength(1000)
    cancellationReason: string;
}

export class RateProjectDto {
    @ApiProperty({ example: 4.5, description: 'Rating (0-5)' })
    @IsNumber()
    @Min(0)
    @Max(5)
    rating: number;

    @ApiProperty({ example: 'Excellent communication and project management.' })
    @IsString()
    @MaxLength(1000)
    review: string;
}

export class GetProjectsQueryDto {
    @ApiPropertyOptional({ example: 1, minimum: 1 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 50 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(50)
    limit?: number;

    @ApiPropertyOptional({ enum: ProjectStatus, example: 'open', enumName: 'ProjectStatus' })
    @IsOptional()
    @IsEnum(ProjectStatus, {
        message: 'status must be one of the following values: open, in_progress, completed, cancelled'
    })
    @Transform(({ value }) => value?.toLowerCase())
    status?: ProjectStatus;

    @ApiPropertyOptional({ enum: ProjectCategory, example: 'web_development', enumName: 'ProjectCategory' })
    @IsOptional()
    @IsEnum(ProjectCategory, {
        message: 'category must be one of the following values: web_development, mobile_development, ui_ux_design, graphic_design, content_writing, digital_marketing, seo, data_science, blockchain, other'
    })
    @Transform(({ value }) => value?.toLowerCase())
    category?: ProjectCategory;

    @ApiPropertyOptional({ example: 1000 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    minBudget?: number;

    @ApiPropertyOptional({ example: 5000 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    maxBudget?: number;

    @ApiPropertyOptional({ example: '2024-01-01', description: 'Filter by deadline start date (YYYY-MM-DD)' })
    @IsOptional()
    @IsISO8601({ strict: false })
    @Type(() => String)
    startDate?: string;

    @ApiPropertyOptional({ example: '2024-12-31', description: 'Filter by deadline end date (YYYY-MM-DD)' })
    @IsOptional()
    @IsISO8601({ strict: false })
    @Type(() => String)
    endDate?: string;
} 