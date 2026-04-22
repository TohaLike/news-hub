import { X, Clock, Eye, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Comment {
  id: number;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

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
    publishedAt: string;
    groupName?: string;
  };
  comments: Comment[];
  onClose: () => void;
  onAddComment: (newsId: string, text: string) => void;
  currentUser?: {
    name: string;
    avatar: string;
  } | null;
}

const safeText =
  'min-w-0 max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word]';

export function NewsDetail({ news, comments, onClose, onAddComment, currentUser }: NewsDetailProps) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(String(news.id), newComment);
      setNewComment('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto bg-black bg-opacity-50">
      <div className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-4xl min-w-0 bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-lg border-b bg-white px-6 py-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <ImageWithFallback
                src={news.publisher.logo}
                alt={news.publisher.name}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
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
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 p-2 transition-colors hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
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

            {/* Comments Section */}
            <div className="border-t pt-6">
              <h2 className="mb-6 flex items-center gap-2 text-xl">
                <MessageCircle size={24} />
                Обсуждение ({comments.length})
              </h2>

              <form onSubmit={handleSubmit} className="mb-6 min-w-0">
                <div className="flex gap-3">
                  <ImageWithFallback
                    src={
                      currentUser?.avatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
                    }
                    alt="Ваш аватар"
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Добавьте комментарий..."
                      className="box-border w-full min-w-0 max-w-full resize-none rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Send size={16} />
                        Отправить
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 rounded-lg bg-gray-50 p-4">
                    <ImageWithFallback
                      src={comment.avatar}
                      alt={comment.author}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className={`text-sm text-gray-900 ${safeText}`}>{comment.author}</span>
                        <span className="shrink-0 text-xs text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className={`mb-2 text-sm text-gray-700 ${safeText}`}>{comment.text}</p>
                      <button
                        type="button"
                        className="text-xs text-gray-500 transition-colors hover:text-blue-600"
                      >
                        👍 {comment.likes}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
