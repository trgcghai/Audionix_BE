import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Artist } from 'src/modules/artists/entities/artist.entity';
import { AlbumStatus } from '../enum/album-status.enum';
import { Image } from 'src/common/interfaces/entity.interface';
import { Track } from 'src/modules/tracks/entities/track.entity';

export type AlbumDocument = HydratedDocument<Album>;

@Schema({
  timestamps: true,
})
export class Album {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  })
  _id: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  title: string;

  @Prop({
    type: String,
    trim: true,
  })
  description: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true,
  })
  artist: Artist;

  @Prop({
    type: String,
    trim: true,
    required: true,
    enum: AlbumStatus,
  })
  status: AlbumStatus;

  @Prop({
    type: [
      {
        url: { type: String, required: true },
        height: { type: Number, required: true },
        width: { type: Number, required: true },
      },
    ],
  })
  cover_images: Image[];

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track',
      },
    ],
    default: [],
  })
  tracks: Track[];

  @Prop({
    type: [String],
    minlength: 1,
  })
  genres: string[];

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  number_of_followers: number;

  @Virtual({
    get: function (this: Album): number {
      return this.tracks ? this.tracks.length : 0;
    },
  })
  number_of_tracks: number;

  @Virtual({
    get: function (this: Album): number {
      return this.tracks
        ? this.tracks.reduce((prev, curr) => prev + curr.duration_ms || 0, 0)
        : 0;
    },
  })
  total_duration_ms: number;
}

export const AlbumSchema = SchemaFactory.createForClass(Album);
