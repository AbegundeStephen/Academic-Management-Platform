// src/assignments/assignments.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { AssignmentSubmission } from './entities/assignment-submission.entity';
import { Course } from '../courses/entities/course.entity';
import { User } from '../users/entities/user.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { GradeAssignmentDto } from './dto/grade-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(AssignmentSubmission)
    private submissionRepository: Repository<AssignmentSubmission>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createAssignmentDto: CreateAssignmentDto,
    lecturerId: string,
  ): Promise<Assignment> {
    // Verify the course exists and lecturer has permission
    const course = await this.courseRepository.findOne({
      where: { id: createAssignmentDto.courseId },
      relations: ['lecturer'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if lecturer owns the course or is admin
    const lecturer = await this.userRepository.findOne({
      where: { id: lecturerId },
    });
    if (lecturer.role !== UserRole.ADMIN && course.lecturer.id !== lecturerId) {
      throw new ForbiddenException(
        'You can only create assignments for your own courses',
      );
    }

    const assignment = this.assignmentRepository.create({
      ...createAssignmentDto,
      dueDate: new Date(createAssignmentDto.dueDate),
      course,
      createdBy: lecturer,
    });

    return this.assignmentRepository.save(assignment);
  }

  async findAll(
    courseId?: string,
    lecturerId?: string,
    user?: User,
  ): Promise<Assignment[]> {
    const query = this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.course', 'course')
      .leftJoinAndSelect('assignment.createdBy', 'createdBy')
      .leftJoinAndSelect('assignment.submissions', 'submissions');

    if (courseId) {
      query.andWhere('course.id = :courseId', { courseId });
    }

    if (lecturerId) {
      query.andWhere('createdBy.id = :lecturerId', { lecturerId });
    }

    // If user is a student, only show assignments from enrolled courses
    if (user && user.role === UserRole.STUDENT) {
      query
        .leftJoin('course.enrollments', 'enrollment')
        .andWhere('enrollment.student.id = :studentId', { studentId: user.id });
    }

    return query.orderBy('assignment.dueDate', 'ASC').getMany();
  }

  async findOne(id: string, user?: User): Promise<Assignment> {
    const query = this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.course', 'course')
      .leftJoinAndSelect('assignment.createdBy', 'createdBy')
      .leftJoinAndSelect('assignment.submissions', 'submissions')
      .leftJoinAndSelect('submissions.student', 'student')
      .where('assignment.id = :id', { id });

    // If user is a student, check if they're enrolled in the course
    if (user && user.role === UserRole.STUDENT) {
      query
        .leftJoin('course.enrollments', 'enrollment')
        .andWhere('enrollment.student.id = :studentId', { studentId: user.id });
    }

    const assignment = await query.getOne();

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment;
  }

  async update(
    id: string,
    updateAssignmentDto: UpdateAssignmentDto,
    lecturerId: string,
  ): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['course', 'createdBy'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if lecturer owns the assignment or is admin
    const lecturer = await this.userRepository.findOne({
      where: { id: lecturerId },
    });
    if (
      lecturer.role !== UserRole.ADMIN &&
      assignment.createdBy.id !== lecturerId
    ) {
      throw new ForbiddenException('You can only update your own assignments');
    }

    // Update fields
    Object.assign(assignment, updateAssignmentDto);
    if (updateAssignmentDto.dueDate) {
      assignment.dueDate = new Date(updateAssignmentDto.dueDate);
    }

    return this.assignmentRepository.save(assignment);
  }

  async remove(id: string, lecturerId: string): Promise<void> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if lecturer owns the assignment or is admin
    const lecturer = await this.userRepository.findOne({
      where: { id: lecturerId },
    });
    if (
      lecturer.role !== UserRole.ADMIN &&
      assignment.createdBy.id !== lecturerId
    ) {
      throw new ForbiddenException('You can only delete your own assignments');
    }

    await this.assignmentRepository.remove(assignment);
  }

  async submitAssignment(
    assignmentId: string,
    studentId: string,
    submitDto: SubmitAssignmentDto,
  ): Promise<AssignmentSubmission> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['course', 'course.enrollments', 'course.enrollments.student'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if student is enrolled in the course
    const isEnrolled = assignment.course.enrollments.some(
      (enrollment) => enrollment.student.id === studentId,
    );

    if (!isEnrolled) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    // Check if assignment is past due
    if (new Date() > assignment.dueDate) {
      throw new BadRequestException('Assignment submission is past due');
    }

    // Check if already submitted
    const existingSubmission = await this.submissionRepository.findOne({
      where: { assignmentId, studentId },
    });

    if (existingSubmission) {
      throw new BadRequestException('Assignment already submitted');
    }

    const submission = this.submissionRepository.create({
      ...submitDto,
      assignmentId,
      studentId,
    });

    return this.submissionRepository.save(submission);
  }

  async gradeSubmission(
    assignmentId: string,
    submissionId: string,
    gradeDto: GradeAssignmentDto,
    lecturerId: string,
  ): Promise<AssignmentSubmission> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['createdBy'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if lecturer owns the assignment or is admin
    const lecturer = await this.userRepository.findOne({
      where: { id: lecturerId },
    });
    if (
      lecturer.role !== UserRole.ADMIN &&
      assignment.createdBy.id !== lecturerId
    ) {
      throw new ForbiddenException(
        'You can only grade submissions for your own assignments',
      );
    }

    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId, assignmentId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Validate points don't exceed max points
    if (gradeDto.points > assignment.maxPoints) {
      throw new BadRequestException(
        `Points cannot exceed maximum points (${assignment.maxPoints})`,
      );
    }

    submission.points = gradeDto.points;
    submission.feedback = gradeDto.feedback;
    submission.gradedAt = new Date();
    submission.gradedById = lecturerId;

    return this.submissionRepository.save(submission);
  }

  async getSubmissions(
    assignmentId: string,
    lecturerId: string,
  ): Promise<AssignmentSubmission[]> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['createdBy'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if lecturer owns the assignment or is admin
    const lecturer = await this.userRepository.findOne({
      where: { id: lecturerId },
    });
    if (
      lecturer.role !== UserRole.ADMIN &&
      assignment.createdBy.id !== lecturerId
    ) {
      throw new ForbiddenException(
        'You can only view submissions for your own assignments',
      );
    }

    return this.submissionRepository.find({
      where: { assignmentId },
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStudentSubmission(
    assignmentId: string,
    studentId: string,
  ): Promise<AssignmentSubmission> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['course', 'course.enrollments', 'course.enrollments.student'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if student is enrolled in the course
    const isEnrolled = assignment.course.enrollments.some(
      (enrollment) => enrollment.student.id === studentId,
    );

    if (!isEnrolled) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    const submission = await this.submissionRepository.findOne({
      where: { assignmentId, studentId },
      relations: ['assignment'],
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }
}
