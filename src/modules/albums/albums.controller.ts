import { AlbumsService } from '@albums/albums.service';
import { CreateAlbumDto } from '@albums/dto/create-album.dto';
import { AlbumStatus } from '@albums/enum/album-status.enum';
import { CurrentAccount } from '@decorators/current-account.decorator';
import { Public } from '@decorators/is-public.decorator';
import { Roles } from '@decorators/roles.decorator';
import { Role } from '@enums/role.enum';
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
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAlbumFileValidator } from '@validators/file.validator';

@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  /**
   * Post method to create a new album.
   * @Body() createAlbumDto: CreateAlbumDto - The data transfer object containing album details.
   * Returns the id of the created album.
   */
  @Post()
  @Roles(Role.ARTIST)
  @UseInterceptors(FileInterceptor('cover_images'))
  create(
    @Body() createAlbumDto: CreateAlbumDto,
    @CurrentAccount() payload: TokenPayload,
    @UploadedFile(new CreateAlbumFileValidator())
    cover_image: Express.Multer.File,
  ) {
    return this.albumsService.create(payload.sub, createAlbumDto, cover_image);
  }

  /**
   * Get method to retrieve all albums.
   * @Query() query: Record<string, any> - Optional query parameters for filtering.
   * @Query('limit') limit: number - The maximum number of albums to return (default is 10).
   * @Query('current') current: number - The current page number (default is 1).
   * Returns a paginated list of albums.
   */
  @Get()
  findAll(
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.albumsService.findAll(query, limit, current, '', '', ['title']);
  }

  /**
   * Get method to retrieve latest albums by user's followed artists, if user has no followed artist, just return latest albums.
   * @Query() query: Record<string, any> - Optional query parameters for filtering.
   * @Query('limit') limit: number - The maximum number of albums to return (default is 10).
   * @Query('current') current: number - The current page number (default is 1).
   * Returns a paginated list of albums.
   */
  @Get('latest')
  @Public()
  findLatestAlbums(
    @CurrentAccount() payload: TokenPayload,
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.albumsService.findLatestAlbums(
      query,
      limit,
      current,
      payload?.sub,
    );
  }

  /**
   * Get method to retrieve an album by ID.
   * @Param('id') id: string - The ID of the album to retrieve.
   * Returns the album object if found.
   */
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.albumsService.findById(id);
  }

  /**
   * Delete method to remove an album by ID.
   * @Param('id') id: string - The ID of the album to remove.
   * Returns a confirmation message or the removed album object.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.albumsService.deleteAlbum(id);
  }

  /**
   * Delete method to remove multiple albums by their IDs.
   * @Body('ids') ids: string[] - An array of album IDs to remove.
   * Returns a confirmation message or the removed album objects.
   */
  @Delete()
  removeMultiple(@Body('ids') ids: string[]) {
    return this.albumsService.deleteMultipleAlbums(...ids);
  }

  /**
   * Get method to retrieve tracks in an album.
   * @Param('id') id: string - The ID of the album whose tracks are to be retrieved.
   * Returns a list of tracks in the album.
   */
  @Get(':id/tracks')
  findTracksInAlbum(@Param('id') id: string) {
    return this.albumsService.findTracksInAlbum(id);
  }

  /**
   * Put method to add tracks to an album.
   * @Param('id') id: string - The ID of the album to which tracks are to be added.
   * @Body('trackIds') trackIds: string[] - An array of track IDs to add to the album.
   * Returns a confirmation message or the updated album object.
   */
  @Put(':id/tracks')
  addTracksToAlbum(
    @Param('id') albumId: string,
    @Body('trackIds') trackIds: string[] = [],
  ) {
    return this.albumsService.addTracksToAlbum({ albumId, trackIds });
  }

  /**
   * Delete method to remove tracks from an album.
   * @Param('id') id: string - The ID of the album from which tracks are to be removed.
   * @Body('trackIds') trackIds: string[] - An array of track IDs to remove from the album.
   * Returns a confirmation message or the updated album object.
   */
  @Delete(':id/tracks')
  removeTracksFromAlbum(
    @Param('id') albumId: string,
    @Body('trackIds') trackIds: string[] = [],
  ) {
    return this.albumsService.removeTracksFromAlbum({ albumId, trackIds });
  }

  /**
   * Patch method to update the status of an album.
   * @Param('id') id: string - The ID of the album to update.
   * @Body('status') status: AlbumStatus - The new status to set for the album.
   * Returns the updated album object.
   */
  @Patch(':id/status')
  updateStatus(
    @Param('id') albumId: string,
    @Body('status') status: AlbumStatus,
  ) {
    return this.albumsService.updateStatus({ id: albumId, status });
  }

  /**
   * Patch method to update the status of multiple albums.
   * @Body('ids') ids: string[] - The IDs of the albums to update.
   * @Body('status') status: AlbumStatus - The new status to set for the albums.
   * Returns the updated album objects.
   */
  @Patch('status')
  updateMultipleStatus(
    @Body('ids') albumIds: string[],
    @Body('status') status: AlbumStatus,
  ) {
    return this.albumsService.updateMultipleStatus({ ids: albumIds, status });
  }
}
