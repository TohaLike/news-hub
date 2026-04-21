import { useEffect, useState } from 'react';
import { Redirect, Router, useLocation, useRoute } from 'wouter';
import { clearAccessToken, logout, me, refreshSession } from '@/api';
import { AuthModal } from './components/AuthModal';
import { NewsDetail } from './components/NewsDetail';
import { UserProfile } from './components/UserProfile';
import { userFromMe } from './lib/sessionUser';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import type { Comment, News, User } from './types';
import { initialComments, initialNews, publishers } from './types';

function AppRoutes() {
  const [, setLocation] = useLocation();
  const [newsMatch, newsParams] = useRoute('/news/:id');
  const routeParams = newsParams as { id: string } | undefined;
  const detailId = newsMatch && routeParams?.id ? routeParams.id : null;

  const [authReady, setAuthReady] = useState(false);
  const [selectedPublisher, setSelectedPublisher] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [news] = useState<News[]>(initialNews);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await refreshSession();
        const profile = await me();
        if (!cancelled) setCurrentUser(userFromMe(profile));
      } catch {
        clearAccessToken();
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedNews = detailId
    ? (news.find((n) => String(n.id) === detailId) ?? null)
    : null;
  const invalidNewsRoute = Boolean(newsMatch && detailId && !selectedNews);

  const filteredNews = news.filter((item) => {
    const matchesPublisher =
      selectedPublisher === null || item.publisher.id === selectedPublisher;
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPublisher && matchesSearch;
  });

  const trendingViews = filteredNews.reduce((sum, n) => sum + n.views, 0);

  const handleAddComment = (newsId: number, text: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    const newComment: Comment = {
      id: comments.length + 1,
      newsId,
      author: currentUser.name,
      avatar: currentUser.avatar,
      text,
      timestamp: 'Только что',
      likes: 0,
    };
    setComments([...comments, newComment]);
  };

  const handleAuthenticated = (user: User) => {
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // clearAccessToken вызывается внутри api
    }
    setCurrentUser(null);
    setShowProfile(false);
  };

  const handleUpdateProfile = (name: string, email: string, avatar: string) => {
    if (currentUser) {
      setCurrentUser({ name, email, avatar });
    }
  };

  const userComments = currentUser
    ? comments
        .filter((c) => c.author === currentUser.name)
        .map((c) => ({
          ...c,
          newsTitle: news.find((n) => n.id === c.newsId)?.title || 'Новость не найдена',
        }))
    : [];

  const newsComments = selectedNews
    ? comments.filter((c) => c.newsId === selectedNews.id)
    : [];

  if (invalidNewsRoute) {
    return <Redirect to="/" />;
  }

  return (
    <MainLayout
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      trendingViews={trendingViews}
      authRestoring={!authReady}
      currentUser={currentUser}
      onOpenAuth={() => setShowAuthModal(true)}
      onLogout={handleLogout}
      onOpenProfile={() => setShowProfile(true)}
    >
      <HomePage
        publishers={publishers}
        selectedPublisher={selectedPublisher}
        onSelectPublisher={setSelectedPublisher}
        filteredNews={filteredNews}
        onOpenNews={(id) => setLocation(`/news/${id}`)}
      />

      {selectedNews && (
        <NewsDetail
          news={selectedNews}
          comments={newsComments}
          onClose={() => setLocation('/')}
          onAddComment={handleAddComment}
          currentUser={currentUser}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthenticated={handleAuthenticated}
        />
      )}

      {showProfile && currentUser && (
        <UserProfile
          user={currentUser}
          comments={userComments}
          onClose={() => setShowProfile(false)}
          onUpdateProfile={handleUpdateProfile}
        />
      )}
    </MainLayout>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
