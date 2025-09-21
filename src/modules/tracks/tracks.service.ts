import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTrackDto, UpdateTrackDto } from './dto/create-track.dto';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose, { Model } from 'mongoose';
import { BaseService } from '@utils/service.util';
import { Track } from '@tracks/entities/track.entity';
import { ArtistsService } from '@artists/artists.service';
import { UploadService } from '@upload/upload.service';
import { Artist } from '@artists/entities/artist.entity';
import { AlbumsService } from '@albums/albums.service';
import {
  UpdateManyTracksStatusDto,
  UpdateOneTrackStatusDto,
} from '@tracks/dto/status-track.dto';
import { TrackStatus } from '@tracks/enum/track-status.enum';
import { Album } from '@albums/entities/album.entity';

@Injectable()
export class TracksService extends BaseService<Track> {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<Track>,
    @Inject(forwardRef(() => ArtistsService))
    private artistService: ArtistsService,
    @Inject(UploadService)
    private uploadService: UploadService,
    @Inject(forwardRef(() => AlbumsService))
    private albumService: AlbumsService,
  ) {
    super(trackModel);
  }

  async create({
    createTrackDto,
    audioFile,
    coverImageFile,
    artistId,
  }: {
    createTrackDto: CreateTrackDto;
    audioFile: Express.Multer.File[];
    coverImageFile: Express.Multer.File[];
    artistId: string;
  }) {
    const { albumIds, genres, title } = createTrackDto;

    let albumIdsParsed: string[] = [];

    if (albumIds) {
      albumIdsParsed = JSON.parse(albumIds);
    }

    for (const albumId of albumIdsParsed) {
      await this.albumService.findOne(albumId);
    }

    if (!audioFile || audioFile.length === 0) {
      throw new BadRequestException('Audio file is required');
    }

    if (!coverImageFile || coverImageFile.length === 0) {
      throw new BadRequestException('Cover image is required');
    }

    const { item: artist } = await this.artistService.findOne(artistId);

    const {
      url: audioUrl,
      key: audioKey,
      size: audioSize,
      mimetype: audioMimetype,
      duration: audioDuration,
    } = await this.uploadService.uploadTrack({
      fileName: audioFile[0].originalname,
      file: audioFile[0],
      author: artistId,
    });

    const {
      url: coverImageUrl,
      height: coverImageHeight,
      width: coverImageWidth,
      key: coverImageKey,
    } = await this.uploadService.uploadImage({
      fileName: coverImageFile[0].originalname,
      file: coverImageFile[0],
      path: 'cover_images',
      author: artistId,
    });

    const result = await this.trackModel.create({
      title,
      duration_ms: audioDuration,
      artist,
      genres: genres ? JSON.parse(genres) : [],
      albums: albumIdsParsed ? albumIdsParsed : [],
      cover_images: [
        {
          url: coverImageUrl,
          height: coverImageHeight,
          width: coverImageWidth,
          key: coverImageKey,
        },
      ],
      file: {
        url: audioUrl,
        key: audioKey,
        size: audioSize,
        mimetype: audioMimetype,
      },
    });

    if (albumIdsParsed.length > 0) {
      await this.albumService.addTracksToAlbums({
        albumIds: albumIdsParsed,
        trackIds: [result._id.toString()],
      });
    }

    return { result };
  }

  async findById(id: string) {
    const { item } = await this.findOne(id);
    await item.populate<{ artist: Artist }>('artist', '_id name cover_images');
    await item.populate<{ albums: Album[] }>(
      'albums',
      '_id title cover_images',
    );
    return item;
  }

  async findByArtist(artistId: string, query: Record<string, any>) {
    query.artist = artistId;
    const { items, totalItems, totalPages, current, limit } =
      await this.findAll(
        query,
        query.limit as number,
        query.current as number,
        '',
        '',
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

  async findWithArtist(
    query: Record<string, any>,
    limit: number = 10,
    current: number = 1,
  ) {
    const { filter, sort } = aqp(query);

    if (limit < 1) {
      limit = 10;
    }

    if (current < 1) {
      current = 1;
    }

    if (filter.limit) delete filter.limit;
    if (filter.current) delete filter.current;

    if (filter.title) {
      filter.title = {
        $regex: new RegExp(filter.title, 'i'),
      };
    }

    const totalItems = await this.trackModel.countDocuments(filter).exec();
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (current - 1) * limit;

    const result = await this.trackModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort as Record<string, 1 | -1>)
      .populate<{ artist: Artist }>('artist', '_id name cover_images')
      .exec();

    return {
      items: result,
      totalItems,
      totalPages,
      current: parseInt(current.toString()),
      limit: parseInt(limit.toString()),
    };
  }

  async deleteTrack(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }

    const track = await this.trackModel.findByIdAndDelete(id).exec();

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    await this.uploadService.deleteFiles({
      keys: [track.file.key, ...track.cover_images.map((img) => img.key)],
    });

    return {
      track,
    };
  }

  async deleteMultipleTracks(...ids: string[]) {
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
        const track = await this.trackModel.findByIdAndDelete(id).exec();

        if (!track) {
          results.failedDeletions.push({
            id,
            reason: 'Track not found',
          });
          continue;
        }

        const trackFileKeys = [
          track.file.key,
          ...track.cover_images.map((img) => img.key),
        ];

        results.fileKeys.push(...trackFileKeys);
        results.successfulDeletions.push({
          id,
          title: track.title,
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
          ? `Track deleted successfully`
          : `Track not found`,
    };
  }

  async updateStatus({ id, status }: UpdateOneTrackStatusDto) {
    try {
      const { item: track } = await this.findOne(id);

      track.status = status;

      const result = await track.save();
      return result;
    } catch (error) {
      throw new BadRequestException(`Update track status failed`);
    }
  }

  async updateMultipleStatus({ ids, status }: UpdateManyTracksStatusDto) {
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
        newStatus: TrackStatus;
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
          // Find the track using existing findOne method
          const { item: track } = await this.findOne(id);

          if (!track) {
            results.failedUpdates.push({
              id,
              reason: 'Track not found',
            });
            continue;
          }

          // Update status
          track.status = status;
          const updatedTrack = await track.save();

          // Add to successful updates
          results.successfulUpdates.push({
            id,
            title: updatedTrack.title,
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
      throw new BadRequestException(`Update track status failed`);
    }

    return {
      totalProcessed: ids.length,
      successCount: results.successfulUpdates.length,
      failCount: results.failedUpdates.length,
      successfulUpdates: results.successfulUpdates,
      failedUpdates: results.failedUpdates,
      message:
        results.successfulUpdates.length > 0
          ? `Successfully updated ${results.successfulUpdates.length} track(s)`
          : 'No tracks were updated',
    };
  }

  async findSimilarTrack(
    id: string,
    query: Record<string, any>,
    limit: number,
    current: number,
  ) {
    const { item } = await this.findOne(id);

    if (query.title) {
      query.title = {
        $regex: new RegExp(query.title, 'i'),
      };
    }

    if (query.limit) delete query.limit;
    if (query.current) delete query.current;

    if (limit < 1) limit = 10;
    if (current < 1) current = 1;

    const filter = { _id: { $ne: id }, genres: { $in: item.genres }, ...query };

    const totalItems = await this.trackModel.countDocuments(filter).exec();
    const totalPages = Math.ceil(totalItems / limit);

    const result = await this.trackModel
      .find(filter)
      .skip((current - 1) * limit)
      .limit(limit)
      .exec();

    return {
      items: result,
      totalItems,
      totalPages,
      current: parseInt(current.toString()),
      limit: parseInt(limit.toString()),
    };
  }

  async addAlbumToTracks(albumIds: string[], trackIds: string[]) {
    this.trackModel
      .updateMany(
        {
          _id: { $in: trackIds },
        },
        {
          $addToSet: { albums: { $each: albumIds } },
        },
      )
      .exec();
  }

  async updateTrack({
    id,
    updateTrackDto,
    audioFile,
    coverImageFile,
    artistId,
  }: {
    id: string;
    updateTrackDto: UpdateTrackDto;
    audioFile?: Express.Multer.File[];
    coverImageFile?: Express.Multer.File[];
    artistId: string;
  }) {
    const { albumIds, genres, title } = updateTrackDto;

    let albumIdsParsed: string[] = [];

    if (albumIds) {
      albumIdsParsed = JSON.parse(albumIds);
    }

    const { item: track } = await this.findOne(id);

    if (track.artist.toString() !== artistId) {
      throw new BadRequestException('You are not the owner of this track');
    }

    const oldAlbums = track.albums;
    track.albums = [];

    for (const albumId of albumIdsParsed) {
      const { item: album } = await this.albumService.findOne(albumId);
      track.albums.push(album._id);
    }

    const removedAlbumIds = oldAlbums
      .map((album) => album.toString())
      .filter((id) => !albumIdsParsed.includes(id));

    if (removedAlbumIds.length > 0) {
      await this.albumService.removeTracksFromAlbums({
        albumIds: removedAlbumIds,
        trackIds: [track._id.toString()],
      });
    }

    await this.albumService.addTracksToAlbums({
      albumIds: albumIdsParsed,
      trackIds: [track._id.toString()],
    });

    await this.artistService.findOne(artistId);

    if (title) {
      track.title = title;
    }

    if (genres) {
      track.genres = JSON.parse(genres);
    }

    if (audioFile && audioFile.length > 0) {
      const {
        url: audioUrl,
        key: audioKey,
        size: audioSize,
        mimetype: audioMimetype,
        duration: audioDuration,
      } = await this.uploadService.uploadTrack({
        fileName: audioFile[0].originalname,
        file: audioFile[0],
        author: artistId,
      });

      track.file = {
        url: audioUrl,
        key: audioKey,
        size: audioSize,
        mimetype: audioMimetype,
      };

      track.duration_ms = audioDuration || track.duration_ms;
    }

    if (coverImageFile && coverImageFile.length > 0) {
      const {
        url: coverImageUrl,
        height: coverImageHeight,
        width: coverImageWidth,
        key: coverImageKey,
      } = await this.uploadService.uploadImage({
        fileName: coverImageFile[0].originalname,
        file: coverImageFile[0],
        path: 'cover_images',
        author: artistId,
      });

      track.cover_images = [
        {
          url: coverImageUrl,
          height: coverImageHeight,
          width: coverImageWidth,
          key: coverImageKey,
        },
      ];
    }

    const result = await track.save();

    return { result };
  }
}
