import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { News } from '@/app/types';
import { api } from './client';

type FeedPostDto = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  views: number;
  comments: number;
  likes: number;
  likedByMe?: boolean;
  publishedAt: string;
  groupName: string;
  publisher: { id: string; name: string; logo: string };
};

function formatRuRelative(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ru });
  } catch {
    return iso;
  }
}

export async function listFeedPosts(): Promise<News[]> {
  const { data } = await api.get<FeedPostDto[]>('/feed/posts');
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    image: row.image,
    publisher: row.publisher,
    category: row.category,
    views: row.views,
    comments: row.comments,
    likes: row.likes ?? 0,
    likedByMe: row.likedByMe,
    publishedAt: formatRuRelative(row.publishedAt),
    groupName: row.groupName,
  }));
}

export async function togglePublicationLike(
  publicationId: string,
): Promise<{ likes: number; liked: boolean }> {
  const { data } = await api.post<{ likes: number; liked: boolean }>(
    `/feed/posts/${encodeURIComponent(publicationId)}/like`,
  );
  return data;
}
