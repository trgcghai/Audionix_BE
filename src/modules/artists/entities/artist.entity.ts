import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ArtistDocument = HydratedDocument<Artist>;

@Schema({ timestamps: true })
export class Artist {
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
  cover_images: {
    url: string;
    height: number;
    width: number;
  }[];
}

export const ArtistSchema = SchemaFactory.createForClass(Artist);
