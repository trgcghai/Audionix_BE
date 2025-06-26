import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FollowArtistDto } from './dto/artist-user.dto';
import { FollowAlbumDto } from './dto/album-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /* 
    Post method to create a new user.
    @Body() createUserDto: CreateUserDto - The data transfer object containing user details.
    Returns the id of the created user.
  */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /* 
    Get method to retrieve all users.
    @Query() query: Record<string, any> - Optional query parameters for filtering.
    @Query('limit') limit: number - The maximum number of users to return (default is 10).
    @Query('current') current: number - The current page number (default is 1).
    Returns a paginated list of users.
  */
  @Get()
  findAll(
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.usersService.findAll(query, limit, current);
  }

  /* 
    Get method to retrieve a user by ID.
    @Param('id') id: string - The ID of the user to retrieve.
    Returns the user object if found.
  */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /* 
    Delete method to remove a user by ID.
    @Param('id') id: string - The ID of the user to remove.
    Returns a confirmation message or the removed user object.
  */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  /* 
    Put method to follow an artist.
    @Body() followArtistDto: FollowArtistDto - The data transfer object containing user ID and artist ID.
    Returns a confirmation message or the updated user object.
  */
  @Put('me/following/artists')
  followArtist(@Body() followArtistDto: FollowArtistDto) {
    return this.usersService.followArtist(followArtistDto);
  }

  /* 
    Delete method to unfollow an artist.
    @Body() followArtistDto: FollowArtistDto - The data transfer object containing user ID and artist ID.
    Returns a confirmation message or the updated user object.
  */
  @Delete('me/following/artists')
  unfollowArtist(@Body() followArtistDto: FollowArtistDto) {
    return this.usersService.unfollowArtist(followArtistDto);
  }

  /* 
    Get method to retrieve artists followed by the user.
    @Param('id') id: string - The ID of the user whose followed artists are to be retrieved.
    Returns a list of objects with 2 properties: artistId and isFollowing.
  */
  @Get(':id/following/artists/contains')
  checkIfUserIsFollowingArtists(
    @Param('id') id: string,
    @Query('artistIds') artistIds: string,
  ) {
    return this.usersService.checkIfUserIsFollowingArtists({
      userId: id,
      artistIds: artistIds.split(','),
    });
  }

  /* 
    Put method to follow an album.
    @Body() followAlbumDto: FollowAlbumDto - The data transfer object containing user ID and album ID.
    Returns a confirmation message or the updated user object.
  */
  @Put('me/following/albums')
  followAlbum(@Body() followAlbumDto: FollowAlbumDto) {
    return this.usersService.followAlbum(followAlbumDto);
  }

  /* 
    Delete method to unfollow an album.
    @Body() followAlbumDto: FollowAlbumDto - The data transfer object containing user ID and album ID.
    Returns a confirmation message or the updated user object.
  */
  @Delete('me/following/albums')
  unfollowAlbum(@Body() followAlbumDto: FollowAlbumDto) {
    return this.usersService.unfollowAlbum(followAlbumDto);
  }

  /* 
    Get method to check if a user is following specific albums.
    @Param('id') id: string - The ID of the user whose followed albums are to be checked.
    @Query('albumIds') albumIds: string - Comma-separated list of album IDs to check.
    Returns a list of objects with 2 properties: albumId and isFollowing.
  */
  @Get(':id/following/albums/contains')
  checkIfUserIsFollowingAlbum(
    @Param('id') id: string,
    @Query('albumIds') albumIds: string,
  ) {
    return this.usersService.checkIfUserIsFollowingAlbums({
      userId: id,
      albumIds: albumIds.split(','),
    });
  }
}

// -crud: xong
// -follow / unfollow artist: xong
// -kiểm tra follow artist hay không: xong

// -follow album: put /me/following/albums: xong
// -unfollow album: delete /me/following/albums: xong
// -kiểm tra follow album hay không: get /me/following/albums/contains: xong

// -lấy ra playlist của người dùng: get /me/playlists
