import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { User } from '@users/entities/user.entity';
import { Track } from '@tracks/entities/track.entity';
import { Artist } from '@artists/entities/artist.entity';
import { Playlist } from '@playlists/entities/playlist.entity';
import {
  DashboardResponseDto,
  DashboardStatsDto,
  UserRegistrationDataDto,
  TopArtistDataDto,
  LikesDataDto,
  PlaylistDataDto,
} from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Track.name) private trackModel: Model<Track>,
    @InjectModel(Artist.name) private artistModel: Model<Artist>,
    @InjectModel(Playlist.name) private playlistModel: Model<Playlist>,
  ) {}

  async getDashboardStats(): Promise<DashboardResponseDto> {
    const [
      stats,
      userRegistrationData,
      topArtistsData,
      likesData,
      playlistData,
    ] = await Promise.all([
      this.getMainStats(),
      this.getUserRegistrationData(),
      this.getTopArtistsData(),
      this.getLikesData(),
      this.getPlaylistData(),
    ]);

    return {
      stats,
      userRegistrationData,
      topArtistsData,
      likesData,
      playlistData,
    };
  }

  async getMainStats(): Promise<DashboardStatsDto> {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get current totals
    const [totalUsers, totalTracks, totalLikes, userPlaylists] =
      await Promise.all([
        this.userModel.countDocuments({ createdAt: { $lt: currentMonth } }),
        this.trackModel.countDocuments({ createdAt: { $lt: currentMonth } }),
        this.getTotalLikes(currentMonth),
        this.playlistModel.countDocuments({ createdAt: { $lt: currentMonth } }),
      ]);

    // Get last month totals for growth calculation
    const [
      lastMonthUsers,
      lastMonthTracks,
      lastMonthLikes,
      lastMonthPlaylists,
    ] = await Promise.all([
      this.userModel.countDocuments({ createdAt: { $lt: lastMonth } }),
      this.trackModel.countDocuments({ createdAt: { $lt: lastMonth } }),
      this.getTotalLikes(lastMonth),
      this.playlistModel.countDocuments({
        createdAt: { $lt: lastMonth },
      }),
    ]);

    // Calculate growth percentages
    const userGrowthPercentage = this.calculateGrowthPercentage(
      totalUsers,
      lastMonthUsers,
    );
    const trackGrowthPercentage = this.calculateGrowthPercentage(
      totalTracks,
      lastMonthTracks,
    );
    const likesGrowthPercentage = this.calculateGrowthPercentage(
      totalLikes,
      lastMonthLikes,
    );
    const playlistGrowthPercentage = this.calculateGrowthPercentage(
      userPlaylists,
      lastMonthPlaylists,
    );

    return {
      totalUsers,
      totalTracks,
      totalLikes,
      userPlaylists,
      userGrowthPercentage,
      trackGrowthPercentage,
      likesGrowthPercentage,
      playlistGrowthPercentage,
    };
  }

  async getTotalLikes(beforeDate?: Date): Promise<number> {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'playlists',
          localField: 'liked_songs',
          foreignField: '_id',
          as: 'likedPlaylist',
        },
      },
      {
        $unwind: '$likedPlaylist',
      },
      {
        $project: {
          trackCount: { $size: '$likedPlaylist.tracks' },
        },
      },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: '$trackCount' },
        },
      },
    ];

    if (beforeDate) {
      pipeline.unshift({
        $match: {
          createdAt: { $lt: beforeDate },
        },
      });
    }

    const result = await this.userModel.aggregate(pipeline);
    return result[0]?.totalLikes || 0;
  }

  async getUserRegistrationData(): Promise<UserRegistrationDataDto[]> {
    const tenMonthsAgo = new Date();
    tenMonthsAgo.setMonth(tenMonthsAgo.getMonth() - 10);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          createdAt: { $gte: tenMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          users: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        } as any,
      },
      {
        $project: {
          _id: 0,
          date: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: {
                  if: { $lt: ['$_id.month', 10] },
                  then: { $concat: ['0', { $toString: '$_id.month' }] },
                  else: { $toString: '$_id.month' },
                },
              },
            ],
          },
          users: 1,
        },
      },
    ];

    return await this.userModel.aggregate(pipeline);
  }

  async getTopArtistsData(): Promise<TopArtistDataDto[]> {
    try {
      // First, get artist direct follows count
      const artistDirectFollows = await this.userModel.aggregate([
        {
          $unwind: '$followed_artists',
        },
        {
          $group: {
            _id: '$followed_artists',
            directFollows: { $sum: 1 },
          },
        },
      ] as PipelineStage[]);

      // Then, get artist album follows count
      const artistAlbumFollows = await this.userModel.aggregate([
        {
          $unwind: '$followed_albums',
        },
        {
          $lookup: {
            from: 'albums',
            localField: 'followed_albums',
            foreignField: '_id',
            as: 'album',
          },
        },
        {
          $unwind: '$album',
        },
        {
          $group: {
            _id: '$album.artist',
            albumFollows: { $sum: 1 },
          },
        },
      ] as PipelineStage[]);

      // Combine the results
      const followsMap = new Map();

      // Add direct follows
      artistDirectFollows.forEach((item) => {
        followsMap.set(item._id.toString(), {
          directFollows: item.directFollows,
          albumFollows: 0,
        });
      });

      // Add album follows
      artistAlbumFollows.forEach((item) => {
        const artistId = item._id.toString();
        const existing = followsMap.get(artistId) || {
          directFollows: 0,
          albumFollows: 0,
        };
        existing.albumFollows = item.albumFollows;
        followsMap.set(artistId, existing);
      });

      // Get artist names and calculate total
      const results: TopArtistDataDto[] = [];
      for (const [artistId, follows] of followsMap) {
        const artist = await this.artistModel
          .findById(artistId, { name: 1 })
          .lean();
        if (artist) {
          results.push({
            name: artist.name,
            likes: follows.directFollows + follows.albumFollows,
          });
        }
      }

      // Sort and limit to top 10
      const topArtists = results.sort((a, b) => b.likes - a.likes).slice(0, 10);

      return topArtists;
    } catch (error) {
      console.error('Error in getTopArtistsData:', error);
      return [];
    }
  }

  async getLikesData(): Promise<LikesDataDto[]> {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Get songs likes data
    const songsLikesData = await this.userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $lookup: {
          from: 'playlists',
          localField: 'liked_songs',
          foreignField: '_id',
          as: 'likedPlaylist',
        },
      },
      {
        $unwind: '$likedPlaylist',
      },
      {
        $unwind: '$likedPlaylist.tracks',
      },
      {
        $group: {
          _id: {
            year: { $year: '$likedPlaylist.tracks.time_added' },
            month: { $month: '$likedPlaylist.tracks.time_added' },
          },
          songs: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        } as any,
      },
    ] as PipelineStage[]);

    // Get albums follows data
    const albumsFollowsData = await this.userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $unwind: '$followed_albums',
      },
      {
        $group: {
          _id: {
            year: { $year: '$followed_albums.time_followed' },
            month: { $month: '$followed_albums.time_followed' },
          },
          albums: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        } as any,
      },
    ] as PipelineStage[]);

    // Merge data by month
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const likesDataMap = new Map<string, { songs: number; albums: number }>();

    // Process songs data
    songsLikesData.forEach((item) => {
      const monthKey = `${item._id.year}-${item._id.month}`;
      const existing = likesDataMap.get(monthKey) || { songs: 0, albums: 0 };
      existing.songs = item.songs;
      likesDataMap.set(monthKey, existing);
    });

    // Process albums data
    albumsFollowsData.forEach((item) => {
      const monthKey = `${item._id.year}-${item._id.month}`;
      const existing = likesDataMap.get(monthKey) || { songs: 0, albums: 0 };
      existing.albums = item.albums;
      likesDataMap.set(monthKey, existing);
    });

    // Convert to array with month names
    const result: LikesDataDto[] = [];
    for (const [key, value] of likesDataMap) {
      const [year, month] = key.split('-');
      result.push({
        month: monthNames[parseInt(month) - 1],
        songs: value.songs,
        albums: value.albums,
      });
    }

    return result.sort(
      (a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month),
    );
  }

  async getPlaylistData(): Promise<PlaylistDataDto[]> {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          type: 'playlist',
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        } as any,
      },
      {
        $project: {
          _id: 0,
          month: {
            $arrayElemAt: [
              [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ],
              { $subtract: ['$_id.month', 1] },
            ],
          },
          count: 1,
        },
      },
    ];

    return await this.playlistModel.aggregate(pipeline);
  }

  private calculateGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(2));
  }
}
