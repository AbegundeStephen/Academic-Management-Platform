import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitAssignmentDto {
    @ApiProperty({ example: 'path/to/submission.pdf', description: 'File path of the submission' })
    @IsString()
    submissionPath: string;

    @ApiPropertyOptional({ example: 'This is my solution to the problem', description: 'Student notes about the submission' })
    @IsOptional()
    @IsString()
    notes?: string;
}