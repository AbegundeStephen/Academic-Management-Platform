// src/courses/courses.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { syllabusUploadOptions } from '../shared/file-upload.utils';

@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Get()
    findAll() {
        return this.coursesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.coursesService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.LECTURER, UserRole.ADMIN)
    create(@Body() createCourseDto: CreateCourseDto) {
        return this.coursesService.create(createCourseDto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.LECTURER, UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
        return this.coursesService.update(id, updateCourseDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.coursesService.remove(id);
    }

    @Post(':id/syllabus')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.LECTURER, UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('file', syllabusUploadOptions))
    uploadSyllabus(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        return this.coursesService.uploadSyllabus(id, file);
    }
}