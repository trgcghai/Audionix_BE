import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTrackDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  albumIds: string;

  @IsString()
  @IsNotEmpty()
  genres: string;
}

export class UpdateTrackDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  albumIds?: string;

  @IsString()
  @IsOptional()
  genres?: string;
}
