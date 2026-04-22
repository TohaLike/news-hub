import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEditorialGroupDto } from './dto/create-editorial-group.dto';
import { CreateGroupPublicationDto } from './dto/create-group-publication.dto';
import {
  EditorialGroup,
  EditorialGroupDocument,
} from './schemas/editorial-group.schema';
import {
  GroupPublication,
  GroupPublicationDocument,
} from './schemas/group-publication.schema';

const DEFAULT_POST_IMAGE =
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop';

@Injectable()
export class EditorialService {
  constructor(
    @InjectModel(EditorialGroup.name)
    private readonly groupModel: Model<EditorialGroupDocument>,
    @InjectModel(GroupPublication.name)
    private readonly pubModel: Model<GroupPublicationDocument>,
  ) {}

  private assertObjectId(id: string, label: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Некорректный ${label}`);
    }
    return new Types.ObjectId(id);
  }

  async createGroup(publisherUserId: string, dto: CreateEditorialGroupDto) {
    const publisherId = this.assertObjectId(publisherUserId, 'идентификатор издателя');
    const doc = await this.groupModel.create({
      name: dto.name.trim(),
      publisherId,
    });
    return this.toGroupResponse(doc);
  }

  async listGroups(publisherUserId: string) {
    const publisherId = this.assertObjectId(publisherUserId, 'идентификатор издателя');
    const list = await this.groupModel
      .find({ publisherId })
      .sort({ createdAt: -1 })
      .exec();
    return list.map((d) => this.toGroupResponse(d));
  }

  async getGroup(publisherUserId: string, groupId: string) {
    const doc = await this.findGroupDocument(publisherUserId, groupId);
    if (!doc) {
      throw new NotFoundException('Группа не найдена');
    }
    return this.toGroupResponse(doc);
  }

  async createPublication(
    publisherUserId: string,
    groupId: string,
    dto: CreateGroupPublicationDto,
  ) {
    await this.ensureGroupOwned(publisherUserId, groupId);
    const gid = this.assertObjectId(groupId, 'идентификатор группы');
    const image =
      dto.image && dto.image.trim() !== ''
        ? dto.image.trim()
        : DEFAULT_POST_IMAGE;
    const doc = await this.pubModel.create({
      groupId: gid,
      title: dto.title.trim(),
      excerpt: dto.excerpt.trim(),
      content: dto.content.trim(),
      category: dto.category.trim(),
      image,
    });
    return this.toPublicationResponse(doc);
  }

  async listPublications(publisherUserId: string, groupId: string) {
    await this.ensureGroupOwned(publisherUserId, groupId);
    const gid = this.assertObjectId(groupId, 'идентификатор группы');
    const list = await this.pubModel
      .find({ groupId: gid })
      .sort({ createdAt: -1 })
      .exec();
    return list.map((d) => this.toPublicationResponse(d));
  }

  private async findGroupDocument(
    publisherUserId: string,
    groupId: string,
  ): Promise<EditorialGroupDocument | null> {
    const publisherId = this.assertObjectId(publisherUserId, 'идентификатор издателя');
    const gid = this.assertObjectId(groupId, 'идентификатор группы');
    return this.groupModel
      .findOne({ _id: gid, publisherId })
      .exec();
  }

  private async ensureGroupOwned(
    publisherUserId: string,
    groupId: string,
  ): Promise<EditorialGroupDocument> {
    const doc = await this.findGroupDocument(publisherUserId, groupId);
    if (!doc) {
      throw new NotFoundException('Группа не найдена');
    }
    return doc;
  }

  private toGroupResponse(doc: EditorialGroupDocument) {
    const createdAt = doc.get('createdAt') as Date | undefined;
    return {
      id: String(doc._id),
      name: doc.name,
      publisherId: String(doc.publisherId),
      createdAt: createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  private toPublicationResponse(doc: GroupPublicationDocument) {
    const createdAt = doc.get('createdAt') as Date | undefined;
    const iso = createdAt?.toISOString() ?? new Date().toISOString();
    return {
      id: String(doc._id),
      groupId: String(doc.groupId),
      title: doc.title,
      excerpt: doc.excerpt,
      content: doc.content,
      category: doc.category,
      image: doc.image,
      views: doc.views,
      comments: doc.comments,
      createdAt: iso,
      publishedAt: iso,
    };
  }
}
