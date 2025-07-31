import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Image } from '@common/interfaces/entity.interface';
import { TrackStatus } from '@tracks/enum/track-status.enum';

export type TrackDocument = HydratedDocument<Track>;

@Schema({ timestamps: true })
export class Track {
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
    required: true,
    trim: true,
  })
  duration_ms: number;

  @Prop({
    type: [
      {
        _id: false,
        url: { type: String, required: true },
        height: { type: Number, required: true },
        width: { type: Number, required: true },
        key: { type: String, required: true },
      },
    ],
  })
  cover_images: Image[];

  @Prop({
    type: String,
    trim: true,
    required: true,
    enum: TrackStatus,
  })
  status: string;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album',
      },
    ],
  })
  albums: mongoose.Schema.Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
  })
  artist: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: [String],
    default: [],
  })
  genres: string[];

  @Prop({
    type: {
      _id: false,
      url: { type: String, required: true },
      key: { type: String, required: true },
      size: { type: Number, required: true },
      mimetype: { type: String, required: true },
    },
    required: true,
  })
  file: {
    url: string;
    key: string;
    size: number;
    mimetype: string;
  };
}

export const TrackSchema = SchemaFactory.createForClass(Track);
