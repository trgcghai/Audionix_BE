import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Album } from './entities/album.entity';
import mongoose, { Model } from 'mongoose';
import { BaseService } from 'src/utils/service.util';
import { ArtistsService } from '../artists/artists.service';

@Injectable()
export class AlbumsService extends BaseService<Album> {
  constructor(
    @InjectModel(Album.name) private albumModel: Model<Album>,
    @Inject(forwardRef(() => ArtistsService))
    private artistService: ArtistsService,
  ) {
    super(albumModel);
  }

  async create(createAlbumDto: CreateAlbumDto) {
    const { artistId, description, status, title, genres } = createAlbumDto;

    if (!mongoose.isValidObjectId(artistId)) {
      throw new BadRequestException('Artist ID is invalid');
    }

    const { item: artist } = await this.artistService.findOne(artistId);

    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    const result = await this.albumModel.create({
      title,
      description,
      artist,
      status,
      cover_images: [],
      tracks: [],
      genres,
    });

    return {
      _id: result._id,
    };
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

  async findByArtist(artistId: string, query: Record<string, any>) {
    query.artist = artistId;
    const {
      items: albums,
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
      albums,
      totalItems,
      totalPages,
      current,
      limit,
    };
  }
}
