import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class TrackPlaylistDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  playlistIds: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  trackIds: string[];
}
