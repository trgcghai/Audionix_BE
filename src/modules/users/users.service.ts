import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ArtistsService } from '../artists/artists.service';
import {
  CheckFollowingArtistsDto,
  FollowArtistDto,
} from './dto/artist-user.dto';
import { BaseService } from 'src/utils/service.util';
import { CheckFollowingAlbumsDto, FollowAlbumDto } from './dto/album-user.dto';
import { AlbumsService } from '../albums/albums.service';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly artistService: ArtistsService,
    private readonly albumService: AlbumsService,
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
    });

    return {
      _id: result._id,
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

    const { item: user } = await this.findOne(userId);

    const isArtistAlreadyFollowed = user.followed_artists
      .map((artist) => artist._id.toString())
      .includes(artistId);

    if (isArtistAlreadyFollowed) {
      throw new BadRequestException('Artist already followed');
    }

    const { item: artist } = await this.artistService.findOne(artistId);

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

    const { item: user } = await this.findOne(userId);

    const isArtistAlreadyFollowed = user.followed_artists
      .map((artist) => artist._id.toString())
      .includes(artistId);

    if (!isArtistAlreadyFollowed) {
      throw new BadRequestException('Artist is not followed');
    }

    const { item: artist } = await this.artistService.findOne(artistId);

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

    const { item: user } = await this.findOne(userId);

    const followedArtists = user.followed_artists.map((artist) =>
      artist._id.toString(),
    );

    const result = artistIds.map((artistId) => ({
      artistId,
      isFollowing: followedArtists.includes(artistId),
    }));

    return {
      result,
    };
  }

  async followAlbum(followAlbumDto: FollowAlbumDto) {
    const { userId, albumId } = followAlbumDto;

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(albumId)
    ) {
      throw new BadRequestException('Invalid ID format');
    }

    const { item: user } = await this.findOne(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const { item: album } = await this.albumService.findOne(albumId);

    const isAlbumAlreadyFollowed = user.followed_albums
      .map((album) => album._id.toString())
      .includes(albumId);

    if (isAlbumAlreadyFollowed) {
      throw new BadRequestException('Album already followed');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $push: {
            followed_albums: album,
          },
        },
        { new: true },
      )
      .exec();

    await this.albumService.updateAlbumFollowCount(albumId, 1);

    return {
      user: updatedUser,
      message: 'Album followed successfully',
    };
  }

  async unfollowAlbum(followAlbumDto: FollowAlbumDto) {
    const { userId, albumId } = followAlbumDto;

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(albumId)
    ) {
      throw new BadRequestException('Invalid ID format');
    }

    const { item: user } = await this.findOne(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.albumService.findOne(albumId);

    const isAlbumAlreadyFollowed = user.followed_albums
      .map((album) => album._id.toString())
      .includes(albumId);

    if (!isAlbumAlreadyFollowed) {
      throw new BadRequestException('Album is not followed');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $pull: {
            followed_albums: { _id: albumId },
          },
        },
        { new: true },
      )
      .exec();

    await this.albumService.updateAlbumFollowCount(albumId, -1);

    return {
      user: updatedUser,
      message: 'Album unfollowed successfully',
    };
  }

  async checkIfUserIsFollowingAlbums(
    checkFollowingAlbumsDto: CheckFollowingAlbumsDto,
  ) {
    const { userId, albumIds } = checkFollowingAlbumsDto;

    const isValidAlbumIds = albumIds.every((id) =>
      mongoose.isValidObjectId(id),
    );

    if (!mongoose.isValidObjectId(userId) || !isValidAlbumIds) {
      throw new BadRequestException('Invalid user ID format');
    }

    const { item: user } = await this.findOne(userId);

    const followedArtists = user.followed_albums.map((album) =>
      album._id.toString(),
    );

    const result = albumIds.map((albumId) => ({
      albumId,
      isFollowing: followedArtists.includes(albumId),
    }));

    return {
      result,
    };
  }
}
