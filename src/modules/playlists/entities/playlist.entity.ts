import mongoose, { HydratedDocument } from 'mongoose';
import { Image } from '@common/interfaces/entity.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PlaylistStatus } from '@playlists/enum/playlist-status.enum';
import {
  EmbeddedTrack,
  EmbeddedTrackSchema,
} from '@tracks/entities/embeddedTrack.entity';

export type PlaylistDocument = HydratedDocument<Playlist>;

@Schema({ timestamps: true })
export class Playlist {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  title: string;

  @Prop({
    type: String,
    trim: true,
    default: '',
  })
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: String,
    trim: true,
    required: true,
    enum: PlaylistStatus,
    default: PlaylistStatus.PUBLIC,
  })
  status: PlaylistStatus;

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
    type: [EmbeddedTrackSchema],
  })
  tracks: EmbeddedTrack[];

  @Prop({
    default: 'playlist',
    required: true,
    trim: true,
  })
  type: string;
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
