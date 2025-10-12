import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { BaseService } from '@utils/service.util';
import { Model, Query } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@users/entities/user.entity';
import { ArtistsService } from '@artists/artists.service';
import { AlbumsService } from '@albums/albums.service';
import { PlaylistsService } from '@playlists/playlists.service';
import { CreateUserDto, UpdateUserDto } from '@users/dto/create-user.dto';
import { FollowArtistDto } from '@users/dto/artist-user.dto';
import { FollowAlbumDto } from '@users/dto/album-user.dto';
import { PlaylistStatus } from '@playlists/enum/playlist-status.enum';
import { UploadService } from '@upload/upload.service';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(forwardRef(() => ArtistsService))
    private artistService: ArtistsService,
    @Inject(forwardRef(() => AlbumsService))
    private albumService: AlbumsService,
    @Inject(forwardRef(() => PlaylistsService))
    private playlistsService: PlaylistsService,
    private uploadService: UploadService,
  ) {
    super(userModel);
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

  async findById(id: string) {
    if (!this.checkIdsValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const { item: user } = await this.findOne(id);

    await user.populate({ path: 'followed_artists', select: 'name' });
    await user.populate({ path: 'followed_albums', select: 'title' });

    return user;
  }

  async create(
    createUserDto: CreateUserDto,
    _id?: string,
    avatar?: Express.Multer.File,
  ) {
    const { email } = createUserDto;

    const isEmailExists = await this.userModel.exists({ email }).exec();

    if (isEmailExists) {
      throw new BadRequestException('Email already exists');
    }

    const userCreated = await this.userModel.create({
      _id,
      username: createUserDto.username,
      email: createUserDto.email,
      avatar: [],
      followed_artists: [],
      followed_albums: [],
    });

    if (avatar) {
      const { url, key, height, width } = await this.uploadService.uploadImage({
        path: 'user_avatars',
        author: userCreated._id.toString(),
        fileName: avatar.originalname,
        file: avatar,
      });

      userCreated.avatar = [
        {
          height,
          width,
          url,
          key,
        },
      ];
    }

    const likedSongsResult = await this.playlistsService.create(
      {
        title: 'Liked Songs',
        description: 'Your favorite songs all in one place',
        status: PlaylistStatus.PRIVATE,
      },
      userCreated._id.toString(),
    );

    userCreated.liked_songs = likedSongsResult._id;

    await userCreated.save();

    return {
      _id: userCreated._id,
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
          followed_artists: artist._id,
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
        followed_artists: artistId,
      },
    });

    return {
      result,
      message: 'Artist unfollowed successfully',
    };
  }

  async checkIfUserIsFollowingArtists(userId: string, artistIds: string[]) {
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
          followed_albums: album._id,
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
          followed_albums: albumId,
        },
      })
      .exec();

    await this.albumService.updateAlbumFollowCount(albumId, -1);

    return {
      result,
      message: 'Album unfollowed successfully',
    };
  }

  async checkIfUserIsFollowingAlbums(userId: string, albumIds: string[]) {
    if (!this.checkIdsValid(...albumIds, userId)) {
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
      throw new BadRequestException('Invalid User ID format');
    }
    return await this.playlistsService.findByUser(id, query);
  }

  async findFollowedArtists(
    id: string,
    query: Record<string, any> = {},
    limit: number = 10,
    current: number = 1,
  ) {
    if (!this.checkIdsValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const { item: user } = await this.findOne(id);

    if (!user.followed_artists || user.followed_artists.length === 0) {
      return {
        artists: [],
        totalItems: 0,
        totalPages: 0,
        current,
        limit,
      };
    }

    query._id = user.followed_artists
      .map((artist) => artist.toString())
      .join(',');

    const {
      items: artists,
      totalItems,
      totalPages,
    } = await this.artistService.findAll(query, limit, current, '', '', [
      'name',
    ]);

    return {
      artists,
      totalItems,
      totalPages,
      current,
      limit,
    };
  }

  async findFollowedAlbums(
    id: string,
    query: Record<string, any> = {},
    limit: number = 10,
    current: number = 1,
  ) {
    if (!this.checkIdsValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const { item: user } = await this.findOne(id);

    if (!user.followed_albums || user.followed_albums.length === 0) {
      return {
        albums: [],
        totalItems: 0,
        totalPages: 0,
        current,
        limit,
      };
    }
    query._id = user.followed_albums.map((album) => album.toString()).join(',');

    const {
      items: albums,
      totalItems,
      totalPages,
    } = await this.albumService.findAll(query, limit, current, '', '', [
      'title',
    ]);

    return {
      albums,
      totalItems,
      totalPages,
      current,
      limit,
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    avatar?: Express.Multer.File,
  ) {
    const { item: user } = await this.findOne(id);
    const { username } = updateUserDto;

    if (username) {
      user.username = username;
    }

    if (avatar) {
      const { url, key, height, width } = await this.uploadService.uploadImage({
        path: 'user_avatars',
        fileName: avatar.originalname,
        file: avatar,
        author: user._id.toString(),
      });

      user.avatar = [
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
      message: 'User updated successfully',
    };
  }

  async findLikedPlaylists(id: string) {
    return await this.playlistsService.findUserLikedSongs(id);
  }

  async findAsOptions() {
    const { items: users } = await this.findAll({}, 1000, 1, '', '', [
      'username',
    ]);
    return {
      items: users.map((user) => ({
        label: user.username,
        value: user._id,
      })),
    };
  }
}
