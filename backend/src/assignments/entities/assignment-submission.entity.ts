import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Assignment } from './assignment.entity';
import { User } from '../../users/entities/user.entity';

@Entity('assignment_submissions')
export class AssignmentSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  submissionPath: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  points: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ type: 'timestamp', nullable: true })
  gradedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Assignment, (assignment) => assignment.submissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assignmentId' })
  assignment: Assignment;

  @Column({ type: 'uuid' })
  assignmentId: string;

  @ManyToOne(() => User, (user) => user.assignmentSubmissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column({ type: 'uuid' })
  studentId: string;

  @ManyToOne(() => User, (user) => user.gradedSubmissions, { nullable: true })
  @JoinColumn({ name: 'gradedById' })
  gradedBy: User;

  @Column({ type: 'uuid', nullable: true })
  gradedById: string;
}
