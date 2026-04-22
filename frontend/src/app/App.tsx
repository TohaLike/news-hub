import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Redirect, Router, useLocation, useRoute } from 'wouter';
import {
  clearAccessToken,
  createGroupPublication,
  createPublisherGroup,
  listFeedPosts,
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
import type { Comment, EditorialGroup, GroupPublication, News, Publisher, User } from './types';

function formatPublishedRu(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ru });
  } catch {
    return iso;
  }
}

function AppRoutes() {
  const [, setLocation] = useLocation();
  const [newsMatch, newsParams] = useRoute('/news/:id');
  const routeParams = newsParams as { id: string } | undefined;
  const detailId = newsMatch && routeParams?.id ? routeParams.id : null;

  const [authReady, setAuthReady] = useState(false);
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [editorialGroups, setEditorialGroups] = useState<EditorialGroup[]>([]);
  const [groupPublications, setGroupPublications] = useState<GroupPublication[]>([]);
  const [editorialLoading, setEditorialLoading] = useState(false);
  const [editorialError, setEditorialError] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    const posts = await listFeedPosts();
    setNews(posts);
  }, []);

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
    let cancelled = false;
    (async () => {
      try {
        setFeedLoading(true);
        setFeedError(null);
        await loadFeed();
      } catch (e) {
        if (!cancelled) setFeedError(getApiErrorMessage(e));
      } finally {
        if (!cancelled) setFeedLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadFeed]);

  useEffect(() => {
    if (!showProfile || currentUser?.role !== 'publisher') {
      return;
    }
    void openEditorialLoad();
  }, [showProfile, currentUser?.role, openEditorialLoad]);

  const feedPublishers = useMemo(() => {
    const map = new Map<string, Publisher>();
    for (const item of news) {
      if (!map.has(item.publisher.id)) {
        map.set(item.publisher.id, { ...item.publisher });
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [news]);

  const selectedNews = detailId
    ? (news.find((n) => String(n.id) === detailId) ?? null)
    : null;
  const invalidNewsRoute = Boolean(
    newsMatch && detailId && !feedLoading && !selectedNews,
  );

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

  const handleAddComment = (newsId: string, text: string) => {
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
    try {
      await loadFeed();
    } catch {
      // лента обновится при следующем заходе; ошибку не перекрываем
    }
  };

  const publisherActivityPosts = useMemo(() => {
    if (currentUser?.role !== 'publisher') return [];
    return groupPublications.map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      image: p.image,
      views: p.views,
      comments: p.comments,
      publishedAt: formatPublishedRu(p.publishedAt),
    }));
  }, [currentUser?.role, groupPublications]);

  const userComments = currentUser
    ? comments
        .filter((c) => c.author === currentUser.name)
        .map((c) => ({
          ...c,
          newsTitle:
            news.find((n) => String(n.id) === String(c.newsId))?.title ||
            'Новость не найдена',
        }))
    : [];

  const newsComments = selectedNews
    ? comments.filter((c) => String(c.newsId) === String(selectedNews.id))
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
        publishers={feedPublishers}
        selectedPublisher={selectedPublisher}
        onSelectPublisher={setSelectedPublisher}
        filteredNews={filteredNews}
        onOpenNews={(id) => setLocation(`/news/${id}`)}
        feedLoading={feedLoading}
        feedError={feedError}
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
