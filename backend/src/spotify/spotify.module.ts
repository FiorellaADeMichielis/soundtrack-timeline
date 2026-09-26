import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SpotifyApiClientService } from './spotify-api-client.service';
import { SpotifyController } from './spotify.controller';

@Module({
  imports: [AuthModule],
  controllers: [SpotifyController],
  providers: [SpotifyApiClientService],
  exports: [SpotifyApiClientService],
})
export class SpotifyModule {}
