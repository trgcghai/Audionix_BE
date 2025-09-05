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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreatePlaylistDto,
  UpdatePlaylistDto,
} from '@playlists/dto/create-playlist.dto';
import { PlaylistsService } from '@playlists/playlists.service';
import { UpdatePlaylistFileValidator } from '@validators/file.validator';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  /**
   * Post method to create a new playlist.
   * @Body() createPlaylistDto: CreatePlaylistDto - The data transfer object containing playlist details.
   * Returns the id of the created playlist.
   */
  @Post()
  create(
    @Body() createPlaylistDto: CreatePlaylistDto,
    @CurrentAccount() payload: TokenPayload,
  ) {
    return this.playlistsService.create(createPlaylistDto, payload.sub);
  }

  /**
   * Get method to retrieve all playlists.
   * @Query() query: Record<string, any> - Optional query parameters for filtering.
   * @Query('limit') limit: number - The maximum number of playlists to return (default is 10).
   * @Query('current') current: number - The current page number (default is 1).
   * Returns a paginated list of playlists.
   */
  @Get()
  findAll(
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.playlistsService.findAll(query, limit, current, '', '', [
      'title',
    ]);
  }

  /**
   * Get method to retrieve a playlist by ID.
   * @Param('id') id: string - The ID of the playlist to retrieve.
   * Returns the playlist object if found.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playlistsService.findById(id);
  }

  /**
   * Put method to add tracks to multiple playlists.
   * @param playlistIds - An array of playlist IDs to update.
   * @param trackIds - An array of track IDs to add to the playlists.
   * @returns The result of the update operation.
   */
  @Put('tracks')
  addTracksToPlaylists(
    @Body('playlistIds') playlistIds: string[],
    @Body('trackIds') trackIds: string[],
  ) {
    return this.playlistsService.addTracksToPlaylists({
      playlistIds,
      trackIds,
    });
  }

  /**
   * Put method to remove tracks from multiple playlists.
   * @param playlistIds - An array of playlist IDs to update.
   * @param trackIds - An array of track IDs to remove from the playlists.
   * @returns The result of the update operation.
   */
  @Delete('tracks')
  removeTracksFromPlaylists(
    @Body('playlistIds') playlistIds: string[],
    @Body('trackIds') trackIds: string[],
  ) {
    return this.playlistsService.removeTracksFromPlaylists({
      playlistIds,
      trackIds,
    });
  }

  /**
   * Put method to add tracks to the user's liked songs.
   * @param payload - The current user's token payload.
   * @param trackIds - An array of track IDs to add to the liked songs.
   * @returns The result of the operation.
   */
  @Put('liked/tracks')
  addTrackToLiked(
    @CurrentAccount() payload: TokenPayload,
    @Body('trackIds') trackIds: string[],
  ) {
    return this.playlistsService.addTrackToLiked(trackIds, payload.sub);
  }

  /**
   * Delete method to remove tracks from the user's liked songs.
   * @param payload - The current user's token payload.
   * @param trackIds - An array of track IDs to remove from the liked songs.
   * @returns The result of the operation.
   */
  @Delete('liked/tracks')
  removeTrackFromLiked(
    @CurrentAccount() payload: TokenPayload,
    @Body('trackIds') trackIds: string[],
  ) {
    return this.playlistsService.removeTrackFromLiked(trackIds, payload.sub);
  }

  /**
   * Put method to update a playlist.
   * @param id - The ID of the playlist to update.
   * @param updatePlaylistDto - The data transfer object containing updated playlist details.
   * @param file - The uploaded file (cover image) for the playlist.
   * @returns The updated playlist object.
   */
  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
    @UploadedFile(new UpdatePlaylistFileValidator())
    file: Express.Multer.File,
  ) {
    return this.playlistsService.update(id, updatePlaylistDto, file);
  }

  /**
   * Delete method to remove a playlist by ID.
   * @Param('id') id: string - The ID of the playlist to remove.
   * Returns a confirmation message or the removed playlist object.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playlistsService.remove(id);
  }

  /**
   * Delete method to remove multiple playlists by their IDs.
   * @Body('ids') ids: string[] - An array of playlist IDs to remove.
   * Returns a confirmation message or the removed playlist objects.
   */
  @Delete()
  removeMultiple(@Body('ids') ids: string[]) {
    return this.playlistsService.remove(...ids);
  }

  /**
   * Put method to add tracks to a playlist.
   * @Param('id') playlistId: string - The ID of the playlist to update.
   * @Body('trackIds') trackIds: string[] - An array of track IDs to add to the playlist.
   * Returns the updated playlist object.
   */
  @Put(':id/tracks')
  addTracksToPlaylist(
    @Param('id') playlistId: string,
    @Body('trackIds') trackIds: string[] = [],
  ) {
    return this.playlistsService.addTracksToPlaylists({
      playlistIds: [playlistId],
      trackIds,
    });
  }

  /**
   * Delete method to remove tracks from a playlist.
   * @Param('id') playlistId: string - The ID of the playlist to update.
   * @Body('trackIds') trackIds: string[] - An array of track IDs to remove from the playlist.
   * Returns the updated playlist object.
   */
  @Delete(':id/tracks')
  removeTracksFromPlaylist(
    @Param('id') playlistId: string,
    @Body('trackIds') trackIds: string[] = [],
  ) {
    return this.playlistsService.removeTracksFromPlaylists({
      playlistIds: [playlistId],
      trackIds,
    });
  }

  /**
   * Get method to retrieve all tracks in a playlist.
   * @Param('id') playlistId: string - The ID of the playlist to retrieve tracks from.
   * Returns an array of track objects.
   */
  @Get(':id/tracks')
  findTracksInPlaylist(@Param('id') playlistId: string) {
    return this.playlistsService.findTracksInPlaylist(playlistId);
  }

  /**
   * Get method to check if specific tracks are liked by the user.
   * @param payload - The current user's token payload.
   * @param trackIds - An array of track IDs to check for in the liked songs.
   * @returns An array indicating whether each track is liked by the user.
   */
  @Public()
  @Get('liked/tracks/contains')
  checkLikedTracks(
    @CurrentAccount() payload: TokenPayload,
    @Query('trackIds') trackIds: string,
  ) {
    return this.playlistsService.checkTracksInLiked(
      payload ? payload.sub : null,
      trackIds.split(','),
    );
  }

  /**
   * Post method to check if specific tracks are in a playlist.
   * @param playlistId - The ID of the playlist to check.
   * @param trackIds - An array of track IDs to check for in the playlist.
   * @returns An array indicating whether each track is in the playlist.
   */
  @Get(':id/tracks/contains')
  checkTracksInPlaylist(
    @Param('id') playlistId: string,
    @Query('trackIds') trackIds: string,
  ) {
    return this.playlistsService.checkTracksInPlaylist(
      playlistId,
      trackIds.split(','),
    );
  }
}
