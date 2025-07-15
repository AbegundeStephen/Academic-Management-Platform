// src/shared/file-upload.utils.ts
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx'];

export const syllabusUploadOptions = {
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (ALLOWED_FILE_TYPES.includes(ext)) {
            return cb(null, true);
        }
        cb(new BadRequestException('Invalid file type'), false);
    },
    storage: diskStorage({
        destination: './uploads/syllabi',
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${req.params.id}-${uniqueSuffix}${ext}`);
        },
    }),
};

export const assignmentUploadOptions = {
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (ALLOWED_FILE_TYPES.includes(ext)) {
            return cb(null, true);
        }
        cb(new BadRequestException('Invalid file type'), false);
    },
    storage: diskStorage({
        destination: (req, file, cb) => {
            const path = `./uploads/assignments/${req.params.courseId}/${req.user.id}`;
            cb(null, path);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${uniqueSuffix}${ext}`);
        },
    }),
};