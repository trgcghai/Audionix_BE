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

@Injectable()
export class TracksService extends BaseService<Track> {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<Track>,
    @Inject(forwardRef(() => ArtistsService))
    private artistService: ArtistsService,
  ) {
    super(trackModel);
  }

  async create(createTrackDto: CreateTrackDto) {
    const { artistId, genres, duration_ms, title, status } = createTrackDto;

    if (!mongoose.isValidObjectId(artistId)) {
      throw new BadRequestException('Invalid artist ID');
    }

    const { item: artist } = await this.artistService.findOne(artistId);

    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    const result = await this.trackModel.create({
      title,
      duration_ms,
      genres,
      status,
      artist,
      albums: [],
      cover_images: [],
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
}
