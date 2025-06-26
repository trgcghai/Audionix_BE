import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { Image } from 'src/common/interfaces/entity.interface';

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
    cover_images: Image[];
  }[];

  @Prop()
  followed_albums: {
    _id: ObjectId;
    title: string;
    images: Image[];
  }[];

  @Prop()
  playlists: {
    id: ObjectId;
    title: string;
    images: Image[];
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
  avatar: Image[];
}

export const UserSchema = SchemaFactory.createForClass(User);
