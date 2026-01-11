
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, UserPlus, MessageSquare, Share2, Users, Calendar, TrendingUp, Grid, Info, Settings2, Sparkles, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import NewsCard from './NewsCard';
import { NewsItem, SiteSettings } from '../types';

interface UserProfileProps {
  userId?: string;
  name: string;
  onBack: () => void;
  onNewsSelect: (id: string) => void;
  onEditClick?: () => void;
  siteSettings?: SiteSettings | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, name, onBack, onNewsSelect, onEditClick, siteSettings }) => {
  const [activeTab, setActiveTab] = useState<'news' | 'popular' | 'about'>('news');
  const [isFollowing, setIsFollowing] = useState(false);
  const [userData, setUserData] = useState<any>(() => {
    try {
      const cached = localStorage.getItem(`pateez_v2025_user_profile_${name}`);
      return cached ? JSON.parse(cached).data : null;
    } catch (e) { return null; }
  });
  const [userNews, setUserNews] = useState<NewsItem[]>(() => {
    try {
      const cached = localStorage.getItem(`pateez_v2025_user_profile_${name}`);
      return cached ? JSON.parse(cached).news : [];
    } catch (e) { return []; }
  });
  const [loading, setLoading] = useState(() => !localStorage.getItem(`pateez_v2025_user_profile_${name}`));
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const cacheKey = `pateez_v2025_user_profile_${name}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, news } = JSON.parse(cached);
      setUserData(data);
      setUserNews(news);
      setLoading(false);
    }

    const fetchData = async () => {
      try {
        if (!cached) setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        let query = supabase.from('profiles').select('*');
        if (userId) {
          query = query.eq('id', userId);
        } else {
          query = query.or(`full_name.eq."${name}",username.eq."${name}"`);
        }

        const { data: profile, error: profileError } = await query
          .select('id, full_name, username, expertise, about_me, avatar_url, social_links, created_at, role')
          .maybeSingle();

        if (profileError) throw profileError;

        if (profile) {
          if (user && user.id === profile.id) {
            setIsOwnProfile(true);
          }

          // Fetch posts count
          const { count: postsCountData, error: countError } = await supabase
            .from('posts')
            .select('id', { count: 'exact', head: true })
            .eq('publisher_id', profile.id)
            .eq('status', 'published');

          const t = Date.now();
          const newData = {
            id: profile.id,
            name: profile.full_name || profile.username,
            handle: `@${profile.username}`,
            category: profile.expertise || 'Haber Yazarı',
            description: profile.about_me || '',
            avatar: profile.avatar_url ? `${profile.avatar_url}${profile.avatar_url.includes('?') ? '&' : '?'}t=${t}` : '',
            cover: profile.social_links?.cover_url ? `${profile.social_links.cover_url}${profile.social_links.cover_url.includes('?') ? '&' : '?'}t=${t}` : '',
            followers: '0',
            postsCount: (postsCountData || 0).toString(),
            joinedDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }) : '',
            verified: profile.role === 'admin' || profile.role === 'editor'
          };
          setUserData(newData);

          // Fetch news
          const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select('*')
            .eq('publisher_id', profile.id)
            .eq('status', 'published')
            .order('published_at', { ascending: false });

          if (postsError) throw postsError;

          if (postsData) {
            const mappedNews: NewsItem[] = postsData.map((item: any) => {
              const items = item.items || [];
              const homepageItem = items.find((i: any) => i.showOnHomepage === true);
              let cardType = item.type;
              let extraData: any = {};
              if (homepageItem) {
                cardType = homepageItem.type?.toUpperCase();
                if (homepageItem.type === 'beforeafter') { cardType = 'BEFORE_AFTER'; extraData.beforeAfterData = homepageItem.beforeAfterData; }
                else if (homepageItem.type === 'flipcard') { cardType = 'FLIP_CARD'; extraData.flipData = homepageItem.flipData; }
                else if (homepageItem.type === 'review') { cardType = 'REVIEW'; extraData.reviewData = homepageItem.reviewData; }
                else if (homepageItem.type === 'poll') { cardType = 'POLL'; extraData.options = homepageItem.options; }
                else if (homepageItem.type === 'slider') { cardType = 'GALLERY'; extraData.mediaList = homepageItem.mediaUrls; }
              } else { cardType = 'STANDARD'; }

              return {
                id: item.id,
                type: cardType as any,
                title: item.title,
                summary: item.summary,
                category: item.category,
                source: profile.full_name || profile.username,
                author: profile.full_name || 'Editör',
                timestamp: item.published_at ? new Date(item.published_at).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '',
                mediaUrl: item.media_url || '',
                thumbnail: item.thumbnail_url || '',
                likes: item.likes_count || 0,
                comments: item.comments_count || 0,
                shares: item.shares_count || 0,
                ...extraData
              };
            });
            setUserNews(mappedNews);
            localStorage.setItem(cacheKey, JSON.stringify({ data: newData, news: mappedNews }));
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [name, userId]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-[5px] h-12 w-12 border-b-2 border-palette-red"></div>
    </div>
  );

  if (!userData) return (
    <div className="text-center py-20 bg-white rounded-[5px] border border-gray-200">
      <p className="text-gray-500 font-bold">Kullanıcı bulunamadı.</p>
      <button onClick={onBack} className="mt-4 text-blue-600 font-bold hover:underline">Geri Dön</button>
    </div>
  );

  return (
    <div className="animate-in bg-white rounded-[5px] border border-gray-200 shadow-sm overflow-hidden mb-10">

      {/* HEADER: Cover */}
      <div className="relative h-48 md:h-60 overflow-hidden bg-gray-100">
        {userData.cover ? (
          <img src={userData.cover} className="w-full h-full object-cover" alt="Cover" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Sparkles className="text-gray-300" size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
          <button
            onClick={onBack}
            className="p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[5px] text-white hover:bg-white/30 transition-all shadow-lg active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex gap-2">
            {isOwnProfile && (
              <button
                onClick={onEditClick}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[5px] text-white hover:bg-white/30 transition-all shadow-lg active:scale-95 text-[10px] font-black uppercase tracking-widest"
              >
                <Settings2 size={16} />
                <span>Ayarlar</span>
              </button>
            )}
            <button className="p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[5px] text-white hover:bg-white/30 transition-all shadow-lg active:scale-95">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* PROFILE INFO */}
      <div className="px-6 md:px-10 relative">

        {/* Avatar */}
        <div className="absolute -top-12 left-6 md:left-10 w-28 h-28 rounded-[5px] border-4 border-white overflow-hidden shadow-xl bg-gray-100 z-10">
          {userData.avatar ? (
            <img src={userData.avatar} className="w-full h-full object-cover" alt="Avatar" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <User className="text-gray-300" size={32} />
            </div>
          )}
        </div>

        {/* Action Area */}
        <div className="pt-18 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-16 md:mt-0 md:pt-4">
            <div className="md:ml-32">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{userData.name}</h1>
                {userData.verified && <CheckCircle2 size={18} className="text-blue-500 fill-blue-500/10" />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 tracking-tight">{userData.handle}</span>
                {userData.category && (
                  <>
                    <span className="w-1 h-1 bg-gray-200 rounded-[5px]" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{userData.category}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <button
                  onClick={onEditClick}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-gray-900 text-white border border-gray-900 rounded-[5px] font-black text-[10px] uppercase tracking-widest transition-all hover:bg-blue-600 hover:border-blue-600 active:scale-95 shadow-sm"
                >
                  Profili Düzenle
                </button>
              ) : (
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-[5px] font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm border ${isFollowing
                    ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                    : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {isFollowing ? 'Takip Ediliyor' : <><UserPlus size={14} /> Takip Et</>}
                </button>
              )}
              <button className="p-2.5 bg-gray-50 text-gray-400 border border-gray-100 rounded-[5px] hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm active:scale-90">
                <MessageSquare size={18} />
              </button>
            </div>
          </div>

          <p className="mt-6 text-[13px] text-gray-600 font-medium leading-relaxed max-w-2xl">
            {userData.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-6 items-center pt-6 border-t border-gray-50">
            {userData.followers !== '0' && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gray-50 text-gray-400 rounded-[5px]">
                  <Users size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-gray-900 leading-none">{userData.followers}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Takipçi</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-50 text-gray-400 rounded-[5px]">
                <TrendingUp size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 leading-none">{userData.postsCount}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">İçerik</span>
              </div>
            </div>
            {userData.joinedDate && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gray-50 text-gray-400 rounded-[5px]">
                  <Calendar size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-gray-900 leading-none">{userData.joinedDate}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Katıldı</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-8 px-6 md:px-10 border-b border-gray-50">
        <button
          onClick={() => setActiveTab('news')}
          className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'news' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Haberler
          {activeTab === 'news' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('popular')}
          className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'popular' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Popüler
          {activeTab === 'popular' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'about' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Hakkında
          {activeTab === 'about' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="p-6 md:p-10 bg-gray-50/50">
        {activeTab === 'news' && (
          <div className="grid grid-cols-1 gap-8">
            {userNews.length > 0 ? (
              userNews.map((news) => (
                <NewsCard key={news.id} data={news} onClick={() => onNewsSelect(news.id)} siteSettings={siteSettings} />
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Henüz içerik bulunmuyor.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-2xl bg-white p-8 rounded-[5px] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Hakkında</h3>
            <p className="text-[14px] text-gray-700 font-medium leading-relaxed">
              {userData.description || 'Bu kullanıcı henüz bir biyografi eklememiş.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
