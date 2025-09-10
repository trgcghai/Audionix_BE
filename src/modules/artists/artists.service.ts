import { AlbumsService } from '@albums/albums.service';
import {
  CreateArtistDto,
  UpdateArtistDto,
} from '@artists/dto/create-artist.dto';
import { Artist } from '@artists/entities/artist.entity';
import { AuthService } from '@auth/auth.service';
import { Role } from '@enums/role.enum';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TracksService } from '@tracks/tracks.service';
import { UploadService } from '@upload/upload.service';
import { BaseService } from '@utils/service.util';
import mongoose, { Model, PipelineStage } from 'mongoose';

@Injectable()
export class ArtistsService extends BaseService<Artist> {
  constructor(
    @InjectModel(Artist.name) private artistModel: Model<Artist>,
    @Inject(forwardRef(() => TracksService))
    private trackService: TracksService,
    @Inject(forwardRef(() => AlbumsService))
    private albumService: AlbumsService,
    private uploadService: UploadService,
    // @Inject(forwardRef(() => AuthService))
    // private authService: AuthService,
  ) {
    super(artistModel);
  }

  async checkArtistExists(id: string): Promise<boolean> {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid artist ID format');
    }
    const isArtistExists = await this.artistModel.exists({ _id: id });

    return !!isArtistExists;
  }

  async create(
    id: string,
    createArtistDto: CreateArtistDto,
    cover_images: Express.Multer.File,
  ) {
    const isArtistExists = await this.checkArtistExists(id);
    if (isArtistExists) {
      throw new BadRequestException('Artist already exists');
    }

    const { name, genres } = createArtistDto;

    const result = await this.artistModel.create({
      _id: id,
      name,
      cover_images: [],
      genres: genres ? JSON.parse(genres) : [],
    });

    if (cover_images) {
      const { url, key, height, width } = await this.uploadService.uploadImage({
        fileName: cover_images.originalname,
        file: cover_images,
        author: result._id.toString(),
      });

      result.cover_images = [
        {
          height,
          width,
          url,
          key,
        },
      ];
    }

    // const { item: account } = await this.authService.findOne(id);

    // const currentRoles = Array.isArray(account.role)
    //   ? account.role
    //   : [account.role];
    // if (!currentRoles.includes(Role.ARTIST)) {
    //   account.role = [...currentRoles, Role.ARTIST];
    // }
    // await account.save();

    return { result };
  }

  async findAllTracks(id: string, query: Record<string, any>) {
    return await this.trackService.findByArtist(id, query);
  }

  async findAllAlbums(id: string, query: Record<string, any>) {
    return await this.albumService.findByArtist(id, query);
  }

  async findSimilarArtists(id: string, query: Record<string, any>) {
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

  async findPopularArtists(
    query: Record<string, any>,
    limit: number,
    current: number,
  ) {
    if (query.limit) delete query.limit;
    if (query.current) delete query.current;
    if (query.name) {
      query.name = {
        $regex: new RegExp(query.name, 'i'),
      };
    }

    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'albums', // tên collection albums
          localField: '_id',
          foreignField: 'artist',
          as: 'albums',
        },
      },
      {
        $addFields: {
          totalFollowers: {
            $sum: '$albums.number_of_followers',
          },
        },
      },
      {
        $match: query,
      },
      {
        $facet: {
          metadata: [{ $count: 'totalItems' }],
          data: [
            { $sort: { totalFollowers: -1 } },
            { $skip: (current - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                name: 1,
                cover_images: 1,
                genres: 1,
                createdAt: 1,
                updatedAt: 1,
                type: 1,
                totalFollowers: 1,
              },
            },
          ],
        },
      },
    ];
    const result = await this.artistModel.aggregate(pipeline);

    const items = result[0].data;
    const totalItems = result[0].metadata[0]?.totalItems || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      totalPages,
      totalItems,
      limit,
      current,
    };
  }

  async findById(id: string) {
    const { item } = await this.findOne(id);
    return item;
  }

  async update(
    id: string,
    updateArtistDto: UpdateArtistDto,
    cover_images: Express.Multer.File,
  ) {
    try {
      const { item: user } = await this.findOne(id);
      const { name, genres } = updateArtistDto;

      if (name) {
        user.name = name;
      }

      if (genres) {
        user.genres = JSON.parse(genres);
      }

      if (cover_images) {
        const { url, key, height, width } =
          await this.uploadService.uploadImage({
            fileName: cover_images.originalname,
            file: cover_images,
            author: user._id.toString(),
          });

        user.cover_images = [
          {
            height,
            width,
            url,
            key,
          },
        ];
      }

      const result = await user.save();

      return {
        result,
      };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
