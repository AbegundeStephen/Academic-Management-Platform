import { IsUUID, IsOptional, IsEnum, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatus } from '../../common/enums/enrollment-status.enum';

export class CreateEnrollmentDto {
    @ApiProperty({
        description: 'Course ID to enroll in',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    courseId: string;

    @ApiProperty({
        description: 'Student ID (optional, defaults to current user if student)',
        example: '123e4567-e89b-12d3-a456-426614174001',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    studentId?: string;

    @ApiProperty({
        description: 'Enrollment status',
        enum: EnrollmentStatus,
        default: EnrollmentStatus.PENDING,
        required: false,
    })
    @IsOptional()
    @IsEnum(EnrollmentStatus)
    status?: EnrollmentStatus;

    @ApiProperty({
        description: 'Final grade (0-100)',
        example: 85.5,
        minimum: 0,
        maximum: 100,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    finalGrade?: number;

    @ApiProperty({
        description: 'Letter grade (A, B, C, D, F)',
        example: 'B',
        required: false,
    })
    @IsOptional()
    @IsString()
    letterGrade?: string;

    @ApiProperty({
        description: 'Additional notes',
        example: 'Student shows great potential',
        required: false,
    })
    @IsOptional()
    @IsString()
    notes?: string;
}