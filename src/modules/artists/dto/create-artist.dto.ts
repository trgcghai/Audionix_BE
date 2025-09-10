import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArtistDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  genres: string;
}

export class UpdateArtistDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  genres?: string;
}
