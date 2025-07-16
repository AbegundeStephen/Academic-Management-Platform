import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Assignment } from '../assignments/entities/assignment.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Course,
            Enrollment,
            Assignment
        ])
    ],
    controllers: [AiController],
    providers: [AiService],
    exports: [AiService]
})
export class AiModule { }