import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { FollowAlbumDto } from '@users/dto/album-user.dto';
import { FollowArtistDto } from '@users/dto/artist-user.dto';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { UsersService } from '@users/users.service';

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
    Delete method to remove multiple users by their IDs.
    @Body('ids') ids: string[] - An array of user IDs to remove.
    Returns a confirmation message or the removed user objects.
  */
  @Delete()
  removeMultiple(@Body('ids') ids: string[]) {
    return this.usersService.remove(...ids);
  }

  /* 
    Get method to retrieve artists followed by a user.
    @Param('id') id: string - The ID of the user whose followed artists are to be retrieved.
    Returns a list of artists followed by the user.
  */
  @Get(':id/following/artists')
  findFollowedArtists(@Param('id') id: string) {
    return this.usersService.findFollowedArtists(id);
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
    Get method to retrieve artists followed by a user.
    @Param('id') id: string - The ID of the user whose followed artists are to be retrieved.
    Returns a list of artists followed by the user.
  */
  @Get(':id/following/albums')
  findFollowedAlbums(@Param('id') id: string) {
    return this.usersService.findFollowedAlbums(id);
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

  /* 
    Get method to retrieve playlists of a user.
    @Param('id') id: string - The ID of the user whose playlists are to be retrieved.
    @Query() query: Record<string, any> - Optional query parameters for filtering.
    Returns a list of playlists associated with the user.
  */
  @Get(':id/playlists')
  findPlaylist(@Param('id') id: string, @Query() query: Record<string, any>) {
    return this.usersService.findPlaylist(id, query);
  }
}

// -crud: xong
// -follow / unfollow artist: xong
// -kiểm tra follow artist hay không: xong

// -follow album: put: xong
// -unfollow album: delete: xong
// -kiểm tra follow album hay không: xong

// -lấy ra playlist của người dùng: xong
