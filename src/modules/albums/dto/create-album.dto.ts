import {
  ArrayNotEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AlbumStatus } from '../enum/album-status.enum';

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
