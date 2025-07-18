import {
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({ example: 'Midterm Exam', description: 'Assignment title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Complete the programming assignment',
    description: 'Assignment description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '2024-12-31T23:59:59Z',
    description: 'Due date in ISO format',
  })
  @IsDateString()
  dueDate: string;

  @ApiProperty({
    example: 100,
    description: 'Maximum points for the assignment',
  })
  @IsNumber()
  @Min(0)
  maxPoints: number;

  @ApiProperty({
    example: 'uuid-course-id',
    description: 'Course ID this assignment belongs to',
  })
  @IsUUID()
  courseId: string;

  @ApiPropertyOptional({
    example: 'path/to/file.pdf',
    description: 'File path for assignment materials',
  })
  @IsOptional()
  @IsString()
  filePath?: string;
}
