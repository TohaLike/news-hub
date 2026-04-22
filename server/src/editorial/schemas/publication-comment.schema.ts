import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GroupPublication } from './group-publication.schema';
import { User } from 'src/user/schemas/user.schema';

export type PublicationCommentDocument = HydratedDocument<PublicationComment>;

@Schema({ timestamps: true, collection: 'publication_comments' })
export class PublicationComment {
  @Prop({
    type: Types.ObjectId,
    ref: GroupPublication.name,
    required: true,
    index: true,
  })
  publicationId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  text: string;

  /** Ответ на другой комментарий этой же публикации */
  @Prop({
    type: Types.ObjectId,
    ref: 'PublicationComment',
    default: null,
    index: true,
  })
  parentCommentId: Types.ObjectId | null;

  /** Кто поставил лайк (без дублей); число лайков = длина массива */
  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }], default: [] })
  likedUserIds: Types.ObjectId[];
}

export const PublicationCommentSchema =
  SchemaFactory.createForClass(PublicationComment);
