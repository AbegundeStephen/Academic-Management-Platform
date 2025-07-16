import {
    Controller,
    Post,
    Get,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    Res,
    HttpException,
    HttpStatus
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Response } from 'express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
    ApiParam
} from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { existsSync } from 'fs';

// File upload configuration
const createMulterOptions = (destination: string) => ({
    storage: diskStorage({
        destination: `./uploads/${destination}`,
        filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`;
            callback(null, filename);
        },
    }),
    fileFilter: (req, file, callback) => {
        // Allow common file types
        const allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/zip',
            'application/x-zip-compressed'
        ];

        if (allowedMimes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new HttpException('File type not supported', HttpStatus.BAD_REQUEST), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

@ApiTags('File Uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) { }

    @Post('syllabus/:courseId')
    @Roles(UserRole.LECTURER, UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('file', createMulterOptions('syllabi')))
    @ApiOperation({ summary: 'Upload course syllabus' })
    @ApiConsumes('multipart/form-data')
    @ApiParam({ name: 'courseId', description: 'Course ID' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Syllabus file (PDF, DOC, DOCX)'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Syllabus uploaded successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                filename: { type: 'string' },
                originalName: { type: 'string' },
                mimeType: { type: 'string' },
                size: { type: 'number' },
                uploadedAt: { type: 'string', format: 'date-time' },
                uploadedBy: { type: 'string' }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid file or course ID'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Only lecturers and admins can upload syllabi'
    })
    async uploadSyllabus(
        @Param('courseId') courseId: string,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() user: User
    ) {
        if (!file) {
            throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
        }

        return this.uploadsService.uploadSyllabus(courseId, file, user.id);
    }

    @Post('assignment/:assignmentId')
    @Roles(UserRole.STUDENT)
    @UseInterceptors(FilesInterceptor('files', 5, createMulterOptions('assignments')))
    @ApiOperation({ summary: 'Submit assignment files' })
    @ApiConsumes('multipart/form-data')
    @ApiParam({ name: 'assignmentId', description: 'Assignment ID' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary'
                    },
                    description: 'Assignment files (max 5 files)'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Assignment submitted successfully',
        schema: {
            type: 'object',
            properties: {
                submissionId: { type: 'string' },
                files: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            filename: { type: 'string' },
                            originalName: { type: 'string' },
                            mimeType: { type: 'string' },
                            size: { type: 'number' }
                        }
                    }
                },
                submittedAt: { type: 'string', format: 'date-time' }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid files or assignment ID'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Only students can submit assignments'
    })
    async submitAssignment(
        @Param('assignmentId') assignmentId: string,
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUser() user: User
    ) {
        if (!files || files.length === 0) {
            throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
        }

        return this.uploadsService.submitAssignment(assignmentId, files, user.id);
    }

    @Get('syllabus/:courseId')
    @ApiOperation({ summary: 'Get course syllabus' })
    @ApiParam({ name: 'courseId', description: 'Course ID' })
    @ApiResponse({
        status: 200,
        description: 'Syllabus file retrieved successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Syllabus not found'
    })
    async getSyllabus(
        @Param('courseId') courseId: string,
        @Res() res: Response
    ) {
        const syllabusInfo = await this.uploadsService.getSyllabus(courseId);
        const filePath = join(process.cwd(), 'uploads', 'syllabi', syllabusInfo.filename);

        if (!existsSync(filePath)) {
            throw new HttpException('File not found', HttpStatus.NOT_FOUND);
        }

        res.setHeader('Content-Type', syllabusInfo.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${syllabusInfo.originalName}"`);
        res.sendFile(filePath);
    }

    @Get('assignment/:assignmentId/submissions')
    @Roles(UserRole.LECTURER, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get assignment submissions' })
    @ApiParam({ name: 'assignmentId', description: 'Assignment ID' })
    @ApiResponse({
        status: 200,
        description: 'Assignment submissions retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    submissionId: { type: 'string' },
                    studentId: { type: 'string' },
                    studentName: { type: 'string' },
                    files: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                filename: { type: 'string' },
                                originalName: { type: 'string' },
                                mimeType: { type: 'string' },
                                size: { type: 'number' }
                            }
                        }
                    },
                    submittedAt: { type: 'string', format: 'date-time' }
                }
            }
        }
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Only lecturers and admins can view submissions'
    })
    async getAssignmentSubmissions(
        @Param('assignmentId') assignmentId: string,
        @CurrentUser() user: User
    ) {
        return this.uploadsService.getAssignmentSubmissions(assignmentId, user.id);
    }

    @Get('file/:fileId')
    @ApiOperation({ summary: 'Download file by ID' })
    @ApiParam({ name: 'fileId', description: 'File ID' })
    @ApiResponse({
        status: 200,
        description: 'File downloaded successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'File not found'
    })
    async downloadFile(
        @Param('fileId') fileId: string,
        @CurrentUser() user: User,
        @Res() res: Response
    ) {
        const fileInfo = await this.uploadsService.getFileInfo(fileId, user.id);
        const filePath = join(process.cwd(), 'uploads', fileInfo.category, fileInfo.filename);

        if (!existsSync(filePath)) {
            throw new HttpException('File not found', HttpStatus.NOT_FOUND);
        }

        res.setHeader('Content-Type', fileInfo.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.originalName}"`);
        res.sendFile(filePath);
    }

    @Get('my-files')
    @ApiOperation({ summary: 'Get current user uploaded files' })
    @ApiResponse({
        status: 200,
        description: 'User files retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    filename: { type: 'string' },
                    originalName: { type: 'string' },
                    mimeType: { type: 'string' },
                    size: { type: 'number' },
                    category: { type: 'string' },
                    uploadedAt: { type: 'string', format: 'date-time' }
                }
            }
        }
    })
    async getMyFiles(@CurrentUser() user: User) {
        return this.uploadsService.getUserFiles(user.id);
    }
}