import { AlbumStatus } from '@albums/enum/album-status.enum';
import {
  ArrayNotEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAlbumDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNotEmpty()
  @IsString()
  artistId: string;

  @IsEnum(AlbumStatus)
  @IsNotEmpty()
  status: string;

  @ArrayNotEmpty()
  @IsString({ each: true })
  genres: string[];
}
