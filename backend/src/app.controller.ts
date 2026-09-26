import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import type { ElementalArchetype } from '@soundtrack-timeline/shared';

export interface HealthCheckResponse {
  status: 'ok';
  timestamp: string;
  uptimeSeconds: number;
  defaultElement?: ElementalArchetype;
}

@Controller()
export class AppController {
  constructor(@Inject(AppService) private readonly appService: AppService) {}

  @Get('health')
  getHealth(): HealthCheckResponse {
    return this.appService.getHealthStatus();
  }
}
