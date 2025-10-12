import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Image } from '@common/interfaces/entity.interface';
import { AlbumStatus } from '@albums/enum/album-status.enum';

export type AlbumDocument = HydratedDocument<Album>;

@Schema({ timestamps: true })
export class Album {
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
  })
  description: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true,
  })
  artist: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: String,
    trim: true,
    required: true,
    enum: AlbumStatus,
    default: AlbumStatus.HIDDEN,
  })
  status: AlbumStatus;

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

  @Prop({
    type: String,
    default: 'album',
  })
  type: string;
}

export const AlbumSchema = SchemaFactory.createForClass(Album);
