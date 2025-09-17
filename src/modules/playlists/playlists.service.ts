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

  async create(createPlaylistDto: CreatePlaylistDto, userId: string) {
    const { description, title } = createPlaylistDto;

    const { item: user } = await this.userService.findOne(userId);

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

    const { title, description } = updatePlaylistDto;

    playlist.title = title;
    playlist.description = description;

    if (file) {
      const { url, key, height, width } = await this.uploadService.uploadImage({
        fileName: file.originalname,
        file,
        author: playlist.owner.toString(),
      });

      playlist.cover_images = [
        {
          height,
          width,
          url,
          key,
        },
      ];
    }

    await playlist.save();

    return playlist;
  }

  async findByUser(
    userId: string,
    query: Record<string, any>,
  ): Promise<PaginatedResponse<Playlist>> {
    query.owner = userId;

    const { items, totalItems, totalPages, limit, current } =
      await this.findAll(query, query.limit, query.current, '', 'owner', [
        'title',
      ]);

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

  async findUserLikedSongs(userId: string) {
    if (!this.checkIdsValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const { item: user } = await this.userService.findOne(userId);

    return await this.findById(user.liked_songs.toString());
  }

  async addTracksToPlaylists(trackPlaylistDto: TrackPlaylistDto) {
    const { playlistIds, trackIds } = trackPlaylistDto;

    if (!this.checkIdsValid(...playlistIds, ...trackIds)) {
      throw new BadRequestException('Invalid playlist or track IDs');
    }

    const playlists = await this.playlistModel.find({
      _id: { $in: playlistIds },
    });

    if (playlists.length === 0) {
      throw new NotFoundException('No playlists found with the provided IDs');
    }

    const { items: tracks } = await this.trackService.findMany(trackIds);

    if (tracks.length === 0) {
      throw new NotFoundException('No tracks found with the provided IDs');
    }

    const bulkOps = playlistIds.map((playlistId) => ({
      updateOne: {
        filter: { _id: playlistId },
        update: {
          $addToSet: {
            tracks: { $each: tracks },
          },
        },
      },
    }));

    const bulkResult = await this.playlistModel.bulkWrite(bulkOps);

    return {
      success: bulkResult.modifiedCount > 0,
      message: `Added ${tracks.length} track(s) to ${bulkResult.modifiedCount} playlist(s)`,
      stats: {
        tracksAdded: tracks.length,
        playlistsModified: bulkResult.modifiedCount,
        playlistsAttempted: playlistIds.length,
      },
    };
  }

  async removeTracksFromPlaylists(trackPlaylistDto: TrackPlaylistDto) {
    const { playlistIds, trackIds } = trackPlaylistDto;

    if (!this.checkIdsValid(...playlistIds, ...trackIds)) {
      throw new BadRequestException('Invalid playlist or track IDs');
    }

    const playlists = await this.playlistModel.find({
      _id: { $in: playlistIds },
    });

    if (playlists.length === 0) {
      throw new NotFoundException('No playlists found with the provided IDs');
    }

    const bulkOps = playlistIds.map((playlistId) => ({
      updateOne: {
        filter: { _id: playlistId },
        update: {
          $pull: {
            tracks: { _id: { $in: trackIds } },
          },
        },
      },
    }));

    const bulkResult = await this.playlistModel.bulkWrite(bulkOps);

    return {
      success: bulkResult.modifiedCount > 0,
      message: `Removed ${trackIds.length} track(s) from ${bulkResult.modifiedCount} playlist(s)`,
      stats: {
        tracksRemoved: trackIds.length,
        playlistsModified: bulkResult.modifiedCount,
        playlistsAttempted: playlistIds.length,
      },
    };
  }

  async findTracksInPlaylist(playlistId: string) {
    if (!mongoose.isValidObjectId(playlistId)) {
      throw new BadRequestException('Invalid playlist ID');
    }

    const { item: playlist } = await this.findOne(playlistId);

    await playlist.populate('tracks._id');

    return {
      _id: playlist._id,
      tracks: playlist.tracks,
    };
  }

  async addTrackToLiked(trackIds: string[], userId: string) {
    if (!this.checkIdsValid(...trackIds, userId)) {
      throw new BadRequestException('Invalid provided IDs');
    }

    const { item: user } = await this.userService.findOne(userId);

    const result = await this.addTracksToPlaylists({
      playlistIds: [user.liked_songs.toString()],
      trackIds,
    });

    return result;
  }

  async removeTrackFromLiked(trackIds: string[], userId: string) {
    if (!this.checkIdsValid(...trackIds, userId)) {
      throw new BadRequestException('Invalid provided IDs');
    }

    const { item: user } = await this.userService.findOne(userId);

    const result = await this.removeTracksFromPlaylists({
      playlistIds: [user.liked_songs.toString()],
      trackIds,
    });

    return result;
  }

  async checkTracksInPlaylist(playlistId: string, trackIds: string[]) {
    if (!this.checkIdsValid(playlistId, ...trackIds)) {
      throw new BadRequestException('Invalid provided IDs');
    }

    const { item: playlist } = await this.findOne(playlistId);

    const existingTrackIds = playlist.tracks.map((track) =>
      track._id.toString(),
    );

    const results = trackIds.map((trackId) => ({
      trackId,
      inPlaylist: existingTrackIds.includes(trackId),
    }));

    return {
      playlistId,
      playlistTitle: playlist.title,
      results,
      summary: {
        total: trackIds.length,
        inPlaylist: results.filter((item) => item.inPlaylist).length,
        notInPlaylist: results.filter((item) => !item.inPlaylist).length,
      },
    };
  }

  async checkTracksInLiked(userId: string, trackIds: string[]) {
    if (!this.checkIdsValid(...trackIds, userId)) {
      throw new BadRequestException('Invalid provided IDs');
    }

    const { item: user } = await this.userService.findOne(userId);

    return await this.checkTracksInPlaylist(
      user.liked_songs.toString(),
      trackIds,
    );
  }
}
