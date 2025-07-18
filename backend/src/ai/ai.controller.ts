import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GetRecommendationDto } from './dto/recommendation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('AI Recommendations')
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('course-recommendations')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get course recommendations for student' })
  @ApiBody({ type: GetRecommendationDto })
  @ApiResponse({
    status: 200,
    description: 'Course recommendations generated successfully',
    schema: {
      type: 'object',
      properties: {
        recommendations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              courseId: { type: 'string' },
              courseName: { type: 'string' },
              courseCode: { type: 'string' },
              description: { type: 'string' },
              credits: { type: 'number' },
              matchScore: { type: 'number' },
              reasons: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
        totalRecommendations: { type: 'number' },
        generatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only students can access this endpoint',
  })
  async getCourseRecommendations(
    @CurrentUser() user: User,
    @Body() recommendationDto: GetRecommendationDto,
  ) {
    return this.aiService.getCourseRecommendations(user.id, recommendationDto);
  }

  @Get('study-plan/:courseId')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Generate AI study plan for a course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Study plan generated successfully',
    schema: {
      type: 'object',
      properties: {
        courseId: { type: 'string' },
        courseName: { type: 'string' },
        studyPlan: {
          type: 'object',
          properties: {
            weeklySchedule: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  week: { type: 'number' },
                  topics: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  activities: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  studyHours: { type: 'number' },
                },
              },
            },
            totalWeeks: { type: 'number' },
            estimatedStudyHours: { type: 'number' },
          },
        },
        generatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only students can access this endpoint',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  async getStudyPlan(
    @CurrentUser() user: User,
    @Param('courseId') courseId: string,
  ) {
    return this.aiService.generateStudyPlan(user.id, courseId);
  }

  @Post('assignment-feedback')
  @Roles(UserRole.LECTURER)
  @ApiOperation({ summary: 'Generate AI feedback for assignment' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        assignmentId: { type: 'string' },
        submissionContent: { type: 'string' },
        rubric: { type: 'string' },
      },
      required: ['assignmentId', 'submissionContent'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment feedback generated successfully',
    schema: {
      type: 'object',
      properties: {
        assignmentId: { type: 'string' },
        feedback: {
          type: 'object',
          properties: {
            overallScore: { type: 'number' },
            strengths: {
              type: 'array',
              items: { type: 'string' },
            },
            improvements: {
              type: 'array',
              items: { type: 'string' },
            },
            detailedComments: { type: 'string' },
            suggestedGrade: { type: 'string' },
          },
        },
        generatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only lecturers can access this endpoint',
  })
  async getAssignmentFeedback(
    @CurrentUser() user: User,
    @Body()
    body: { assignmentId: string; submissionContent: string; rubric?: string },
  ) {
    return this.aiService.generateAssignmentFeedback(
      user.id,
      body.assignmentId,
      body.submissionContent,
      body.rubric,
    );
  }

  @Get('analytics/performance/:studentId')
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get AI-powered student performance analytics' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({
    status: 200,
    description: 'Student performance analytics generated successfully',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string' },
        performanceMetrics: {
          type: 'object',
          properties: {
            overallGrade: { type: 'number' },
            attendanceRate: { type: 'number' },
            submissionRate: { type: 'number' },
            participationScore: { type: 'number' },
            improvementTrend: { type: 'string' },
          },
        },
        recommendations: {
          type: 'array',
          items: { type: 'string' },
        },
        riskFactors: {
          type: 'array',
          items: { type: 'string' },
        },
        generatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Only lecturers and admins can access this endpoint',
  })
  async getStudentAnalytics(
    @CurrentUser() user: User,
    @Param('studentId') studentId: string,
  ) {
    return this.aiService.generateStudentAnalytics(user.id, studentId);
  }
}
