import { Image } from '@interfaces/entity.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ _id: false })
export class EmbeddedTrack {
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
    type: Number,
    required: true,
    trim: true,
  })
  duration_ms: number;

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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
  })
  artist: mongoose.Schema.Types.ObjectId;

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

  @Prop({
    default: 'track',
    required: true,
    trim: true,
  })
  type: string;

  @Prop({ required: true, default: Date.now })
  timeAdded: Date;
}
export const EmbeddedTrackSchema = SchemaFactory.createForClass(EmbeddedTrack);
