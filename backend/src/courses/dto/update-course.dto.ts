import { PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
    @ApiProperty({
        description: 'Whether the course is active',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}