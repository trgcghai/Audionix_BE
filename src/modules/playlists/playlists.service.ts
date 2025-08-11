import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from '@utils/service.util';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Playlist } from '@playlists/entities/playlist.entity';
import { UsersService } from '@users/users.service';
import { TracksService } from '@tracks/tracks.service';
import {
  CreatePlaylistDto,
  UpdatePlaylistDto,
} from '@playlists/dto/create-playlist.dto';
import { TrackPlaylistDto } from '@playlists/dto/track-playlist.dto';
import { TokenPayload } from '@interfaces/token-payload.interface';
import { PaginatedResponse } from '@interfaces/response.interface';
import { UploadService } from '@upload/upload.service';
@Injectable()
export class PlaylistsService extends BaseService<Playlist> {
  constructor(
    @InjectModel(Playlist.name) private readonly playlistModel: Model<Playlist>,
    @Inject(forwardRef(() => UsersService)) private userService: UsersService,
    @Inject() private trackService: TracksService,
    @Inject(UploadService)
    private uploadService: UploadService,
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

  async create(createPlaylistDto: CreatePlaylistDto, payload: TokenPayload) {
    const { description, title } = createPlaylistDto;

    const { item: user } = await this.userService.findOne(payload.sub);

    const countUserPlaylist = await this.playlistModel.countDocuments({
      owner: user._id,
    });

    const result = await this.playlistModel.create({
      title: title || `Untitled Playlist #${countUserPlaylist + 1}`,
      description,
      owner: user,
      cover_images: [],
      tracks: [],
    });

    return {
      _id: result._id,
    };
  }

  async update(
    id: string,
    updatePlaylistDto: UpdatePlaylistDto,
    file?: Express.Multer.File,
  ) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid playlist ID');
    }

    const { item: playlist } = await this.findOne(id);

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    const { title, description } = updatePlaylistDto;

    playlist.title = title;
    playlist.description = description;

    if (file) {
      const { url, key, height, width } = await this.uploadService.uploadImage({
        fileName: file.originalname,
        file,
        author: playlist.owner.toString(),
      });

      playlist.cover_images.push({
        height,
        width,
        url,
        key,
      });
    }

    await playlist.save();

    return playlist;
  }

  async findByUser(
    userId: string,
    query: Record<string, any>,
  ): Promise<PaginatedResponse<Playlist>> {
    query.owner = userId;
    const { items, totalItems, totalPages, current, limit } =
      await this.findAll(
        query,
        query.limit as number,
        query.current as number,
        '',
        'owner',
      );

    return {
      items,
      totalItems,
      totalPages,
      current,
      limit,
    };
  }

  async findById(id: string) {
    const { item: playlist } = await this.findOne(id);

    await playlist.populate({
      path: 'tracks.artist',
      select: '_id name',
    });

    await playlist.populate({
      path: 'tracks.albums',
      select: '_id title',
    });

    return playlist;
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

    tracks.forEach((track) => {
      playlist.tracks.push({
        _id: track._id,
        title: track.title,
        duration_ms: track.duration_ms,
        cover_images: track.cover_images,
        artist: track.artist,
        file: track.file,
        type: track.type,
        albums: track.albums,
        timeAdded: new Date(),
      });
    });

    const result = await playlist.save();

    return result;
  }

  async removeTracksFromPlaylist(trackPlaylistDto: TrackPlaylistDto) {
    const { playlistId, trackIds } = trackPlaylistDto;

    if (!mongoose.isValidObjectId(playlistId)) {
      throw new BadRequestException('Invalid playlist ID');
    }

    if (!this.checkIdsValid(...trackIds)) {
      throw new BadRequestException('Invalid track IDs');
    }

    const { item: playlist } = await this.findOne(playlistId);

    playlist.tracks = playlist.tracks.filter(
      (track) => !trackIds.includes(track._id.toString()),
    );

    const result = await playlist.save();

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
