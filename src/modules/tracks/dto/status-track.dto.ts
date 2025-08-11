import { TrackStatus } from '@tracks/enum/track-status.enum';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UpdateOneTrackStatusDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  status: TrackStatus;
}

export class UpdateManyTracksStatusDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];

  @IsString()
  @IsNotEmpty()
  status: TrackStatus;
}
