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
   * @param createAlbumDto The data transfer object containing album details.
   * @param payload The current user's token payload.
   * @param cover_image The cover image file for the album.
   * @returns The ID of the created album.
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
   * @param query Optional query parameters for filtering.
   * @param limit The maximum number of albums to return (default is 10).
   * @param current The current page number (default is 1).
   * @returns A paginated list of albums.
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
   * @param payload The current user's token payload.
   * @param query Optional query parameters for filtering.
   * @param limit The maximum number of albums to return (default is 10).
   * @param current The current page number (default is 1).
   * @returns A paginated list of albums.
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
   * Get method to retrieve album filter options for the current artist.
   * @param payload The current user's token payload.
   * @returns An array of album filter options.
   */
  @Get('my-options')
  findMyAlbumAsFilterOptions(@CurrentAccount() payload: TokenPayload) {
    return this.albumsService.findMyAlbumsAsFilterOptions(payload.sub);
  }

  /**
   * Get method to retrieve an album by ID.
   * @param id - The ID of the album to retrieve.
   * @returns The album object if found.
   */
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.albumsService.findById(id);
  }

  /**
   * Put method to add tracks to multiple albums.
   * @param albumIds - The IDs of the albums to which tracks are to be added.
   * @param trackIds - The IDs of the tracks to add to the albums.
   * @returns A confirmation message or the updated album objects.
   */
  @Put('tracks')
  addTracksToAlbums(
    @Body('albumIds') albumIds: string[],
    @Body('trackIds') trackIds: string[],
  ) {
    return this.albumsService.addTracksToAlbums({ albumIds, trackIds });
  }

  /**
   * Delete method to remove tracks from multiple albums.
   * @param albumIds - The IDs of the albums from which tracks are to be removed.
   * @param trackIds - The IDs of the tracks to remove from the albums.
   * @returns A confirmation message or the updated album objects.
   */
  @Delete('tracks')
  removeTracksFromAlbums(
    @Body('albumIds') albumIds: string[],
    @Body('trackIds') trackIds: string[] = [],
  ) {
    return this.albumsService.removeTracksFromAlbums({ albumIds, trackIds });
  }

  /**
   * Delete method to remove an album by ID.
   * @param id - The ID of the album to remove.
   * @returns A confirmation message or the removed album object.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.albumsService.deleteAlbum(id);
  }

  /**
   * Delete method to remove multiple albums by their IDs.
   * @param ids - An array of album IDs to remove.
   * @returns A confirmation message or the removed album objects.
   */
  @Delete()
  removeMultiple(@Body('ids') ids: string[]) {
    return this.albumsService.deleteMultipleAlbums(...ids);
  }

  /**
   * Get method to retrieve tracks in an album.
   * @param id - The ID of the album whose tracks are to be retrieved.
   * @returns A list of tracks in the album.
   */
  @Get(':id/tracks')
  findTracksInAlbum(@Param('id') id: string) {
    return this.albumsService.findTracksInAlbum(id);
  }

  /**
   * Patch method to update the status of an album.
   * @param albumId - The ID of the album to update.
   * @param status - The new status to set for the album.
   * @returns The updated album object.
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
   * @param albumIds - The IDs of the albums to update.
   * @param status - The new status to set for the albums.
   * @returns The updated album objects.
   */
  @Patch('status')
  updateMultipleStatus(
    @Body('ids') albumIds: string[],
    @Body('status') status: AlbumStatus,
  ) {
    return this.albumsService.updateMultipleStatus({ ids: albumIds, status });
  }
}
