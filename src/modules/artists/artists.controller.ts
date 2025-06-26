import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Post()
  create(@Body() createArtistDto: CreateArtistDto) {
    return this.artistsService.create(createArtistDto);
  }

  @Get()
  findAll(
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.artistsService.findAll(query, limit, current);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.artistsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.artistsService.remove(id);
  }

  @Get(':id/tracks')
  findAllTracks(@Param('id') id: string, @Query() query: Record<string, any>) {
    return this.artistsService.findAllTracks(id, query);
  }

  @Get(':id/albums')
  findAllAlbums(@Param('id') id: string, @Query() query: Record<string, any>) {
    return this.artistsService.findAllAlbums(id, query);
  }

  @Get(':id/related-artists')
  findRelatedArtists(
    @Param('id') id: string,
    @Query() query: Record<string, any>,
  ) {
    return this.artistsService.findRelatedArtists(id, query);
  }
}

// -crud: xong
// -lấy ra tracks của artist: /:id/tracks: xong
// -lấy ra albums của artist: /:id/albums: xong
// -lấy ra artist tương tự based on genres /:id/related-artists: xong
