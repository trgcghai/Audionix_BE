import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  /**
   * Post method to create a new track.
   * @Body() createTrackDto: CreateTrackDto - The data transfer object containing track details.
   * Returns the id of the created track.
   */
  @Post()
  create(@Body() createTrackDto: CreateTrackDto) {
    return this.tracksService.create(createTrackDto);
  }

  /**
   * Get method to retrieve all tracks.
   * @Query() query: Record<string, any> - Optional query parameters for filtering.
   * @Query('limit') limit: number - The maximum number of tracks to return (default is 10).
   * @Query('current') current: number - The current page number (default is 1).
   * Returns a paginated list of tracks.
   */
  @Get()
  findAll(
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.tracksService.findAll(query, limit, current);
  }

  /**
   * Get method to retrieve a track by ID.
   * @Param('id') id: string - The ID of the track to retrieve.
   * Returns the track object if found.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tracksService.findOne(id);
  }

  /**
   * Delete method to remove a track by ID.
   * @Param('id') id: string - The ID of the track to remove.
   * Returns a confirmation message or the removed track object.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tracksService.remove(id);
  }

  /**
   * Delete method to remove multiple tracks by their IDs.
   * @Body('ids') ids: string[] - An array of track IDs to remove.
   * Returns a confirmation message or the removed track objects.
   */
  @Delete()
  removeMultiple(@Body('ids') ids: string[]) {
    return this.tracksService.remove(...ids);
  }
}
