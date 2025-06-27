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

  checkIdsValid(...ids: string[]) {
    for (const id of ids) {
      if (!mongoose.isValidObjectId(id)) {
        return false;
      }
      return true;
    }
  }

  checkUserAlreadyFollowed(
    user: User,
    itemId: string,
    type: 'artist' | 'album',
  ): boolean {
    if (type === 'artist') {
      return user.followed_artists
        .map((artist) => artist._id.toString())
        .includes(itemId);
    }
    if (type === 'album') {
      return user.followed_albums
        .map((album) => album._id.toString())
        .includes(itemId);
    }
    return false;
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

    if (!this.checkIdsValid(userId, artistId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const { item: user } = await this.findOne(userId);

    const isArtistAlreadyFollowed = this.checkUserAlreadyFollowed(
      user,
      artistId,
      'artist',
    );

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

    if (!this.checkIdsValid(userId, artistId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const { item: user } = await this.findOne(userId);

    const isArtistAlreadyFollowed = this.checkUserAlreadyFollowed(
      user,
      artistId,
      'artist',
    );

    if (!isArtistAlreadyFollowed) {
      throw new BadRequestException('Artist is not followed');
    }

    await this.artistService.findOne(artistId);

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

    if (!this.checkIdsValid(userId, ...artistIds)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const { item: user } = await this.findOne(userId);

    const result = artistIds.map((artistId) => ({
      artistId,
      isFollowing: this.checkUserAlreadyFollowed(user, artistId, 'artist'),
    }));

    return {
      result,
    };
  }

  async followAlbum(followAlbumDto: FollowAlbumDto) {
    const { userId, albumId } = followAlbumDto;

    if (!this.checkIdsValid(userId, albumId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const { item: user } = await this.findOne(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const { item: album } = await this.albumService.findOne(albumId);

    const isAlbumAlreadyFollowed = this.checkUserAlreadyFollowed(
      user,
      albumId,
      'album',
    );

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

    if (!this.checkIdsValid(userId, albumId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const { item: user } = await this.findOne(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.albumService.findOne(albumId);

    const isAlbumAlreadyFollowed = this.checkUserAlreadyFollowed(
      user,
      albumId,
      'album',
    );

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

    if (!this.checkIdsValid(userId, ...albumIds)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const { item: user } = await this.findOne(userId);

    const result = albumIds.map((albumId) => ({
      albumId,
      isFollowing: this.checkUserAlreadyFollowed(user, albumId, 'album'),
    }));

    return {
      result,
    };
  }
}
