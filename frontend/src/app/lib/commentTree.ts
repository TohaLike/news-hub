import type { Comment } from '../types';

export type CommentNode = Comment & { replies: CommentNode[] };

/** Собирает дерево из плоского списка (parentCommentId → вложенные replies). */
export function buildCommentTree(flat: Comment[]): CommentNode[] {
  const nodes = new Map<string, CommentNode>();
  for (const c of flat) {
    nodes.set(c.id, { ...c, replies: [] });
  }
  const roots: CommentNode[] = [];
  for (const c of flat) {
    const node = nodes.get(c.id)!;
    const pid = c.parentCommentId;
    if (pid && nodes.has(pid)) {
      nodes.get(pid)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  const asc = (a: Comment, b: Comment) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  const desc = (a: Comment, b: Comment) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  for (const n of nodes.values()) {
    n.replies.sort(asc);
  }
  roots.sort(desc);
  return roots;
}

function toPlainComment(n: CommentNode): Comment {
  return {
    id: n.id,
    newsId: n.newsId,
    parentCommentId: n.parentCommentId,
    authorUserId: n.authorUserId,
    author: n.author,
    avatar: n.avatar,
    text: n.text,
    timestamp: n.timestamp,
    createdAt: n.createdAt,
    likes: n.likes,
    likedByMe: n.likedByMe,
  };
}

/** Все id в ветке (корень + любые ответы) — чтобы показать форму ответа под нужной карточкой. */
export function collectThreadCommentIds(root: CommentNode): Set<string> {
  const ids = new Set<string>();
  const walk = (n: CommentNode) => {
    ids.add(n.id);
    n.replies.forEach(walk);
  };
  walk(root);
  return ids;
}

/** Все ответы в ветке одним плоским списком по времени (без вложенной вёрстки). */
export function flattenThreadRepliesChronological(root: CommentNode): Comment[] {
  const list: Comment[] = [];
  const walk = (n: CommentNode) => {
    for (const ch of n.replies) {
      list.push(toPlainComment(ch));
      walk(ch);
    }
  };
  walk(root);
  list.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  return list;
}
