import { AlbumStatus } from '@albums/enum/album-status.enum';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAlbumDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  genres: string;
}

export class UpdateAlbumDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  genres: string;
}

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  status: AlbumStatus;
}

export class UpdateMultipleStatusDto {
  @IsNotEmpty()
  @IsString({ each: true })
  ids: string[];

  @IsNotEmpty()
  @IsString()
  status: AlbumStatus;
}
