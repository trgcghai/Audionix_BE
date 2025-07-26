import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTrackDto } from './dto/create-track.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Track } from './entities/track.entity';
import mongoose, { Model } from 'mongoose';
import { BaseService } from 'src/utils/service.util';
import { ArtistsService } from '../artists/artists.service';
import { UploadService } from '../upload/upload.service';
import aqp from 'api-query-params';
import { Artist } from '../artists/entities/artist.entity';

@Injectable()
export class TracksService extends BaseService<Track> {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<Track>,
    @Inject(forwardRef(() => ArtistsService))
    private artistService: ArtistsService,
    @Inject(UploadService)
    private uploadService: UploadService,
  ) {
    super(trackModel);
  }

  async create({
    createTrackDto,
    audioFile,
    coverImageFile,
  }: {
    createTrackDto: CreateTrackDto;
    audioFile: Express.Multer.File[];
    coverImageFile: Express.Multer.File[];
  }) {
    const { artistId, genres, duration_ms, title, status } = createTrackDto;

    if (!mongoose.isValidObjectId(artistId)) {
      throw new BadRequestException('Invalid artist ID');
    }

    if (!audioFile || audioFile.length === 0) {
      throw new BadRequestException('Audio file is required');
    }

    if (!coverImageFile || coverImageFile.length === 0) {
      throw new BadRequestException('Cover image is required');
    }

    const { item: artist } = await this.artistService.findOne(artistId);

    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    const {
      url: audioUrl,
      key: audioKey,
      size: audioSize,
      mimetype: audioMimetype,
    } = await this.uploadService.uploadTrack({
      fileName: audioFile[0].originalname,
      file: audioFile[0],
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
    });

    const result = await this.trackModel.create({
      title,
      duration_ms,
      genres,
      status,
      artist,
      albums: [],
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

    return { result };
  }

  async findByArtist(artistId: string, query: Record<string, any>) {
    query.artist = artistId;
    const {
      items: tracks,
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
      tracks,
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

    if (filter.limit) delete filter.limit;
    if (filter.current) delete filter.current;

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
      result,
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
}
