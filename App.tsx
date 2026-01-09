
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
import { NewsItem, NavigationItem, SiteSettings } from './types';
import { useLanguage } from './context/LanguageContext';
import MainLoading from './components/MainLoading';

// Lazy Components
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));
const WebStoryEditor = React.lazy(() => import('./components/admin/WebStoryEditor'));
const Login = React.lazy(() => import('./components/auth/Login'));

type ViewType = 'feed' | 'detail' | 'publishers' | 'publisher_detail' | 'categories' | 'category_detail' | 'edit_publisher_profile' | 'login' | 'admin' | 'stories' | 'web_story_editor';

// 🚀 2025-2026 ULTRA PERSISTENCE ENGINE
const CACHE_CONFIG = {
  PREFIX: 'buzz_v26_',
  KEYS: {
    NEWS: 'news_',
    NAV: 'navigation',
    SETTINGS: 'settings',
    STORIES: 'stories',
    LAST_CAT: 'last_selected_category'
  }
};

const App: React.FC = () => {
  const { currentLang, t } = useLanguage();

  // --- PERSISTENCE UTILS ---
  const saveCache = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(`${CACHE_CONFIG.PREFIX}${key}_${currentLang.code}`, JSON.stringify({ data, ts: Date.now() }));
    } catch (e) { console.error("Cache Error", e); }
  }, [currentLang.code]);

  const getCache = useCallback((key: string) => {
    try {
      const cached = localStorage.getItem(`${CACHE_CONFIG.PREFIX}${key}_${currentLang.code}`);
      return cached ? JSON.parse(cached).data : null;
    } catch (e) { return null; }
  }, [currentLang.code]);

  // --- UI STATES ---
  const [view, setView] = useState<ViewType>(() => {
    const s = window.location.pathname.split('/').filter(Boolean);
    if (s[0] === 'haber') return 'detail';
    if (s[0] === 'admin') return 'admin';
    if (s[0] === 'giris') return 'login';
    return 'feed';
  });
  const [lastView, setLastView] = useState<ViewType>('feed');
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(() => {
    const s = window.location.pathname.split('/').filter(Boolean);
    return (s[0] === 'haber' && s[1]) ? s[1] : null;
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    // Initial category sync: URL > Last Persistent Choice > Null
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments[0] === 'kategori' && segments[1]) return decodeURIComponent(segments[1]);
    return localStorage.getItem(`${CACHE_CONFIG.PREFIX}${CACHE_CONFIG.KEYS.LAST_CAT}`);
  });

  const [adminTab, setAdminTab] = useState<string | null>(null);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- DATA STATES (Initialized from cache for 0ms First-Paint) ---
  const [newsItems, setNewsItems] = useState<NewsItem[]>(() => getCache(`${CACHE_CONFIG.KEYS.NEWS}${selectedCategory || 'home'}`) || []);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(() => getCache(CACHE_CONFIG.KEYS.NAV) || []);
  const [storiesItems, setStoriesItems] = useState<any[]>(() => getCache(CACHE_CONFIG.KEYS.STORIES) || []);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(() => getCache(CACHE_CONFIG.KEYS.SETTINGS));

  const [loading, setLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(() => !!getCache(`${CACHE_CONFIG.KEYS.NEWS}${selectedCategory || 'home'}`));

  // --- NEWS FETCHING CORE (Hierarchical & Persistent) ---
  const fetchNews = useCallback(async (category?: string | null, navItemsOverride?: NavigationItem[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentNav = navItemsOverride || navigationItems;

      let query = supabase
        .from('posts')
        .select(`*, profiles:publisher_id (id, username, full_name, avatar_url, role)`)
        .eq('status', 'published')
        .eq('language_code', currentLang.code)
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false });

      const trendTags = ['weekly_trends', 'weekly_likes', 'weekly_comments', 'weekly_shares', 'weekly_reads'];
      if (category && trendTags.includes(category)) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query = query.gte('published_at', sevenDaysAgo.toISOString());
        if (['weekly_trends', 'weekly_likes'].includes(category)) query = query.order('likes_count', { ascending: false });
        else if (category === 'weekly_comments') query = query.order('comments_count', { ascending: false });
        else if (category === 'weekly_shares') query = query.order('shares_count', { ascending: false });
        else if (category === 'weekly_reads') query = query.order('likes_count', { ascending: false });
      }
      else if (category && category !== 'home' && category !== 'null') {
        const targetItem = currentNav.find(i => i.value === category || i.label === category);
        const filterValues = new Set<string>([category]);
        if (targetItem) {
          filterValues.add(targetItem.label);
          if (targetItem.value) filterValues.add(targetItem.value);
          const findDeepChildren = (parentId: string) => {
            currentNav.filter(i => i.parent_id === parentId).forEach(c => {
              if (c.label) filterValues.add(c.label);
              if (c.value) filterValues.add(c.value);
              findDeepChildren(c.id);
            });
          };
          findDeepChildren(targetItem.id);
        }
        query = query.in('category', Array.from(filterValues));
      }

      const { data: postsData, error: postsError } = await query;
      if (postsError) throw postsError;

      if (postsData) {
        let userLikes: string[] = [];
        let userSaves: string[] = [];
        if (user && postsData.length > 0) {
          const postIds = postsData.map(p => p.id);
          const [likes, saves] = await Promise.all([
            supabase.from('post_likes').select('post_id').in('post_id', postIds).eq('user_id', user.id),
            supabase.from('post_saves').select('post_id').in('post_id', postIds).eq('user_id', user.id)
          ]);
          userLikes = (likes.data || []).map(l => l.post_id);
          userSaves = (saves.data || []).map(s => s.post_id);
        }

        const mappedNews: NewsItem[] = postsData.map((item: any) => {
          const profile = item.profiles;
          const homepageItem = (item.items || []).find((i: any) => i.showOnHomepage === true);
          let cardType = item.type?.toUpperCase() || 'STANDARD';
          let extraData: any = {};
          if (homepageItem) {
            cardType = homepageItem.type?.toUpperCase();
            if (homepageItem.type === 'slider') cardType = 'GALLERY';
            extraData = {
              ...homepageItem,
              summary: homepageItem.description || item.summary,
              mediaUrl: homepageItem.mediaUrl || item.media_url || '',
              thumbnail: homepageItem.mediaUrl || item.thumbnail_url || 'https://picsum.photos/800/600'
            };
          }

          return {
            id: item.id,
            title: item.title,
            summary: item.summary,
            content: item.content,
            category: item.category,
            source: profile?.full_name || profile?.username || 'Editör',
            author: profile?.full_name || 'Editör',
            timestamp: item.published_at
              ? new Date(item.published_at).toLocaleDateString(currentLang.code === 'ar' ? 'ar-SA' : 'tr-TR', { hour: '2-digit', minute: '2-digit' })
              : new Date(item.created_at).toLocaleDateString(currentLang.code === 'ar' ? 'ar-SA' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
            mediaUrl: item.media_url || '',
            thumbnail: item.thumbnail_url || 'https://picsum.photos/800/600',
            likes: item.likes_count || 0,
            comments: item.comments_count || 0,
            shares: item.shares_count || 0,
            views: item.likes_count || 0,
            items: item.items || [],
            sourceAvatar: profile?.avatar_url || '',
            isPinned: item.is_pinned || false,
            userLiked: userLikes.includes(item.id),
            userSaved: userSaves.includes(item.id),
            publisherId: item.publisher_id,
            ...extraData,
            type: cardType as any
          };
        });

        setNewsItems(mappedNews);
        saveCache(`${CACHE_CONFIG.KEYS.NEWS}${category || 'home'}`, mappedNews);
        return mappedNews;
      }
      return [];
    } catch (error) { console.error("Fetch News Error:", error); return []; }
  }, [currentLang.code, navigationItems, saveCache]);

  const fetchSingleNews = useCallback(async (newsId: string) => {
    try {
      const { data: item, error } = await supabase
        .from('posts')
        .select(`*, profiles:publisher_id (id, username, full_name, avatar_url, role)`)
        .eq('id', newsId)
        .maybeSingle();

      if (error) throw error;
      if (item) {
        const profile = item.profiles;
        const homepageItem = (item.items || []).find((i: any) => i.showOnHomepage === true);
        let cardType = item.type?.toUpperCase() || 'STANDARD';
        let extraData: any = {};
        if (homepageItem) {
          cardType = homepageItem.type?.toUpperCase();
          if (homepageItem.type === 'slider') cardType = 'GALLERY';
          extraData = { ...homepageItem };
        }

        const mappedNews: NewsItem = {
          id: item.id,
          title: item.title,
          summary: item.summary,
          content: item.content,
          category: item.category,
          source: profile?.full_name || profile?.username || 'Editör',
          author: profile?.full_name || 'Editör',
          timestamp: item.published_at
            ? new Date(item.published_at).toLocaleDateString(currentLang.code === 'ar' ? 'ar-SA' : 'tr-TR', { hour: '2-digit', minute: '2-digit' })
            : new Date(item.created_at).toLocaleDateString(currentLang.code === 'ar' ? 'ar-SA' : 'tr-TR', { hour: '2-digit', minute: '2-digit' }),
          mediaUrl: item.media_url || '',
          thumbnail: item.thumbnail_url || 'https://picsum.photos/800/600',
          likes: item.likes_count || 0,
          comments: item.comments_count || 0,
          shares: item.shares_count || 0,
          views: item.likes_count || 0,
          items: item.items || [],
          sourceAvatar: profile?.avatar_url || '',
          isPinned: item.is_pinned || false,
          publisherId: item.publisher_id,
          ...extraData,
          type: cardType as any
        };

        setNewsItems(prev => {
          if (prev.find(n => n.id === mappedNews.id)) return prev;
          return [mappedNews, ...prev];
        });
      }
    } catch (e) {
      console.error("Fetch Single News Error", e);
    }
  }, [currentLang.code]);

  // --- DATA INITIALIZATION ---
  const init = useCallback(async () => {
    try {
      const segments = window.location.pathname.split('/').filter(Boolean);
      const initialCategory = (segments[0] === 'kategori' && segments[1]) ? decodeURIComponent(segments[1]) : (segments[0] === 'haber' ? null : selectedCategory);
      const initialNewsId = (segments[0] === 'haber' && segments[1]) ? segments[1] : null;

      const [sessionRes, navRes, settingsRes, storiesRes] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from('navigation_items').select('*, navigation_menus!inner(code)').eq('language_code', currentLang.code).order('order_index'),
        supabase.from('site_settings').select('*').eq('language_code', currentLang.code).maybeSingle(),
        supabase.from('stories').select('*').eq('is_active', true).order('created_at', { ascending: false })
      ]);

      if (navRes.data) {
        setNavigationItems(navRes.data);
        saveCache(CACHE_CONFIG.KEYS.NAV, navRes.data);
      }
      if (settingsRes.data) {
        setSiteSettings(settingsRes.data);
        saveCache(CACHE_CONFIG.KEYS.SETTINGS, settingsRes.data);
      }
      if (storiesRes.data) {
        setStoriesItems(storiesRes.data);
        saveCache(CACHE_CONFIG.KEYS.STORIES, storiesRes.data);
      }
      setSession(sessionRes.data.session);
      setAuthLoading(false);

      const items = await fetchNews(initialCategory, navRes.data || []);

      if (initialNewsId && !items.some(n => n.id === initialNewsId)) {
        await fetchSingleNews(initialNewsId);
      }

      setIsAppReady(true);
    } catch (e) { console.error("Init Error", e); setIsAppReady(true); } finally { setLoading(false); }
  }, [currentLang.code, fetchNews, fetchSingleNews, saveCache, selectedCategory]);

  useEffect(() => {
    const handlePopState = () => {
      const segments = window.location.pathname.split('/').filter(Boolean);
      if (segments[0] === 'haber' && segments[1]) {
        setSelectedNewsId(segments[1]);
        setView('detail');
      } else if (segments[0] === 'kategori' && segments[1]) {
        const cat = decodeURIComponent(segments[1]);
        setSelectedCategory(cat);
        setView('feed');
        fetchNews(cat);
      } else if (segments[0] === 'admin') {
        setView('admin');
      } else if (segments[0] === 'giris') {
        setView('login');
      } else {
        // 🛡️ INTELLIGENT ROUTE RECOVERY:
        // Eğer kök dizine (/) dönülüyorsa, null set etmek yerine 
        // son seçilen ana kategoriyi (Niğde vb.) hafızadan geri yükle.
        const lastCat = localStorage.getItem(`${CACHE_CONFIG.PREFIX}${CACHE_CONFIG.KEYS.LAST_CAT}`);
        setView('feed');
        setSelectedCategory(lastCat);
        fetchNews(lastCat);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [fetchNews]);

  useEffect(() => { init(); }, [currentLang.code]);

  // --- SEO & TAB TITLE ENGINE ---
  useEffect(() => {
    if (!isAppReady) return;

    let title = siteSettings?.home_title || siteSettings?.site_name || 'Pateez News';
    let description = siteSettings?.meta_description || '';
    let keywords = siteSettings?.meta_keywords || '';

    if (view === 'detail' && selectedNewsId) {
      const news = newsItems.find(n => n.id === selectedNewsId);
      if (news) {
        title = `${news.title} | ${siteSettings?.site_name || 'Haber'}`;
        description = news.summary || description;
      }
    } else if (selectedCategory) {
      const navItem = navigationItems.find(i => i.value === selectedCategory || i.label === selectedCategory);
      if (navItem) {
        title = `${t(navItem.label)} | ${siteSettings?.site_name || 'Pateez'}`;
      }
    } else {
      // Home Page: SiteSettings içinde home_title varsa onu kullan, yoksa site_name kullan
      title = siteSettings?.home_title || siteSettings?.site_name || title;
    }

    document.title = title;

    // Meta Update (Pure JS for 0-dependency SEO)
    const updateMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('og:title', title, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('robots', siteSettings?.robots_txt || 'index, follow');

    // Canonical Link Update
    let canonical = document.querySelector('link[rel="canonical"]');
    if (siteSettings?.canonical_url) {
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', siteSettings.canonical_url);
    }
  }, [view, selectedNewsId, selectedCategory, siteSettings, newsItems, navigationItems, isAppReady, t]);

  // --- NAVIGATION & ROUTING ---
  const updateUrl = (newView: ViewType, category?: string | null, newsId?: string | null) => {
    let path = '/';
    if (newView === 'feed' && category) {
      // PERSISTENCE LOGIC: Ana kategoriler (Niğde vb.) seçildiğinde URL DEĞİŞMEZ.
      // Sadece alt kategoriler ve trendler seçildiğinde URL değişir.
      const navItem = navigationItems.find(i => i.value === category || i.label === category);
      const isSubOrTrend = navItem && (navItem.parent_id && navItem.parent_id !== 'root' || navItem.type === 'trends');

      if (isSubOrTrend) {
        path = `/kategori/${encodeURIComponent(category)}`;
      } else {
        path = '/'; // Ana kategoriler base URL'de kalır
      }
    }
    else if (newView === 'detail' && newsId) path = `/haber/${newsId}`;
    else if (newView === 'admin') path = '/admin';
    else if (newView === 'login') path = '/giris';

    if (window.location.pathname !== path) window.history.pushState(null, '', path);
  };

  const handleCategorySelect = (category: string | null) => {
    let next: string | null = category;
    // 🛡️ INTELLIGENT SELECTION TOGGLE:
    // Eğer aynı öğeye tekrar tıklanırsa seçimi kademeli olarak kaldır
    if (category === selectedCategory) {
      const navItem = navigationItems.find(i => i.value === category || i.label === category);
      const isMain = navItem && (!navItem.parent_id || navItem.parent_id === 'root');

      if (isMain) {
        // Ana kategoriye tekrar basıldıysa her şeyi temizle (Küresel Ana Sayfa)
        next = null;
        localStorage.removeItem(`${CACHE_CONFIG.PREFIX}${CACHE_CONFIG.KEYS.LAST_CAT}`);
      } else {
        // Alt öğeye (İlçe, Trend vb.) tekrar basıldıysa aktif Ana Kategori'ye geri dön
        next = localStorage.getItem(`${CACHE_CONFIG.PREFIX}${CACHE_CONFIG.KEYS.LAST_CAT}`);
      }
    } else if (category) {
      // Yeni bir seçim yapılıyorsa ve bu bir Ana Kategori ise hafızaya al
      const navItem = navigationItems.find(i => i.value === category || i.label === category);
      const isMain = navItem && (!navItem.parent_id || navItem.parent_id === 'root');

      if (isMain) {
        localStorage.setItem(`${CACHE_CONFIG.PREFIX}${CACHE_CONFIG.KEYS.LAST_CAT}`, category);
      }
    }

    setSelectedCategory(next);

    setView('feed');
    updateUrl('feed', next);
    fetchNews(next);
  };

  const handleNewsSelect = (id: string) => {
    setSelectedNewsId(id);
    setView('detail');
    updateUrl('detail', null, id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const currentCategoryLabel = useMemo(() => {
    if (!selectedCategory) return null;
    const navItem = navigationItems.find(i => i.value === selectedCategory || i.label === selectedCategory);
    if (navItem && (!navItem.parent_id || navItem.parent_id === 'root')) return null;
    return navItem ? t(navItem.label) : selectedCategory;
  }, [selectedCategory, navigationItems, t]);

  if (!isAppReady && loading) return <MainLoading />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-opacity duration-500" dir={currentLang.direction}>
      <Navbar
        onHomeClick={() => {
          const lastCat = localStorage.getItem(`${CACHE_CONFIG.PREFIX}${CACHE_CONFIG.KEYS.LAST_CAT}`);
          setView('feed');
          setSelectedCategory(lastCat);
          updateUrl('feed', lastCat);
          fetchNews(lastCat);
        }}
        onProfileClick={() => { setView(session ? 'admin' : 'login'); updateUrl(session ? 'admin' : 'login'); }}
        isLoggedIn={!!session}
        navItems={navigationItems}
        siteSettings={siteSettings}
      />

      <main className={`${view === 'admin' ? 'max-w-full' : 'max-w-[1280px]'} mx-auto pt-[72px] flex justify-center items-start gap-8 px-4`}>
        {view !== 'detail' && view !== 'admin' && view !== 'login' && (
          <aside className="hidden lg:block w-[260px] flex-shrink-0 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto pb-8 no-scrollbar">
            <Sidebar items={navigationItems} activeCategory={selectedCategory} onCategoryItemClick={handleCategorySelect} />
          </aside>
        )}

        <section className="flex-1 min-w-0 pb-10 flex justify-center w-full">
          <div className={`w-full ${view === 'admin' ? '' : 'max-w-[840px]'}`}>
            {view === 'feed' ? (
              <Feed newsData={newsItems} title={currentCategoryLabel || undefined} onNewsSelect={handleNewsSelect} storiesData={storiesItems} />
            ) : view === 'detail' && selectedNewsId ? (
              <NewsDetail
                data={newsItems.find(n => n.id === selectedNewsId) || ({} as any)}
                onBack={() => { setView('feed'); updateUrl('feed', selectedCategory); }}
                navItems={navigationItems}
              />
            ) : view === 'admin' ? (
              <React.Suspense fallback={<MainLoading />}><AdminDashboard initialTab={adminTab || 'overview'} initialUserId={adminUserId || undefined} onLogout={() => setView('feed')} /></React.Suspense>
            ) : view === 'login' ? (
              <React.Suspense fallback={<MainLoading />}><Login onBack={() => setView('feed')} /></React.Suspense>
            ) : null}
          </div>
        </section>

        {(view === 'feed' || view === 'detail') && (
          <aside className="hidden xl:block w-[320px] flex-shrink-0 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto pb-8 no-scrollbar">
            <RightSidebar newsData={newsItems} />
          </aside>
        )}
      </main>
    </div>
  );
};

export default App;
