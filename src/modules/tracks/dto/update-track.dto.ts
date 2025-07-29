import { IsOptional, IsString } from 'class-validator';

export class UpdateTrackDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  duration_ms?: string;

  @IsOptional()
  @IsString({ each: true })
  genres?: string[];
}
