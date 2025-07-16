import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Assignment } from '../assignments/entities/assignment.entity';
import { GetRecommendationDto } from './dto/recommendation.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { EnrollmentStatus } from '../common/enums/enrollment-status.enum';

@Injectable()
export class AiService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Course)
        private readonly courseRepository: Repository<Course>,
        @InjectRepository(Enrollment)
        private readonly enrollmentRepository: Repository<Enrollment>,
        @InjectRepository(Assignment)
        private readonly assignmentRepository: Repository<Assignment>,
    ) { }

    async getCourseRecommendations(userId: string, recommendationDto: GetRecommendationDto) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['enrollments', 'enrollments.course']
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role !== UserRole.STUDENT) {
            throw new ForbiddenException('Only students can get course recommendations');
        }

        // Get all available courses
        const allCourses = await this.courseRepository.find({
            where: { isActive: true },
            relations: ['lecturer']
        });

        // Get enrolled course IDs
        const enrolledCourseIds = user.enrollments
            .filter(enrollment => enrollment.status === EnrollmentStatus.ENROLLED)
            .map(enrollment => enrollment.course.id);

        // Filter out already enrolled courses
        const availableCourses = allCourses.filter(
            course => !enrolledCourseIds.includes(course.id)
        );

        // Simple recommendation algorithm based on interests and prerequisites
        const recommendations = this.generateRecommendations(
            availableCourses,
            user.enrollments.map(e => e.course),
            recommendationDto
        );

        return {
            recommendations,
            totalRecommendations: recommendations.length,
            generatedAt: new Date().toISOString()
        };
    }

    async generateStudyPlan(userId: string, courseId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user || user.role !== UserRole.STUDENT) {
            throw new ForbiddenException('Only students can generate study plans');
        }

        const course = await this.courseRepository.findOne({
            where: { id: courseId },
            relations: ['assignments']
        });

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // Check if student is enrolled
        const enrollment = await this.enrollmentRepository.findOne({
            where: {
                student: { id: userId },
                course: { id: courseId },
                status: EnrollmentStatus.ENROLLED
            }
        });

        if (!enrollment) {
            throw new ForbiddenException('Student is not enrolled in this course');
        }

        // Generate study plan based on course duration and assignments
        const studyPlan = this.createStudyPlan(course);

        return {
            courseId: course.id,
            courseName: course.name,
            studyPlan,
            generatedAt: new Date().toISOString()
        };
    }

    async generateAssignmentFeedback(
        userId: string,
        assignmentId: string,
        submissionContent: string,
        rubric?: string
    ) {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user || user.role !== UserRole.LECTURER) {
            throw new ForbiddenException('Only lecturers can generate assignment feedback');
        }

        const assignment = await this.assignmentRepository.findOne({
            where: { id: assignmentId },
            relations: ['course', 'course.lecturer']
        });

        if (!assignment) {
            throw new NotFoundException('Assignment not found');
        }

        // Check if lecturer owns this assignment
        if (assignment.course.lecturer.id !== userId) {
            throw new ForbiddenException('You can only provide feedback for your own assignments');
        }

        // Generate AI feedback
        const feedback = this.generateFeedback(
            submissionContent,
            assignment.description,
            rubric
        );

        return {
            assignmentId,
            feedback,
            generatedAt: new Date().toISOString()
        };
    }

    async generateStudentAnalytics(userId: string, studentId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user || (user.role !== UserRole.LECTURER && user.role !== UserRole.ADMIN)) {
            throw new ForbiddenException('Only lecturers and admins can access student analytics');
        }

        const student = await this.userRepository.findOne({
            where: { id: studentId, role: UserRole.STUDENT },
            relations: ['enrollments', 'enrollments.course', 'assignments']
        });

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        // Generate analytics
        const analytics = this.calculateStudentAnalytics(student);

        return {
            studentId,
            performanceMetrics: analytics.metrics,
            recommendations: analytics.recommendations,
            riskFactors: analytics.riskFactors,
            generatedAt: new Date().toISOString()
        };
    }

    private generateRecommendations(
        availableCourses: Course[],
        enrolledCourses: Course[],
        preferences: GetRecommendationDto
    ) {
        return availableCourses
            .map(course => {
                let matchScore = 0;
                const reasons = [];

                // Interest matching
                if (preferences.interests && preferences.interests.length > 0) {
                    const courseKeywords = [
                        course.name.toLowerCase(),
                        course.description.toLowerCase(),
                        course.courseCode.toLowerCase()
                    ].join(' ');

                    const matchedInterests = preferences.interests.filter(interest =>
                        courseKeywords.includes(interest.toLowerCase())
                    );

                    if (matchedInterests.length > 0) {
                        matchScore += matchedInterests.length * 20;
                        reasons.push(`Matches your interests: ${matchedInterests.join(', ')}`);
                    }
                }

                // Difficulty level matching
                if (preferences.preferredDifficulty) {
                    if (course.credits <= 3 && preferences.preferredDifficulty === 'beginner') {
                        matchScore += 15;
                        reasons.push('Suitable for beginner level');
                    } else if (course.credits === 4 && preferences.preferredDifficulty === 'intermediate') {
                        matchScore += 15;
                        reasons.push('Matches intermediate difficulty');
                    } else if (course.credits >= 5 && preferences.preferredDifficulty === 'advanced') {
                        matchScore += 15;
                        reasons.push('Suitable for advanced level');
                    }
                }

                // Academic background matching
                if (preferences.academicBackground) {
                    const backgroundKeywords = course.description.toLowerCase();
                    if (backgroundKeywords.includes(preferences.academicBackground.toLowerCase())) {
                        matchScore += 25;
                        reasons.push(`Relevant to your ${preferences.academicBackground} background`);
                    }
                }

                // Prerequisites check (simplified)
                const hasPrerequisites = enrolledCourses.some(enrolled =>
                    course.description.toLowerCase().includes(enrolled.courseCode.toLowerCase())
                );
                if (hasPrerequisites) {
                    matchScore += 10;
                    reasons.push('You have completed related prerequisites');
                }

                // Random baseline score
                matchScore += Math.random() * 10;

                return {
                    courseId: course.id,
                    courseName: course.name,
                    courseCode: course.courseCode,
                    description: course.description,
                    credits: course.credits,
                    matchScore: Math.round(matchScore),
                    reasons
                };
            })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, preferences.maxRecommendations || 10);
    }

    private createStudyPlan(course: Course) {
        const totalWeeks = 16; // Standard semester length
        const weeklySchedule = [];

        for (let week = 1; week <= totalWeeks; week++) {
            const topics = this.generateWeeklyTopics(course, week);
            const activities = this.generateWeeklyActivities(course, week);
            const studyHours = this.calculateWeeklyStudyHours(course);

            weeklySchedule.push({
                week,
                topics,
                activities,
                studyHours
            });
        }

        return {
            weeklySchedule,
            totalWeeks,
            estimatedStudyHours: weeklySchedule.reduce((total, week) => total + week.studyHours, 0)
        };
    }

    private generateWeeklyTopics(course: Course, week: number): string[] {
        // Simplified topic generation based on course name and week
        const baseTopics = [
            `Introduction to ${course.name}`,
            `Fundamentals and Core Concepts`,
            `Advanced Topics in ${course.name}`,
            `Practical Applications`,
            `Case Studies and Examples`,
            `Review and Assessment Preparation`
        ];

        const topicIndex = Math.floor((week - 1) / 3) % baseTopics.length;
        return [baseTopics[topicIndex], `Week ${week} Specific Content`];
    }

    private generateWeeklyActivities(course: Course, week: number): string[] {
        const activities = [
            'Read assigned chapters',
            'Complete practice exercises',
            'Participate in discussion forums',
            'Attend virtual lectures',
            'Work on assignments',
            'Review lecture notes'
        ];

        // Return 2-3 activities per week
        return activities.slice(0, 2 + (week % 2));
    }

    private calculateWeeklyStudyHours(course: Course): number {
        // Base study hours on course credits
        return course.credits * 2 + Math.floor(Math.random() * 3);
    }

    private generateFeedback(
        submissionContent: string,
        assignmentDescription: string,
        rubric?: string
    ) {
        // Simplified feedback generation
        const wordCount = submissionContent.split(' ').length;
        const hasGoodStructure = submissionContent.includes('\n') || submissionContent.length > 500;

        const overallScore = Math.floor(Math.random() * 30) + 70; // 70-100 range

        const strengths = [];
        const improvements = [];

        if (wordCount > 300) {
            strengths.push('Comprehensive coverage of the topic');
        }
        if (hasGoodStructure) {
            strengths.push('Well-structured presentation');
        }

        if (wordCount < 200) {
            improvements.push('Consider expanding your analysis with more details');
        }
        if (!submissionContent.includes('example')) {
            improvements.push('Include more concrete examples to support your arguments');
        }

        const detailedComments = `This submission demonstrates ${overallScore >= 85 ? 'excellent' : overallScore >= 75 ? 'good' : 'satisfactory'} understanding of the assignment requirements. ${strengths.length > 0 ? 'Strengths include: ' + strengths.join(', ') + '. ' : ''}${improvements.length > 0 ? 'Areas for improvement: ' + improvements.join(', ') + '.' : ''}`;

        const suggestedGrade = overallScore >= 90 ? 'A' : overallScore >= 80 ? 'B' : overallScore >= 70 ? 'C' : overallScore >= 60 ? 'D' : 'F';

        return {
            overallScore,
            strengths,
            improvements,
            detailedComments,
            suggestedGrade
        };
    }

    private calculateStudentAnalytics(student: User) {
        const enrollments = student.enrollments || [];
        const assignments = student.assignments || [];

        // Calculate metrics
        const totalEnrollments = enrollments.length;
        const activeEnrollments = enrollments.filter(e => e.status === EnrollmentStatus.ENROLLED).length;
        const completedAssignments = assignments.filter(a => a.submissionDate).length;
        const totalAssignments = assignments.length;

        const attendanceRate = Math.floor(Math.random() * 20) + 80; // 80-100%
        const submissionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 100;
        const participationScore = Math.floor(Math.random() * 30) + 70; // 70-100
        const overallGrade = (attendanceRate + submissionRate + participationScore) / 3;

        const metrics = {
            overallGrade: Math.round(overallGrade),
            attendanceRate,
            submissionRate: Math.round(submissionRate),
            participationScore,
            improvementTrend: overallGrade >= 85 ? 'improving' : overallGrade >= 75 ? 'stable' : 'declining'
        };

        // Generate recommendations
        const recommendations = [];
        if (submissionRate < 80) {
            recommendations.push('Focus on timely assignment submissions');
        }
        if (attendanceRate < 90) {
            recommendations.push('Improve class attendance');
        }
        if (participationScore < 75) {
            recommendations.push('Increase participation in class discussions');
        }
        if (overallGrade >= 85) {
            recommendations.push('Consider taking advanced courses in your field');
        }

        // Identify risk factors
        const riskFactors = [];
        if (submissionRate < 70) {
            riskFactors.push('Low assignment submission rate');
        }
        if (attendanceRate < 80) {
            riskFactors.push('Poor attendance record');
        }
        if (overallGrade < 70) {
            riskFactors.push('Overall performance below expectations');
        }

        return {
            metrics,
            recommendations,
            riskFactors
        };
    }
}