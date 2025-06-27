import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Image } from 'src/common/interfaces/entity.interface';
import { Artist } from 'src/modules/artists/entities/artist.entity';
import { TrackStatus } from '../enum/track-status.enum';

export type TrackDocument = HydratedDocument<Track>;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      if (ret.artist) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        delete ret.artist.createdAt;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        delete ret.artist.updatedAt;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        delete ret.artist.__v;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        delete ret.artist.genres;
      }

      return ret;
    },
  },
})
export class Track {
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
    required: true,
    trim: true,
  })
  duration_ms: number;

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
    type: String,
    trim: true,
    required: true,
    enum: TrackStatus,
  })
  status: string;

  @Prop()
  albums: string[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true,
  })
  artist: Artist;

  @Prop({
    type: [String],
    default: [],
  })
  genres: string[];
}

export const TrackSchema = SchemaFactory.createForClass(Track);
