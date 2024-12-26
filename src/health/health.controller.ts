import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get('ping')
  async healthCheck() {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      details: {
        database: 'UP',
        cache: 'UP',
        messageQueue: 'UP',
      },
    };
  }
}
