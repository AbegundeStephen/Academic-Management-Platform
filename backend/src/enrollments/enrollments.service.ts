// src/enrollments/enrollments.service.ts
import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Course } from '../courses/entities/course.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class EnrollmentsService {
    constructor(
        @InjectRepository(Enrollment)
        private readonly enrollmentRepository: Repository<Enrollment>,
        @InjectRepository(Course)
        private readonly courseRepository: Repository<Course>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createEnrollmentDto: CreateEnrollmentDto, requestingUser: User): Promise<Enrollment> {
        const { courseId, studentId, status } = createEnrollmentDto;

        // Verify course exists
        const course = await this.courseRepository.findOne({ where: { id: courseId } });
        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // Verify student exists
        const student = await this.userRepository.findOne({ where: { id: studentId, role: UserRole.STUDENT } });
        if (!student) {
            throw new NotFoundException('Student not found');
        }

        // Check if enrollment already exists
        const existingEnrollment = await this.enrollmentRepository.findOne({
            where: { course: { id: courseId }, student: { id: studentId } },
        });

        if (existingEnrollment) {
            throw new ConflictException('Student is already enrolled or has a pending enrollment for this course');
        }

        // Authorization check
        if (requestingUser.role !== UserRole.ADMIN && requestingUser.id !== studentId) {
            throw new ForbiddenException('You can only enroll yourself unless you are an admin');
        }

        const enrollment = this.enrollmentRepository.create({
            course,
            student,
            status: status || EnrollmentStatus.PENDING,
        });

        return this.enrollmentRepository.save(enrollment);
    }

    async findAll(): Promise<Enrollment[]> {
        return this.enrollmentRepository.find({ relations: ['course', 'student'] });
    }

    async findOne(id: string): Promise<Enrollment> {
        const enrollment = await this.enrollmentRepository.findOne({
            where: { id },
            relations: ['course', 'student'],
        });

        if (!enrollment) {
            throw new NotFoundException('Enrollment not found');
        }

        return enrollment;
    }

    async update(id: string, updateEnrollmentDto: UpdateEnrollmentDto, requestingUser: User): Promise<Enrollment> {
        const enrollment = await this.findOne(id);

        // Authorization check
        if (
            requestingUser.role !== UserRole.ADMIN &&
            !(requestingUser.role === UserRole.LECTURER && enrollment.course.lecturer.id === requestingUser.id)
        ) {
            throw new ForbiddenException('You are not authorized to update this enrollment');
        }

        if (updateEnrollmentDto.status) {
            enrollment.status = updateEnrollmentDto.status;

            if (updateEnrollmentDto.status === EnrollmentStatus.COMPLETED) {
                enrollment.completedAt = new Date();
            }
        }

        if (updateEnrollmentDto.grade !== undefined) {
            enrollment.grade = updateEnrollmentDto.grade;
        }

        return this.enrollmentRepository.save(enrollment);
    }

    async remove(id: string, requestingUser: User): Promise<void> {
        const enrollment = await this.findOne(id);

        // Authorization check
        if (
            requestingUser.role !== UserRole.ADMIN &&
            requestingUser.id !== enrollment.student.id
        ) {
            throw new ForbiddenException('You are not authorized to delete this enrollment');
        }

        await this.enrollmentRepository.remove(enrollment);
    }

    async findStudentEnrollments(studentId: string): Promise<Enrollment[]> {
        return this.enrollmentRepository.find({
            where: { student: { id: studentId } },
            relations: ['course'],
        });
    }

    async findCourseEnrollments(courseId: string): Promise<Enrollment[]> {
        return this.enrollmentRepository.find({
            where: { course: { id: courseId } },
            relations: ['student'],
        });
    }
}