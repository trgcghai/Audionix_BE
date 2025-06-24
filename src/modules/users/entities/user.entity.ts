import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';

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

  @Prop()
  followed_artists: string[];

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

  @Prop()
  avatar: {
    url: string;
    height: number;
    width: number;
  }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
