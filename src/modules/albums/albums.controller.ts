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
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/create-album.dto';

@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  /**
   * Post method to create a new album.
   * @Body() createAlbumDto: CreateAlbumDto - The data transfer object containing album details.
   * Returns the id of the created album.
   */
  @Post()
  create(@Body() createAlbumDto: CreateAlbumDto) {
    return this.albumsService.create(createAlbumDto);
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
    return this.albumsService.findAll(query, limit, current);
  }

  /**
   * Get method to retrieve an album by ID.
   * @Param('id') id: string - The ID of the album to retrieve.
   * Returns the album object if found.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.albumsService.findOne(id);
  }

  /**
   * Delete method to remove an album by ID.
   * @Param('id') id: string - The ID of the album to remove.
   * Returns a confirmation message or the removed album object.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.albumsService.remove(id);
  }

  /**
   * Delete method to remove multiple albums by their IDs.
   * @Body('ids') ids: string[] - An array of album IDs to remove.
   * Returns a confirmation message or the removed album objects.
   */
  @Delete()
  removeMultiple(@Body('ids') ids: string[]) {
    return this.albumsService.remove(...ids);
  }

  @Get(':id/tracks')
  findTracksInAlbum(@Param('id') id: string) {
    return this.albumsService.findTracksInAlbum(id);
  }

  @Put(':id/tracks')
  addTracksToAlbum(
    @Param('id') albumId: string,
    @Body('trackIds') trackIds: string[] = [],
  ) {
    return this.albumsService.addTracksToAlbum({ albumId, trackIds });
  }

  @Delete(':id/tracks')
  removeTracksFromAlbum(
    @Param('id') albumId: string,
    @Body('trackIds') trackIds: string[] = [],
  ) {
    return this.albumsService.removeTracksFromAlbum({ albumId, trackIds });
  }
}
