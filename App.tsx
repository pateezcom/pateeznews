
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import RightSidebar from './components/RightSidebar';
import NewsDetail from './components/NewsDetail';
import PublishersList from './components/PublishersList';
import PublisherProfile from './components/PublisherProfile';
import CategoriesList from './components/CategoriesList';
import { NEWS_FEED } from './constants';
import { NewsItem, NavigationItem } from './types';
import { useLanguage } from './context/LanguageContext';
import StoriesSection from './components/StoriesSection';
import MainLoading from './components/MainLoading';

// Lazy Components
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));
const WebStoryEditor = React.lazy(() => import('./components/admin/WebStoryEditor'));
const Login = React.lazy(() => import('./components/auth/Login'));

type ViewType = 'feed' | 'detail' | 'publishers' | 'publisher_detail' | 'categories' | 'category_detail' | 'edit_publisher_profile' | 'login' | 'admin' | 'stories' | 'web_story_editor';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('feed');
  const [lastView, setLastView] = useState<ViewType>('feed');
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [selectedPublisherName, setSelectedPublisherName] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<string | null>(null);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { currentLang } = useLanguage();

  const [newsItems, setNewsItems] = useState<NewsItem[]>(NEWS_FEED);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  const fetchNews = useCallback(async (category?: string | null) => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:publisher_id (
            id,
            username,
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('status', 'published')
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data: postsData, error: postsError } = await query;

      if (postsError) throw postsError;

      if (postsData) {
        const mappedNews: NewsItem[] = postsData.map((item: any) => {
          const profile = item.profiles;

          // Find item marked for homepage/cover
          const items = item.items || [];
          const homepageItem = items.find((i: any) => i.showOnHomepage === true);

          let cardType = item.type;
          let extraData: any = {};

          if (homepageItem) {
            // Map the homepage item type to our NewsType enum (usually they align)
            cardType = homepageItem.type?.toUpperCase();

            // Map specific data based on type
            if (homepageItem.type === 'beforeafter') {
              cardType = 'BEFORE_AFTER';
              extraData.beforeAfterData = homepageItem.beforeAfterData;
            } else if (homepageItem.type === 'flipcard') {
              cardType = 'FLIP_CARD';
              extraData.flipData = homepageItem.flipData;
            } else if (homepageItem.type === 'review') {
              cardType = 'REVIEW';
              extraData.reviewData = homepageItem.reviewData;
            } else if (homepageItem.type === 'poll') {
              cardType = 'POLL';
              extraData.options = homepageItem.options;
              extraData.isImagePoll = homepageItem.isImagePoll;
              extraData.pollColumns = homepageItem.pollColumns;
            } else if (homepageItem.type === 'vs') {
              cardType = 'VS';
              extraData.options = homepageItem.options;
            } else if (homepageItem.type === 'slider') {
              cardType = 'GALLERY';
              extraData.mediaList = homepageItem.mediaUrls;
            } else if (homepageItem.type === 'video') {
              cardType = 'VIDEO';
              extraData.mediaUrl = homepageItem.mediaUrl;
            } else if (homepageItem.type === 'audio') {
              cardType = 'AUDIO';
              extraData.mediaUrl = homepageItem.mediaUrl;
            } else if (homepageItem.type === 'social' || homepageItem.type === 'iframe') {
              cardType = 'EMBED';
              extraData.mediaUrl = homepageItem.mediaUrl;
            }
          } else {
            // Default to STANDARD if no homepage item is specified
            cardType = 'STANDARD';
          }

          return {
            id: item.id,
            type: cardType as any,
            title: item.title,
            summary: item.summary,
            content: item.content,
            category: item.category,
            source: profile?.full_name || profile?.username || 'Buzz Haber',
            author: profile?.full_name || 'Editör',
            timestamp: item.published_at
              ? new Date(item.published_at).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })
              : new Date(item.created_at).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            mediaUrl: item.media_url || '',
            thumbnail: item.thumbnail_url || 'https://picsum.photos/800/600',
            likes: item.likes_count || 0,
            comments: item.comments_count || 0,
            shares: item.shares_count || 0,
            items: item.items || [],
            sourceAvatar: profile?.avatar_url || '',
            isPinned: item.is_pinned || false,
            ...extraData
          };
        });
        setNewsItems(mappedNews);
        return mappedNews;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
    return [];
  }, []);

  const fetchNavigation = useCallback(async () => {
    try {
      // Fetch all navigation items for the current language with menu codes (Single Query Join)
      const { data: itemsData, error } = await supabase
        .from('navigation_items')
        .select(`
          *,
          navigation_menus!inner(code)
        `)
        .eq('language_code', currentLang.code)
        .order('order_index');

      if (error) throw error;

      if (itemsData) {
        setNavigationItems(itemsData);
        return itemsData;
      }
    } catch (e) {
      console.error("Error fetching navigation items:", e);
    }
    return [];
  }, [currentLang.code]);

  const syncStateFromUrl = useCallback(() => {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      setView('feed'); setSelectedNewsId(null); setSelectedCategory(null); setSelectedPublisherName(null);
    } else if (segments[0] === 'admin' && segments[1] === 'hikaye-editor' && segments[2]) {
      setView('web_story_editor'); setSelectedNewsId(segments[2]);
    } else if (segments[0] === 'admin') {
      setView('admin'); setAdminTab(segments[1] || 'overview'); setAdminUserId(segments[2] || null);
    } else if (segments[0] === 'giris') {
      setView('login');
    } else if (segments[0] === 'haber' && segments[1]) {
      setView('detail'); setSelectedNewsId(segments[1]);
    } else if (segments[0] === 'yayinlar') {
      setView('publishers');
    } else if (segments[0] === 'yayin' && segments[1]) {
      setView('publisher_detail'); setSelectedPublisherName(decodeURIComponent(segments[1]));
    } else if (segments[0] === 'kategoriler') {
      setView('categories');
    } else if (segments[0] === 'kategori' && segments[1]) {
      setSelectedCategory(decodeURIComponent(segments[1])); setView('feed');
    } else if (segments[0] === 'profil' && segments[1] === 'duzenle') {
      setView('edit_publisher_profile');
    } else if (segments[0] === 'hikayeler') {
      setView('stories');
    }
  }, []);

  const updateUrl = useCallback((newView: ViewType, id?: string | null, name?: string | null, tab?: string | null) => {
    let newPath = '/';
    switch (newView) {
      case 'admin': newPath = tab ? `/admin/${tab}` : '/admin'; break;
      case 'detail': newPath = `/haber/${id}`; break;
      case 'login': newPath = '/giris'; break;
      case 'publishers': newPath = '/yayinlar'; break;
      case 'publisher_detail': newPath = `/yayin/${encodeURIComponent(name || '')}`; break;
      case 'categories': newPath = '/kategoriler'; break;
      case 'stories': newPath = '/hikayeler'; break;
      case 'feed': newPath = selectedCategory ? `/kategori/${encodeURIComponent(selectedCategory)}` : '/'; break;
    }
    if (window.location.pathname !== newPath) window.history.pushState(null, '', newPath);
  }, [selectedCategory]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const start = Date.now();

      // Determine category from URL if present
      const segments = window.location.pathname.split('/').filter(Boolean);
      let initialCategory = null;
      if (segments[0] === 'kategori' && segments[1]) {
        initialCategory = decodeURIComponent(segments[1]);
      }

      const [sessionRes] = await Promise.all([
        supabase.auth.getSession(),
        fetchNews(initialCategory),
        fetchNavigation(),
        syncStateFromUrl()
      ]);

      if (mounted) {
        setSession(sessionRes.data.session);
        setAuthLoading(false);

        const elapsed = Date.now() - start;
        const wait = Math.max(0, 800 - elapsed);
        setTimeout(() => { if (mounted) setIsAppReady(true); }, wait);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        if (session && window.location.pathname === '/giris') {
          setView('admin'); updateUrl('admin', null, null, 'overview');
        }
      }
    });

    window.onpopstate = () => { if (mounted) syncStateFromUrl(); };
    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.onpopstate = null;
    };
  }, [fetchNews, fetchNavigation, syncStateFromUrl, updateUrl, currentLang.code]);

  // Handle category changes
  useEffect(() => {
    if (isAppReady) {
      fetchNews(selectedCategory);
    }
  }, [selectedCategory, fetchNews]);

  const handleBack = () => {
    setView('feed');
    setSelectedNewsId(null);
    setSelectedPublisherName(null);
    setSelectedCategory(null);
    updateUrl('feed');
  };

  const handleProfileClick = () => {
    if (session) {
      setView('admin');
      updateUrl('admin');
    } else {
      setLastView(view);
      setView('login');
      updateUrl('login');
    }
  };

  const handleNewsSelect = (id: string) => {
    setSelectedNewsId(id);
    setView('detail');
    updateUrl('detail', id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublisherSelect = (name: string) => {
    setSelectedPublisherName(name);
    setView('publisher_detail');
    updateUrl('publisher_detail', null, name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setView('feed');
    updateUrl('feed', null, category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditProfile = () => {
    setView('edit_publisher_profile');
    updateUrl('edit_publisher_profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedNews = useMemo(() => newsItems.find(n => n.id === selectedNewsId), [newsItems, selectedNewsId]);
  const activeView = view === 'login' ? lastView : view;
  const showRightSidebar = activeView === 'feed' || activeView === 'detail';

  if (view === 'web_story_editor') {
    return (
      <React.Suspense fallback={<MainLoading />}>
        <WebStoryEditor story={{ id: selectedNewsId || '' } as any} onClose={() => setView('admin')} />
      </React.Suspense>
    );
  }

  if (view === 'admin' && session) {
    return (
      <React.Suspense fallback={<MainLoading />}>
        <AdminDashboard onLogout={() => setView('feed')} initialTab={adminTab || 'overview'} />
      </React.Suspense>
    );
  }

  return (
    <>
      {!isAppReady && <MainLoading />}

      <div className={`min-h-screen bg-gray-50 text-gray-900 transition-opacity duration-500 ${isAppReady ? 'opacity-100' : 'opacity-0'}`} dir={currentLang.direction}>
        <Navbar
          onHomeClick={handleBack}
          onProfileClick={handleProfileClick}
          isLoggedIn={!!session}
          navItems={navigationItems} // Pass navigationItems as a prop
        />

        <main className="max-w-[1280px] mx-auto pt-[80px] flex justify-center items-start gap-8 px-4">
          {activeView !== 'detail' && activeView !== 'edit_publisher_profile' && (
            <aside className="hidden lg:block w-[260px] flex-shrink-0 sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto pb-8 no-scrollbar">
              <Sidebar
                items={navigationItems.filter(item => (item as any).navigation_menus?.code === 'sidebar_main')}
                onCategoryItemClick={handleBack}
              />
            </aside>
          )}

          <section className="flex-1 min-w-0 pb-10 flex justify-center w-full">
            <div className="w-full max-w-[840px]">
              {activeView === 'detail' && selectedNews ? (
                <NewsDetail data={selectedNews} onBack={handleBack} />
              ) : activeView === 'publishers' ? (
                <PublishersList onBack={handleBack} onPublisherSelect={handlePublisherSelect} />
              ) : activeView === 'publisher_detail' && selectedPublisherName ? (
                <PublisherProfile
                  name={selectedPublisherName}
                  onBack={() => setView('publishers')}
                  onNewsSelect={handleNewsSelect}
                  onEditClick={handleEditProfile}
                />
              ) : activeView === 'categories' ? (
                <CategoriesList onBack={handleBack} onCategorySelect={handleCategorySelect} />
              ) : activeView === 'stories' ? (
                <StoriesSection onBack={handleBack} />
              ) : (
                <Feed
                  newsData={selectedCategory ? newsItems.filter(i => i.category === selectedCategory) : newsItems}
                  onNewsSelect={handleNewsSelect}
                  onSourceClick={handlePublisherSelect}
                />
              )}
            </div>
          </section>

          {showRightSidebar && (
            <aside className="hidden xl:block w-[320px] flex-shrink-0 pb-10">
              <RightSidebar />
            </aside>
          )}
        </main>

        <React.Suspense fallback={null}>
          {view === 'login' && <Login onSuccess={() => setView('admin')} onClose={() => setView(lastView)} />}
        </React.Suspense>
      </div>
    </>
  );
};

export default App;
