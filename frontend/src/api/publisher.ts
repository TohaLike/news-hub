import { api } from './client';
import type { EditorialGroup, GroupPublication } from '@/app/types';

type EditorialGroupDto = {
  id: string;
  name: string;
  publisherId: string;
  createdAt: string;
};

type GroupPublicationDto = {
  id: string;
  groupId: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  views: number;
  comments: number;
  createdAt: string;
  publishedAt: string;
};

function mapGroup(d: EditorialGroupDto): EditorialGroup {
  return {
    id: d.id,
    name: d.name,
    publisherId: d.publisherId,
    createdAt: d.createdAt,
  };
}

function mapPublication(d: GroupPublicationDto): GroupPublication {
  return {
    id: d.id,
    groupId: d.groupId,
    title: d.title,
    excerpt: d.excerpt,
    content: d.content,
    category: d.category,
    image: d.image,
    views: d.views,
    comments: d.comments,
    publishedAt: d.publishedAt ?? d.createdAt,
  };
}

export async function listPublisherGroups(): Promise<EditorialGroup[]> {
  const { data } = await api.get<EditorialGroupDto[]>('/publisher/groups');
  return data.map(mapGroup);
}

export async function createPublisherGroup(name: string): Promise<EditorialGroup> {
  const { data } = await api.post<EditorialGroupDto>('/publisher/groups', { name });
  return mapGroup(data);
}

export async function listGroupPublications(groupId: string): Promise<GroupPublication[]> {
  const { data } = await api.get<GroupPublicationDto[]>(
    `/publisher/groups/${encodeURIComponent(groupId)}/publications`,
  );
  return data.map(mapPublication);
}

export type CreatePublicationBody = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image?: string;
};

export async function createGroupPublication(
  groupId: string,
  body: CreatePublicationBody,
): Promise<GroupPublication> {
  const payload: Record<string, string> = {
    title: body.title,
    excerpt: body.excerpt,
    content: body.content,
    category: body.category,
  };
  if (body.image?.trim()) {
    payload.image = body.image.trim();
  }
  const { data } = await api.post<GroupPublicationDto>(
    `/publisher/groups/${encodeURIComponent(groupId)}/publications`,
    payload,
  );
  return mapPublication(data);
}
