import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TrackStatus } from '../enum/track-status.enum';

export class CreateTrackDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  duration_ms: string;

  @IsEnum(TrackStatus)
  status: string = TrackStatus.HIDDEN;

  @IsNotEmpty()
  @IsString()
  artistId: string;

  @IsString({ each: true })
  genres: string[];
}
