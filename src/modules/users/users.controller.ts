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

  /**
   * Post method to create a new user.
   * @param createUserDto The data transfer object containing user details.
   * @returns The id of the created user.
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Get method to retrieve all users.
   * @param query Optional query parameters for filtering.
   * @param limit The maximum number of users to return (default is 10).
   * @param current The current page number (default is 1).
   * @returns A paginated list of users.
   */
  @Get()
  findAll(
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.usersService.findAll(query, limit, current);
  }

  /**
   * Get method to retrieve the current user's information.
   * @param payload The current user's account information.
   * @returns The current user's information.
   */
  @Get('me')
  findMe(@CurrentAccount() payload: TokenPayload) {
    return this.usersService.findOne(payload.sub);
  }

  /**
   * Get method to retrieve a user by ID.
   * @param id The ID of the user to retrieve.
   * @returns The user object if found.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Delete method to remove a user by ID.
   * @param id The ID of the user to remove.
   * @returns A confirmation message or the removed user object.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  /**
   * Delete method to remove multiple users by their IDs.
   * @param ids The IDs of the users to remove.
   * @returns A confirmation message or the removed user objects.
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

  /**
   * Get method to retrieve artists followed by current user.
   * @param payload The current user's account information.
   * @param query Optional query parameters for filtering.
   * @param limit The maximum number of artists to return (default is 10).
   * @param current The current page number (default is 1).
   * @returns A paginated list of artists followed by the user.
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

  /**
   * Get method to retrieve artists followed by a user.
   * @param id The ID of the user whose followed artists are to be retrieved.
   * @param query Optional query parameters for filtering.
   * @param limit The maximum number of artists to return (default is 10).
   * @param current The current page number (default is 1).
   * @returns A paginated list of artists followed by the user.
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

  /**
   * Put method to follow an artist.
   * @param payload The current user's account information.
   * @param artistId The ID of the artist to follow.
   * @returns A confirmation message or the updated user object.
   */
  @Put('me/following/artists')
  followArtist(
    @CurrentAccount() payload: TokenPayload,
    @Body('artistId') artistId: string,
  ) {
    return this.usersService.followArtist({ userId: payload.sub, artistId });
  }

  /**
   * Delete method to unfollow an artist.
   * @param payload The current user's account information.
   * @param artistId The ID of the artist to unfollow.
   * @returns A confirmation message or the updated user object.
   */
  @Delete('me/following/artists')
  unfollowArtist(
    @CurrentAccount() payload: TokenPayload,
    @Body('artistId') artistId: string,
  ) {
    return this.usersService.unfollowArtist({ userId: payload.sub, artistId });
  }

  /**
   * Get method to check if the current user is following specific artists.
   * @param payload The current user's account information.
   * @param artistIds The IDs of the artists to check.
   * @returns A list of objects with 2 properties: artistId and isFollowing.
   */
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

  /**
   * Get method to retrieve artists followed by current user.
   * @param payload The current user's account information.
   * @param query Optional query parameters for filtering.
   * @param limit The maximum number of artists to return (default is 10).
   * @param current The current page number (default is 1).
   * @returns A paginated list of artists followed by the user.
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

  /**
   * Get method to retrieve artists followed by a user.
   * @param id The ID of the user whose followed artists are to be retrieved.
   * @param query Optional query parameters for filtering.
   * @param limit The maximum number of artists to return (default is 10).
   * @param current The current page number (default is 1).
   * @returns A paginated list of artists followed by the user.
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

  /**
   * Put method to follow an album.
   * @param payload The current user's account information.
   * @param albumId The ID of the album to follow.
   * @returns A confirmation message or the updated user object.
   */
  @Put('me/following/albums')
  followAlbum(
    @CurrentAccount() payload: TokenPayload,
    @Body('albumId') albumId: string,
  ) {
    return this.usersService.followAlbum({ userId: payload.sub, albumId });
  }

  /**
   * Delete method to unfollow an album.
   * @param payload The current user's account information.
   * @param albumId The ID of the album to unfollow.
   * @returns A confirmation message or the updated user object.
   */
  @Delete('me/following/albums')
  unfollowAlbum(
    @CurrentAccount() payload: TokenPayload,
    @Body('albumId') albumId: string,
  ) {
    return this.usersService.unfollowAlbum({ userId: payload.sub, albumId });
  }

  /**
   * Get method to check if a user is following specific albums.
   * @param payload The current user's account information.
   * @param albumIds The IDs of the albums to check.
   * @returns A list of objects with 2 properties: albumId and isFollowing.
   */
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

  /**
   * Get method to retrieve playlists of a current user.
   * @param payload The current user's account information.
   * @param query Optional query parameters for filtering.
   * @returns A list of playlists associated with the user.
   */
  @Get('me/playlists')
  findMyPlaylists(
    @CurrentAccount() payload: TokenPayload,
    @Query() query: Record<string, any>,
  ) {
    return this.usersService.findPlaylist(payload.sub, query);
  }

  /**
   * Get method to retrieve liked playlists of a current user.
   * @param payload - The JWT payload containing user information.
   * @returns A list of liked playlists associated with the user.
   */
  @Get('me/playlists/liked')
  findMyLikedPlaylists(@CurrentAccount() payload: TokenPayload) {
    return this.usersService.findLikedPlaylists(payload.sub);
  }

  /**
   * Get method to retrieve playlists of a user.
   * @param id The ID of the user whose playlists are to be retrieved.
   * @param query Optional query parameters for filtering.
   * @returns A list of playlists associated with the user.
   */
  @Get(':id/playlists')
  findPlaylist(@Param('id') id: string, @Query() query: Record<string, any>) {
    return this.usersService.findPlaylist(id, query);
  }
}
