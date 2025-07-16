import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { EnrollmentStatus } from '../common/enums/enrollment-status.enum';

@Injectable()
export class EnrollmentsService {
    constructor(
        @InjectRepository(Enrollment)
        private enrollmentRepository: Repository<Enrollment>,
        @InjectRepository(Course)
        private courseRepository: Repository<Course>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async create(createEnrollmentDto: CreateEnrollmentDto, user: User): Promise<Enrollment> {
        const { courseId, studentId } = createEnrollmentDto;

        // Determine the actual student ID
        let actualStudentId: string;
        if (user.role === UserRole.STUDENT) {
            // Students can only enroll themselves
            actualStudentId = user.id;
        } else if (user.role === UserRole.ADMIN || user.role === UserRole.LECTURER) {
            // Admin and lecturers can enroll specific students
            if (!studentId) {
                throw new BadRequestException('Student ID is required for admin/lecturer enrollment');
            }
            actualStudentId = studentId;
        } else {
            throw new ForbiddenException('Invalid user role for enrollment');
        }

        // Check if course exists
        const course = await this.courseRepository.findOne({
            where: { id: courseId },
            relations: ['enrollments'],
        });

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // Check if course is active
        if (!course.isActive) {
            throw new BadRequestException('Course is not active');
        }

        // Check if course is full
        if (course.isFull) {
            throw new BadRequestException('Course is full');
        }

        // Check if student exists
        const student = await this.userRepository.findOne({
            where: { id: actualStudentId },
        });

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        if (student.role !== UserRole.STUDENT) {
            throw new BadRequestException('User is not a student');
        }

        // Check if student is already enrolled
        const existingEnrollment = await this.enrollmentRepository.findOne({
            where: { studentId: actualStudentId, courseId },
        });

        if (existingEnrollment) {
            throw new BadRequestException('Student is already enrolled in this course');
        }

        // Create enrollment
        const enrollment = this.enrollmentRepository.create({
            studentId: actualStudentId,
            courseId,
            status: createEnrollmentDto.status || EnrollmentStatus.PENDING,
            finalGrade: createEnrollmentDto.finalGrade,
            letterGrade: createEnrollmentDto.letterGrade,
            notes: createEnrollmentDto.notes,
        });

        // Set enrollment timestamp if status is ENROLLED
        if (enrollment.status === EnrollmentStatus.ENROLLED) {
            enrollment.enrolledAt = new Date();
        }

        const savedEnrollment = await this.enrollmentRepository.save(enrollment);

        // Return with relations
        return this.enrollmentRepository.findOne({
            where: { id: savedEnrollment.id },
            relations: ['student', 'course', 'course.lecturer'],
        });
    }

    async findAll(user: User): Promise<Enrollment[]> {
        const queryBuilder = this.enrollmentRepository
            .createQueryBuilder('enrollment')
            .leftJoinAndSelect('enrollment.student', 'student')
            .leftJoinAndSelect('enrollment.course', 'course')
            .leftJoinAndSelect('course.lecturer', 'lecturer');

        // Filter based on user role
        if (user.role === UserRole.STUDENT) {
            queryBuilder.where('enrollment.studentId = :studentId', { studentId: user.id });
        } else if (user.role === UserRole.LECTURER) {
            queryBuilder.where('course.lecturerId = :lecturerId', { lecturerId: user.id });
        }
        // Admin can see all enrollments (no additional filtering)

        return queryBuilder.getMany();
    }

    async findOne(id: string, user: User): Promise<Enrollment> {
        const enrollment = await this.enrollmentRepository.findOne({
            where: { id },
            relations: ['student', 'course', 'course.lecturer'],
        });

        if (!enrollment) {
            throw new NotFoundException('Enrollment not found');
        }

        // Check permissions
        if (user.role === UserRole.STUDENT && enrollment.studentId !== user.id) {
            throw new ForbiddenException('You can only view your own enrollments');
        }

        if (user.role === UserRole.LECTURER && enrollment.course.lecturerId !== user.id) {
            throw new ForbiddenException('You can only view enrollments for your courses');
        }

        return enrollment;
    }

    async updateStatus(id: string, status: EnrollmentStatus, user: User): Promise<Enrollment> {
        const enrollment = await this.findOne(id, user);

        // Only admin and course lecturer can update enrollment status
        if (user.role !== UserRole.ADMIN && enrollment.course.lecturerId !== user.id) {
            throw new ForbiddenException('Only admin or course lecturer can update enrollment status');
        }

        enrollment.status = status;

        // Set appropriate timestamps
        switch (status) {
            case EnrollmentStatus.ENROLLED:
                enrollment.enrolledAt = new Date();
                break;
            case EnrollmentStatus.COMPLETED:
                enrollment.completedAt = new Date();
                break;
            case EnrollmentStatus.DROPPED:
                enrollment.droppedAt = new Date();
                break;
        }

        return this.enrollmentRepository.save(enrollment);
    }

    async updateGrade(id: string, finalGrade: number, user: User): Promise<Enrollment> {
        const enrollment = await this.findOne(id, user);

        // Only admin and course lecturer can update grades
        if (user.role !== UserRole.ADMIN && enrollment.course.lecturerId !== user.id) {
            throw new ForbiddenException('Only admin or course lecturer can update grades');
        }

        enrollment.finalGrade = finalGrade;
        enrollment.letterGrade = enrollment.calculateLetterGrade();

        return this.enrollmentRepository.save(enrollment);
    }

    async remove(id: string, user: User): Promise<void> {
        const enrollment = await this.findOne(id, user);

        // Students can drop their own enrollments if status is PENDING or ENROLLED
        if (user.role === UserRole.STUDENT) {
            if (enrollment.studentId !== user.id) {
                throw new ForbiddenException('You can only drop your own enrollments');
            }
            if (enrollment.status === EnrollmentStatus.COMPLETED) {
                throw new BadRequestException('Cannot drop completed enrollment');
            }
        }

        // Admin and lecturers can remove any enrollment
        if (user.role === UserRole.LECTURER && enrollment.course.lecturerId !== user.id) {
            throw new ForbiddenException('You can only remove enrollments for your courses');
        }

        await this.enrollmentRepository.remove(enrollment);
    }

    async findByStudent(studentId: string, user: User): Promise<Enrollment[]> {
        // Check permissions
        if (user.role === UserRole.STUDENT && user.id !== studentId) {
            throw new ForbiddenException('You can only view your own enrollments');
        }

        return this.enrollmentRepository.find({
            where: { studentId },
            relations: ['course', 'course.lecturer'],
        });
    }

    async findByCourse(courseId: string, user: User): Promise<Enrollment[]> {
        // Check if course exists and user has permission
        const course = await this.courseRepository.findOne({
            where: { id: courseId },
        });

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        if (user.role === UserRole.LECTURER && course.lecturerId !== user.id) {
            throw new ForbiddenException('You can only view enrollments for your courses');
        }

        return this.enrollmentRepository.find({
            where: { courseId },
            relations: ['student'],
        });
    }

    async getEnrollmentStats(user: User): Promise<any> {
        const queryBuilder = this.enrollmentRepository
            .createQueryBuilder('enrollment')
            .leftJoin('enrollment.course', 'course');

        // Filter based on user role
        if (user.role === UserRole.STUDENT) {
            queryBuilder.where('enrollment.studentId = :studentId', { studentId: user.id });
        } else if (user.role === UserRole.LECTURER) {
            queryBuilder.where('course.lecturerId = :lecturerId', { lecturerId: user.id });
        }

        const total = await queryBuilder.getCount();
        const pending = await queryBuilder.clone().andWhere('enrollment.status = :status', { status: EnrollmentStatus.PENDING }).getCount();
        const enrolled = await queryBuilder.clone().andWhere('enrollment.status = :status', { status: EnrollmentStatus.ENROLLED }).getCount();
        const completed = await queryBuilder.clone().andWhere('enrollment.status = :status', { status: EnrollmentStatus.COMPLETED }).getCount();
        const dropped = await queryBuilder.clone().andWhere('enrollment.status = :status', { status: EnrollmentStatus.DROPPED }).getCount();

        return {
            total,
            pending,
            enrolled,
            completed,
            dropped,
        };
    }
}