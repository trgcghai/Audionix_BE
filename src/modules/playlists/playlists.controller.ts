import { CurrentAccount } from '@decorators/current-account.decorator';
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
    return this.playlistsService.create(createPlaylistDto, payload);
  }

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
    return this.playlistsService.findAll(query, limit, current);
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

  @Put(':id/tracks')
  addTracksToPlaylist(
    @Param('id') playlistId: string,
    @Body('trackIds') trackIds: string[] = [],
  ) {
    return this.playlistsService.addTracksToPlaylist({ playlistId, trackIds });
  }

  @Delete(':id/tracks')
  removeTracksFromPlaylist(
    @Param('id') playlistId: string,
    @Body('trackIds') trackIds: string[] = [],
  ) {
    return this.playlistsService.removeTracksFromPlaylist({
      playlistId,
      trackIds,
    });
  }

  @Get(':id/tracks')
  findTracksInPlaylist(@Param('id') playlistId: string) {
    return this.playlistsService.findTracksInPlaylist(playlistId);
  }
}

// thêm 1 / nhiều bài hát vào 1 / nhiều playlist(s)
// xóa 1 / nhiều bài hát khỏi 1 / nhiều playlist(s)
