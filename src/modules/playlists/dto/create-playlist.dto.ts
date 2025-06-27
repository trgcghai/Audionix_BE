import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PlaylistStatus } from '../enum/playlist-status.enum';

export class CreatePlaylistDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  @IsEnum(PlaylistStatus)
  status: string;
}
