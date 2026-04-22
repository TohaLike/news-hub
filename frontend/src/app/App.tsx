import { useCallback, useEffect, useMemo, useState } from 'react';
import { Redirect, Router, useLocation, useRoute } from 'wouter';
import {
  clearAccessToken,
  createGroupPublication,
  createPublisherGroup,
  listGroupPublications,
  listPublisherGroups,
  logout,
  me,
  refreshSession,
} from '@/api';
import { getApiErrorMessage } from './components/auth/getApiErrorMessage';
import { AuthModal } from './components/AuthModal';
import { NewsDetail } from './components/NewsDetail';
import { UserProfile } from './components/UserProfile';
import { userFromMe } from './lib/sessionUser';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import type { Comment, EditorialGroup, GroupPublication, News, User } from './types';
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
  const [editorialGroups, setEditorialGroups] = useState<EditorialGroup[]>([]);
  const [groupPublications, setGroupPublications] = useState<GroupPublication[]>([]);
  const [editorialLoading, setEditorialLoading] = useState(false);
  const [editorialError, setEditorialError] = useState<string | null>(null);

  const loadEditorialData = useCallback(async () => {
    const groups = await listPublisherGroups();
    setEditorialGroups(groups);
    const pubs: GroupPublication[] = [];
    for (const g of groups) {
      const list = await listGroupPublications(g.id);
      pubs.push(...list);
    }
    setGroupPublications(pubs);
  }, []);

  const openEditorialLoad = useCallback(async () => {
    setEditorialLoading(true);
    setEditorialError(null);
    try {
      await loadEditorialData();
    } catch (e) {
      setEditorialError(getApiErrorMessage(e));
    } finally {
      setEditorialLoading(false);
    }
  }, [loadEditorialData]);

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

  useEffect(() => {
    if (!showProfile || currentUser?.role !== 'publisher') {
      return;
    }
    void openEditorialLoad();
  }, [showProfile, currentUser?.role, openEditorialLoad]);

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
    setEditorialGroups([]);
    setGroupPublications([]);
    setEditorialError(null);
  };

  const handleUpdateProfile = (name: string, email: string, avatar: string) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, name, email, avatar });
    }
  };

  const handleCreateEditorialGroup = async (payload: { name: string }) => {
    await createPublisherGroup(payload.name);
    await loadEditorialData();
  };

  const handleCreateGroupPublication = async (
    groupId: string,
    payload: {
      title: string;
      excerpt: string;
      content: string;
      category: string;
      image?: string;
    },
  ) => {
    await createGroupPublication(groupId, payload);
    await loadEditorialData();
  };

  const publisherActivityPosts = useMemo(() => {
    if (currentUser?.role !== 'publisher') return [];
    const fromEditorial = groupPublications.map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      image: p.image,
      views: p.views,
      comments: p.comments,
      publishedAt: p.publishedAt,
    }));
    const fromDemo = news.map((n) => ({
      id: n.id,
      title: n.title,
      excerpt: n.excerpt,
      image: n.image,
      views: n.views,
      comments: n.comments,
      publishedAt: n.publishedAt,
    }));
    return [...fromEditorial, ...fromDemo];
  }, [currentUser?.role, groupPublications, news]);

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
          publisherPosts={publisherActivityPosts}
          editorialGroups={
            currentUser.role === 'publisher' ? editorialGroups : undefined
          }
          groupPublications={
            currentUser.role === 'publisher' ? groupPublications : undefined
          }
          editorialLoading={
            currentUser.role === 'publisher' ? editorialLoading : undefined
          }
          editorialError={
            currentUser.role === 'publisher' ? editorialError : undefined
          }
          onRetryEditorialLoad={
            currentUser.role === 'publisher'
              ? () => {
                  void openEditorialLoad();
                }
              : undefined
          }
          onCreateEditorialGroup={
            currentUser.role === 'publisher' ? handleCreateEditorialGroup : undefined
          }
          onCreateGroupPublication={
            currentUser.role === 'publisher' ? handleCreateGroupPublication : undefined
          }
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
