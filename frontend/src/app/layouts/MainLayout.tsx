import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { LogIn, Newspaper, Search, TrendingUp } from 'lucide-react';
import { UserMenu } from '../components/UserMenu';
import type { User } from '../types';

export interface MainLayoutProps {
  children: ReactNode;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  trendingViews: number;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export function MainLayout({
  children,
  searchQuery,
  onSearchChange,
  trendingViews,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenProfile,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-3 text-left no-underline text-inherit">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Newspaper className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900">НовостиHub</h1>
                <p className="text-sm text-gray-600">Новости из проверенных источников</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-blue-600">
                <TrendingUp size={20} />
                <span className="text-sm hidden sm:block">
                  Сейчас читают: {trendingViews.toLocaleString()}
                </span>
              </div>

              {currentUser ? (
                <UserMenu
                  user={currentUser}
                  onLogout={onLogout}
                  onOpenProfile={onOpenProfile}
                />
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LogIn size={20} />
                  <span className="hidden sm:block">Войти</span>
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="search"
              placeholder="Поиск новостей..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
