import { IsNotEmpty, IsString } from 'class-validator';

export class FollowAlbumDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  albumId: string;
}

export class CheckFollowingAlbumsDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  albumIds: string[];
}
