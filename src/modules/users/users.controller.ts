import { CurrentAccount } from '@decorators/current-account.decorator';
import { Public } from '@decorators/is-public.decorator';
import { TokenPayload } from '@interfaces/token-payload.interface';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto, UpdateUserDto } from '@users/dto/create-user.dto';
import { UsersService } from '@users/users.service';
import { UpdateUserAvatarValidator } from '@validators/file.validator';

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

  /* Get method to retrieve the current user's information. */
  @Get('me')
  findMe(@CurrentAccount() payload: TokenPayload) {
    return this.usersService.findOne(payload.sub);
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

  /**
   * Put method to update a user by ID.
   * @param currentAccount The current user's account information stored in the request.
   * @param updateUserDto The data transfer object containing updated user details.
   * @returns The updated user object.
   */
  @Put('me')
  @UseInterceptors(FileInterceptor('avatar'))
  updateUser(
    @CurrentAccount() payload: TokenPayload,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(new UpdateUserAvatarValidator())
    avatar: Express.Multer.File,
  ) {
    return this.usersService.update(payload.sub, updateUserDto, avatar);
  }

  /* 
    Get method to retrieve artists followed by current user.
    @Param('id') id: string - The ID of the user whose followed artists are to be retrieved.
    Returns a list of artists followed by the user.
  */
  @Get('me/following/artists')
  findMyFollowedArtists(
    @CurrentAccount() payload: TokenPayload,
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.usersService.findFollowedArtists(
      payload.sub,
      query,
      limit,
      current,
    );
  }

  /* 
    Get method to retrieve artists followed by a user.
    @Param('id') id: string - The ID of the user whose followed artists are to be retrieved.
    Returns a list of artists followed by the user.
  */
  @Get(':id/following/artists')
  findFollowedArtists(
    @Param('id') id: string,
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.usersService.findFollowedArtists(id, query, limit, current);
  }

  /* 
    Put method to follow an artist.
    @Body() followArtistDto: FollowArtistDto - The data transfer object containing user ID and artist ID.
    Returns a confirmation message or the updated user object.
  */
  @Put('me/following/artists')
  followArtist(
    @CurrentAccount() payload: TokenPayload,
    @Body('artistId') artistId: string,
  ) {
    return this.usersService.followArtist({ userId: payload.sub, artistId });
  }

  /* 
    Delete method to unfollow an artist.
    @Body() followArtistDto: FollowArtistDto - The data transfer object containing user ID and artist ID.
    Returns a confirmation message or the updated user object.
  */
  @Delete('me/following/artists')
  unfollowArtist(
    @CurrentAccount() payload: TokenPayload,
    @Body('artistId') artistId: string,
  ) {
    return this.usersService.unfollowArtist({ userId: payload.sub, artistId });
  }

  /* 
    Get method to retrieve artists followed by the user.
    @Param('id') id: string - The ID of the user whose followed artists are to be retrieved.
    Returns a list of objects with 2 properties: artistId and isFollowing.
  */
  @Public()
  @Get('me/following/artists/contains')
  checkIfUserIsFollowingArtists(
    @CurrentAccount() payload: TokenPayload,
    @Query('artistIds') artistIds: string,
  ) {
    return this.usersService.checkIfUserIsFollowingArtists(
      payload ? payload.sub : null,
      artistIds.split(','),
    );
  }

  /* 
    Get method to retrieve artists followed by current user.
    @Param('id') id: string - The ID of the user whose followed artists are to be retrieved.
    Returns a list of artists followed by the user.
  */
  @Get('me/following/albums')
  findMyFollowedAlbums(
    @CurrentAccount() payload: TokenPayload,
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.usersService.findFollowedAlbums(
      payload.sub,
      query,
      limit,
      current,
    );
  }

  /* 
    Get method to retrieve artists followed by a user.
    @Param('id') id: string - The ID of the user whose followed artists are to be retrieved.
    Returns a list of artists followed by the user.
  */
  @Get(':id/following/albums')
  findFollowedAlbums(
    @Param('id') id: string,
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.usersService.findFollowedAlbums(id, query, limit, current);
  }

  /* 
    Put method to follow an album.
    @Body() followAlbumDto: FollowAlbumDto - The data transfer object containing user ID and album ID.
    Returns a confirmation message or the updated user object.
  */
  @Put('me/following/albums')
  followAlbum(
    @CurrentAccount() payload: TokenPayload,
    @Body('albumId') albumId: string,
  ) {
    return this.usersService.followAlbum({ userId: payload.sub, albumId });
  }

  /* 
    Delete method to unfollow an album.
    @Body() followAlbumDto: FollowAlbumDto - The data transfer object containing user ID and album ID.
    Returns a confirmation message or the updated user object.
  */
  @Delete('me/following/albums')
  unfollowAlbum(
    @CurrentAccount() payload: TokenPayload,
    @Body('albumId') albumId: string,
  ) {
    return this.usersService.unfollowAlbum({ userId: payload.sub, albumId });
  }

  /* 
    Get method to check if a user is following specific albums.
    @Param('id') id: string - The ID of the user whose followed albums are to be checked.
    @Query('albumIds') albumIds: string - Comma-separated list of album IDs to check.
    Returns a list of objects with 2 properties: albumId and isFollowing.
  */
  @Public()
  @Get('me/following/albums/contains')
  checkIfUserIsFollowingAlbum(
    @CurrentAccount() payload: TokenPayload,
    @Query('albumIds') albumIds: string,
  ) {
    return this.usersService.checkIfUserIsFollowingAlbums(
      payload ? payload.sub : null,
      albumIds.split(','),
    );
  }

  /* 
    Get method to retrieve playlists of a current user.
    @CurrentAccount() payload: TokenPayload - Jwt payload containing user information.
    @Query() query: Record<string, any> - Optional query parameters for filtering.
    Returns a list of playlists associated with the user.
  */
  @Get('me/playlists')
  findMyPlaylists(
    @CurrentAccount() payload: TokenPayload,
    @Query() query: Record<string, any>,
  ) {
    return this.usersService.findPlaylist(payload.sub, query);
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
