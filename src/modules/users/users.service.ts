import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { ArtistsService } from '../artists/artists.service';
import {
  CheckFollowingArtistsDto,
  FollowArtistDto,
} from './dto/artist-user.dto';
import { BaseService } from 'src/utils/service.util';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly artistService: ArtistsService,
  ) {
    super(userModel);
  }

  async create(createUserDto: CreateUserDto) {
    const { email } = createUserDto;

    const isEmailExists = await this.userModel.exists({ email }).exec();

    if (isEmailExists) {
      throw new BadRequestException('Email already exists');
    }

    const result = await this.userModel.create({
      username: createUserDto.username,
      email: createUserDto.email,
      avatar: createUserDto.avatar || [],
      followed_artists: [],
      followed_albums: [],
      playlists: [],
    });
    return {
      _id: result._id,
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

  async followArtist(followArtistDto: FollowArtistDto) {
    const { userId, artistId } = followArtistDto;

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(artistId)
    ) {
      throw new BadRequestException('Invalid ID format');
    }

    const { user } = await this.findOne(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isArtistAlreadyFollowed = user.followed_artists
      .map((artist) => artist._id.toString())
      .includes(artistId);

    if (isArtistAlreadyFollowed) {
      throw new BadRequestException('Artist already followed');
    }

    const { artist } = await this.artistService.findOne(artistId);

    if (!artist) {
      throw new BadRequestException('Artist not found');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $push: {
            followed_artists: artist,
          },
        },
        { new: true },
      )
      .exec();

    return {
      user: updatedUser,
      message: 'Artist followed successfully',
    };
  }

  async unfollowArtist(followArtistDto: FollowArtistDto) {
    const { userId, artistId } = followArtistDto;

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(artistId)
    ) {
      throw new BadRequestException('Invalid ID format');
    }

    const { user } = await this.findOne(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isArtistAlreadyFollowed = user.followed_artists
      .map((artist) => artist._id.toString())
      .includes(artistId);

    if (!isArtistAlreadyFollowed) {
      throw new BadRequestException('Artist is not followed');
    }

    const { artist } = await this.artistService.findOne(artistId);

    if (!artist) {
      throw new BadRequestException('Artist not found');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $pull: {
          followed_artists: { _id: artistId },
        },
      },
      { new: true },
    );

    return {
      user: updatedUser,
      message: 'Artist unfollowed successfully',
    };
  }

  async checkIfUserIsFollowingArtists(
    checkFollowingArtistsDto: CheckFollowingArtistsDto,
  ) {
    const { userId, artistIds } = checkFollowingArtistsDto;

    const isValidArtistIds = artistIds.every((id) =>
      mongoose.isValidObjectId(id),
    );

    if (!mongoose.isValidObjectId(userId) || !isValidArtistIds) {
      throw new BadRequestException('Invalid user ID format');
    }

    const { user } = await this.findOne(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const followedArtists = user.followed_artists.map((artist) =>
      artist._id.toString(),
    );

    const result = artistIds.map((artistId) => ({
      id: artistId,
      isFollowing: followedArtists.includes(artistId),
    }));

    return {
      result,
    };
  }
}
