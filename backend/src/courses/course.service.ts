import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class CoursesService {
    constructor(
        @InjectRepository(Course)
        private courseRepository: Repository<Course>,
    ) { }

    async create(createCourseDto: CreateCourseDto, user: User): Promise<Course> {
        // Only admin can create courses
        if (user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Only admin can create courses');
        }

        // Check if course code already exists
        const existingCourse = await this.courseRepository.findOne({
            where: { code: createCourseDto.code },
        });

        if (existingCourse) {
            throw new BadRequestException('Course with this code already exists');
        }

        const course = this.courseRepository.create({
            ...createCourseDto,
            lecturerId: user.id, // For now, admin creates and assigns to themselves
        });

        return this.courseRepository.save(course);
    }

    async findAll(user: User): Promise<Course[]> {
        const queryBuilder = this.courseRepository
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.lecturer', 'lecturer')
            .leftJoinAndSelect('course.enrollments', 'enrollments')
            .leftJoinAndSelect('enrollments.student', 'student');

        // Filter based on user role
        if (user.role === UserRole.STUDENT) {
            // Students can only see active courses
            queryBuilder.where('course.isActive = :isActive', { isActive: true });
        } else if (user.role === UserRole.LECTURER) {
            // Lecturers can see all courses but primarily their own
            queryBuilder.where('course.lecturerId = :lecturerId OR course.isActive = :isActive', {
                lecturerId: user.id,
                isActive: true,
            });
        }
        // Admin can see all courses (no additional filtering)

        return queryBuilder.getMany();
    }

    async findOne(id: string, user: User): Promise<Course> {
        const course = await this.courseRepository.findOne({
            where: { id },
            relations: ['lecturer', 'enrollments', 'enrollments.student', 'assignments'],
        });

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // Check permissions
        if (user.role === UserRole.STUDENT && !course.isActive) {
            throw new ForbiddenException('Course is not active');
        }

        if (user.role === UserRole.LECTURER && course.lecturerId !== user.id) {
            throw new ForbiddenException('You can only access your own courses');
        }

        return course;
    }

    async update(id: string, updateCourseDto: UpdateCourseDto, user: User): Promise<Course> {
        const course = await this.findOne(id, user);

        // Only admin or the lecturer of the course can update it
        if (user.role !== UserRole.ADMIN && course.lecturerId !== user.id) {
            throw new ForbiddenException('You can only update your own courses or be an admin');
        }

        // If updating course code, check for duplicates
        if (updateCourseDto.code && updateCourseDto.code !== course.code) {
            const existingCourse = await this.courseRepository.findOne({
                where: { code: updateCourseDto.code },
            });

            if (existingCourse) {
                throw new BadRequestException('Course with this code already exists');
            }
        }

        Object.assign(course, updateCourseDto);
        return this.courseRepository.save(course);
    }

    async remove(id: string, user: User): Promise<void> {
        const course = await this.findOne(id, user);

        // Only admin can delete courses
        if (user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Only admin can delete courses');
        }

        await this.courseRepository.remove(course);
    }

    async findByLecturer(lecturerId: string): Promise<Course[]> {
        return this.courseRepository.find({
            where: { lecturerId },
            relations: ['enrollments', 'assignments'],
        });
    }

    async findByCode(code: string): Promise<Course | null> {
        return this.courseRepository.findOne({
            where: { code },
            relations: ['lecturer'],
        });
    }

    async findByDepartment(department: string): Promise<Course[]> {
        return this.courseRepository.find({
            where: { department, isActive: true },
            relations: ['lecturer'],
        });
    }

    async findBySemesterAndYear(semester: string, year: number): Promise<Course[]> {
        return this.courseRepository.find({
            where: { semester, year, isActive: true },
            relations: ['lecturer'],
        });
    }

    async assignLecturer(courseId: string, lecturerId: string, user: User): Promise<Course> {
        // Only admin can assign lecturers
        if (user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Only admin can assign lecturers');
        }

        const course = await this.courseRepository.findOne({
            where: { id: courseId },
        });

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        course.lecturerId = lecturerId;
        return this.courseRepository.save(course);
    }
}