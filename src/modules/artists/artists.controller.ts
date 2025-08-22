import { ArtistsService } from '@artists/artists.service';
import { CreateArtistDto } from '@artists/dto/create-artist.dto';
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
} from '@nestjs/common';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  /**
   * Post method to create a new artist.
   * @Body() createArtistDto: CreateArtistDto - The data transfer object containing artist details.
   * Returns the id of the created artist.
   */
  @Post()
  create(@Body() createArtistDto: CreateArtistDto) {
    return this.artistsService.create(createArtistDto);
  }

  /*
   * Get method to retrieve all artists.
   * @Query() query: Record<string, any> - Optional query parameters for filtering.
   * @Query('limit') limit: number - The maximum number of artists to return (default is 10).
   * @Query('current') current: number - The current page number (default is 1).
   * Returns a paginated list of artists.
   */
  @Get()
  findAll(
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.artistsService.findAll(query, limit, current, '', '', ['name']);
  }

  @Get('popular')
  findPopularArtists(
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.artistsService.findPopularArtists(query, limit, current);
  }

  /**
   * Get method to retrieve an artist by ID.
   * @Param('id') id: string - The ID of the artist to retrieve.
   * Returns the artist object if found.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.artistsService.findById(id);
  }

  /**
   * Delete method to remove an artist by ID.
   * @Param('id') id: string - The ID of the artist to remove.
   * Returns a confirmation message or the removed artist object.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.artistsService.remove(id);
  }

  /**
   * Delete method to remove multiple artists by their IDs.
   * @Body('ids') ids: string[] - An array of artist IDs to remove.
   * Returns a confirmation message or the removed artist objects.
   */
  @Delete()
  removeMultiple(@Body('ids') ids: string[]) {
    return this.artistsService.remove(...ids);
  }

  /**
   * Get method to retrieve all tracks of an artist.
   * @Param('id') id: string - The ID of the artist.
   * @Query() query: Record<string, any> - Optional query parameters for filtering.
   * Returns a paginated list of tracks for the specified artist.
   */
  @Get('me/tracks')
  findMyTracks(
    @CurrentAccount() payload: TokenPayload,
    @Query() query: Record<string, any>,
  ) {
    return this.artistsService.findAllTracks(payload.sub, query);
  }

  /**
   * Get method to retrieve all tracks of an artist.
   * @Param('id') id: string - The ID of the artist.
   * @Query() query: Record<string, any> - Optional query parameters for filtering.
   * Returns a paginated list of tracks for the specified artist.
   */
  @Get(':id/tracks')
  findAllTracks(@Param('id') id: string, @Query() query: Record<string, any>) {
    return this.artistsService.findAllTracks(id, query);
  }

  /**
   * Get method to retrieve all albums of an artist.
   * @Param('id') id: string - The ID of the artist.
   * @Query() query: Record<string, any> - Optional query parameters for filtering.
   * Returns a paginated list of albums for the specified artist.
   */
  @Get('me/albums')
  findMyAlbums(
    @CurrentAccount() payload: TokenPayload,
    @Query() query: Record<string, any>,
  ) {
    return this.artistsService.findAllAlbums(payload.sub, query);
  }

  /**
   * Get method to retrieve all albums of an artist.
   * @Param('id') id: string - The ID of the artist.
   * @Query() query: Record<string, any> - Optional query parameters for filtering.
   * Returns a paginated list of albums for the specified artist.
   */
  @Get(':id/albums')
  findAllAlbums(@Param('id') id: string, @Query() query: Record<string, any>) {
    return this.artistsService.findAllAlbums(id, query);
  }

  /**
   * Get method to retrieve related artists based on genres.
   * @Param('id') id: string - The ID of the artist.
   * @Query() query: Record<string, any> - Optional query parameters for filtering.
   * Returns a list of related artists.
   */
  @Get(':id/related-artists')
  findRelatedArtists(
    @Param('id') id: string,
    @Query() query: Record<string, any>,
  ) {
    return this.artistsService.findRelatedArtists(id, query);
  }
}
