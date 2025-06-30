import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class TrackAlbumDto {
  @IsString()
  @IsNotEmpty()
  albumId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  trackIds: string[];
}
