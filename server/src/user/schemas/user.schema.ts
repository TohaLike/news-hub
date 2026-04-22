import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const USER_ROLES = ['reader', 'publisher'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ trim: true, default: '' })
  name: string;

  @Prop({ required: true, enum: USER_ROLES, default: 'reader' })
  role: UserRole;

  @Prop({ default: [] })
  refreshTokens: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
