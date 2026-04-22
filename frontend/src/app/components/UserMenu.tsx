import { LogOut, User, Settings, BookMarked } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { personAvatarUrl } from '../lib/letterAvatar';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface UserMenuProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  onLogout: () => void;
  onOpenProfile?: () => void;
}

export function UserMenu({ user, onLogout, onOpenProfile }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ImageWithFallback
          src={personAvatarUrl(user.name, user.id, user.avatar)}
          alt={user.name}
          className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200/80"
        />
        <span className="text-sm hidden sm:block">{user.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-50">
          <div className="px-4 py-3 border-b">
            <p className="text-sm text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>

          <div className="py-2">
            <button
              onClick={handleProfileClick}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
            >
              <User size={16} />
              Профиль
            </button>
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700">
              <BookMarked size={16} />
              Закладки
            </button>
            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700">
              <Settings size={16} />
              Настройки
            </button>
          </div>

          <div className="border-t pt-2">
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
            >
              <LogOut size={16} />
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  );
}