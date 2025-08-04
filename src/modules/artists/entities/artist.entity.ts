import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Image } from '@common/interfaces/entity.interface';

export type ArtistDocument = HydratedDocument<Artist>;

@Schema({ timestamps: true })
export class Artist {
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
  name: string;

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
    type: [String],
    default: [],
  })
  genres: string[];
}

export const ArtistSchema = SchemaFactory.createForClass(Artist);
