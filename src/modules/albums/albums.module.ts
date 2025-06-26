import { forwardRef, Module } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import { Album, AlbumSchema } from './entities/album.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { ArtistsModule } from '../artists/artists.module';

@Module({
  imports: [
    forwardRef(() => ArtistsModule),
    MongooseModule.forFeature([
      {
        name: Album.name,
        schema: AlbumSchema,
      },
    ]),
  ],
  controllers: [AlbumsController],
  providers: [AlbumsService],
  exports: [AlbumsService],
})
export class AlbumsModule {}
