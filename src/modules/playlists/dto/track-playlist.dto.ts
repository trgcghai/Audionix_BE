import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class TrackPlaylistDto {
  @IsString()
  @IsNotEmpty()
  playlistId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  trackIds: string[];
}
