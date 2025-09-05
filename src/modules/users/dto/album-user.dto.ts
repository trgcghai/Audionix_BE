import { IsNotEmpty, IsString } from 'class-validator';

export class FollowAlbumDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  albumId: string;
}
