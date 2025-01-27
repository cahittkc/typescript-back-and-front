import { IsString, IsNumber, IsArray, IsOptional, Min, MaxLength, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProposalDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    projectId: number;

    @ApiProperty({ example: 4500 })
    @IsNumber()
    @Min(0)
    bidAmount: number;

    @ApiProperty({ example: 30 })
    @IsNumber()
    @Min(1)
    deliveryTime: number;

    @ApiProperty({ example: 'I am interested in your project and believe I am the perfect fit...' })
    @IsString()
    @MaxLength(2000)
    coverLetter: string;

    @ApiPropertyOptional({ example: 'portfolio.pdf' })
    @IsOptional()
    @IsString()
    attachments?: string;
}

export class UpdateProposalDto {
    @ApiPropertyOptional({ example: 4800 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    bidAmount?: number;

    @ApiPropertyOptional({ example: 25 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    deliveryTime?: number;

    @ApiPropertyOptional({ example: 'Updated cover letter...' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    coverLetter?: string;

    @ApiPropertyOptional({ example: 'updated-portfolio.pdf' })
    @IsOptional()
    @IsString()
    attachments?: string;
}

export class ProposalActionDto {
    @ApiPropertyOptional({ example: 'Thank you for your proposal. We would like to proceed...' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    clientNote?: string;
} 