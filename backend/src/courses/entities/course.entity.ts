import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ length: 20, unique: true })
  code: string;

  @Column('text')
  description: string;

  @Column('text')
  name: string;

  @Column('int')
  credits: number;

  @Column({ length: 100 })
  department: string;

  @Column({ length: 50 })
  semester: string;

  @Column('int')
  year: number;

  @Column('int', { default: 30 })
  maxStudents: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  syllabusUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('uuid')
  lecturerId: string;

  @ManyToOne(() => User, (user) => user.courses, { eager: true })
  @JoinColumn({ name: 'lecturerId' })
  lecturer: User;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];

  @OneToMany(() => Assignment, (assignment) => assignment.course)
  assignments: Assignment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  courseCode: any;

  // Virtual property to get enrolled students count
  get enrolledStudentsCount(): number {
    return this.enrollments ? this.enrollments.length : 0;
  }

  // Virtual property to check if course is full
  get isFull(): boolean {
    return this.enrolledStudentsCount >= this.maxStudents;
  }
}
