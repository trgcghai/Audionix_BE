import { IsNotEmpty, IsString } from 'class-validator';

export class FollowArtistDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  artistId: string;
}

export class CheckFollowingArtistsDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  artistIds: string[];
}
