import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GradeAssignmentDto {
  @ApiProperty({ example: 85, description: 'Points awarded (0 to maxPoints)' })
  @IsNumber()
  @Min(0)
  points: number;

  @ApiPropertyOptional({
    example: 'Good work, but could improve on...',
    description: 'Feedback for the student',
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}
