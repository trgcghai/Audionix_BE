import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Artist } from './entities/artist.entity';
import mongoose, { Model } from 'mongoose';
import { BaseService } from 'src/utils/service.util';
import { TracksService } from '../tracks/tracks.service';

@Injectable()
export class ArtistsService extends BaseService<Artist> {
  constructor(
    @InjectModel(Artist.name) private artistModel: Model<Artist>,
    @Inject(forwardRef(() => TracksService))
    private trackService: TracksService,
  ) {
    super(artistModel);
  }

  async create(createArtistDto: CreateArtistDto) {
    const { name, cover_images } = createArtistDto;

    const result = await this.artistModel.create({
      name,
      cover_images: cover_images || [],
      genres: [],
    });

    return {
      _id: result._id,
    };
  }

  async update(id: string, updateArtistDto: UpdateArtistDto) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const result = await this.artistModel
      .updateOne(
        {
          _id: id,
        },
        {
          $set: updateArtistDto,
        },
      )
      .exec();

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      message:
        result.modifiedCount > 0
          ? 'Artist updated successfully'
          : 'No changes made or artist not found',
    };
  }

  async findAllTracks(id: string, query: Record<string, any>) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid artist ID format');
    }

    const isArtistExists = await this.artistModel.exists({ _id: id });

    if (!isArtistExists) {
      throw new BadRequestException('Artist not found');
    }

    return await this.trackService.findByArtist(id, query);
  }

  async findRelatedArtists(id: string, query: Record<string, any>) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid artist ID format');
    }

    const { item: artist } = await this.findOne(id);

    if (!artist) {
      throw new BadRequestException('Artist not found');
    }

    const { genres } = artist;

    query.genres = genres.join(',');

    return await this.findAll(query, query.limit, query.current);
  }
}
