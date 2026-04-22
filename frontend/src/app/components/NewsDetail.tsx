import { X, Clock, Eye, MessageCircle, Send, ThumbsUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Comment } from '../types';
import {
  buildCommentTree,
  collectThreadCommentIds,
  flattenThreadRepliesChronological,
} from '../lib/commentTree';
import { personAvatarUrl } from '../lib/letterAvatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { cn } from './ui/utils';

interface NewsDetailProps {
  news: {
    id: string;
    title: string;
    content: string;
    image: string;
    publisher: {
      name: string;
      logo: string;
    };
    category: string;
    views: number;
    likes: number;
    likedByMe?: boolean;
    publishedAt: string;
    groupName?: string;
  };
  comments: Comment[];
  onClose: () => void;
  onAddComment: (
    newsId: string,
    text: string,
    parentCommentId?: string | null,
  ) => void | Promise<void>;
  onToggleCommentLike: (commentId: string) => void | Promise<void>;
  onTogglePostLike: (publicationId: string) => void | Promise<void>;
  onRequireLogin?: () => void;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  } | null;
}

const safeText =
  'min-w-0 max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word]';

export function NewsDetail({
  news,
  comments,
  onClose,
  onAddComment,
  onToggleCommentLike,
  onTogglePostLike,
  onRequireLogin,
  currentUser,
}: NewsDetailProps) {
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [likeBusyId, setLikeBusyId] = useState<string | null>(null);
  const [postLikeBusy, setPostLikeBusy] = useState(false);
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);
  const byId = useMemo(() => new Map(comments.map((c) => [c.id, c])), [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || sending) return;
    setSending(true);
    try {
      await onAddComment(String(news.id), newComment.trim(), null);
      setNewComment('');
    } finally {
      setSending(false);
    }
  };

  const handleReplySubmit = async (parentId: string, text: string) => {
    if (!text.trim() || replySending) return;
    setReplySending(true);
    try {
      await onAddComment(String(news.id), text.trim(), parentId);
      setReplyText('');
      setReplyParentId(null);
    } finally {
      setReplySending(false);
    }
  };

  const handlePostLike = async () => {
    if (!currentUser) {
      onRequireLogin?.();
      return;
    }
    if (postLikeBusy) return;
    setPostLikeBusy(true);
    try {
      await onTogglePostLike(String(news.id));
    } finally {
      setPostLikeBusy(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!currentUser) {
      onRequireLogin?.();
      return;
    }
    if (likeBusyId) return;
    setLikeBusyId(commentId);
    try {
      await onToggleCommentLike(commentId);
    } finally {
      setLikeBusyId(null);
    }
  };

  const openReply = (targetId: string) => {
    if (!currentUser) {
      onRequireLogin?.();
      return;
    }
    if (replyParentId === targetId) {
      setReplyParentId(null);
      setReplyText('');
    } else {
      setReplyParentId(targetId);
      setReplyText('');
    }
  };

  const replyTargetName =
    replyParentId && byId.has(replyParentId)
      ? byId.get(replyParentId)!.author
      : null;

  return (
    <div className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto bg-black bg-opacity-50">
      <div className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-4xl min-w-0 rounded-lg bg-white shadow-xl">
          <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-lg border-b bg-white px-6 py-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <ImageWithFallback
                src={news.publisher.logo}
                alt={news.publisher.name}
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-gray-200/80"
              />
              <div className="min-w-0 flex-1">
                <div className={`text-sm text-gray-600 ${safeText}`}>{news.publisher.name}</div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span className="flex min-w-0 max-w-full items-center gap-1">
                    <Clock size={14} />
                    <span className={safeText}>{news.publishedAt}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    <Eye size={14} />
                    {news.views}
                  </span>
                  <button
                    type="button"
                    disabled={postLikeBusy}
                    aria-pressed={Boolean(news.likedByMe)}
                    title={news.likedByMe ? 'Вы лайкнули этот материал' : 'Лайкнуть'}
                    onClick={(e) => {
                      e.stopPropagation();
                      void handlePostLike();
                    }}
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1 tabular-nums transition-colors',
                      news.likedByMe
                        ? 'border border-blue-300/80 bg-blue-50/90 font-medium text-blue-800 hover:border-blue-400 hover:bg-blue-50'
                        : 'hover:bg-gray-100 hover:text-blue-700',
                      postLikeBusy && 'opacity-60',
                    )}
                  >
                    <ThumbsUp
                      size={14}
                      className={news.likedByMe ? 'text-blue-600' : undefined}
                      aria-hidden
                    />
                    {news.likes}
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>

          <div className="min-w-0 p-6">
            <div className="mb-4 min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-block max-w-full truncate rounded-full bg-blue-600 px-3 py-1 text-sm text-white">
                  {news.category}
                </span>
                {news.groupName ? (
                  <span className={`text-sm text-gray-500 ${safeText}`}>Группа: {news.groupName}</span>
                ) : null}
              </div>
              <h1 className={`mb-4 text-3xl ${safeText}`}>{news.title}</h1>
            </div>

            <ImageWithFallback
              src={news.image}
              alt={news.title}
              className="mb-6 h-96 w-full max-w-full rounded-lg object-cover"
            />

            <div className="prose mb-8 max-w-none">
              <p className={`text-gray-700 leading-relaxed whitespace-pre-line ${safeText}`}>
                {news.content}
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="mb-6 flex items-center gap-2 text-xl">
                <MessageCircle size={24} />
                Обсуждение ({comments.length})
              </h2>

              <form onSubmit={handleSubmit} className="mb-6 min-w-0">
                <div className="flex gap-3">
                  <ImageWithFallback
                    src={
                      currentUser
                        ? personAvatarUrl(
                            currentUser.name,
                            currentUser.id,
                            currentUser.avatar,
                          )
                        : personAvatarUrl('Гость', 'guest')
                    }
                    alt="Ваш аватар"
                    className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-gray-200/80"
                  />
                  <div className="min-w-0 flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Добавьте комментарий…"
                      className="box-border w-full min-w-0 max-w-full resize-none rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={!newComment.trim() || sending}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Send size={16} />
                        {sending ? 'Отправка…' : 'Отправить'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              <div className="space-y-5">
                {commentTree.map((root) => {
                  const threadIds = collectThreadCommentIds(root);
                  const flatReplies = flattenThreadRepliesChronological(root);
                  const showReplyForm =
                    Boolean(replyParentId) && threadIds.has(replyParentId);

                  return (
                    <div key={root.id} className="rounded-lg bg-gray-50 p-4">
                      <div className="flex gap-3">
                        <ImageWithFallback
                          src={root.avatar}
                          alt={root.author}
                          className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-gray-200/80"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className={`text-sm font-medium text-gray-900 ${safeText}`}>
                              {root.author}
                            </span>
                            <span className="shrink-0 text-xs text-gray-500">{root.timestamp}</span>
                          </div>
                          <p className={`mb-2 text-sm leading-relaxed text-gray-700 ${safeText}`}>
                            {root.text}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              disabled={likeBusyId === root.id}
                              onClick={() => void handleLike(root.id)}
                              className={cn(
                                'rounded-md px-2 py-1 text-xs font-medium tabular-nums transition-colors',
                                root.likedByMe
                                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-blue-700',
                                likeBusyId === root.id && 'opacity-60',
                              )}
                            >
                              👍 {root.likes}
                            </button>
                            <button
                              type="button"
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                              onClick={() => openReply(root.id)}
                            >
                              {replyParentId === root.id ? 'Отмена' : 'Ответить'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {flatReplies.length > 0 ? (
                        <div className="mt-3 rounded-md border border-gray-100 bg-white/70 px-3 py-2">
                          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                            Ответы
                          </p>
                          <div className="space-y-3">
                            {flatReplies.map((r) => {
                              const addressee =
                                r.parentCommentId && byId.has(r.parentCommentId)
                                  ? byId.get(r.parentCommentId)!.author
                                  : '…';
                              return (
                                <div
                                  key={r.id}
                                  className="border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                                >
                                  <p className="text-xs text-gray-500">
                                    ответ{' '}
                                    <span className={`font-medium text-gray-700 ${safeText}`}>
                                      {addressee}
                                    </span>
                                  </p>
                                  <div className="mt-1 flex gap-2">
                                    <ImageWithFallback
                                      src={r.avatar}
                                      alt={r.author}
                                      className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-gray-200/80"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-baseline gap-2">
                                        <span className={`text-sm font-medium text-gray-900 ${safeText}`}>
                                          {r.author}
                                        </span>
                                        <span className="text-xs text-gray-400">{r.timestamp}</span>
                                      </div>
                                      <p className={`mt-0.5 text-sm text-gray-700 ${safeText}`}>{r.text}</p>
                                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                        <button
                                          type="button"
                                          disabled={likeBusyId === r.id}
                                          onClick={() => void handleLike(r.id)}
                                          className={cn(
                                            'rounded px-1.5 py-0.5 text-[11px] font-medium tabular-nums transition-colors',
                                            r.likedByMe
                                              ? 'bg-blue-100 text-blue-800'
                                              : 'text-gray-500 hover:bg-gray-100 hover:text-blue-700',
                                            likeBusyId === r.id && 'opacity-60',
                                          )}
                                        >
                                          👍 {r.likes}
                                        </button>
                                        <button
                                          type="button"
                                          className="text-[11px] font-medium text-blue-600 hover:underline"
                                          onClick={() => openReply(r.id)}
                                        >
                                          {replyParentId === r.id ? 'Отмена' : 'Ответить'}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}

                      {showReplyForm ? (
                        <form
                          className="mt-3 space-y-2 border-t border-gray-200 pt-3"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (replyParentId) void handleReplySubmit(replyParentId, replyText);
                          }}
                        >
                          {replyTargetName ? (
                            <p className="text-xs text-gray-500">
                              Ваш ответ для{' '}
                              <span className="font-medium text-gray-800">{replyTargetName}</span>
                            </p>
                          ) : null}
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Напишите ответ…"
                            rows={2}
                            className="box-border w-full min-w-0 max-w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                              onClick={() => {
                                setReplyParentId(null);
                                setReplyText('');
                              }}
                            >
                              Отмена
                            </button>
                            <button
                              type="submit"
                              disabled={!replyText.trim() || replySending || !replyParentId}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Send className="size-3.5" aria-hidden />
                              {replySending ? '…' : 'Отправить'}
                            </button>
                          </div>
                        </form>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
