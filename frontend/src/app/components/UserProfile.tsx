import { X, Edit2, Save, Camera, MessageCircle, Eye } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Comment {
  id: number;
  newsId: number;
  newsTitle: string;
  text: string;
  timestamp: string;
  likes: number;
}

interface UserProfileProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  comments: Comment[];
  onClose: () => void;
  onUpdateProfile: (name: string, email: string, avatar: string) => void;
}

export function UserProfile({ user, comments, onClose, onUpdateProfile }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  });
  const [activeTab, setActiveTab] = useState<'info' | 'activity'>('info');

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl">
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
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-6 py-3 text-sm transition-colors ${
                activeTab === 'info'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Информация
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 px-6 py-3 text-sm transition-colors ${
                activeTab === 'activity'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Активность
            </button>
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
            ) : (
              <div>
                <h3 className="mb-4 flex items-center gap-2">
                  <MessageCircle size={20} />
                  Ваши комментарии ({comments.length})
                </h3>

                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-start gap-3 mb-2">
                          <ImageWithFallback
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-900">{user.name}</span>
                              <span className="text-xs text-gray-500">{comment.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{comment.newsTitle}</p>
                            <p className="text-gray-900">{comment.text}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>👍 {comment.likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Вы еще не оставляли комментариев</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}