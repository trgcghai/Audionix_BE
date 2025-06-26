import {
  ArrayNotEmpty,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { TrackStatus } from '../enum/track-status.enum';

export class CreateTrackDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  duration_ms: number;

  @IsNotEmpty()
  @IsEnum(TrackStatus)
  status: string;

  @IsNotEmpty()
  @IsString()
  artistId: string;

  @IsString({ each: true })
  @ArrayNotEmpty()
  genres: string[];
}
