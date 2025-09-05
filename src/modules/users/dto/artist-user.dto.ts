import { IsNotEmpty, IsString } from 'class-validator';

export class FollowArtistDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  artistId: string;
}
