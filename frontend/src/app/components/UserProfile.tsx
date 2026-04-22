import {
  BookOpen,
  Camera,
  Edit2,
  Eye,
  Layers,
  MessageCircle,
  Newspaper,
  Save,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AccountRole, EditorialGroup, GroupPublication } from '../types';
import { PublisherEditorialPanel } from './PublisherEditorialPanel';
import { cn } from './ui/utils';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Comment {
  id: number;
  newsId: string;
  newsTitle: string;
  text: string;
  timestamp: string;
  likes: number;
}

/** Демо-публикации издателя (данные с ленты, только UI). */
export interface PublisherActivityPost {
  id: number | string;
  title: string;
  excerpt: string;
  image: string;
  views: number;
  comments: number;
  publishedAt: string;
}

interface UserProfileProps {
  user: {
    name: string;
    email: string;
    avatar: string;
    role: AccountRole;
  };
  comments: Comment[];
  /** Для роли издателя — карточки «мои публикации» (передаётся из App из `news`). */
  publisherPosts?: PublisherActivityPost[];
  /** Только для издателя: группы и публикации с API. */
  editorialGroups?: EditorialGroup[];
  groupPublications?: GroupPublication[];
  editorialLoading?: boolean;
  editorialError?: string | null;
  onRetryEditorialLoad?: () => void;
  onCreateEditorialGroup?: (payload: { name: string }) => Promise<void>;
  onCreateGroupPublication?: (
    groupId: string,
    payload: {
      title: string;
      excerpt: string;
      content: string;
      category: string;
      image?: string;
    },
  ) => Promise<void>;
  onClose: () => void;
  onUpdateProfile: (name: string, email: string, avatar: string) => void;
}

export function UserProfile({
  user,
  comments,
  publisherPosts = [],
  editorialGroups,
  groupPublications,
  editorialLoading = false,
  editorialError = null,
  onRetryEditorialLoad,
  onCreateEditorialGroup,
  onCreateGroupPublication,
  onClose,
  onUpdateProfile,
}: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  });
  const [activeTab, setActiveTab] = useState<'info' | 'activity' | 'editorial'>('info');
  const [activityPanel, setActivityPanel] = useState<'posts' | 'comments'>('posts');

  const handleSave = () => {
    onUpdateProfile(formData.name, formData.email, formData.avatar);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });
    setIsEditing(false);
  };

  const stats = {
    totalComments: comments.length,
    totalLikes: comments.reduce((sum, c) => sum + c.likes, 0),
  };

  const accountMeta: Record<
    AccountRole,
    { title: string; description: string; Icon: typeof BookOpen }
  > = {
    reader: {
      title: 'Читатель',
      description: 'Читайте ленту, комментируйте и ведите профиль',
      Icon: BookOpen,
    },
    publisher: {
      title: 'Издатель',
      description: 'Публикуйте материалы и управляйте своим каналом',
      Icon: Newspaper,
    },
  };

  const { title: roleTitle, description: roleDescription, Icon: RoleIcon } =
    accountMeta[user.role];

  useEffect(() => {
    if (user.role === 'publisher') {
      setActivityPanel('posts');
    } else {
      setActivityPanel('comments');
    }
  }, [user.role]);

  const postCount = publisherPosts.length;

  const renderCommentsList = () =>
    comments.length > 0 ? (
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={cn(
              'rounded-xl border p-4 transition-shadow',
              user.role === 'publisher'
                ? 'border-gray-100 bg-gradient-to-br from-slate-50/80 to-white shadow-sm'
                : 'rounded-lg border bg-gray-50',
            )}
          >
            <div className="flex items-start gap-3">
              <ImageWithFallback
                src={user.avatar}
                alt={user.name}
                className="size-10 shrink-0 rounded-full object-cover ring-2 ring-white"
              />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  <span className="shrink-0 text-xs text-gray-500">{comment.timestamp}</span>
                </div>
                <p
                  className={cn(
                    'mb-2 text-sm',
                    user.role === 'publisher' ? 'text-violet-800/90' : 'text-gray-600',
                  )}
                >
                  {comment.newsTitle}
                </p>
                <p className="text-gray-900">{comment.text}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <span aria-hidden>👍</span> {comment.likes}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="py-14 text-center">
        <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">Вы ещё не оставляли комментариев</p>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div
          className={cn(
            'mx-auto rounded-lg bg-white shadow-xl',
            user.role === 'publisher' ? 'max-w-5xl' : 'max-w-4xl',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl">Профиль пользователя</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap border-b">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={cn(
                'min-w-[33%] flex-1 px-4 py-3 text-sm transition-colors sm:px-6',
                activeTab === 'info'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900',
              )}
            >
              Информация
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={cn(
                'min-w-[33%] flex-1 px-4 py-3 text-sm transition-colors sm:px-6',
                activeTab === 'activity'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900',
              )}
            >
              Активность
            </button>
            {user.role === 'publisher' &&
            editorialGroups !== undefined &&
            groupPublications !== undefined &&
            onCreateEditorialGroup &&
            onCreateGroupPublication ? (
              <button
                type="button"
                onClick={() => setActiveTab('editorial')}
                className={cn(
                  'min-w-[33%] flex-1 px-4 py-3 text-sm transition-colors sm:px-6',
                  activeTab === 'editorial'
                    ? 'border-b-2 border-violet-600 text-violet-700'
                    : 'text-gray-600 hover:text-gray-900',
                )}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Layers className="size-4 shrink-0 opacity-80" aria-hidden />
                  Редакция
                </span>
              </button>
            ) : null}
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'info' ? (
              <div>
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative mb-4">
                    <ImageWithFallback
                      src={formData.avatar}
                      alt={formData.name}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                        <Camera size={20} />
                      </button>
                    )}
                  </div>
                  
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 size={16} />
                      Редактировать профиль
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Save size={16} />
                        Сохранить
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Отмена
                      </button>
                    </div>
                  )}
                </div>

                {/* Тип аккаунта */}
                <div className="max-w-md mx-auto mb-8">
                  <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Тип аккаунта
                  </p>
                  <div
                    className={cn(
                      'relative overflow-hidden rounded-2xl border-2 p-5 shadow-sm transition-shadow',
                      user.role === 'reader'
                        ? 'border-blue-200 bg-gradient-to-br from-blue-50 via-white to-sky-50/90 ring-1 ring-blue-600/10'
                        : 'border-violet-200 bg-gradient-to-br from-violet-50 via-white to-purple-50/90 ring-1 ring-violet-600/10',
                    )}
                  >
                    <div
                      className={cn(
                        'pointer-events-none absolute -right-6 -top-6 size-28 rounded-full opacity-40 blur-2xl',
                        user.role === 'reader' ? 'bg-blue-400' : 'bg-violet-400',
                      )}
                      aria-hidden
                    />
                    <div className="relative flex gap-4">
                      <span
                        className={cn(
                          'flex size-14 shrink-0 items-center justify-center rounded-xl shadow-inner',
                          user.role === 'reader'
                            ? 'bg-blue-600 text-white'
                            : 'bg-violet-600 text-white',
                        )}
                      >
                        <RoleIcon className="size-7" strokeWidth={2} aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {roleTitle}
                          </span>
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-xs font-medium',
                              user.role === 'reader'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-violet-100 text-violet-800',
                            )}
                          >
                            {user.role === 'reader' ? 'Лента и комментарии' : 'Публикации'}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                          {roleDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      Имя
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg">{user.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="px-4 py-2 bg-gray-50 rounded-lg">{user.email}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">
                        URL аватара
                      </label>
                      <input
                        type="url"
                        value={formData.avatar}
                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-8 max-w-md mx-auto">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                      <MessageCircle size={20} />
                    </div>
                    <div className="text-2xl mb-1">{stats.totalComments}</div>
                    <div className="text-sm text-gray-600">Комментариев</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                      👍
                    </div>
                    <div className="text-2xl mb-1">{stats.totalLikes}</div>
                    <div className="text-sm text-gray-600">Лайков</div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'editorial' &&
              user.role === 'publisher' &&
              editorialGroups !== undefined &&
              groupPublications !== undefined &&
              onCreateEditorialGroup &&
              onCreateGroupPublication ? (
              <PublisherEditorialPanel
                publisherName={user.name}
                groups={editorialGroups}
                publications={groupPublications}
                loading={editorialLoading}
                loadError={editorialError}
                onRetryLoad={onRetryEditorialLoad}
                onCreateGroup={onCreateEditorialGroup}
                onCreatePublication={onCreateGroupPublication}
              />
            ) : user.role === 'publisher' ? (
              <div>
                <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Активность
                </p>
                <div
                  className="mb-6 flex gap-1 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/90 via-white to-slate-50/80 p-1.5 shadow-inner"
                  role="tablist"
                  aria-label="Разделы активности"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activityPanel === 'posts'}
                    onClick={() => setActivityPanel('posts')}
                    className={cn(
                      'relative flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all duration-200',
                      activityPanel === 'posts'
                        ? 'bg-white text-violet-800 shadow-md ring-1 ring-violet-200/60'
                        : 'text-gray-600 hover:bg-white/60 hover:text-gray-900',
                    )}
                  >
                    <Newspaper className="size-4 shrink-0 opacity-80" aria-hidden />
                    <span className="hidden sm:inline">Публикации</span>
                    <span className="sm:hidden">Посты</span>
                    <span
                      className={cn(
                        'min-w-[1.5rem] rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                        activityPanel === 'posts'
                          ? 'bg-violet-600 text-white'
                          : 'bg-violet-100 text-violet-800',
                      )}
                    >
                      {postCount}
                    </span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activityPanel === 'comments'}
                    onClick={() => setActivityPanel('comments')}
                    className={cn(
                      'relative flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all duration-200',
                      activityPanel === 'comments'
                        ? 'bg-white text-blue-800 shadow-md ring-1 ring-blue-200/60'
                        : 'text-gray-600 hover:bg-white/60 hover:text-gray-900',
                    )}
                  >
                    <MessageCircle className="size-4 shrink-0 opacity-80" aria-hidden />
                    Комментарии
                    <span
                      className={cn(
                        'min-w-[1.5rem] rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                        activityPanel === 'comments'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-800',
                      )}
                    >
                      {comments.length}
                    </span>
                  </button>
                </div>

                {activityPanel === 'posts' ? (
                  postCount > 0 ? (
                    <div className="space-y-4">
                      {publisherPosts.map((post) => (
                        <article
                          key={post.id}
                          className="group overflow-hidden rounded-2xl border border-violet-100/80 bg-white shadow-sm ring-1 ring-violet-500/5 transition-shadow hover:shadow-md"
                        >
                          <div className="flex flex-col gap-0 sm:flex-row">
                            <div className="relative h-36 shrink-0 overflow-hidden sm:h-auto sm:w-44">
                              <ImageWithFallback
                                src={post.image}
                                alt=""
                                className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                              />
                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent sm:bg-gradient-to-r" />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:p-5">
                              <h4 className="text-base font-semibold leading-snug text-gray-900">
                                {post.title}
                              </h4>
                              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
                                {post.excerpt}
                              </p>
                              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                                <span className="inline-flex items-center gap-1.5 text-violet-700/90">
                                  <Eye className="size-3.5" aria-hidden />
                                  {post.views.toLocaleString('ru-RU')} просмотров
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-blue-700/90">
                                  <MessageCircle className="size-3.5" aria-hidden />
                                  {post.comments} в ленте
                                </span>
                                <span className="text-gray-400">{post.publishedAt}</span>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 py-14 text-center">
                      <Newspaper
                        className="mx-auto mb-3 size-12 text-violet-300"
                        strokeWidth={1.25}
                        aria-hidden
                      />
                      <p className="font-medium text-gray-800">Пока нет публикаций</p>
                      <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                        Когда появятся ваши материалы, они отобразятся в этом разделе.
                      </p>
                    </div>
                  )
                ) : (
                  renderCommentsList()
                )}
              </div>
            ) : (
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-gray-900">
                  <MessageCircle size={20} className="text-blue-600" aria-hidden />
                  Ваши комментарии
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-semibold text-blue-800 tabular-nums">
                    {comments.length}
                  </span>
                </h3>
                {renderCommentsList()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}