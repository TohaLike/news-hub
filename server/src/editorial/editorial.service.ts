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
import {
  PublicationComment,
  PublicationCommentDocument,
} from './schemas/publication-comment.schema';
import {
  GroupPublicationView,
  GroupPublicationViewDocument,
} from './schemas/group-publication-view.schema';
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
    @InjectModel(PublicationComment.name)
    private readonly commentModel: Model<PublicationCommentDocument>,
    @InjectModel(GroupPublicationView.name)
    private readonly pubViewModel: Model<GroupPublicationViewDocument>,
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
    const ids = list.map((d) => d._id);
    const commentCounts = await this.commentCountsForPublications(ids);
    return list.map((d) => ({
      ...this.toPublicationResponse(d),
      comments: commentCounts.get(String(d._id)) ?? 0,
    }));
  }

  /** Публичная лента: все публикации с данными издателя и группы. */
  async listPublicFeed(limit = 100, viewerUserId?: string) {
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
      likedUserIds?: Types.ObjectId[];
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

    const pubIds = rows.map((r) => r._id);
    const commentCounts = await this.commentCountsForPublications(pubIds);

    const viewerOid =
      viewerUserId && Types.ObjectId.isValid(viewerUserId)
        ? new Types.ObjectId(viewerUserId)
        : null;

    const result: Array<{
      id: string;
      title: string;
      excerpt: string;
      content: string;
      image: string;
      category: string;
      views: number;
      comments: number;
      likes: number;
      likedByMe: boolean;
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
      const commentCount = commentCounts.get(String(doc._id)) ?? 0;
      const likedIds = doc.likedUserIds ?? [];
      const likes = likedIds.length;
      const likedByMe = Boolean(
        viewerOid && likedIds.some((id) => id.equals(viewerOid)),
      );

      result.push({
        id: String(doc._id),
        title: doc.title,
        excerpt: doc.excerpt,
        content: doc.content,
        image: doc.image?.trim() ? doc.image.trim() : DEFAULT_POST_IMAGE,
        category: doc.category,
        views: doc.views ?? 0,
        comments: commentCount,
        likes,
        likedByMe,
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
    const likes = (doc.likedUserIds ?? []).length;
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
      likes,
      createdAt: iso,
      publishedAt: iso,
    };
  }

  async togglePublicationLike(userId: string, publicationId: string) {
    await this.ensurePublicationExists(publicationId);
    const pid = this.assertObjectId(publicationId, 'идентификатор публикации');
    const uid = this.assertObjectId(userId, 'идентификатор пользователя');
    const doc = await this.pubModel.findById(pid).exec();
    if (!doc) {
      throw new NotFoundException('Публикация не найдена');
    }
    const liked = (doc.likedUserIds ?? []).some((id) => id.equals(uid));
    if (liked) {
      await this.pubModel.updateOne({ _id: pid }, { $pull: { likedUserIds: uid } }).exec();
    } else {
      await this.pubModel
        .updateOne({ _id: pid }, { $addToSet: { likedUserIds: uid } })
        .exec();
    }
    const fresh = await this.pubModel.findById(pid).lean().exec();
    const n = (fresh?.likedUserIds as Types.ObjectId[] | undefined)?.length ?? 0;
    return { likes: n, liked: !liked };
  }

  private async commentCountsForPublications(
    ids: Types.ObjectId[],
  ): Promise<Map<string, number>> {
    if (ids.length === 0) {
      return new Map();
    }
    const rows = await this.commentModel
      .aggregate<{ _id: Types.ObjectId; n: number }>([
        { $match: { publicationId: { $in: ids } } },
        { $group: { _id: '$publicationId', n: { $sum: 1 } } },
      ])
      .exec();
    return new Map(rows.map((r) => [String(r._id), r.n]));
  }

  private displayNameFromUser(u: {
    name?: string;
    email?: string;
  }): string {
    const email = u.email ? String(u.email) : '';
    return (
      (u.name && String(u.name).trim()) ||
      (email ? email.split('@')[0] : '') ||
      'Пользователь'
    );
  }

  private avatarUrlFromName(name: string): string {
    const label = encodeURIComponent(name.slice(0, 40));
    return `https://ui-avatars.com/api/?name=${label}&size=128&background=6366f1&color=fff`;
  }

  private async ensurePublicationExists(
    publicationId: string,
  ): Promise<GroupPublicationDocument> {
    const pid = this.assertObjectId(publicationId, 'идентификатор публикации');
    const doc = await this.pubModel.findById(pid).exec();
    if (!doc) {
      throw new NotFoundException('Публикация не найдена');
    }
    return doc;
  }

  async listPublicationComments(
    publicationId: string,
    viewerUserId?: string,
  ) {
    await this.ensurePublicationExists(publicationId);
    const pid = this.assertObjectId(publicationId, 'идентификатор публикации');
    const list = await this.commentModel
      .find({ publicationId: pid })
      .sort({ createdAt: 1 })
      .populate<{ name?: string; email?: string }>({
        path: 'userId',
        model: User.name,
        select: 'name email',
      })
      .lean()
      .exec();

    const viewerOid =
      viewerUserId && Types.ObjectId.isValid(viewerUserId)
        ? new Types.ObjectId(viewerUserId)
        : null;

    return list.map((row) => {
      const u = row.userId as unknown as { name?: string; email?: string; _id?: Types.ObjectId } | null;
      const authorName = u ? this.displayNameFromUser(u) : 'Пользователь';
      const authorUserId =
        u && u._id ? String(u._id) : String(row.userId);
      const likedUserIds = (row.likedUserIds ?? []) as Types.ObjectId[];
      const likes = likedUserIds.length;
      const likedByMe = Boolean(
        viewerOid && likedUserIds.some((id) => id.equals(viewerOid)),
      );
      const created = (row as { createdAt?: Date }).createdAt;
      const parentRaw = (row as { parentCommentId?: Types.ObjectId | null }).parentCommentId;
      return {
        id: String(row._id),
        newsId: String(row.publicationId),
        parentCommentId: parentRaw ? String(parentRaw) : null,
        authorUserId,
        author: authorName,
        avatar: this.avatarUrlFromName(authorName),
        text: row.text,
        createdAt: created instanceof Date ? created.toISOString() : new Date().toISOString(),
        likes,
        likedByMe,
      };
    });
  }

  async createPublicationComment(
    userId: string,
    publicationId: string,
    text: string,
    parentCommentId?: string,
  ) {
    await this.ensurePublicationExists(publicationId);
    const pid = this.assertObjectId(publicationId, 'идентификатор публикации');
    const uid = this.assertObjectId(userId, 'идентификатор пользователя');
    let parentOid: Types.ObjectId | null = null;
    if (parentCommentId !== undefined && parentCommentId !== null && String(parentCommentId).trim() !== '') {
      parentOid = this.assertObjectId(
        String(parentCommentId).trim(),
        'родительский комментарий',
      );
      const parent = await this.commentModel
        .findOne({ _id: parentOid, publicationId: pid })
        .exec();
      if (!parent) {
        throw new BadRequestException('Комментарий для ответа не найден');
      }
    }
    const doc = await this.commentModel.create({
      publicationId: pid,
      userId: uid,
      text: text.trim(),
      likedUserIds: [],
      parentCommentId: parentOid,
    });
    const populated = await this.commentModel
      .findById(doc._id)
      .populate<{ name?: string; email?: string }>({
        path: 'userId',
        model: User.name,
        select: 'name email',
      })
      .lean()
      .exec();
    if (!populated) {
      throw new NotFoundException('Комментарий не найден');
    }
    const u = populated.userId as unknown as {
      name?: string;
      email?: string;
      _id?: Types.ObjectId;
    } | null;
    const authorName = u ? this.displayNameFromUser(u) : 'Пользователь';
    const authorUserId =
      u && u._id ? String(u._id) : String(populated.userId);
    const created = (populated as { createdAt?: Date }).createdAt;
    const parentOut = (populated as { parentCommentId?: Types.ObjectId | null })
      .parentCommentId;
    return {
      id: String(populated._id),
      newsId: String(populated.publicationId),
      parentCommentId: parentOut ? String(parentOut) : null,
      authorUserId,
      author: authorName,
      avatar: this.avatarUrlFromName(authorName),
      text: populated.text,
      createdAt:
        created instanceof Date ? created.toISOString() : new Date().toISOString(),
      likes: 0,
      likedByMe: false,
    };
  }

  async togglePublicationCommentLike(userId: string, commentId: string) {
    const cid = this.assertObjectId(commentId, 'идентификатор комментария');
    const uid = this.assertObjectId(userId, 'идентификатор пользователя');
    const doc = await this.commentModel.findById(cid).exec();
    if (!doc) {
      throw new NotFoundException('Комментарий не найден');
    }
    const liked = doc.likedUserIds.some((id) => id.equals(uid));
    if (liked) {
      await this.commentModel.updateOne({ _id: cid }, { $pull: { likedUserIds: uid } }).exec();
    } else {
      await this.commentModel
        .updateOne({ _id: cid }, { $addToSet: { likedUserIds: uid } })
        .exec();
    }
    const fresh = await this.commentModel.findById(cid).lean().exec();
    const n = fresh?.likedUserIds?.length ?? 0;
    return { likes: n, liked: !liked };
  }

  async listMyComments(userId: string) {
    const uid = this.assertObjectId(userId, 'идентификатор пользователя');
    const list = await this.commentModel
      .find({ userId: uid })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate<{ title?: string }>({
        path: 'publicationId',
        model: GroupPublication.name,
        select: 'title',
      })
      .lean()
      .exec();

    return list.map((row) => {
      const pub = row.publicationId as unknown as {
        title?: string;
        _id?: Types.ObjectId;
      } | null;
      const newsTitle =
        pub && typeof pub === 'object' && pub.title
          ? String(pub.title)
          : 'Материал удалён или недоступен';
      const created = (row as { createdAt?: Date }).createdAt;
      const likedUserIds = (row.likedUserIds ?? []) as Types.ObjectId[];
      const likedByMe = likedUserIds.some((id) => id.equals(uid));
      const pubId =
        pub && typeof pub === 'object' && '_id' in pub && pub._id
          ? String(pub._id)
          : String(row.publicationId);
      const parentRaw = (row as { parentCommentId?: Types.ObjectId | null }).parentCommentId;
      return {
        id: String(row._id),
        newsId: pubId,
        parentCommentId: parentRaw ? String(parentRaw) : null,
        authorUserId: String(row.userId),
        author: '',
        avatar: '',
        text: row.text,
        createdAt:
          created instanceof Date ? created.toISOString() : new Date().toISOString(),
        likes: likedUserIds.length,
        likedByMe,
        newsTitle,
      };
    });
  }

  /**
   * Учитывает один просмотр на одного зрителя (авторизованный — по userId, гость — по viewerKey uuid).
   */
  async recordPublicationView(
    publicationId: string,
    opts: { userId?: string; anonKey?: string },
  ): Promise<{ views: number; newView: boolean }> {
    const pubDoc = await this.ensurePublicationExists(publicationId);
    const pid = pubDoc._id as Types.ObjectId;

    let viewerIdentity: string;
    if (opts.userId && Types.ObjectId.isValid(opts.userId)) {
      viewerIdentity = `u:${opts.userId}`;
    } else if (opts.anonKey && this.isUuidV4(opts.anonKey)) {
      viewerIdentity = `a:${opts.anonKey.toLowerCase()}`;
    } else {
      throw new BadRequestException(
        'Укажите viewerKey (UUID v4) для гостя или авторизуйтесь',
      );
    }

    let inserted = false;
    try {
      await this.pubViewModel.create({
        publicationId: pid,
        viewerIdentity,
      });
      inserted = true;
    } catch (e: unknown) {
      const code = (e as { code?: number })?.code;
      if (code === 11000) {
        inserted = false;
      } else {
        throw e;
      }
    }

    if (inserted) {
      await this.pubModel.updateOne({ _id: pid }, { $inc: { views: 1 } }).exec();
    }

    const fresh = await this.pubModel.findById(pid).select('views').lean().exec();
    const views = typeof fresh?.views === 'number' ? fresh.views : 0;
    return { views, newView: inserted };
  }

  private isUuidV4(s: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      s.trim(),
    );
  }
}
