export class DashboardStatsDto {
  totalUsers: number;
  totalTracks: number;
  totalLikes: number;
  userPlaylists: number;
  userGrowthPercentage: number;
  trackGrowthPercentage: number;
  likesGrowthPercentage: number;
  playlistGrowthPercentage: number;
}

export class UserRegistrationDataDto {
  date: string;
  users: number;
}

export class TopArtistDataDto {
  name: string;
  likes: number;
}

export class LikesDataDto {
  month: string;
  songs: number;
  albums: number;
}

export class PlaylistDataDto {
  month: string;
  count: number;
}

export class DashboardResponseDto {
  stats: DashboardStatsDto;
  userRegistrationData: UserRegistrationDataDto[];
  topArtistsData: TopArtistDataDto[];
  likesData: LikesDataDto[];
  playlistData: PlaylistDataDto[];
}
