import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Artist } from './entities/artist.entity';
import mongoose, { Model } from 'mongoose';
import { BaseService } from 'src/utils/service.util';
import { TracksService } from '../tracks/tracks.service';
import { AlbumsService } from '../albums/albums.service';

@Injectable()
export class ArtistsService extends BaseService<Artist> {
  constructor(
    @InjectModel(Artist.name) private artistModel: Model<Artist>,
    @Inject(forwardRef(() => TracksService))
    private trackService: TracksService,
    @Inject(forwardRef(() => AlbumsService))
    private albumService: AlbumsService,
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

  async findAllTracks(id: string, query: Record<string, any>) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid artist ID format');
    }

    const isArtistExists = await this.artistModel.exists({ _id: id });

    if (!isArtistExists) {
      throw new NotFoundException('Artist not found');
    }

    return await this.trackService.findByArtist(id, query);
  }

  async findAllAlbums(id: string, query: Record<string, any>) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid artist ID format');
    }

    const isArtistExists = await this.artistModel.exists({ _id: id });

    if (!isArtistExists) {
      throw new NotFoundException('Artist not found');
    }

    return await this.albumService.findByArtist(id, query);
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
