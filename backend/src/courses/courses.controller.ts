import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Courses')
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new course (Admin only)' })
    @ApiResponse({ status: 201, description: 'Course created successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
    @ApiResponse({ status: 400, description: 'Bad request - Course code already exists' })
    create(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: User) {
        return this.coursesService.create(createCourseDto, user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all courses (filtered by user role)' })
    @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
    @ApiQuery({ name: 'department', required: false, description: 'Filter by department' })
    @ApiQuery({ name: 'semester', required: false, description: 'Filter by semester' })
    @ApiQuery({ name: 'year', required: false, description: 'Filter by year' })
    async findAll(
        @CurrentUser() user: User,
        @Query('department') department?: string,
        @Query('semester') semester?: string,
        @Query('year') year?: number,
    ) {
        if (department) {
            return this.coursesService.findByDepartment(department);
        }

        if (semester && year) {
            return this.coursesService.findBySemesterAndYear(semester, year);
        }

        return this.coursesService.findAll(user);
    }

    @Get('my-courses')
    @Roles(UserRole.LECTURER)
    @ApiOperation({ summary: 'Get courses assigned to current lecturer' })
    @ApiResponse({ status: 200, description: 'Lecturer courses retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - Lecturer only' })
    findMycourses(@CurrentUser() user: User) {
        return this.coursesService.findByLecturer(user.id);
    }

    @Get('code/:code')
    @ApiOperation({ summary: 'Get course by code' })
    @ApiResponse({ status: 200, description: 'Course found' })
    @ApiResponse({ status: 404, description: 'Course not found' })
    findByCode(@Param('code') code: string) {
        return this.coursesService.findByCode(code);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific course' })
    @ApiResponse({ status: 200, description: 'Course retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Course not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - No access to this course' })
    findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
        return this.coursesService.findOne(id, user);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.LECTURER)
    @ApiOperation({ summary: 'Update a course (Admin or assigned lecturer only)' })
    @ApiResponse({ status: 200, description: 'Course updated successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - No permission to update this course' })
    @ApiResponse({ status: 404, description: 'Course not found' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCourseDto: UpdateCourseDto,
        @CurrentUser() user: User,
    ) {
        return this.coursesService.update(id, updateCourseDto, user);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a course (Admin only)' })
    @ApiResponse({ status: 200, description: 'Course deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
    @ApiResponse({ status: 404, description: 'Course not found' })
    remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
        return this.coursesService.remove(id, user);
    }

    @Patch(':id/assign-lecturer')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Assign a lecturer to a course (Admin only)' })
    @ApiResponse({ status: 200, description: 'Lecturer assigned successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
    @ApiResponse({ status: 404, description: 'Course not found' })
    assignLecturer(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('lecturerId', ParseUUIDPipe) lecturerId: string,
        @CurrentUser() user: User,
    ) {
        return this.coursesService.assignLecturer(id, lecturerId, user);
    }
}