import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type EditorialGroupDocument = HydratedDocument<EditorialGroup>;

/** Тематическая группа издателя; принадлежит пользователю с ролью publisher. */
@Schema({ timestamps: true, collection: 'editorial_groups' })
export class EditorialGroup {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  publisherId: Types.ObjectId;
}

export const EditorialGroupSchema = SchemaFactory.createForClass(EditorialGroup);
