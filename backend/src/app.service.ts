import { Injectable } from '@nestjs/common';
import { HealthCheckResponse } from './app.controller';

@Injectable()
export class AppService {
  private readonly startTime = Date.now();

  getHealthStatus(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}
