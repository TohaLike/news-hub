import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GroupPublication } from './group-publication.schema';

export type GroupPublicationViewDocument = HydratedDocument<GroupPublicationView>;

/** Один документ = один уникальный просмотр (по пользователю или анонимному ключу браузера). */
@Schema({ timestamps: true, collection: 'group_publication_views' })
export class GroupPublicationView {
  @Prop({
    type: Types.ObjectId,
    ref: GroupPublication.name,
    required: true,
    index: true,
  })
  publicationId: Types.ObjectId;

  /**
   * Стабильный идентификатор зрителя: `u:` + ObjectId пользователя или `a:` + uuid v4.
   */
  @Prop({ required: true })
  viewerIdentity: string;
}

export const GroupPublicationViewSchema =
  SchemaFactory.createForClass(GroupPublicationView);

GroupPublicationViewSchema.index(
  { publicationId: 1, viewerIdentity: 1 },
  { unique: true },
);
