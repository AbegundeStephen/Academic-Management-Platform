import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { message: string; timestamp: string; uptime: number } {
    return {
      message: 'Academic Management Platform API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  getStatus(): {
    service: string;
    version: string;
    timestamp: string;
    uptime: number;
    memory: NodeJS.MemoryUsage;
  } {
    return {
      service: 'Academic Management Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}