// src/enrollments/dto/create-enrollment.dto.ts
import { IsUUID, IsEnum, IsOptional, IsDecimal, Min, Max } from 'class-validator';
import { EnrollmentStatus } from '../entities/enrollment.entity';

export class CreateEnrollmentDto {
    @IsUUID()
    courseId: string;

    @IsUUID()
    studentId: string;

    @IsOptional()
    @IsEnum(EnrollmentStatus)
    status?: EnrollmentStatus;
}

// src/enrollments/dto/update-enrollment.dto.ts
import { IsEnum, IsOptional, IsDecimal, Min, Max } from 'class-validator';
import { EnrollmentStatus } from '../entities/enrollment.entity';

export class UpdateEnrollmentDto {
    @IsOptional()
    @IsEnum(EnrollmentStatus)
    status?: EnrollmentStatus;

    @IsOptional()
    @IsDecimal()
    @Min(0)
    @Max(100)
    grade?: number;
}