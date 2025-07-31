import { ArtistsModule } from '@artists/artists.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Track, TrackSchema } from '@tracks/entities/track.entity';
import { TracksController } from '@tracks/tracks.controller';
import { TracksService } from '@tracks/tracks.service';
import { UploadModule } from '@upload/upload.module';
@Module({
  imports: [
    UploadModule,
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
