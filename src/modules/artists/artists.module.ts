import { AlbumsModule } from '@albums/albums.module';
import { ArtistsController } from '@artists/artists.controller';
import { ArtistsService } from '@artists/artists.service';
import { Artist, ArtistSchema } from '@artists/entities/artist.entity';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TracksModule } from '@tracks/tracks.module';

@Module({
  imports: [
    forwardRef(() => TracksModule),
    forwardRef(() => AlbumsModule),
    MongooseModule.forFeature([
      {
        name: Artist.name,
        schema: ArtistSchema,
      },
    ]),
  ],
  controllers: [ArtistsController],
  providers: [ArtistsService],
  exports: [ArtistsService],
})
export class ArtistsModule {}
