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
  publishedAt: string;
  /** Тематическая группа издателя (с бэка). */
  groupName?: string;
}

export interface Comment {
  id: number;
  newsId: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

/** Роль аккаунта (читатель / издатель), приходит с бэка в /auth/me. */
export type AccountRole = 'reader' | 'publisher';

export interface User {
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
}
