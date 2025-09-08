import { ArtistsService } from '@artists/artists.service';
import {
  CreateArtistDto,
  UpdateArtistDto,
} from '@artists/dto/create-artist.dto';
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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserAvatarValidator } from '@validators/file.validator';

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

  /**
   * Get method to retrieve popular artists.
   * @param query Record<string, any> - Optional query parameters for filtering.
   * @param limit number - The maximum number of artists to return (default is 10).
   * @param current number - The current page number (default is 1).
   * @returns A paginated list of popular artists.
   */
  @Get('popular')
  @Public()
  findPopularArtists(
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.artistsService.findPopularArtists(query, limit, current);
  }

  /**
   * Get the current artist profile.
   * @param payload The token payload containing the artist's ID.
   * @returns The artist profile information.
   */
  @Get('me')
  findMyArtistProfile(@CurrentAccount() payload: TokenPayload) {
    return this.artistsService.findById(payload.sub);
  }

  /**
   * Get method to retrieve an artist by ID.
   * @Param('id') id: string - The ID of the artist to retrieve.
   * Returns the artist object if found.
   */
  @Public()
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
  @Public()
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
  @Public()
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
  @Public()
  @Get(':id/similar')
  findSimilarArtists(
    @Param('id') id: string,
    @Query() query: Record<string, any>,
  ) {
    return this.artistsService.findSimilarArtists(id, query);
  }

  /**
   * Update an artist's profile.
   * @param payload The current user's token payload.
   * @param updateArtistDto The data to update the artist with.
   * @returns The updated artist object.
   */
  @Put('me')
  @Roles(Role.ARTIST)
  @UseInterceptors(FileInterceptor('cover_images'))
  updateMyArtist(
    @CurrentAccount() payload: TokenPayload,
    @Body() updateArtistDto: UpdateArtistDto,
    @UploadedFile(new UpdateUserAvatarValidator())
    cover_images: Express.Multer.File,
  ) {
    return this.artistsService.update(
      payload.sub,
      updateArtistDto,
      cover_images,
    );
  }

  /**
   * Update an artist's profile.
   * @param id The ID of the artist to update.
   * @param updateArtistDto The data to update the artist with.
   * @param cover_images The cover images to upload for the artist.
   * @returns The updated artist object.
   */
  @Put(':id')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('cover_images'))
  updateArtist(
    @Param('id') id: string,
    @Body() updateArtistDto: UpdateArtistDto,
    @UploadedFile(new UpdateUserAvatarValidator())
    cover_images: Express.Multer.File,
  ) {
    return this.artistsService.update(id, updateArtistDto, cover_images);
  }
}
