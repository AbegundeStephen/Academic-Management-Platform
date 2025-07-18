// src/ai/dto/recommendation.dto.ts
import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RecommendationType {
  COURSE = 'course',
  STUDY_PATH = 'study_path',
  PERFORMANCE_INSIGHT = 'performance_insight',
  ASSIGNMENT_FEEDBACK = 'assignment_feedback',
}

export class GetRecommendationDto {
  @ApiProperty({
    enum: RecommendationType,
    example: RecommendationType.COURSE,
    description: 'Type of recommendation to generate',
  })
  @IsEnum(RecommendationType)
  type: RecommendationType;

  @ApiPropertyOptional({
    example: 'I want to learn more about web development',
    description: 'User query or context for the recommendation',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    example: ['computer-science', 'mathematics'],
    description: 'Array of user interests or subjects',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiPropertyOptional({
    example: 'uuid-course-id',
    description: 'Course ID for course-specific recommendations',
  })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'Maximum number of recommendations to return',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
  preferredDifficulty: any;
  academicBackground: any;
  maxRecommendations: number;
}

export class RecommendationResponseDto {
  @ApiProperty({ example: 'course', description: 'Type of recommendation' })
  type: string;

  @ApiProperty({
    example: 'Course Recommendations',
    description: 'Title of the recommendation',
  })
  title: string;

  @ApiProperty({
    example: 'Based on your interests, here are some recommended courses...',
    description: 'Detailed recommendation text',
  })
  content: string;

  @ApiProperty({
    example: ['Advanced JavaScript', 'React Fundamentals', 'Node.js Backend'],
    description: 'List of recommended items',
  })
  items: string[];

  @ApiProperty({
    example: 0.95,
    description: 'Confidence score of the recommendation (0-1)',
  })
  confidence: number;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Timestamp when recommendation was generated',
  })
  generatedAt: Date;
}

export class StudyPathRecommendationDto {
  @ApiProperty({
    example: 'Full Stack Web Development',
    description: 'Study path title',
  })
  title: string;

  @ApiProperty({
    example: 'Complete path to become a full stack developer',
    description: 'Study path description',
  })
  description: string;

  @ApiProperty({ example: 6, description: 'Estimated duration in months' })
  estimatedDuration: number;

  @ApiProperty({ example: 'beginner', description: 'Required skill level' })
  difficulty: string;

  @ApiProperty({
    example: [
      { order: 1, title: 'HTML & CSS Basics', duration: 2 },
      { order: 2, title: 'JavaScript Fundamentals', duration: 3 },
      { order: 3, title: 'React Framework', duration: 4 },
    ],
    description: 'Ordered list of courses in the study path',
  })
  courses: Array<{
    order: number;
    title: string;
    duration: number;
    courseId?: string;
  }>;
}

export class PerformanceInsightDto {
  @ApiProperty({
    example: 'Mathematics',
    description: 'Subject or course name',
  })
  subject: string;

  @ApiProperty({ example: 85.5, description: 'Current grade average' })
  currentGrade: number;

  @ApiProperty({ example: 'improving', description: 'Trend direction' })
  trend: 'improving' | 'declining' | 'stable';

  @ApiProperty({
    example: 'Your performance in assignments has improved by 15% this month',
    description: 'Detailed performance analysis',
  })
  analysis: string;

  @ApiProperty({
    example: [
      'Focus more on problem-solving exercises',
      'Review previous assignment feedback',
      'Attend office hours for additional help',
    ],
    description: 'Actionable improvement suggestions',
  })
  suggestions: string[];

  @ApiProperty({
    example: {
      strengths: ['Algebra', 'Geometry'],
      weaknesses: ['Calculus', 'Statistics'],
    },
    description: 'Identified strengths and weaknesses',
  })
  insights: {
    strengths: string[];
    weaknesses: string[];
  };
}
