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
import { User } from 'src/user/schemas/user.schema';

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

  /** Публичная лента: все публикации с данными издателя и группы. */
  async listPublicFeed(limit = 100) {
    type PopulatedPublisher = {
      _id: Types.ObjectId;
      name?: string;
      email?: string;
    };
    type PopulatedGroup = {
      _id: Types.ObjectId;
      name: string;
      publisherId?: PopulatedPublisher | null;
    };
    type LeanPub = {
      _id: Types.ObjectId;
      title: string;
      excerpt: string;
      content: string;
      image: string;
      category: string;
      views: number;
      comments: number;
      createdAt?: Date;
      groupId?: PopulatedGroup | Types.ObjectId | null;
    };

    const rows = (await this.pubModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: 'groupId',
        select: 'name publisherId',
        populate: {
          path: 'publisherId',
          model: User.name,
          select: 'name email',
        },
      })
      .lean()
      .exec()) as LeanPub[];

    const result: Array<{
      id: string;
      title: string;
      excerpt: string;
      content: string;
      image: string;
      category: string;
      views: number;
      comments: number;
      publishedAt: string;
      groupName: string;
      publisher: { id: string; name: string; logo: string };
    }> = [];

    for (const doc of rows) {
      const g = doc.groupId;
      if (!g || typeof g !== 'object' || !('publisherId' in g)) continue;
      const group = g as PopulatedGroup;
      const u = group.publisherId;
      if (!u || typeof u !== 'object') continue;

      const displayName =
        (u.name && String(u.name).trim()) ||
        (u.email ? String(u.email).split('@')[0] : '') ||
        'Издатель';
      const created = doc.createdAt;
      const publishedAt =
        created instanceof Date
          ? created.toISOString()
          : new Date().toISOString();
      const logoLabel = encodeURIComponent(displayName.slice(0, 40));

      result.push({
        id: String(doc._id),
        title: doc.title,
        excerpt: doc.excerpt,
        content: doc.content,
        image: doc.image?.trim() ? doc.image.trim() : DEFAULT_POST_IMAGE,
        category: doc.category,
        views: doc.views ?? 0,
        comments: doc.comments ?? 0,
        publishedAt,
        groupName: group.name,
        publisher: {
          id: String(u._id),
          name: displayName,
          logo: `https://ui-avatars.com/api/?name=${logoLabel}&size=128&background=6366f1&color=fff`,
        },
      });
    }

    return result;
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
