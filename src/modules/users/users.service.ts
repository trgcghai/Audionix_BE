import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto) {
    const { email } = createUserDto;

    const isEmailExists = await this.userModel.exists({ email }).exec();

    if (isEmailExists) {
      throw new BadRequestException('Email already exists');
    }

    const result = await this.userModel.create({
      username: createUserDto.username,
      email: createUserDto.email,
      avatar: [],
      followed_artists: [],
      followed_albums: [],
      playlists: [],
    });
    return {
      _id: result._id,
    };
  }

  async findAll(query: Record<string, any>, limit: number, current: number) {
    const { filter, sort } = aqp(query);

    if (filter.limit) delete filter.limit;
    if (filter.current) delete filter.current;

    const totalItems = await this.userModel.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (current - 1) * limit;

    const result = await this.userModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort as Record<string, 1 | -1>)
      .exec();

    return {
      users: result,
      totalItems,
      totalPages,
      current: parseInt(current.toString()),
      limit: parseInt(limit.toString()),
    };
  }

  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const user = await this.userModel.findOne({ _id: id }).exec();
    return {
      user,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const result = await this.userModel
      .updateOne(
        {
          _id: id,
        },
        {
          $set: updateUserDto,
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

    const result = await this.userModel.deleteOne({ _id: id }).exec();

    return {
      deletedCount: result.deletedCount,
      message:
        result.deletedCount > 0
          ? 'User deleted successfully'
          : 'User not found',
    };
  }
}
