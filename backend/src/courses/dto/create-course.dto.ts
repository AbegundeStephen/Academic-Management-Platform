import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Course title',
    example: 'Introduction to Computer Science',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  title: string;

  @ApiProperty({
    description: 'Course code',
    example: 'CS101',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  code: string;

  @ApiProperty({
    description: 'Course description',
    example:
      'An introductory course covering fundamental concepts of computer science',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Number of credits',
    example: 3,
    minimum: 1,
    maximum: 6,
  })
  @IsInt()
  @Min(1)
  @Max(6)
  credits: number;

  @ApiProperty({
    description: 'Department offering the course',
    example: 'Computer Science',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  department: string;

  @ApiProperty({
    description: 'Semester (e.g., Fall, Spring, Summer)',
    example: 'Fall',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  semester: string;

  @ApiProperty({
    description: 'Academic year',
    example: 2024,
    minimum: 2020,
    maximum: 2030,
  })
  @IsInt()
  @Min(2020)
  @Max(2030)
  year: number;

  @ApiProperty({
    description: 'Maximum number of students',
    example: 30,
    minimum: 1,
    maximum: 500,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  maxStudents?: number;

  @ApiProperty({
    description: 'URL to syllabus file',
    example: 'https://example.com/syllabus.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  syllabusUrl?: string;
}
