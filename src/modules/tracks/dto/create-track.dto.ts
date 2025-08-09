import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
