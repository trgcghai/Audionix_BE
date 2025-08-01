import mongoose, { HydratedDocument } from 'mongoose';
import { PlaylistStatus } from '../enum/playlist-status.enum';
import { Image } from 'src/common/interfaces/entity.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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
    default: 'Unitled Playlist',
  })
  title: string;

  @Prop({
    type: String,
    trim: true,
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
    type: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' },
        time_added: { type: mongoose.Schema.Types.Date, default: Date.now },
      },
    ],
  })
  tracks: {
    _id: mongoose.Schema.Types.ObjectId;
    time_added: mongoose.Schema.Types.Date;
  }[];
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
