import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlbumsService } from './albums.service';
import { ArtistsModule } from '@artists/artists.module';
import { TracksModule } from '@tracks/tracks.module';
import { Album, AlbumSchema } from '@albums/entities/album.entity';
import { AlbumsController } from '@albums/albums.controller';
import { UploadModule } from '@upload/upload.module';
import { UsersModule } from '@users/users.module';

@Module({
  imports: [
    UploadModule,
    forwardRef(() => ArtistsModule),
    forwardRef(() => TracksModule),
    forwardRef(() => UsersModule),
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
