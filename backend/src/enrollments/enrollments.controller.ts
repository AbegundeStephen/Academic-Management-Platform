import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  ParseFloatPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { EnrollmentStatus } from '../common/enums/enrollment-status.enum';

@ApiTags('Enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new enrollment' })
  @ApiResponse({ status: 201, description: 'Enrollment created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Course full or student already enrolled',
  })
  @ApiResponse({ status: 404, description: 'Course or student not found' })
  create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @CurrentUser() user: User,
  ) {
    return this.enrollmentsService.create(createEnrollmentDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all enrollments (filtered by user role)' })
  @ApiResponse({
    status: 200,
    description: 'Enrollments retrieved successfully',
  })
  findAll(@CurrentUser() user: User) {
    return this.enrollmentsService.findAll(user);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get enrollment statistics' })
  @ApiResponse({
    status: 200,
    description: 'Enrollment statistics retrieved successfully',
  })
  getStats(@CurrentUser() user: User) {
    return this.enrollmentsService.getEnrollmentStats(user);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get enrollments for a specific student' })
  @ApiResponse({
    status: 200,
    description: 'Student enrollments retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only view own enrollments',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findByStudent(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() user: User,
  ) {
    return this.enrollmentsService.findByStudent(studentId, user);
  }

  @Get('course/:courseId')
  @Roles(UserRole.ADMIN, UserRole.LECTURER)
  @ApiOperation({
    summary: 'Get enrollments for a specific course (Admin/Lecturer only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Course enrollments retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin/Lecturer only' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findByCourse(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: User,
  ) {
    return this.enrollmentsService.findByCourse(courseId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific enrollment' })
  @ApiResponse({
    status: 200,
    description: 'Enrollment retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No access to this enrollment',
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.enrollmentsService.findOne(id, user);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.LECTURER)
  @ApiOperation({ summary: 'Update enrollment status (Admin/Lecturer only)' })
  @ApiResponse({
    status: 200,
    description: 'Enrollment status updated successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin/Lecturer only' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: EnrollmentStatus,
    @CurrentUser() user: User,
  ) {
    return this.enrollmentsService.updateStatus(id, status, user);
  }

  @Patch(':id/grade')
  @Roles(UserRole.ADMIN, UserRole.LECTURER)
  @ApiOperation({ summary: 'Update enrollment grade (Admin/Lecturer only)' })
  @ApiResponse({ status: 200, description: 'Grade updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin/Lecturer only' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  updateGrade(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('finalGrade', ParseFloatPipe) finalGrade: number,
    @CurrentUser() user: User,
  ) {
    return this.enrollmentsService.updateGrade(id, finalGrade, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete/Drop an enrollment' })
  @ApiResponse({ status: 200, description: 'Enrollment deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot drop this enrollment',
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.enrollmentsService.remove(id, user);
  }
}
