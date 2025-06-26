import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Artist } from './entities/artist.entity';
import mongoose, { Model } from 'mongoose';
import aqp from 'api-query-params';
import { BaseService } from 'src/utils/service.util';

@Injectable()
export class ArtistsService extends BaseService<Artist> {
  constructor(@InjectModel(Artist.name) private artistModel: Model<Artist>) {
    super(artistModel);
  }

  async create(createArtistDto: CreateArtistDto) {
    const { name, cover_images } = createArtistDto;

    const result = await this.artistModel.create({
      name,
      cover_images: cover_images || [],
    });

    return {
      _id: result._id,
    };
  }

  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const artist = await this.artistModel.findOne({ _id: id }).exec();
    return {
      artist,
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
          ? 'User updated successfully'
          : 'No changes made or user not found',
    };
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const result = await this.artistModel.deleteOne({ _id: id }).exec();

    return {
      deletedCount: result.deletedCount,
      message:
        result.deletedCount > 0
          ? 'User deleted successfully'
          : 'User not found',
    };
  }
}
