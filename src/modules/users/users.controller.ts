import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FollowArtistDto } from './dto/artist-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(
    @Query() query: Record<string, any>,
    @Query('limit') limit: number = 10,
    @Query('current') current: number = 1,
  ) {
    return this.usersService.findAll(query, limit, current);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Put('me/following/artists')
  followArtist(@Body() followArtistDto: FollowArtistDto) {
    return this.usersService.followArtist(followArtistDto);
  }

  @Delete('me/following/artists')
  unfollowArtist(@Body() followArtistDto: FollowArtistDto) {
    return this.usersService.unfollowArtist(followArtistDto);
  }

  @Get(':id/following/artists/contains')
  checkIfUserIsFollowingArtists(
    @Param('id') id: string,
    @Query('artistIds') artistIds: string,
  ) {
    return this.usersService.checkIfUserIsFollowingArtists({
      userId: id,
      artistIds: artistIds.split(','),
    });
  }
}

// -crud: xong
// -follow / unfollow artist: xong
// -kiểm tra follow artist hay không: xong

// -follow album: put /me/following/albums
// -unfollow album: delete /me/following/albums
// -kiểm tra follow album hay không: get /me/following/albums/contains
// -lấy ra playlist: get /me/playlists
// -lấy ra album đang theo dõi: get /me/following/albums
// -lấy ra artist đang theo dõi: get /me/following/artists
