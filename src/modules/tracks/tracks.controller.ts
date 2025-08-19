import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  Patch,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadTrackFilesValidator } from '@common/validators/file.validator';
import { TracksService } from '@tracks/tracks.service';
import { CreateTrackDto } from '@tracks/dto/create-track.dto';
import { CurrentAccount } from '@decorators/current-account.decorator';
import { TokenPayload } from '@interfaces/token-payload.interface';
import { Roles } from '@decorators/roles.decorator';
import { Role } from '@enums/role.enum';
import { TrackStatus } from '@tracks/enum/track-status.enum';

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  /**
   * Post method to create a new track.
   * @Body() createTrackDto: CreateTrackDto - The data transfer object containing track details.
   * Returns the id of the created track.
   */
  @Roles(Role.ARTIST)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audio', maxCount: 1 },
      { name: 'cover_image', maxCount: 1 },
    ]),
  )
  createTrack(
    @Body() createTrackDto: CreateTrackDto,
    @CurrentAccount() token: TokenPayload,
    @UploadedFiles(new UploadTrackFilesValidator())
    files: {
      audio?: Express.Multer.File[];
      cover_image?: Express.Multer.File[];
    },
  ) {
    return this.tracksService.create({
      createTrackDto,
      audioFile: files.audio || [],
      coverImageFile: files.cover_image || [],
      artistId: token.sub,
    });
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
    return this.tracksService.findWithArtist(query, limit, current);
  }

  /**
   * Get method to retrieve a track by ID.
   * @Param('id') id: string - The ID of the track to retrieve.
   * Returns the track object if found.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tracksService.findById(id);
  }

  @Get(':id/similar')
  findSimilar(
    @Param('id') id: string,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.tracksService.findSimilarTrack({ id, limit, current });
  }

  /**
   * Delete method to remove a track by ID.
   * @Param('id') id: string - The ID of the track to remove.
   * Returns a confirmation message or the removed track object.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tracksService.deleteTrack(id);
  }

  /**
   * Delete method to remove multiple tracks by their IDs.
   * @Body('ids') ids: string[] - An array of track IDs to remove.
   * Returns a confirmation message or the removed track objects.
   */
  @Delete()
  removeMultiple(@Body('ids') ids: string[]) {
    return this.tracksService.deleteMultipleTracks(...ids);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: TrackStatus) {
    return this.tracksService.updateStatus({ id, status });
  }

  @Patch('status')
  updateMultipleStatus(
    @Body('ids') ids: string[],
    @Body('status') status: TrackStatus,
  ) {
    return this.tracksService.updateMultipleStatus({ ids, status });
  }
}
