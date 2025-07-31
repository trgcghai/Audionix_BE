import { AlbumsModule } from '@albums/albums.module';
import { ArtistsModule } from '@artists/artists.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlaylistsModule } from '@playlists/playlists.module';
import { User, UserSchema } from '@users/entities/user.entity';
import { UsersController } from '@users/users.controller';
import { UsersService } from '@users/users.service';

@Module({
  imports: [
    ArtistsModule,
    AlbumsModule,
    forwardRef(() => PlaylistsModule),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
