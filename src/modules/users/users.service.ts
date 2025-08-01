import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
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
import { PlaylistsService } from '../playlists/playlists.service';
import { Artist } from '../artists/entities/artist.entity';
import { Album } from '../albums/entities/album.entity';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly artistService: ArtistsService,
    private readonly albumService: AlbumsService,
    @Inject(forwardRef(() => PlaylistsService))
    private playlistsService: PlaylistsService,
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
        .map((artist) => artist.toString())
        .includes(itemId);
    }
    if (type === 'album') {
      return user.followed_albums
        .map((album) => album.toString())
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

    const { item: artist } = await this.artistService.findOne(artistId);

    const result = await user
      .updateOne({
        $addToSet: {
          followed_artists: artist,
        },
      })
      .exec();

    return {
      result,
      message: 'Artist followed successfully',
    };
  }

  async unfollowArtist(followArtistDto: FollowArtistDto) {
    const { userId, artistId } = followArtistDto;

    if (!this.checkIdsValid(userId, artistId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const { item: user } = await this.findOne(userId);

    await this.artistService.findOne(artistId);

    const result = await user.updateOne({
      $pull: {
        followed_artists: { _id: artistId },
      },
    });

    return {
      result,
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

    const { item: album } = await this.albumService.findOne(albumId);

    const result = await user
      .updateOne({
        $addToSet: {
          followed_albums: album,
        },
      })
      .exec();

    await this.albumService.updateAlbumFollowCount(albumId, 1);

    return {
      result,
      message: 'Album followed successfully',
    };
  }

  async unfollowAlbum(followAlbumDto: FollowAlbumDto) {
    const { userId, albumId } = followAlbumDto;

    if (!this.checkIdsValid(userId, albumId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const { item: user } = await this.findOne(userId);

    await this.albumService.findOne(albumId);

    const result = await user
      .updateOne({
        $pull: {
          followed_albums: { _id: albumId },
        },
      })
      .exec();

    await this.albumService.updateAlbumFollowCount(albumId, -1);

    return {
      result,
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

  async findPlaylist(id: string, query: Record<string, any>) {
    if (!this.checkIdsValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    return await this.playlistsService.findByUser(id, query);
  }

  async findFollowedArtists(id: string) {
    if (!this.checkIdsValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const { item: user } = await this.findOne(id);

    await user.populate<{ followed_artists: Artist }>('followed_artists');

    return {
      artists: user.followed_artists,
    };
  }

  async findFollowedAlbums(id: string) {
    if (!this.checkIdsValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const { item: user } = await this.findOne(id);

    await user.populate<{ followed_albums: Album }>('followed_albums');

    return {
      albums: user.followed_albums,
    };
  }
}
