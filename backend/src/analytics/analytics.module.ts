import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SpotifyModule } from '../spotify/spotify.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { CultureConnectorService } from './culture-connector.service';

@Module({
  imports: [AuthModule, SpotifyModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, CultureConnectorService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
