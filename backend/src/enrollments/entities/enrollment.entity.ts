import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { EnrollmentStatus } from '../../common/enums/enrollment-status.enum';

@Entity('enrollments')
@Unique(['studentId', 'courseId'])
export class Enrollment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    studentId: string;

    @Column('uuid')
    courseId: string;

    @Column({
        type: 'enum',
        enum: EnrollmentStatus,
        default: EnrollmentStatus.PENDING,
    })
    status: EnrollmentStatus;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    finalGrade: number;

    @Column({ length: 5, nullable: true })
    letterGrade: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'timestamp', nullable: true })
    enrolledAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    droppedAt: Date;

    @ManyToOne(() => User, (user) => user.enrollments, { eager: true })
    @JoinColumn({ name: 'studentId' })
    student: User;

    @ManyToOne(() => Course, (course) => course.enrollments, { eager: true })
    @JoinColumn({ name: 'courseId' })
    course: Course;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Helper method to calculate letter grade from numeric grade
    calculateLetterGrade(): string {
        if (!this.finalGrade) return null;

        if (this.finalGrade >= 90) return 'A';
        if (this.finalGrade >= 80) return 'B';
        if (this.finalGrade >= 70) return 'C';
        if (this.finalGrade >= 60) return 'D';
        return 'F';
    }

    // Helper method to check if enrollment is active
    get isActive(): boolean {
        return this.status === EnrollmentStatus.ENROLLED;
    }

    // Helper method to check if enrollment is completed
    get isCompleted(): boolean {
        return this.status === EnrollmentStatus.COMPLETED;
    }
}