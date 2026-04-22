import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Comment } from '@/app/types';
import { personAvatarUrl } from '@/app/lib/letterAvatar';
import { api } from './client';

type CommentDto = {
  id: string;
  newsId: string;
  parentCommentId?: string | null;
  authorUserId: string;
  author: string;
  avatar: string;
  text: string;
  createdAt: string;
  likes: number;
  likedByMe?: boolean;
};

type MyCommentDto = CommentDto & { newsTitle: string };

function formatRu(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ru });
  } catch {
    return iso;
  }
}

function mapComment(row: CommentDto): Comment {
  return {
    id: row.id,
    newsId: row.newsId,
    parentCommentId: row.parentCommentId ?? null,
    authorUserId: row.authorUserId,
    author: row.author,
    avatar: personAvatarUrl(row.author, row.authorUserId, row.avatar),
    text: row.text,
    timestamp: formatRu(row.createdAt),
    createdAt: row.createdAt || new Date(0).toISOString(),
    likes: row.likes,
    likedByMe: row.likedByMe,
  };
}

export async function listPublicationComments(
  publicationId: string,
): Promise<Comment[]> {
  const { data } = await api.get<CommentDto[]>(
    `/feed/posts/${encodeURIComponent(publicationId)}/comments`,
  );
  return data.map(mapComment);
}

export async function createPublicationComment(
  publicationId: string,
  text: string,
  parentCommentId?: string | null,
): Promise<Comment> {
  const body: { text: string; parentCommentId?: string } = { text };
  if (parentCommentId) {
    body.parentCommentId = parentCommentId;
  }
  const { data } = await api.post<CommentDto>(
    `/feed/posts/${encodeURIComponent(publicationId)}/comments`,
    body,
  );
  return mapComment(data);
}

export async function togglePublicationCommentLike(
  commentId: string,
): Promise<{ likes: number; liked: boolean }> {
  const { data } = await api.post<{ likes: number; liked: boolean }>(
    `/feed/comments/${encodeURIComponent(commentId)}/like`,
  );
  return data;
}

export type ProfileComment = Comment & { newsTitle: string };

export async function listMyComments(): Promise<ProfileComment[]> {
  const { data } = await api.get<MyCommentDto[]>('/feed/me/comments');
  return data.map((row) => ({
    ...mapComment(row),
    newsTitle: row.newsTitle,
  }));
}
