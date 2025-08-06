import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Playlist, PlaylistSchema } from '@playlists/entities/playlist.entity';
import { PlaylistsController } from '@playlists/playlists.controller';
import { PlaylistsService } from '@playlists/playlists.service';
import { TracksModule } from '@tracks/tracks.module';
import { UploadModule } from '@upload/upload.module';
import { UsersModule } from '@users/users.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => TracksModule),
    UploadModule,
    MongooseModule.forFeature([
      {
        name: Playlist.name,
        schema: PlaylistSchema,
      },
    ]),
  ],
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  exports: [PlaylistsService],
})
export class PlaylistsModule {}
