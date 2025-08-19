import {
  CreateAlbumDto,
  UpdateMultipleStatusDto,
  UpdateStatusDto,
} from '@albums/dto/create-album.dto';
import { TrackAlbumDto } from '@albums/dto/track-album.dto';
import { Album } from '@albums/entities/album.entity';
import { AlbumStatus } from '@albums/enum/album-status.enum';
import { ArtistsService } from '@artists/artists.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TracksService } from '@tracks/tracks.service';
import { UploadService } from '@upload/upload.service';
import { UsersService } from '@users/users.service';
import { BaseService } from '@utils/service.util';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class AlbumsService extends BaseService<Album> {
  constructor(
    @InjectModel(Album.name) private albumModel: Model<Album>,
    @Inject(forwardRef(() => ArtistsService))
    private artistService: ArtistsService,
    @Inject(forwardRef(() => TracksService))
    private trackService: TracksService,
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    private uploadService: UploadService,
  ) {
    super(albumModel);
  }

  checkIdsValid(...ids: string[]) {
    for (const id of ids) {
      if (!mongoose.isValidObjectId(id)) {
        return false;
      }
      return true;
    }
  }

  async create(
    artistId: string,
    createAlbumDto: CreateAlbumDto,
    cover_images: Express.Multer.File,
  ) {
    const { description, title, genres } = createAlbumDto;

    if (!cover_images) {
      throw new BadRequestException('Cover image is required');
    }

    if (!mongoose.isValidObjectId(artistId)) {
      throw new BadRequestException('Artist ID is invalid');
    }

    const { item: artist } = await this.artistService.findOne(artistId);

    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    const { url, height, width, key } = await this.uploadService.uploadImage({
      fileName: cover_images.originalname,
      file: cover_images,
      path: 'cover_images',
      author: artistId,
    });

    const result = await this.albumModel.create({
      title,
      description,
      artist,
      cover_images: [
        {
          url,
          height,
          width,
          key,
        },
      ],
      tracks: [],
      genres: genres ? JSON.parse(genres) : [],
    });

    return result;
  }

  async updateAlbumFollowCount(albumId: string, number_of_increment: number) {
    if (!mongoose.isValidObjectId(albumId)) {
      throw new BadRequestException('Album ID is invalid');
    }

    const { item: album } = await this.findOne(albumId);

    album.number_of_followers += number_of_increment;
    await album.save();

    return album;
  }

  async findByArtist(artistId: string | string[], query: Record<string, any>) {
    query.artist = artistId;
    const { items, totalItems, totalPages, current, limit } =
      await this.findAll(
        query,
        query.limit as number,
        query.current as number,
        '',
        'artist',
        ['title'],
      );

    return {
      items,
      totalItems,
      totalPages,
      current,
      limit,
    };
  }

  async findTracksInAlbum(albumId: string) {
    if (!mongoose.isValidObjectId(albumId)) {
      throw new BadRequestException('Album ID is invalid');
    }

    const { item: album } = await this.findOne(albumId);

    await album.populate('tracks._id');

    return {
      _id: album._id,
      tracks: album.tracks,
    };
  }

  async addTracksToAlbum(addTrackToAlbumDto: TrackAlbumDto) {
    const { albumId, trackIds } = addTrackToAlbumDto;

    if (!this.checkIdsValid(albumId)) {
      throw new BadRequestException('Album ID is invalid');
    }

    const { item: album } = await this.findOne(albumId);

    if (!album) {
      throw new NotFoundException('Album not found');
    }

    if (!this.checkIdsValid(...trackIds)) {
      throw new BadRequestException('Invalid track IDs');
    }

    const { items: tracks } = await this.trackService.findMany(trackIds);

    const result = await album.updateOne({
      $addToSet: {
        tracks: tracks,
      },
    });

    return {
      _id: album._id,
      result,
    };
  }

  async removeTracksFromAlbum(removeTracksFromAlbum: TrackAlbumDto) {
    const { albumId, trackIds } = removeTracksFromAlbum;

    if (!this.checkIdsValid(albumId)) {
      throw new BadRequestException('Album ID is invalid');
    }

    const { item: album } = await this.findOne(albumId);

    if (!album) {
      throw new NotFoundException('Album not found');
    }

    if (!this.checkIdsValid(...trackIds)) {
      throw new BadRequestException('Invalid track IDs');
    }

    const result = await album.updateOne({
      $pull: {
        tracks: {
          _id: {
            $in: trackIds,
          },
        },
      },
    });

    return {
      _id: album._id,
      result,
    };
  }

  async deleteAlbum(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }

    const album = await this.albumModel.findByIdAndDelete(id).exec();

    if (!album) {
      throw new NotFoundException('Album not found');
    }

    await this.uploadService.deleteFiles({
      keys: [...album.cover_images.map((img) => img.key)],
    });

    return {
      album,
    };
  }

  async deleteMultipleAlbums(...ids: string[]) {
    for (const id of ids) {
      if (!mongoose.isValidObjectId(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }
    }

    const results: {
      successfulDeletions: { id: string; title: string }[];
      failedDeletions: { id: string; reason: string }[];
      fileKeys: string[];
    } = {
      successfulDeletions: [],
      failedDeletions: [],
      fileKeys: [], // Collect all file keys to delete
    };
    for (const id of ids) {
      try {
        const album = await this.albumModel.findByIdAndDelete(id).exec();

        if (!album) {
          results.failedDeletions.push({
            id,
            reason: 'Album not found',
          });
          continue;
        }

        const albumFileKeys = [...album.cover_images.map((img) => img.key)];

        results.fileKeys.push(...albumFileKeys);
        results.successfulDeletions.push({
          id,
          title: album.title,
        });
      } catch (error) {
        results.failedDeletions.push({
          id,
          reason: error.message || 'Unknown error',
        });
      }
    }

    if (results.fileKeys.length > 0) {
      try {
        await this.uploadService.deleteFiles({
          keys: results.fileKeys,
        });
      } catch (error) {
        console.error('Error deleting files:', error);
      }
    }

    return {
      deletedCount: results.successfulDeletions.length,
      message:
        results.successfulDeletions.length > 0
          ? `Album deleted successfully`
          : `Album not found`,
    };
  }

  async updateStatus({ id, status }: UpdateStatusDto) {
    try {
      const { item: album } = await this.findOne(id);

      album.status = status;

      const result = await album.save();
      return result;
    } catch (error) {
      throw new BadRequestException(`Update album status failed`);
    }
  }

  async updateMultipleStatus({ ids, status }: UpdateMultipleStatusDto) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('Valid IDs array is required');
    }

    // Validate all IDs first
    for (const id of ids) {
      if (!mongoose.isValidObjectId(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }
    }

    const results: {
      successfulUpdates: {
        id: string;
        title: string;
        newStatus: AlbumStatus;
      }[];
      failedUpdates: { id: string; reason: string }[];
      fileKeys: string[];
    } = {
      successfulUpdates: [],
      failedUpdates: [],
      fileKeys: [], // Collect all file keys to delete
    };

    try {
      for (const id of ids) {
        try {
          // Find the album using existing findOne method
          const { item: album } = await this.findOne(id);

          if (!album) {
            results.failedUpdates.push({
              id,
              reason: 'Album not found',
            });
            continue;
          }

          // Update status
          album.status = status;
          const updatedAlbum = await album.save();

          // Add to successful updates
          results.successfulUpdates.push({
            id,
            title: updatedAlbum.title,
            newStatus: status,
          });
        } catch (error) {
          results.failedUpdates.push({
            id,
            reason: error.message || 'Update failed',
          });
        }
      }
    } catch (error) {
      throw new BadRequestException(`Update Album status failed`);
    }

    return {
      totalProcessed: ids.length,
      successCount: results.successfulUpdates.length,
      failCount: results.failedUpdates.length,
      successfulUpdates: results.successfulUpdates,
      failedUpdates: results.failedUpdates,
      message:
        results.successfulUpdates.length > 0
          ? `Successfully updated ${results.successfulUpdates.length} Album(s)`
          : 'No Albums were updated',
    };
  }

  async findLatestAlbums(userId: string, query: Record<string, any>) {
    // find user's followed artist
    const { artists } = await this.userService.findFollowedArtists(
      userId,
      false,
    );

    // if user has no followed artist - find latest albums
    if (artists.length === 0) {
      query.sort = '-createdAt';
      const result = await this.findAll(query, query.limit);

      return result;
    }

    // find latest albums of user's followed artist
    const result = await this.findByArtist(
      artists.map((artist) => artist.toString()),
      query,
    );

    return result;
  }

  async findById(id: string) {
    const { item } = await this.findOne(id);

    await item.populate('artist', '_id name cover_images');

    return item;
  }
}
