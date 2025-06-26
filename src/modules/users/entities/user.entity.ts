import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { Artist } from 'src/modules/artists/entities/artist.entity';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  username: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  })
  email: string;

  @Prop({
    type: [
      {
        _id: { type: mongoose.Schema.ObjectId, ref: 'Artist' },
        name: { type: String, required: true },
        cover_images: [
          {
            url: { type: String, required: true },
            height: { type: Number, required: true },
            width: { type: Number, required: true },
          },
        ],
      },
    ],
  })
  followed_artists: {
    _id: ObjectId;
    name: string;
    cover_images: {
      url: string;
      height: number;
      width: number;
    };
  }[];

  @Prop()
  followed_albums: {
    id: ObjectId;
    title: string;
    images: {
      url: string;
      height: number;
      width: number;
    }[];
  }[];

  @Prop()
  playlists: {
    id: ObjectId;
    title: string;
    images: {
      url: string;
      height: number;
      width: number;
    }[];
  }[];

  @Prop({
    type: [
      {
        url: { type: String, required: true },
        height: { type: Number, required: true },
        width: { type: Number, required: true },
      },
    ],
  })
  avatar: {
    url: string;
    height: number;
    width: number;
  }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
