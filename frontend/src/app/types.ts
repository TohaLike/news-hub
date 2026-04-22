export interface Publisher {
  id: string;
  name: string;
  logo: string;
}

export interface News {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  publisher: Publisher;
  category: string;
  views: number;
  comments: number;
  /** Лайки на материал (не на комментарии) */
  likes: number;
  likedByMe?: boolean;
  publishedAt: string;
  /** Тематическая группа издателя (с бэка). */
  groupName?: string;
}

export interface Comment {
  id: string;
  newsId: string;
  /** Ответ на комментарий с этим id; null — корневой комментарий */
  parentCommentId: string | null;
  authorUserId: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  /** ISO для сортировки и дерева ответов */
  createdAt: string;
  likes: number;
  /** Заполняется после GET комментариев с авторизацией */
  likedByMe?: boolean;
}

/** Роль аккаунта (читатель / издатель), приходит с бэка в /auth/me. */
export type AccountRole = 'reader' | 'publisher';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: AccountRole;
}

/** Тематическая группа издателя; `publisherId` — id пользователя-издателя на бэке. */
export interface EditorialGroup {
  id: string;
  name: string;
  publisherId: string;
  createdAt: string;
}

/** Материал издателя внутри группы (с бэка). */
export interface GroupPublication {
  id: string;
  groupId: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  publishedAt: string;
  views: number;
  comments: number;
  likes: number;
}
