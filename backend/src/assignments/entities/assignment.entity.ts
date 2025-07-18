import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';

@Entity('assignments')
export class Assignment {
  [x: string]: any;
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  instructions: string;

  @Column('int')
  maxPoints: number;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  availableFrom: Date;

  @Column({ type: 'timestamp', nullable: true })
  availableUntil: Date;

  @Column({ length: 50, default: 'assignment' })
  type: string; // 'assignment', 'quiz', 'exam', 'project'

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  allowLateSubmission: boolean;

  @Column('int', { default: 0 })
  latePenaltyPercentage: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  attachmentUrl: string;

  @Column('text', { nullable: true })
  rubric: string;

  @Column('uuid')
  courseId: string;

  @ManyToOne(() => Course, (course) => course.assignments, { eager: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property to check if assignment is overdue
  get isOverdue(): boolean {
    return new Date() > this.dueDate;
  }

  // Virtual property to check if assignment is available
  get isAvailable(): boolean {
    const now = new Date();
    const availableFrom = this.availableFrom || this.createdAt;
    const availableUntil = this.availableUntil || this.dueDate;

    return now >= availableFrom && now <= availableUntil && this.isActive;
  }

  // Virtual property to check if late submission is allowed
  get canSubmitLate(): boolean {
    return this.allowLateSubmission && this.isActive;
  }
}
