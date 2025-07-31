import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '@common/enums/role.enum';

export type AccountDocument = HydratedDocument<Account>;

@Schema({ timestamps: true })
export class Account {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, unique: true, type: String, trim: true })
  email: string;

  @Prop({ required: true, type: String, trim: true, select: false })
  password: string;

  @Prop({ required: true, type: String, trim: true })
  firstName: string;

  @Prop({ required: true, type: String, trim: true })
  lastName: string;

  @Prop({ type: [String], trim: true, enum: Role, default: [Role.USER] })
  role: Role[];

  @Prop({
    type: Boolean,
    default: false,
  })
  isVerified: boolean;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
