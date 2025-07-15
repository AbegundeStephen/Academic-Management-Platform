// src/enrollments/enrollments.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
    constructor(private readonly enrollmentsService: EnrollmentsService) { }

    @Post()
    @Roles(UserRole.STUDENT, UserRole.ADMIN)
    create(@Body() createEnrollmentDto: CreateEnrollmentDto, @CurrentUser() user: User) {
        return this.enrollmentsService.create(createEnrollmentDto, user);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    findAll() {
        return this.enrollmentsService.findAll();
    }

    @Get(':id')
    @Roles(UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN)
    findOne(@Param('id') id: string, @CurrentUser() user: User) {
        return this.enrollmentsService.findOne(id);
    }

    @Put(':id')
    @Roles(UserRole.LECTURER, UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateEnrollmentDto: UpdateEnrollmentDto, @CurrentUser() user: User) {
        return this.enrollmentsService.update(id, updateEnrollmentDto, user);
    }

    @Delete(':id')
    @Roles(UserRole.STUDENT, UserRole.ADMIN)
    remove(@Param('id') id: string, @CurrentUser() user: User) {
        return this.enrollmentsService.remove(id, user);
    }

    @Get('student/:id')
    @Roles(UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN)
    findStudentEnrollments(@Param('id') studentId: string, @CurrentUser() user: User) {
        // Authorization check
        if (user.role !== UserRole.ADMIN && user.id !== studentId) {
            throw new ForbiddenException('You can only view your own enrollments');
        }
        return this.enrollmentsService.findStudentEnrollments(studentId);
    }

    @Get('course/:id')
    @Roles(UserRole.LECTURER, UserRole.ADMIN)
    findCourseEnrollments(@Param('id') courseId: string, @CurrentUser() user: User) {
        // Additional authorization check for lecturers (can only see enrollments for their own courses)
        return this.enrollmentsService.findCourseEnrollments(courseId);
    }
}