// src/enrollments/entities/enrollment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { User } from '../../users/entities/user.entity';

export enum EnrollmentStatus {
    PENDING = 'pending',
    ENROLLED = 'enrolled',
    DROPPED = 'dropped',
    COMPLETED = 'completed',
}

@Entity()
export class Enrollment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Course, (course) => course.enrollments)
    course: Course;

    @ManyToOne(() => User, (user) => user.enrollments)
    student: User;

    @Column({
        type: 'enum',
        enum: EnrollmentStatus,
        default: EnrollmentStatus.PENDING,
    })
    status: EnrollmentStatus;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    grade: number;

    @CreateDateColumn()
    enrolledAt: Date;

    @Column({ nullable: true })
    completedAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}