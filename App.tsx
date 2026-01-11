
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import RightSidebar from './components/RightSidebar';
import NewsDetail from './components/NewsDetail';
import UsersList from './components/UsersList';
import UserProfile from './components/UserProfile';
import UserEditProfile from './components/UserEditProfile';
import CategoriesList from './components/CategoriesList';
import DistrictsList from './components/DistrictsList';
import TrendsList from './components/TrendsList';
import { NewsItem, NavigationItem, SiteSettings } from './types';
import { useLanguage } from './context/LanguageContext';
import MainLoading from './components/MainLoading';
import { isUUID, slugify } from './utils/helpers';

// Lazy Components
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));
const WebStoryEditor = React.lazy(() => import('./components/admin/WebStoryEditor'));
const Login = React.lazy(() => import('./components/auth/Login'));

type ViewType = 'feed' | 'detail' | 'users' | 'user_detail' | 'categories' | 'districts' | 'trends' | 'category_detail' | 'edit_user_profile' | 'login' | 'admin' | 'stories' | 'web_story_editor';

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

const ADMIN_TAB_LABEL_KEYS: Record<string, string> = {
  overview: 'admin.sidebar.overview',
  posts: 'admin.sidebar.posts',
  news_list: 'admin.sidebar.news_list',
  stories: 'admin.sidebar.stories',
  users: 'admin.sidebar.users',
  publishers: 'admin.sidebar.publishers',
  navigation: 'admin.sidebar.navigation',
  roles: 'admin.sidebar.roles',
  settings: 'admin.sidebar.settings',
  languages: 'admin.sidebar.languages',
  my_profile: 'admin.header.my_account'
};

const ADMIN_TAB_LABEL_FALLBACKS: Record<string, string> = {
  'admin.sidebar.overview': 'Genel Bakış',
  'admin.sidebar.posts': 'Haber Ekle',
  'admin.sidebar.news_list': 'Haberler',
  'admin.sidebar.stories': 'Hikayeler',
  'admin.sidebar.users': 'Kullanıcılar',
  'admin.sidebar.publishers': 'Yayıncılar',
  'admin.sidebar.navigation': 'Menü & Kategori',
  'admin.sidebar.roles': 'Roller & İzinler',
  'admin.sidebar.settings': 'Ayarlar',
  'admin.sidebar.languages': 'Dil Ayarları',
  'admin.header.my_account': 'Hesabım'
};

const App: React.FC = () => {
  const { currentLang, t } = useLanguage();
  const defaultFaviconHrefRef = useRef<string | null>(null);
  const defaultDocumentTitleRef = useRef<string | null>(null);

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

  const getAdminTabLabel = useCallback((tabId: string) => {
    const key = ADMIN_TAB_LABEL_KEYS[tabId];
    if (!key) return tabId.replace(/_/g, ' ');
    const translated = t(key);
    if (translated && translated !== key) return translated;
    const fallback = ADMIN_TAB_LABEL_FALLBACKS[key];
    if (fallback) return fallback;
    return tabId.replace(/_/g, ' ');
  }, [t]);

  const getAdminTabSlug = useCallback((tabId: string) => {
    const slug = slugify(getAdminTabLabel(tabId));
    if (slug) return slug;
    return slugify(tabId.replace(/_/g, ' ')) || tabId;
  }, [getAdminTabLabel]);

  const adminTabSlugMap = useMemo(() => {
    const map = new Map<string, string>();
    Object.keys(ADMIN_TAB_LABEL_KEYS).forEach((tabId) => {
      const slug = getAdminTabSlug(tabId);
      if (slug) map.set(slug, tabId);
      map.set(tabId, tabId);
      map.set(tabId.replace(/_/g, '-'), tabId);
      const fallbackSlug = slugify(tabId.replace(/_/g, ' '));
      if (fallbackSlug) map.set(fallbackSlug, tabId);
    });
    return map;
  }, [getAdminTabSlug]);

  const parseAdminPath = useCallback((pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] !== 'admin') return null;
    if (!segments[1]) return { tab: 'overview', userId: null };

    const tabSegment = decodeURIComponent(segments[1]);
    const normalizedTab = slugify(tabSegment);
    const tabId = adminTabSlugMap.get(tabSegment) || adminTabSlugMap.get(normalizedTab);

    if (!tabId) return { tab: 'overview', userId: null };

    const userId = segments[2] ? decodeURIComponent(segments[2]) : null;
    if (tabId === 'news_list' && userId) return { tab: 'edit_post', userId };
    if (tabId === 'publishers' && userId) return { tab: 'edit_publisher', userId };
    if (tabId === 'users' && userId) return { tab: 'edit_user', userId };
    return { tab: tabId, userId: null };
  }, [adminTabSlugMap]);

  const buildAdminPath = useCallback((tab: string, userId?: string | null) => {
    const safeTab = tab || 'overview';
    const safeId = userId ? encodeURIComponent(userId) : '';

    if (safeTab === 'edit_post') {
      const listSlug = getAdminTabSlug('news_list');
      return safeId ? `/admin/${listSlug}/${safeId}` : `/admin/${listSlug}`;
    }
    if (safeTab === 'edit_publisher') {
      const baseSlug = getAdminTabSlug('publishers');
      return safeId ? `/admin/${baseSlug}/${safeId}` : `/admin/${baseSlug}`;
    }
    if (safeTab === 'edit_user') {
      const baseSlug = getAdminTabSlug('users');
      return safeId ? `/admin/${baseSlug}/${safeId}` : `/admin/${baseSlug}`;
    }

    const slug = getAdminTabSlug(safeTab);
    return `/admin/${slug}`;
  }, [getAdminTabSlug]);

  const updateAdminUrl = useCallback((tab: string, userId?: string | null) => {
    const path = buildAdminPath(tab, userId);
    if (window.location.pathname !== path) window.history.pushState(null, '', path);
  }, [buildAdminPath]);

  // --- UI STATES ---
  const [view, setView] = useState<ViewType>(() => {
    const s = window.location.pathname.split('/').filter(Boolean);
    if (s[0] === 'haber') return 'detail';
    if (s[0] === 'admin') return 'admin';
    if (s[0] === 'giris') return 'login';
    if (s[0] === 'kategoriler') return 'categories';
    if (s[0] === 'ilceler') return 'districts';
    if (s[0] === 'trendler') return 'trends';
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

  const [adminTab, setAdminTab] = useState<string>('overview');
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [profileUserName, setProfileUserName] = useState<string | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
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
          const postIds = postsData.map(p => p.id).filter(isUUID);
          if (postIds.length > 0) {
            const [likes, saves] = await Promise.all([
              supabase.from('post_likes').select('post_id').in('post_id', postIds).eq('user_id', user.id),
              supabase.from('post_saves').select('post_id').in('post_id', postIds).eq('user_id', user.id)
            ]);
            userLikes = (likes.data || []).map(l => l.post_id);
            userSaves = (saves.data || []).map(s => s.post_id);
          }
        }

        const mappedNews: NewsItem[] = postsData.map((item: any) => {
          const profile = item.profiles;
          const homepageItem = (item.items || []).find((i: any) => i.showOnHomepage === true);
          let cardType = item.type?.toUpperCase() || 'STANDARD';
          const coverThumbnail = item.thumbnail_url || 'https://picsum.photos/800/600';
          const coverThumbnailAlt = item.thumbnail_alt || '';
          let extraData: any = { postType: item.type, coverThumbnail, coverThumbnailAlt };
          if (homepageItem) {
            const { id: _ignoreId, ...homepagePayload } = homepageItem;
            cardType = homepageItem.type?.toUpperCase();
            if (homepageItem.type === 'slider') cardType = 'GALLERY';
            extraData = {
              ...extraData,
              ...homepagePayload,
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
            ...(homepageItem?.type === 'poll'
              ? { title: item.title, summary: item.summary, blockTitle: homepageItem.title, blockDescription: homepageItem.description }
              : {}),
            type: cardType as any,
            // 🚀 Advanced SEO Mapping
            seoTitle: item.seo_title,
            seoDescription: item.seo_description,
            keywords: item.keywords,
            slug: item.slug,
            factChecked: item.fact_checked,
            schemaType: item.schema_type
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
      let query = supabase
        .from('posts')
        .select(`*, profiles:publisher_id (id, username, full_name, avatar_url, role)`);

      if (isUUID(newsId)) {
        query = query.eq('id', newsId);
      } else {
        query = query.eq('slug', newsId);
      }

      const { data: item, error } = await query.maybeSingle();

      if (error) throw error;
      if (item) {
        const profile = item.profiles;
        const homepageItem = (item.items || []).find((i: any) => i.showOnHomepage === true);
        let cardType = item.type?.toUpperCase() || 'STANDARD';
        const coverThumbnail = item.thumbnail_url || 'https://picsum.photos/800/600';
        const coverThumbnailAlt = item.thumbnail_alt || '';
        let extraData: any = { postType: item.type, coverThumbnail, coverThumbnailAlt };
        if (homepageItem) {
          const { id: _ignoreId, ...homepagePayload } = homepageItem;
          cardType = homepageItem.type?.toUpperCase();
          if (homepageItem.type === 'slider') cardType = 'GALLERY';
          extraData = { ...extraData, ...homepagePayload };
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
          ...(homepageItem?.type === 'poll'
            ? { title: item.title, summary: item.summary, blockTitle: homepageItem.title, blockDescription: homepageItem.description }
            : {}),
          type: cardType as any,
          // 🚀 Advanced SEO Mapping
          seoTitle: item.seo_title,
          seoDescription: item.seo_description,
          keywords: item.keywords,
          slug: item.slug,
          factChecked: item.fact_checked,
          schemaType: item.schema_type
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
      if (segments[0] === 'admin') {
        const parsed = parseAdminPath(window.location.pathname);
        setView('admin');
        if (parsed) {
          setAdminTab(parsed.tab);
          setAdminUserId(parsed.userId);
        }
      } else if (segments[0] === 'haber' && segments[1]) {
        setSelectedNewsId(segments[1]);
        setView('detail');
      } else if (segments[0] === 'kategori' && segments[1]) {
        const cat = decodeURIComponent(segments[1]);
        setSelectedCategory(cat);
        setView('feed');
        fetchNews(cat);
      } else if (segments[0] === 'kategoriler') {
        setView('categories');
      } else if (segments[0] === 'ilceler') {
        setView('districts');
      } else if (segments[0] === 'trendler') {
        setView('trends');
      } else if (segments[0] === 'user' && segments[1]) {
        const value = decodeURIComponent(segments[1]);
        if (isUUID(value)) {
          setProfileUserId(value);
          setProfileUserName(null);
        } else {
          setProfileUserName(value);
          setProfileUserId(null);
        }
        setView('user_detail');
      } else if (segments[0] === 'profil' || segments[0] === 'profile') {
        const name = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0];
        if (name) setProfileUserName(name);
        if (session?.user?.id) setProfileUserId(session.user.id);
        setView('user_detail');
      } else if (segments[0] === 'profil-duzenle' || segments[0] === 'profile-edit') {
        setView('edit_user_profile');
      } else if (segments[0] === 'kullanicilar') {
        setView('users');
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
  }, [fetchNews, parseAdminPath]);

  useEffect(() => { init(); }, [currentLang.code]);

  useEffect(() => {
    const parsed = parseAdminPath(window.location.pathname);
    if (!parsed) return;
    setView('admin');
    setAdminTab(parsed.tab);
    setAdminUserId(parsed.userId);
  }, [parseAdminPath]);

  useEffect(() => {
    const handler = (event: Event) => {
      const updated = (event as CustomEvent<SiteSettings>).detail;
      if (!updated || !updated.language_code) return;

      try {
        localStorage.setItem(
          `${CACHE_CONFIG.PREFIX}${CACHE_CONFIG.KEYS.SETTINGS}_${updated.language_code}`,
          JSON.stringify({ data: updated, ts: Date.now() })
        );
      } catch (e) { }

      if (updated.language_code === currentLang.code) {
        setSiteSettings(updated);
      }
    };

    window.addEventListener('buzz:site_settings_updated', handler);
    return () => window.removeEventListener('buzz:site_settings_updated', handler);
  }, [currentLang.code]);

  useEffect(() => {
    const iconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (defaultFaviconHrefRef.current === null) {
      defaultFaviconHrefRef.current = iconLink?.getAttribute('href') || '';
    }

    const nextHref = (siteSettings?.favicon_url || '').trim() || (defaultFaviconHrefRef.current || '');
    if (!nextHref) return;

    const ensureIconLink = (rel: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', nextHref);
    };

    ensureIconLink('icon');
    ensureIconLink('shortcut icon');
  }, [siteSettings?.favicon_url]);

  // --- SEO & TAB TITLE ENGINE ---
  useEffect(() => {
    if (!isAppReady) return;

    if (defaultDocumentTitleRef.current === null) {
      defaultDocumentTitleRef.current = document.title;
    }

    const siteName = (siteSettings?.site_name || '').trim();
    const homeTitle = (siteSettings?.home_title || '').trim();

    let title = homeTitle || siteName || (defaultDocumentTitleRef.current || document.title);
    let description = siteSettings?.meta_description || '';
    let keywords = siteSettings?.meta_keywords || '';

    let ogImage = (siteSettings?.og_image_url || '').trim();

    if (view === 'admin') {
      const adminSection = getAdminTabLabel(adminTab || 'overview');
      title = siteName ? `${adminSection} | ${siteName}` : adminSection;
      const script = document.getElementById('news-structured-data');
      if (script) script.remove();
    } else if (view === 'detail' && selectedNewsId) {
      const news = newsItems.find(n => n.id === selectedNewsId);
      if (news) {
        // Priority: SEO Title > Title
        title = news.seoTitle || (siteName ? `${news.title} | ${siteName}` : news.title);
        description = news.seoDescription || news.summary || description;
        keywords = news.keywords || keywords;
        ogImage = (news.thumbnail || news.mediaUrl || ogImage || '').trim();

        // 🚀 GENERATIVE ENGINE OPTIMIZATION (GEO) - JSON-LD
        const jsonLd: any = {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": news.schemaType || "NewsArticle",
              "headline": news.seoTitle || news.title,
              "description": news.seoDescription || news.summary,
              "image": [news.thumbnail || news.mediaUrl],
              "datePublished": news.timestamp,
              "dateModified": news.timestamp,
              "author": [{
                "@type": "Person",
                "name": news.author,
                "url": window.location.origin
              }],
              "publisher": {
                "@type": "Organization",
                "name": siteName || window.location.hostname,
                "logo": {
                  "@type": "ImageObject",
                  "url": siteSettings?.logo_url || ""
                }
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": window.location.href
              }
            }
          ]
        };

        if (news.faqData && news.faqData.length > 0) {
          jsonLd["@graph"].push({
            "@type": "FAQPage",
            "mainEntity": news.faqData.map(item => ({
              "@type": "Question",
              "name": item.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.a
              }
            }))
          });
        }

        let script = document.getElementById('news-structured-data');
        if (!script) {
          script = document.createElement('script');
          script.id = 'news-structured-data';
          script.setAttribute('type', 'application/ld+json');
          document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(jsonLd);
      }
    } else if (selectedCategory) {
      const navItem = navigationItems.find(i => i.value === selectedCategory || i.label === selectedCategory);
      if (navItem) {
        title = siteName ? `${t(navItem.label)} | ${siteName}` : t(navItem.label);
      }
      // Remove detail specific schema if not on detail view
      const script = document.getElementById('news-structured-data');
      if (script) script.remove();
    } else {
      title = siteSettings?.home_title || siteSettings?.site_name || title;
      const script = document.getElementById('news-structured-data');
      if (script) script.remove();
    }

    document.title = title;

    // Meta Update (Pure JS for 0-dependency SEO)
    const updateMeta = (name: string, content: string | null | undefined, attr: 'name' | 'property' = 'name') => {
      const normalized = typeof content === 'string' ? content.trim() : '';
      let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
      if (!normalized) {
        if (el) el.remove();
        return;
      }
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', normalized);
    };

    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('og:title', title, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:url', window.location.href, 'property');
    updateMeta('og:type', view === 'detail' ? 'article' : 'website', 'property');
    updateMeta('og:image', ogImage, 'property');
    updateMeta('robots', siteSettings?.robots_txt || 'index, follow');

    // Canonical Link Update
    let canonical = document.querySelector('link[rel="canonical"]');
    const currentUrl = window.location.origin + window.location.pathname;

    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', view === 'detail' ? currentUrl : (siteSettings?.canonical_url || currentUrl));
  }, [view, adminTab, selectedNewsId, selectedCategory, siteSettings, newsItems, navigationItems, isAppReady, t, getAdminTabLabel]);

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
    else if (newView === 'admin') path = buildAdminPath(adminTab, adminUserId);
    else if (newView === 'categories') path = '/kategoriler';
    else if (newView === 'districts') path = '/ilceler';
    else if (newView === 'trends') path = '/trendler';
    else if (newView === 'user_detail' && category) path = `/user/${encodeURIComponent(category)}`;
    else if (newView === 'user_detail' && !category) path = `/profile`;
    else if (newView === 'edit_user_profile') path = '/profile-edit';
    else if (newView === 'users') path = '/kullanicilar';
    else if (newView === 'login') path = '/giris';

    if (window.location.pathname !== path) window.history.pushState(null, '', path);
  };

  const handleAdminTabChange = useCallback((tab: string, userId?: string) => {
    const normalizedUserId = userId ? userId : null;
    setAdminTab(tab);
    setAdminUserId(normalizedUserId);
    updateAdminUrl(tab, normalizedUserId);
  }, [updateAdminUrl]);

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
      {view !== 'admin' && (
        <Navbar
          onHomeClick={() => {
            const lastCat = localStorage.getItem(`${CACHE_CONFIG.PREFIX}${CACHE_CONFIG.KEYS.LAST_CAT}`);
            setView('feed');
            setSelectedCategory(lastCat);
            updateUrl('feed', lastCat);
            fetchNews(lastCat);
          }}
          onProfileClick={() => {
            setView('login');
            updateUrl('login');
          }}
          onAdminClick={() => {
            setView('admin');
            updateAdminUrl(adminTab, adminUserId);
          }}
          onProfileViewClick={() => {
            const name = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0];
            if (name && session?.user?.id) {
              setProfileUserName(name);
              setProfileUserId(session.user.id);
              setView('user_detail');
              updateUrl('user_detail', name);
            }
          }}
          onEditProfileClick={() => {
            setView('edit_user_profile');
            updateUrl('edit_user_profile');
          }}
          onLogout={async () => {
            await supabase.auth.signOut();
            setSession(null);
            setView('feed');
            updateUrl('feed');
          }}
          isLoggedIn={!!session}
          user={session?.user}
          navItems={navigationItems}
          siteSettings={siteSettings}
        />
      )}

      <main className={`${view === 'admin' ? 'max-w-full pt-0 gap-0 px-0' : 'max-w-[1280px] pt-[72px] gap-8 px-4'} mx-auto flex justify-center items-start`}>
        {view !== 'detail' && view !== 'admin' && view !== 'login' && (
          <aside className="hidden lg:block w-[260px] flex-shrink-0 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto pb-8 no-scrollbar">
            <Sidebar
              items={navigationItems}
              activeCategory={selectedCategory}
              onCategoryItemClick={handleCategorySelect}
              onAllCategoriesClick={() => {
                setView('categories');
                updateUrl('categories');
              }}
              onAllDistrictsClick={() => {
                setView('districts');
                updateUrl('districts');
              }}
              onAllTrendsClick={() => {
                setView('trends');
                updateUrl('trends');
              }}
            />
          </aside>
        )}

        <section className="flex-1 min-w-0 pb-10 flex justify-center w-full">
          <div className={`w-full ${view === 'admin' ? '' : 'max-w-[840px]'}`}>
            {view === 'feed' ? (
              <Feed newsData={newsItems} title={currentCategoryLabel || undefined} onNewsSelect={handleNewsSelect} storiesData={storiesItems} siteSettings={siteSettings} navItems={navigationItems} />
            ) : view === 'detail' && selectedNewsId ? (
              <NewsDetail
                data={newsItems.find(n => n.id === selectedNewsId) || ({} as any)}
                onBack={() => { setView('feed'); updateUrl('feed', selectedCategory); }}
                navItems={navigationItems}
              />
            ) : view === 'admin' ? (
              <React.Suspense fallback={<MainLoading />}>
                <AdminDashboard
                  initialTab={adminTab || 'overview'}
                  initialUserId={adminUserId || undefined}
                  onTabChange={handleAdminTabChange}
                  siteSettings={siteSettings}
                  onLogout={() => {
                    setView('feed');
                    updateUrl('feed', selectedCategory);
                  }}
                />
              </React.Suspense>
            ) : view === 'login' ? (
              <React.Suspense fallback={<MainLoading />}><Login onBack={() => setView('feed')} /></React.Suspense>
            ) : view === 'categories' ? (
              <CategoriesList
                onBack={() => { setView('feed'); updateUrl('feed', selectedCategory); }}
                onCategorySelect={(cat) => {
                  setSelectedCategory(cat);
                  setView('feed');
                  updateUrl('feed', cat);
                  fetchNews(cat);
                }}
              />
            ) : view === 'districts' ? (
              <DistrictsList
                onBack={() => { setView('feed'); updateUrl('feed', selectedCategory); }}
                onDistrictSelect={(dist) => {
                  setSelectedCategory(dist);
                  setView('feed');
                  updateUrl('feed', dist);
                  fetchNews(dist);
                }}
              />
            ) : view === 'trends' ? (
              <TrendsList
                onBack={() => { setView('feed'); updateUrl('feed', selectedCategory); }}
                onTrendSelect={(trend) => {
                  setSelectedCategory(trend);
                  setView('feed');
                  updateUrl('feed', trend);
                  fetchNews(trend);
                }}
              />
            ) : view === 'user_detail' ? (
              <UserProfile
                userId={profileUserId || undefined}
                name={profileUserName || ''}
                onBack={() => { setView('feed'); updateUrl('feed', selectedCategory); }}
                onNewsSelect={handleNewsSelect}
                onEditClick={() => { setView('edit_user_profile'); updateUrl('edit_user_profile'); }}
                siteSettings={siteSettings}
              />
            ) : view === 'edit_user_profile' ? (
              <UserEditProfile
                userId={session?.user?.id}
                name={session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || ''}
                onBack={() => { setView('user_detail'); updateUrl('user_detail', selectedCategory); }}
              />
            ) : view === 'users' ? (
              <UsersList
                onBack={() => { setView('feed'); updateUrl('feed', selectedCategory); }}
                onUserSelect={(name) => {
                  setProfileUserName(name);
                  setProfileUserId(null); // Reset ID when selecting by name
                  setView('user_detail');
                  updateUrl('user_detail', name);
                }}
              />
            ) : null}
          </div>
        </section>

        {(view === 'feed' || view === 'detail') && (
          <aside className="hidden xl:block w-[320px] flex-shrink-0 pb-8">
            <RightSidebar newsData={newsItems} />
          </aside>
        )}
      </main>
    </div>
  );
};

export default App;
