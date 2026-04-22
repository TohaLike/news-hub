import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Redirect, Router, useLocation, useRoute } from 'wouter';
import {
  clearAccessToken,
  createGroupPublication,
  createPublicationComment,
  createPublisherGroup,
  listFeedPosts,
  listGroupPublications,
  listMyComments,
  listPublicationComments,
  listPublisherGroups,
  logout,
  me,
  refreshSession,
  togglePublicationCommentLike,
  togglePublicationLike,
} from '@/api';
import type { ProfileComment } from '@/api/comments';
import { getApiErrorMessage } from './components/auth/getApiErrorMessage';
import { AuthModal } from './components/AuthModal';
import { NewsDetail } from './components/NewsDetail';
import { UserProfile } from './components/UserProfile';
import { userFromMe } from './lib/sessionUser';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import type { NewsRubric } from './constants/rubrics';
import type { Comment, EditorialGroup, GroupPublication, News, User } from './types';

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
  const [selectedRubric, setSelectedRubric] = useState<NewsRubric | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailComments, setDetailComments] = useState<Comment[]>([]);
  const [profileComments, setProfileComments] = useState<ProfileComment[] | null>(null);
  const [profileCommentsLoading, setProfileCommentsLoading] = useState(false);
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

  /** Лента после `authReady`, чтобы в запрос ушёл JWT и пришёл корректный `likedByMe`. */
  useEffect(() => {
    if (!authReady) return;
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
  }, [authReady, loadFeed]);

  useEffect(() => {
    if (!showProfile || currentUser?.role !== 'publisher') {
      return;
    }
    void openEditorialLoad();
  }, [showProfile, currentUser?.role, openEditorialLoad]);

  const selectedNews = detailId
    ? (news.find((n) => String(n.id) === detailId) ?? null)
    : null;
  const invalidNewsRoute = Boolean(
    newsMatch && detailId && !feedLoading && !selectedNews,
  );

  useEffect(() => {
    if (!selectedNews) {
      setDetailComments([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const list = await listPublicationComments(selectedNews.id);
        if (!cancelled) setDetailComments(list);
      } catch {
        if (!cancelled) setDetailComments([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedNews?.id]);

  useEffect(() => {
    if (!showProfile) {
      setProfileComments(null);
      setProfileCommentsLoading(false);
      return;
    }
    if (!currentUser) {
      return;
    }
    let cancelled = false;
    setProfileComments(null);
    setProfileCommentsLoading(true);
    (async () => {
      try {
        const list = await listMyComments();
        if (!cancelled) setProfileComments(list);
      } catch {
        if (!cancelled) setProfileComments([]);
      } finally {
        if (!cancelled) setProfileCommentsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showProfile, currentUser?.id]);

  const filteredNews = news.filter((item) => {
    const matchesRubric =
      selectedRubric === null || item.category === selectedRubric;
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRubric && matchesSearch;
  });

  const trendingViews = filteredNews.reduce((sum, n) => sum + n.views, 0);

  const handleAddComment = async (
    newsId: string,
    text: string,
    parentCommentId?: string | null,
  ) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    try {
      await createPublicationComment(
        newsId,
        text,
        parentCommentId ?? undefined,
      );
      const list = await listPublicationComments(newsId);
      setDetailComments(list);
      setNews((prev) =>
        prev.map((n) =>
          String(n.id) === String(newsId) ? { ...n, comments: list.length } : n,
        ),
      );
      if (showProfile && currentUser) {
        try {
          setProfileComments(await listMyComments());
        } catch {
          // список в профиле обновится при следующем открытии
        }
      }
    } catch {
      // ошибку можно показать позже через toast
    }
  };

  const handleToggleCommentLike = async (commentId: string) => {
    if (!currentUser) return;
    try {
      const { likes, liked } = await togglePublicationCommentLike(commentId);
      setDetailComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, likes, likedByMe: liked } : c,
        ),
      );
      setProfileComments((prev) =>
        prev
          ? prev.map((c) =>
              c.id === commentId ? { ...c, likes, likedByMe: liked } : c,
            )
          : prev,
      );
    } catch {
      // игнорируем рассинхрон
    }
  };

  const handleTogglePostLike = async (publicationId: string) => {
    if (!currentUser) return;
    try {
      const { likes, liked } = await togglePublicationLike(publicationId);
      setNews((prev) =>
        prev.map((n) =>
          String(n.id) === String(publicationId)
            ? { ...n, likes, likedByMe: liked }
            : n,
        ),
      );
    } catch {
      // игнорируем
    }
  };

  const handleAuthenticated = (user: User) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    void listFeedPosts()
      .then(setNews)
      .catch(() => {
        // лента обновится при следующей загрузке
      });
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
    setProfileComments(null);
    setDetailComments([]);
    void listFeedPosts()
      .then(setNews)
      .catch(() => {});
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
      likes: p.likes,
      comments: p.comments,
      publishedAt: formatPublishedRu(p.publishedAt),
    }));
  }, [currentUser?.role, groupPublications]);

  const userComments: ProfileComment[] =
    currentUser && profileComments !== null ? profileComments : [];

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
        selectedRubric={selectedRubric}
        onSelectRubric={setSelectedRubric}
        filteredNews={filteredNews}
        onOpenNews={(id) => setLocation(`/news/${id}`)}
        feedLoading={feedLoading}
        feedError={feedError}
      />

      {selectedNews && (
        <NewsDetail
          news={selectedNews}
          comments={detailComments}
          onClose={() => setLocation('/')}
          onAddComment={handleAddComment}
          onToggleCommentLike={handleToggleCommentLike}
          onTogglePostLike={handleTogglePostLike}
          onRequireLogin={() => setShowAuthModal(true)}
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
          commentsLoading={profileCommentsLoading}
          onToggleCommentLike={handleToggleCommentLike}
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
