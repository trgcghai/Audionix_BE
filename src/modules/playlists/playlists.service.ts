import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { BaseService } from 'src/utils/service.util';
import { Playlist } from './entities/playlist.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { TracksService } from '../tracks/tracks.service';
import { TrackPlaylistDto } from './dto/track-playlist.dto';
import { Track } from '../tracks/entities/track.entity';

@Injectable()
export class PlaylistsService extends BaseService<Playlist> {
  constructor(
    @InjectModel(Playlist.name) private readonly playlistModel: Model<Playlist>,
    @Inject(forwardRef(() => UsersService)) private userService: UsersService,
    @Inject() private trackService: TracksService,
  ) {
    super(playlistModel);
  }

  checkIdsValid(...ids: string[]) {
    for (const id of ids) {
      if (!mongoose.isValidObjectId(id)) {
        return false;
      }
      return true;
    }
  }

  async checkPlaylistExists(id: string): Promise<boolean> {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid playlist ID format');
    }
    const isPlaylistExists = await this.playlistModel.exists({ _id: id });

    if (!isPlaylistExists) {
      throw new NotFoundException('Playlist not found');
    }

    return !!isPlaylistExists;
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

  async addTracksToPlaylist(trackPlaylistDto: TrackPlaylistDto) {
    const { playlistId, trackIds } = trackPlaylistDto;

    if (!mongoose.isValidObjectId(playlistId)) {
      throw new BadRequestException('Invalid playlist ID');
    }

    const { item: playlist } = await this.findOne(playlistId);

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (!this.checkIdsValid(...trackIds)) {
      throw new BadRequestException('Invalid track IDs');
    }

    const { items: tracks } = await this.trackService.findMany(trackIds);

    const result = await playlist.updateOne({
      $addToSet: {
        tracks: tracks,
      },
    });

    return {
      _id: playlist._id,
      result,
    };
  }

  async removeTracksFromPlaylist(trackPlaylistDto: TrackPlaylistDto) {
    const { playlistId, trackIds } = trackPlaylistDto;

    if (!mongoose.isValidObjectId(playlistId)) {
      throw new BadRequestException('Invalid playlist ID');
    }

    const { item: playlist } = await this.findOne(playlistId);

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (!this.checkIdsValid(...trackIds)) {
      throw new BadRequestException('Invalid track IDs');
    }

    const result = await playlist.updateOne({
      $pull: {
        tracks: {
          _id: {
            $in: trackIds,
          },
        },
      },
    });

    return {
      _id: playlist._id,
      result,
    };
  }

  async findTracksInPlaylist(playlistId: string) {
    if (!mongoose.isValidObjectId(playlistId)) {
      throw new BadRequestException('Invalid playlist ID');
    }

    const { item: playlist } = await this.findOne(playlistId);

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    await playlist.populate('tracks._id');

    return {
      _id: playlist._id,
      tracks: playlist.tracks,
    };
  }
}
