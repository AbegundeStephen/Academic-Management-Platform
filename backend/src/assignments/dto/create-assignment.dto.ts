import { IsString, IsNotEmpty, IsInt, IsOptional, IsDateString, IsBoolean, Min, Max, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAssignmentDto {
    @ApiProperty({
        description: 'Assignment title',
        example: 'Data Structures Quiz 1',
        maxLength: 200,
    })
    @IsString()
    @IsNotEmpty()
    @Length(1, 200)
    title: string;

    @ApiProperty({
        description: 'Assignment description',
        example: 'This quiz covers arrays, linked lists, and basic algorithms',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        description: 'Detailed instructions for the assignment',
        example: 'Please submit your solutions in PDF format with proper formatting',
        required: false,
    })
    @IsOptional()
    @IsString()
    instructions?: string;

    @ApiProperty({
        description: 'Maximum points for the assignment',
        example: 100,
        minimum: 1,
        maximum: 1000,
    })
    @IsInt()
    @Min(1)
    @Max(1000)
    maxPoints: number;

    @ApiProperty({
        description: 'Due date for the assignment',
        example: '2024-12-31T23:59:59Z',
    })
    @IsDateString()
    dueDate: string;

    @ApiProperty({
        description: 'Date when assignment becomes available',
        example: '2024-12-01T00:00:00Z',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    availableFrom?: string;

    @ApiProperty({
        description: 'Date when assignment is no longer available',
        example: '2024-12-31T23:59:59Z',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    availableUntil?: string;

    @ApiProperty({
        description: 'Type of assignment',
        example: 'quiz',
        default: 'assignment',
        required: false,
    })
    @IsOptional()
    @IsString()
    @Length(1, 50)
    type?: string;

    @ApiProperty({
        description: 'Whether assignment is active',
        example: true,
        default: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({
        description: 'Whether late submission is allowed',
        example: true,
        default: false,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    allowLateSubmission?: boolean;

    @ApiProperty({
        description: 'Late penalty percentage per day',
        example: 10,
        minimum: 0,
        maximum: 100,
        default: 0,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    latePenaltyPercentage?: number;

    @ApiProperty({
        description: 'URL to attachment file',
        example: 'https://example.com/assignment.pdf',
        required: false,
    })
    @IsOptional()
    @IsString()
    attachmentUrl?: string;

    @ApiProperty({
        description: 'Grading rubric',
        example: 'Correctness: 70%, Style: 20%, Documentation: 10%',
        required: false,
    })
    @IsOptional()
    @IsString()
    rubric?: string;

    @ApiProperty({
        description: 'Course ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    @IsNotEmpty()
    courseId: string;
}