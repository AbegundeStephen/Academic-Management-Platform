import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Course } from '../courses/entities/course.entity';
import { Assignment } from '../assignments/entities/assignment.entity';
import { User } from '../users/entities/user.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { EnrollmentStatus } from '../common/enums/enrollment-status.enum';

export interface FileRecord {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: 'syllabi' | 'assignments';
  uploadedBy: string;
  uploadedAt: Date;
  relatedId?: string; // courseId for syllabi, assignmentId for assignments
}

interface SubmissionRecord {
  id: string;
  assignmentId: string;
  studentId: string;
  files: string[]; // Array of file IDs
  submittedAt: Date;
}

@Injectable()
export class UploadsService {
  private fileRecords: Map<string, FileRecord> = new Map();
  private submissions: Map<string, SubmissionRecord> = new Map();

  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async uploadSyllabus(
    courseId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<FileRecord> {
    // Verify course exists and user has permission
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['lecturer'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    if (user.role === UserRole.LECTURER && course.lecturer.id !== userId) {
      throw new ForbiddenException(
        'You can only upload syllabi for your own courses',
      );
    }

    // Create file record
    const fileRecord: FileRecord = {
      id: uuidv4(),
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      category: 'syllabi',
      uploadedBy: userId,
      uploadedAt: new Date(),
      relatedId: courseId,
    };

    this.fileRecords.set(fileRecord.id, fileRecord);

    return fileRecord;
  }

  async submitAssignment(
    assignmentId: string,
    files: Express.Multer.File[],
    userId: string,
  ) {
    // Verify assignment exists and user can submit
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['course'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || user.role !== UserRole.STUDENT) {
      throw new ForbiddenException('Only students can submit assignments');
    }

    // Check if student is enrolled in the course
    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        student: { id: userId },
        course: { id: assignment.course.id },
        status: EnrollmentStatus.ENROLLED,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    // Check if assignment is still open
    if (assignment.dueDate && new Date() > assignment.dueDate) {
      throw new ForbiddenException('Assignment deadline has passed');
    }

    // Create file records for all uploaded files
    const fileRecords: FileRecord[] = [];
    for (const file of files) {
      const fileRecord: FileRecord = {
        id: uuidv4(),
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        category: 'assignments',
        uploadedBy: userId,
        uploadedAt: new Date(),
        relatedId: assignmentId,
      };

      this.fileRecords.set(fileRecord.id, fileRecord);
      fileRecords.push(fileRecord);
    }

    // Create submission record
    const submissionRecord: SubmissionRecord = {
      id: uuidv4(),
      assignmentId,
      studentId: userId,
      files: fileRecords.map((f) => f.id),
      submittedAt: new Date(),
    };

    this.submissions.set(submissionRecord.id, submissionRecord);

    return {
      submissionId: submissionRecord.id,
      files: fileRecords.map((f) => ({
        id: f.id,
        filename: f.filename,
        originalName: f.originalName,
        mimeType: f.mimeType,
        size: f.size,
      })),
      submittedAt: submissionRecord.submittedAt,
    };
  }

  async getSyllabus(courseId: string): Promise<FileRecord> {
    // Find syllabus file for the course
    const syllabusFile = Array.from(this.fileRecords.values()).find(
      (file) => file.category === 'syllabi' && file.relatedId === courseId,
    );

    if (!syllabusFile) {
      throw new NotFoundException('Syllabus not found for this course');
    }

    return syllabusFile;
  }

  async getAssignmentSubmissions(assignmentId: string, userId: string) {
    // Verify assignment exists and user has permission
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['course', 'course.lecturer'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    if (
      user.role === UserRole.LECTURER &&
      assignment.course.lecturer.id !== userId
    ) {
      throw new ForbiddenException(
        'You can only view submissions for your own assignments',
      );
    }

    if (user.role === UserRole.STUDENT) {
      throw new ForbiddenException('Students cannot view all submissions');
    }

    // Get all submissions for this assignment
    const submissions = Array.from(this.submissions.values()).filter(
      (submission) => submission.assignmentId === assignmentId,
    );

    // Get student details and file information
    const submissionDetails = await Promise.all(
      submissions.map(async (submission) => {
        const student = await this.userRepository.findOne({
          where: { id: submission.studentId },
        });

        const files = submission.files
          .map((fileId) => {
            const fileRecord = this.fileRecords.get(fileId);
            return fileRecord
              ? {
                  id: fileRecord.id,
                  filename: fileRecord.filename,
                  originalName: fileRecord.originalName,
                  mimeType: fileRecord.mimeType,
                  size: fileRecord.size,
                }
              : null;
          })
          .filter(Boolean);

        return {
          submissionId: submission.id,
          studentId: submission.studentId,
          studentName: student
            ? `${student.firstName} ${student.lastName}`
            : 'Unknown',
          files,
          submittedAt: submission.submittedAt,
        };
      }),
    );

    return submissionDetails;
  }

  async getFileInfo(fileId: string, userId: string): Promise<FileRecord> {
    const fileRecord = this.fileRecords.get(fileId);

    if (!fileRecord) {
      throw new NotFoundException('File not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    if (fileRecord.uploadedBy !== userId && user.role !== UserRole.ADMIN) {
      // For syllabi, any enrolled student can access
      if (fileRecord.category === 'syllabi') {
        const enrollment = await this.enrollmentRepository.findOne({
          where: {
            student: { id: userId },
            course: { id: fileRecord.relatedId },
            status: EnrollmentStatus.ENROLLED,
          },
        });

        if (!enrollment) {
          throw new ForbiddenException(
            'You do not have permission to access this file',
          );
        }
      }
      // For assignments, only the uploader, course lecturer, or admin can access
      else if (fileRecord.category === 'assignments') {
        const assignment = await this.assignmentRepository.findOne({
          where: { id: fileRecord.relatedId },
          relations: ['course', 'course.lecturer'],
        });

        if (!assignment) {
          throw new NotFoundException('Related assignment not found');
        }

        if (
          user.role === UserRole.LECTURER &&
          assignment.course.lecturer.id !== userId
        ) {
          throw new ForbiddenException(
            'You do not have permission to access this file',
          );
        }

        if (
          user.role === UserRole.STUDENT &&
          fileRecord.uploadedBy !== userId
        ) {
          throw new ForbiddenException(
            'You do not have permission to access this file',
          );
        }
      }
    }

    return fileRecord;
  }

  async getUserFiles(userId: string): Promise<FileRecord[]> {
    const userFiles = Array.from(this.fileRecords.values()).filter(
      (file) => file.uploadedBy === userId,
    );

    return userFiles.map((file) => ({
      ...file,
      // Remove sensitive information
      uploadedBy: undefined,
    })) as FileRecord[];
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const fileRecord = this.fileRecords.get(fileId);

    if (!fileRecord) {
      throw new NotFoundException('File not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions - only file owner or admin can delete
    if (fileRecord.uploadedBy !== userId && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to delete this file',
      );
    }

    // Remove file record
    this.fileRecords.delete(fileId);

    // Remove from submissions if it's an assignment file
    if (fileRecord.category === 'assignments') {
      for (const [submissionId, submission] of this.submissions.entries()) {
        if (submission.files.includes(fileId)) {
          submission.files = submission.files.filter((id) => id !== fileId);
          if (submission.files.length === 0) {
            this.submissions.delete(submissionId);
          }
        }
      }
    }
  }

  async getSubmissionByStudent(assignmentId: string, studentId: string) {
    const submission = Array.from(this.submissions.values()).find(
      (sub) => sub.assignmentId === assignmentId && sub.studentId === studentId,
    );

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const files = submission.files
      .map((fileId) => {
        const fileRecord = this.fileRecords.get(fileId);
        return fileRecord
          ? {
              id: fileRecord.id,
              filename: fileRecord.filename,
              originalName: fileRecord.originalName,
              mimeType: fileRecord.mimeType,
              size: fileRecord.size,
            }
          : null;
      })
      .filter(Boolean);

    return {
      submissionId: submission.id,
      files,
      submittedAt: submission.submittedAt,
    };
  }
}
