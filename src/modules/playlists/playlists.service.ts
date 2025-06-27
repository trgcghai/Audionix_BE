import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { BaseService } from 'src/utils/service.util';
import { Playlist } from './entities/playlist.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';

@Injectable()
export class PlaylistsService extends BaseService<Playlist> {
  constructor(
    @InjectModel(Playlist.name) private readonly playlistModel: Model<Playlist>,
    @Inject(forwardRef(() => UsersService)) private userService: UsersService,
  ) {
    super(playlistModel);
  }

  async create(createPlaylistDto: CreatePlaylistDto) {
    const { description, title, userId } = createPlaylistDto;

    const { item: user } = await this.userService.findOne(userId);

    const result = await this.playlistModel.create({
      title,
      description,
      owner: user,
      cover_images: [],
      tracks: [],
    });

    return {
      _id: result._id,
    };
  }

  async findByUser(userId: string, query: Record<string, any>) {
    query.owner = userId;
    const {
      items: playlists,
      totalItems,
      totalPages,
      current,
      limit,
    } = await this.findAll(
      query,
      query.limit as number,
      query.current as number,
    );

    return {
      playlists,
      totalItems,
      totalPages,
      current,
      limit,
    };
  }
}
