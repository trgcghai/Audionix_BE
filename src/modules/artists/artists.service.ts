import { AlbumsService } from '@albums/albums.service';
import { CreateArtistDto } from '@artists/dto/create-artist.dto';
import { Artist } from '@artists/entities/artist.entity';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TracksService } from '@tracks/tracks.service';
import { BaseService } from '@utils/service.util';
import mongoose, { Model } from 'mongoose';

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

  async checkArtistExists(id: string): Promise<boolean> {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid artist ID format');
    }
    const isArtistExists = await this.artistModel.exists({ _id: id });

    if (!isArtistExists) {
      throw new NotFoundException('Artist not found');
    }

    return !!isArtistExists;
  }

  async create(createArtistDto: CreateArtistDto) {
    const { name } = createArtistDto;

    const result = await this.artistModel.create({
      name,
      cover_images: [],
      genres: [],
    });

    return {
      _id: result._id,
    };
  }

  async findAllTracks(id: string, query: Record<string, any>) {
    const isArtistExists = await this.checkArtistExists(id);

    if (isArtistExists) {
      return await this.trackService.findByArtist(id, query);
    }
  }

  async findAllAlbums(id: string, query: Record<string, any>) {
    const isArtistExists = await this.checkArtistExists(id);

    if (isArtistExists) {
      return await this.albumService.findByArtist(id, query);
    }
  }

  async findRelatedArtists(id: string, query: Record<string, any>) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid artist ID format');
    }

    const { item: artist } = await this.findOne(id);

    const { genres } = artist;

    query.genres = genres.join(',');

    return await this.findAll(
      query,
      query.limit as number,
      query.current as number,
      '',
      '',
      ['name'],
    );
  }
}
