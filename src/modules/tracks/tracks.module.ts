import { forwardRef, Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Track, TrackSchema } from './entities/track.entity';
import { ArtistsModule } from '../artists/artists.module';

@Module({
  imports: [
    forwardRef(() => ArtistsModule),
    MongooseModule.forFeature([
      {
        name: Track.name,
        schema: TrackSchema,
      },
    ]),
  ],
  controllers: [TracksController],
  providers: [TracksService],
  exports: [TracksService],
})
export class TracksModule {}
