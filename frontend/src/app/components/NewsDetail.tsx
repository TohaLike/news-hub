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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
            <div className="flex items-center gap-3">
              <ImageWithFallback 
                src={news.publisher.logo} 
                alt={news.publisher.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="text-sm text-gray-600">{news.publisher.name}</div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {news.publishedAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {news.views}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-block rounded-full bg-blue-600 px-3 py-1 text-sm text-white">
                  {news.category}
                </span>
                {news.groupName ? (
                  <span className="text-sm text-gray-500">Группа: {news.groupName}</span>
                ) : null}
              </div>
              <h1 className="mb-4 text-3xl">{news.title}</h1>
            </div>

            <ImageWithFallback 
              src={news.image} 
              alt={news.title}
              className="w-full h-96 object-cover rounded-lg mb-6"
            />

            <div className="prose max-w-none mb-8">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {news.content}
              </p>
            </div>

            {/* Comments Section */}
            <div className="border-t pt-6">
              <h2 className="text-xl mb-6 flex items-center gap-2">
                <MessageCircle size={24} />
                Обсуждение ({comments.length})
              </h2>

              {/* Comment Form */}
              <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex gap-3">
                  <ImageWithFallback 
                    src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"}
                    alt="Ваш аватар"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Добавьте комментарий..."
                      className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send size={16} />
                        Отправить
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                    <ImageWithFallback 
                      src={comment.avatar} 
                      alt={comment.author}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-900">{comment.author}</span>
                        <span className="text-xs text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{comment.text}</p>
                      <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
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