import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EditorialGroup } from './editorial-group.schema';

export type GroupPublicationDocument = HydratedDocument<GroupPublication>;

/** Публикация только внутри группы; связана с группой (и косвенно с издателем через группу). */
@Schema({ timestamps: true, collection: 'group_publications' })
export class GroupPublication {
  @Prop({
    type: Types.ObjectId,
    ref: EditorialGroup.name,
    required: true,
    index: true,
  })
  groupId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  excerpt: string;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ trim: true, default: '' })
  image: string;

  @Prop({ default: 0, min: 0 })
  views: number;

  @Prop({ default: 0, min: 0 })
  comments: number;
}

export const GroupPublicationSchema = SchemaFactory.createForClass(GroupPublication);
