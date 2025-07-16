import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: exception.message,
            error: this.getErrorDetails(exception),
        };

        // Don't expose internal errors in production
        if (process.env.NODE_ENV === 'production' && status === HttpStatus.INTERNAL_SERVER_ERROR) {
            errorResponse.message = 'Internal server error';
            errorResponse.error = 'Something went wrong';
        }

        response.status(status).json(errorResponse);
    }

    private getErrorDetails(exception: HttpException): any {
        const response = exception.getResponse();
        if (typeof response === 'object' && response !== null) {
            return response;
        }
        return response;
    }
}