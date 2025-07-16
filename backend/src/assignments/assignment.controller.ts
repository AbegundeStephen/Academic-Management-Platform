// src/assignments/assignments.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    ParseUUIDPipe,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentsService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { GradeAssignmentDto } from './dto/grade-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentsController {
    constructor(private readonly assignmentsService: AssignmentsService) { }

    @Post()
    @Roles(UserRole.LECTURER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new assignment' })
    @ApiResponse({ status: 201, description: 'Assignment created successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient privileges' })
    async create(
        @Body() createAssignmentDto: CreateAssignmentDto,
        @CurrentUser() user: User,
    ) {
        return this.assignmentsService.create(createAssignmentDto, user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all assignments with optional filtering' })
    @ApiResponse({ status: 200, description: 'Assignments retrieved successfully' })
    async findAll(
        @CurrentUser() user: User,
        @Query('courseId') courseId?: string,
        @Query('lecturerId') lecturerId?: string,
        
    ) {
        return this.assignmentsService.findAll(courseId, lecturerId, user);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get assignment by ID' })
    @ApiResponse({ status: 200, description: 'Assignment retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Assignment not found' })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ) {
        return this.assignmentsService.findOne(id, user);
    }

    @Patch(':id')
    @Roles(UserRole.LECTURER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Update assignment' })
    @ApiResponse({ status: 200, description: 'Assignment updated successfully' })
    @ApiResponse({ status: 404, description: 'Assignment not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - not assignment creator' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateAssignmentDto: UpdateAssignmentDto,
        @CurrentUser() user: User,
    ) {
        return this.assignmentsService.update(id, updateAssignmentDto, user.id);
    }

    @Delete(':id')
    @Roles(UserRole.LECTURER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete assignment' })
    @ApiResponse({ status: 200, description: 'Assignment deleted successfully' })
    @ApiResponse({ status: 404, description: 'Assignment not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - not assignment creator' })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: User,
    ) {
        return this.assignmentsService.remove(id, user.id);
    }

    @Post(':id/submit')
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: 'Submit assignment (students only)' })
    @ApiResponse({ status: 201, description: 'Assignment submitted successfully' })
    @ApiResponse({ status: 404, description: 'Assignment not found' })
    @ApiResponse({ status: 400, description: 'Assignment already submitted or past due' })
    async submit(
        @Param('id', ParseUUIDPipe) assignmentId: string,
        @Body() submitAssignmentDto: SubmitAssignmentDto,
        @CurrentUser() user: User,
    ) {
        return this.assignmentsService.submitAssignment(assignmentId, user.id, submitAssignmentDto);
    }

    @Post(':id/submissions/:submissionId/grade')
    @Roles(UserRole.LECTURER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Grade assignment submission' })
    @ApiResponse({ status: 200, description: 'Assignment graded successfully' })
    @ApiResponse({ status: 404, description: 'Assignment or submission not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - not assignment creator' })
    async grade(
        @Param('id', ParseUUIDPipe) assignmentId: string,
        @Param('submissionId', ParseUUIDPipe) submissionId: string,
        @Body() gradeAssignmentDto: GradeAssignmentDto,
        @CurrentUser() user: User,
    ) {
        return this.assignmentsService.gradeSubmission(
            assignmentId,
            submissionId,
            gradeAssignmentDto,
            user.id,
        );
    }

    @Get(':id/submissions')
    @Roles(UserRole.LECTURER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get all submissions for an assignment' })
    @ApiResponse({ status: 200, description: 'Submissions retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Assignment not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - not assignment creator' })
    async getSubmissions(
        @Param('id', ParseUUIDPipe) assignmentId: string,
        @CurrentUser() user: User,
    ) {
        return this.assignmentsService.getSubmissions(assignmentId, user.id);
    }

    @Get(':id/my-submission')
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: 'Get student own submission for an assignment' })
    @ApiResponse({ status: 200, description: 'Submission retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Assignment or submission not found' })
    async getMySubmission(
        @Param('id', ParseUUIDPipe) assignmentId: string,
        @CurrentUser() user: User,
    ) {
        return this.assignmentsService.getStudentSubmission(assignmentId, user.id);
    }
}