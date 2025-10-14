import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User, UserSchema } from '@users/entities/user.entity';
import { Track, TrackSchema } from '@tracks/entities/track.entity';
import { Artist, ArtistSchema } from '@artists/entities/artist.entity';
import { Playlist, PlaylistSchema } from '@playlists/entities/playlist.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Track.name, schema: TrackSchema },
      { name: Artist.name, schema: ArtistSchema },
      { name: Playlist.name, schema: PlaylistSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
