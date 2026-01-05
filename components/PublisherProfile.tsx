
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, UserPlus, MessageSquare, Share2, Users, Calendar, TrendingUp, Grid, Info, Settings2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import NewsCard from './NewsCard';
import { NewsItem } from '../types';

interface PublisherProfileProps {
  name: string;
  onBack: () => void;
  onNewsSelect: (id: string) => void;
  onEditClick?: () => void;
}

const PublisherProfile: React.FC<PublisherProfileProps> = ({ name, onBack, onNewsSelect, onEditClick }) => {
  const [activeTab, setActiveTab] = useState<'news' | 'popular' | 'about'>('news');
  const [isFollowing, setIsFollowing] = useState(false);
  const [publisherData, setPublisherData] = useState<any>(null);
  const [publisherNews, setPublisherNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Örn: Eğer giriş yapan kullanıcı bu yayıncı ise düzenleme butonunu göster
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch current user to check own profile
        const { data: { user } } = await supabase.auth.getUser();

        // 2. Fetch publisher profile by name (assuming name is shared as full_name or username)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .or(`full_name.eq."${name}",username.eq."${name}"`)
          .single();

        if (profileError) throw profileError;

        if (profile) {
          setPublisherData({
            name: profile.full_name || profile.username,
            handle: `@${profile.username}`,
            category: profile.expertise || 'Gündem',
            description: profile.about_me || 'Buzz Haber yayıncısı.',
            avatar: profile.avatar_url || `https://picsum.photos/seed/${profile.id}/400`,
            cover: `https://picsum.photos/seed/${profile.id}cover/1600/600`,
            followers: '1.2M',
            following: '124',
            postsCount: '14.2K',
            joinedDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }) : 'Ekim 2021',
            verified: true
          });

          if (user && user.id === profile.id) {
            setIsOwnProfile(true);
          }

          // 3. Fetch publisher news
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
                // Basic mapping (similar to App.tsx)
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
                thumbnail: item.thumbnail_url || 'https://picsum.photos/800/600',
                likes: item.likes_count || 0,
                comments: item.comments_count || 0,
                shares: item.shares_count || 0,
                ...extraData
              };
            });
            setPublisherNews(mappedNews);
          }
        }
      } catch (err) {
        console.error('Error fetching publisher profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [name]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-[5px] h-12 w-12 border-b-2 border-palette-red"></div>
    </div>
  );

  if (!publisherData) return (
    <div className="text-center py-20 bg-white rounded-[5px] border border-gray-200">
      <p className="text-gray-500 font-bold">Yayıncı bulunamadı.</p>
      <button onClick={onBack} className="mt-4 text-blue-600 font-bold hover:underline">Geri Dön</button>
    </div>
  );

  return (
    <div className="animate-in bg-white rounded-[5px] border border-gray-200 shadow-sm overflow-hidden mb-10">

      {/* HEADER: Cover */}
      <div className="relative h-48 md:h-60 overflow-hidden">
        <img src={publisherData.cover} className="w-full h-full object-cover" alt="Cover" />
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
          <img src={publisherData.avatar} className="w-full h-full object-cover" alt="Avatar" />
        </div>

        {/* Action Area */}
        <div className="pt-18 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-16 md:mt-0 md:pt-4">
            <div className="md:ml-32">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{publisherData.name}</h1>
                {publisherData.verified && <CheckCircle2 size={18} className="text-blue-500 fill-blue-500/10" />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 tracking-tight">{publisherData.handle}</span>
                <span className="w-1 h-1 bg-gray-200 rounded-[5px]" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{publisherData.category}</span>
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
            {publisherData.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-6 items-center pt-6 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-50 text-gray-400 rounded-[5px]">
                <Users size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 leading-none">{publisherData.followers}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Takipçi</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-50 text-gray-400 rounded-[5px]">
                <TrendingUp size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 leading-none">{publisherData.postsCount}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">İçerik</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-50 text-gray-400 rounded-[5px]">
                <Calendar size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 leading-none">{publisherData.joinedDate}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Katılım</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS & NEWS LIST */}
      <div className="flex gap-2 border-b border-gray-100 px-6 md:px-10 bg-gray-50/50">
        {[
          { id: 'news', label: 'Tüm Haberler', icon: Grid },
          { id: 'popular', label: 'Popüler', icon: TrendingUp },
          { id: 'about', label: 'Hakkında', icon: Info },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all relative ${activeTab === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-6 md:p-10 bg-gray-50/20">
        {activeTab === 'news' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publisherNews.map(news => (
              <NewsCard key={news.id} data={news} onClick={() => onNewsSelect(news.id)} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default PublisherProfile;
