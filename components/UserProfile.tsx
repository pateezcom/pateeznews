
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, MessageSquare, Share2, Calendar, Settings2, Sparkles, User as UserIcon, Mail, Link as LinkIcon, Globe, Users, FileText, Eye, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
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

  const [isFollowing, setIsFollowing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [userNews, setUserNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const normalizeProfileMediaUrl = (input: any): string => {
    if (!input) return '';
    const url = String(input).trim();
    if (!url) return '';
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('data:') ||
      url.startsWith('/')
    ) {
      return url;
    }
    if (url.startsWith('api/storage/file/')) return `/${url}`;
    if (url.startsWith('profile/')) return `/api/storage/file/${url}`;
    return `/api/storage/file/profile/${url}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        // Query building - Standardized and robust
        let profileQuery = supabase
          .from('profiles')
          .select('id, full_name, username, expertise, about_me, avatar_url, social_links, created_at, role, email');

        if (userId) {
          profileQuery = profileQuery.eq('id', userId);
        } else {
          // Search by name or username (case-insensitive and handles spaces)
          profileQuery = profileQuery.or(`full_name.ilike."${name}",username.ilike."${name}"`);
        }

        const { data: profile, error: profileError } = await profileQuery.maybeSingle();

        if (profileError) throw profileError;

        if (profile) {
          if (currentUser && currentUser.id === profile.id) {
            setIsOwnProfile(true);
          }

          const { count: postsCountData } = await supabase
            .from('posts')
            .select('id', { count: 'exact', head: true })
            .eq('publisher_id', profile.id)
            .eq('status', 'published');

          // Parse social links safely
          let socialLinks = {};
          try {
            if (profile.social_links) {
              if (typeof profile.social_links === 'string') {
                try {
                  socialLinks = JSON.parse(profile.social_links);
                } catch (e) {
                  console.error("Error parsing social_links JSON:", e);
                  socialLinks = {}; // Fallback to empty object on error
                }
              } else if (typeof profile.social_links === 'object') {
                socialLinks = profile.social_links;
              }
            }
          } catch (e) {
            console.error("Social links parsing error:", e);
          }

          const newData = {
            id: profile.id,
            name: profile.full_name || profile.username || 'Kullanıcı',
            handle: profile.username ? `@${profile.username}` : '',
            category: profile.expertise || 'Haber Yazarı',
            description: profile.about_me || '',
            email: profile.email || '',
            avatar: normalizeProfileMediaUrl(profile.avatar_url),
            cover: normalizeProfileMediaUrl((socialLinks as any)?.cover_url),
            followers: '0',
            postsCount: (postsCountData || 0).toString(),
            joinedDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
            verified: profile.role === 'admin' || profile.role === 'editor',
            social_links: socialLinks
          };
          setUserData(newData);

          const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select('*')
            .eq('publisher_id', profile.id)
            .eq('status', 'published')
            .order('published_at', { ascending: false });

          if (postsError) throw postsError;

          if (postsData) {
            const mappedNews: NewsItem[] = postsData.map((item: any) => {
              return {
                id: item.id,
                type: 'STANDARD',
                title: item.title,
                summary: item.summary,
                category: item.category,
                source: profile.full_name || profile.username,
                author: profile.full_name || 'Editör',
                timestamp: item.published_at ? new Date(item.published_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
                mediaUrl: item.media_url || '',
                thumbnail: item.thumbnail_url || item.media_url || '',
                likes: item.likes_count || 0,
                comments: item.comments_count || 0,
                shares: item.shares_count || 0,
                views: item.views_count || item.likes_count || 0
              } as any;
            });
            setUserNews(mappedNews);
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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-palette-red"></div>
    </div>
  );

  if (!userData) return (
    <div className="text-center py-20">
      <p className="text-gray-500 font-medium">Kullanıcı bulunamadı.</p>
      <button onClick={onBack} className="mt-4 px-6 py-2.5 bg-gray-900 text-white rounded-[5px] font-semibold text-sm hover:bg-gray-800 transition-all">Geri Dön</button>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">

      {/* HEADER: Cover with Modern Gradient Overlay */}
      <div className="relative w-full h-48 md:h-64 overflow-hidden">
        {userData.cover ? (
          <img src={userData.cover} className="w-full h-full object-cover" alt="Cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <UserIcon className="text-gray-300" size={80} strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Navigation Buttons */}
        <div className="absolute top-6 left-6 right-6 flex justify-between z-30">
          <button
            onClick={onBack}
            className="p-3 bg-white/90 backdrop-blur-xl rounded-[5px] text-gray-900 hover:bg-white transition-all shadow-2xl hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <button className="p-3 bg-white/90 backdrop-blur-xl rounded-[5px] text-gray-900 hover:bg-white transition-all shadow-2xl hover:scale-105 active:scale-95">
            <Share2 size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">

        {/* Profile Identity Bar with Modern Card Design */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 relative z-20 pb-8">

          {/* Avatar with Ring Animation */}
          <div className="relative">
            <div className="w-36 h-36 rounded-[5px] border-4 border-white shadow-2xl overflow-hidden bg-white">
              {userData.avatar ? (
                <img src={userData.avatar} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <UserIcon className="text-gray-400" size={56} strokeWidth={1.5} />
                </div>
              )}
            </div>
            {userData.verified && (
              <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 shadow-lg border-4 border-white">
                <CheckCircle2 size={20} className="text-white" strokeWidth={3} />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left md:pb-2">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className={`text-3xl font-bold ${userData.cover ? 'text-white' : 'text-gray-900'}`} style={{ textShadow: userData.cover ? '0 2px 10px rgba(0,0,0,0.5)' : 'none' }}>
                {userData.name}
              </h1>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1.5 mb-3">
              <span className="text-sm font-semibold text-gray-600">{userData.handle}</span>
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full hidden md:inline" />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                <Sparkles size={12} />
                {userData.category}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-[5px]">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Çevrimiçi
            </div>
          </div>

          {/* Action Buttons */}
          <div className="md:pb-2">
            {isOwnProfile ? (
              <button
                onClick={onEditClick}
                className="px-5 py-2 bg-gray-900 text-white rounded-[5px] font-semibold text-xs transition-all hover:bg-gray-800 shadow-md hover:shadow-lg active:scale-95"
              >
                Profili Düzenle
              </button>
            ) : (
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-8 py-3.5 rounded-[5px] font-bold text-sm transition-all active:scale-95 shadow-lg hover:shadow-xl ${isFollowing
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600'
                  }`}
              >
                {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-[5px] p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-[5px]">
                <FileText size={20} className="text-blue-600" strokeWidth={2} />
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Haberler</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{userData.postsCount}</p>
          </div>
          <div className="bg-white rounded-[5px] p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 rounded-[5px]">
                <Users size={20} className="text-purple-600" strokeWidth={2} />
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Takipçi</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{userData.followers}</p>
          </div>
          <div className="bg-white rounded-[5px] p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 rounded-[5px]">
                <Users size={20} className="text-emerald-600" strokeWidth={2} />
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Takip</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </div>
          <div className="bg-white rounded-[5px] p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-pink-50 rounded-[5px]">
                <Calendar size={20} className="text-pink-600" strokeWidth={2} />
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Katılım</p>
            </div>
            <p className="text-sm font-semibold text-gray-700">{userData.joinedDate?.split(' ')[2] || '-'}</p>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-12 gap-8 pb-20">

          {/* Left Column: Sidebar Details */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 space-y-6">

            {/* About Card */}
            <div className="bg-white rounded-[5px] p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Hakkında</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                {userData.description || 'Bu kullanıcı henüz hakkında bir bilgi eklememiş.'}
              </p>

              <div className="space-y-3 pt-3 border-t border-gray-100">
                {userData.joinedDate && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" strokeWidth={2} />
                    <span>{userData.joinedDate} tarihinde katıldı</span>
                  </div>
                )}
                {userData.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail size={16} className="text-gray-400" strokeWidth={2} />
                    <span className="truncate">{userData.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links Card */}
            <div className="bg-white rounded-[5px] p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Sosyal Bağlantılar</h3>
              <div className="flex flex-wrap gap-2">
                {['facebook', 'twitter', 'instagram', 'tiktok', 'youtube', 'discord', 'linkedin'].map((key) => {
                  const link = userData.social_links[key];
                  if (!link) return null;
                  return (
                    <a
                      key={key}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[40px] h-11 rounded-[5px] bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gradient-to-br hover:from-palette-red hover:to-red-600 hover:text-white transition-all hover:shadow-md hover:scale-105 active:scale-95"
                    >
                      <Globe size={18} strokeWidth={2} />
                    </a>
                  );
                })}
                {userData.social_links.personal_website_url && (
                  <a
                    href={userData.social_links.personal_website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[40px] h-11 rounded-[5px] bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gradient-to-br hover:from-palette-red hover:to-red-600 hover:text-white transition-all hover:shadow-md hover:scale-105 active:scale-95"
                  >
                    <LinkIcon size={18} strokeWidth={2} />
                  </a>
                )}
              </div>
            </div>

            {/* Following Preview Card */}
            <div className="bg-white rounded-[5px] p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Takip Edilen (12)</h3>
              <div className="flex -space-x-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-3 border-white shadow-md overflow-hidden bg-gray-100 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <img src={`https://picsum.photos/seed/p${i}/100`} className="w-full h-full object-cover" alt="" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-3 border-white flex items-center justify-center text-xs font-bold text-gray-600 shadow-md hover:scale-110 transition-transform cursor-pointer">
                  +7
                </div>
              </div>
            </div>

            {/* Followers Preview Card */}
            <div className="bg-white rounded-[5px] p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Takip Edenler ({userData.followers})</h3>
              <div className="flex -space-x-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-3 border-white shadow-md overflow-hidden bg-gray-100 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <img src={`https://picsum.photos/seed/f${i}/100`} className="w-full h-full object-cover" alt="" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-3 border-white flex items-center justify-center text-xs font-bold text-gray-600 shadow-md hover:scale-110 transition-transform cursor-pointer">
                  +5
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: News */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9">

            {/* News Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userNews.length > 0 ? (
                userNews.map((news) => (
                  <div
                    key={news.id}
                    className="group cursor-pointer bg-white rounded-[5px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => onNewsSelect(news.id)}
                  >
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      <img
                        src={news.thumbnail}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={news.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-gradient-to-r from-palette-red to-red-600 text-white text-[10px] font-bold rounded-[5px] shadow-lg">
                        {news.category}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2 group-hover:text-palette-red transition-colors line-clamp-2">
                        {news.title}
                      </h3>
                      {news.summary && (
                        <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
                          {news.summary}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                          <span>{news.author}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span>{news.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Eye size={14} strokeWidth={2} />
                            <span className="font-semibold">{news.views || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MessageSquare size={14} strokeWidth={2} />
                            <span className="font-semibold">{news.comments || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Heart size={14} strokeWidth={2} />
                            <span className="font-semibold">{news.likes || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-20 bg-white rounded-[5px] border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-[5px] flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-gray-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">Henüz içerik yayınlanmamış.</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default UserProfile;
