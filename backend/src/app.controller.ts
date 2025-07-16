import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth(): { message: string; timestamp: string; uptime: number } {
    return this.appService.getHealth();
  }

  @Get('status')
  @ApiOperation({ summary: 'Detailed status check' })
  @ApiResponse({ status: 200, description: 'Detailed service status' })
  getStatus(): {
    service: string;
    version: string;
    timestamp: string;
    uptime: number;
    memory: NodeJS.MemoryUsage;
  } {
    return this.appService.getStatus();
  }
}