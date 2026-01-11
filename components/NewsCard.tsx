import { isUUID } from '../utils/helpers';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { CheckCircle2, Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { NewsItem, NewsType } from '../types';
import CommentSection from './CommentSection';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

// Kart Bileşenleri
import ReviewCard from './cards/ReviewCard';
import BeforeAfterCard from './cards/BeforeAfterCard';
import FlipCard from './cards/FlipCard';
import EmbedCard from './cards/EmbedCard';
import AudioCard from './cards/AudioCard';
import VideoCard from './cards/VideoCard';
import GalleryCard from './cards/GalleryCard';
import PollCard from './cards/PollCard';
import VSCard from './cards/VSCard';
import StandardCard from './cards/StandardCard';
import ParagraphCard from './cards/ParagraphCard';

interface NewsCardProps {
  data: NewsItem;
  onClick?: () => void;
  onSourceClick?: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ data, onClick, onSourceClick }) => {
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(data.userLiked || false);
  const [isDisliked, setIsDisliked] = useState(data.userDisliked || false);
  const [showComments, setShowComments] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(data.userSaved || false);
  const [likesCount, setLikesCount] = useState(data.likes || 0);
  const [dislikesCount, setDislikesCount] = useState(data.dislikes || 0);
  const [savesCount, setSavesCount] = useState(data.shares || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [publisherId, setPublisherId] = useState<string | null>(data.publisherId || null);
  const [isFollowing, setIsFollowing] = useState(data.isFollowingPublisher || false);

  // Kullanıcı ve mevcut like/save durumunu kontrol et
  useEffect(() => {
    const checkUserAndStatus = async () => {
      // Eğer ID bir UUID değilse (local data veya slug ise) Supabase sorgusunu atla
      if (!isUUID(data.id)) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);

          // Beğeni durumunu kontrol et
          const { data: likeData } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', data.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (likeData) setIsLiked(true);

          // Kaydetme durumunu kontrol et
          const { data: saveData } = await supabase
            .from('post_saves')
            .select('id')
            .eq('post_id', data.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (saveData) setIsBookmarked(true);

          // Beğenmeme durumunu kontrol et
          const { data: dislikeData } = await supabase
            .from('post_dislikes')
            .select('id')
            .eq('post_id', data.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (dislikeData) setIsDisliked(true);

          // Yayıncı bilgisini al (Takip durumu için)
          const { data: postInfo } = await supabase
            .from('posts')
            .select('publisher_id, dislikes_count')
            .eq('id', data.id)
            .maybeSingle();

          if (postInfo) {
            if (postInfo.dislikes_count) setDislikesCount(postInfo.dislikes_count);
            if (postInfo.publisher_id) {
              setPublisherId(postInfo.publisher_id);
              const { data: followData } = await supabase
                .from('publisher_follows')
                .select('id')
                .eq('publisher_id', postInfo.publisher_id)
                .eq('user_id', user.id)
                .maybeSingle();
              if (followData) setIsFollowing(true);
            }
          }
        }
      } catch (error) {
        // Kullanıcı giriş yapmamış veya hata
        console.error("Error checking user status:", error);
      }
    };

    checkUserAndStatus();
  }, [data.id]);

  const handleLike = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    if (!userId || !isUUID(data.id)) {
      if (!userId) showToast('Beğenmek için giriş yapmalısınız.', 'info');
      return;
    }

    const newIsLiked = !isLiked;
    const wasDisliked = isDisliked;

    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

    if (newIsLiked && wasDisliked) {
      setIsDisliked(false);
      setDislikesCount(prev => Math.max(0, prev - 1));
    }

    setIsLoading(true);
    try {
      if (newIsLiked) {
        await supabase.from('post_likes').insert({ post_id: data.id, user_id: userId });
        await supabase.from('posts').update({ likes_count: likesCount + 1 }).eq('id', data.id);

        if (wasDisliked) {
          await supabase.from('post_dislikes').delete().eq('post_id', data.id).eq('user_id', userId);
          await supabase.from('posts').update({ dislikes_count: Math.max(0, dislikesCount - 1) }).eq('id', data.id);
        }
      } else {
        await supabase.from('post_likes').delete().eq('post_id', data.id).eq('user_id', userId);
        await supabase.from('posts').update({ likes_count: Math.max(0, likesCount - 1) }).eq('id', data.id);
      }
    } catch (error) {
      // Revert states on error
      setIsLiked(!newIsLiked);
      setLikesCount(prev => newIsLiked ? Math.max(0, prev - 1) : prev + 1);
      if (newIsLiked && wasDisliked) {
        setIsDisliked(true);
        setDislikesCount(prev => prev + 1);
      }
      showToast('Beğeni işlemi başarısız oldu.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isLiked, isDisliked, isLoading, userId, data.id, likesCount, dislikesCount, showToast]);

  const handleDislike = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    if (!userId || !isUUID(data.id)) {
      if (!userId) showToast('Beğenmemek için giriş yapmalısınız.', 'info');
      return;
    }

    const newIsDisliked = !isDisliked;
    const wasLiked = isLiked;

    setIsDisliked(newIsDisliked);
    setDislikesCount(prev => newIsDisliked ? prev + 1 : Math.max(0, prev - 1));

    if (newIsDisliked && wasLiked) {
      setIsLiked(false);
      setLikesCount(prev => Math.max(0, prev - 1));
    }

    setIsLoading(true);
    try {
      if (newIsDisliked) {
        await supabase.from('post_dislikes').insert({ post_id: data.id, user_id: userId });
        await supabase.from('posts').update({ dislikes_count: dislikesCount + 1 }).eq('id', data.id);

        if (wasLiked) {
          await supabase.from('post_likes').delete().eq('post_id', data.id).eq('user_id', userId);
          await supabase.from('posts').update({ likes_count: Math.max(0, likesCount - 1) }).eq('id', data.id);
        }
      } else {
        await supabase.from('post_dislikes').delete().eq('post_id', data.id).eq('user_id', userId);
        await supabase.from('posts').update({ dislikes_count: Math.max(0, dislikesCount - 1) }).eq('id', data.id);
      }
    } catch (error) {
      // Revert states on error
      setIsDisliked(!newIsDisliked);
      setDislikesCount(prev => newIsDisliked ? Math.max(0, prev - 1) : prev + 1);
      if (newIsDisliked && wasLiked) {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
      showToast('Beğenmeme işlemi başarısız oldu.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isLiked, isDisliked, isLoading, userId, data.id, likesCount, dislikesCount, showToast]);

  const handleFollow = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading || !publisherId || !userId) {
      if (!userId) showToast('Takip etmek için giriş yapmalısınız.', 'info');
      return;
    }

    const newIsFollowing = !isFollowing;
    setIsFollowing(newIsFollowing);

    setIsLoading(true);
    try {
      if (newIsFollowing) {
        await supabase.from('publisher_follows').insert({ publisher_id: publisherId, user_id: userId });
      } else {
        await supabase.from('publisher_follows').delete().eq('publisher_id', publisherId).eq('user_id', userId);
      }
    } catch (error) {
      setIsFollowing(!newIsFollowing);
      showToast('Takip işlemi başarısız oldu.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isFollowing, isLoading, publisherId, userId, showToast]);

  // Kaydetme işlemi (giriş gerektirir)
  const handleSave = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    // Giriş yapmamışsa uyarı göster
    if (!userId || !isUUID(data.id)) {
      if (!userId) showToast('Kaydetmek için giriş yapmalısınız.', 'info');
      return;
    }

    const newIsBookmarked = !isBookmarked;
    setIsBookmarked(newIsBookmarked);
    setSavesCount(prev => newIsBookmarked ? prev + 1 : prev - 1);

    setIsLoading(true);
    try {
      if (newIsBookmarked) {
        await supabase.from('post_saves').insert({ post_id: data.id, user_id: userId });
      } else {
        await supabase.from('post_saves').delete().eq('post_id', data.id).eq('user_id', userId);
      }
    } catch (error) {
      setIsBookmarked(!newIsBookmarked);
      setSavesCount(prev => newIsBookmarked ? prev - 1 : prev + 1);
      showToast('Kaydetme işlemi başarısız oldu.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isBookmarked, isLoading, userId, data.id, showToast]);

  // Paylaş menüsü state
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Paylaş işlemi
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  // Paylaşım URL'i
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/post/${data.id}` : '';
  const shareText = data.title;

  // Sosyal medya paylaşım fonksiyonları
  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToInstagram = () => {
    window.open(`https://www.instagram.com/`, '_blank');
    setShowShareMenu(false);
  };

  const shareToTikTok = () => {
    window.open(`https://www.tiktok.com/`, '_blank');
    setShowShareMenu(false);
  };

  const shareToSocial = () => {
    if (navigator.share) {
      navigator.share({
        title: shareText,
        url: shareUrl,
      }).catch(() => { });
    } else {
      copyLink();
    }
    setShowShareMenu(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Link kopyalandı!', 'success');
    } catch (error) { }
    setShowShareMenu(false);
  };

  const renderContent = () => {
    switch (data.type) {
      case NewsType.REVIEW: return <ReviewCard data={data} />;
      case NewsType.BEFORE_AFTER: return <BeforeAfterCard data={data} />;
      case NewsType.FLIP_CARD: return <FlipCard data={data} />;
      case NewsType.EMBED: return <EmbedCard data={data} />;
      case NewsType.AUDIO: return <AudioCard data={data} />;
      case NewsType.VIDEO: return <VideoCard data={data} />;
      case NewsType.GALLERY: return <GalleryCard data={data} />;
      case NewsType.POLL: return <PollCard data={data} />;
      case NewsType.VS: return <VSCard data={data} />;
      case NewsType.PARAGRAPH: return <ParagraphCard data={data} />;
      case NewsType.IMAGE:
      case NewsType.STANDARD:
      default: return <StandardCard data={data} />;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a')) {
      return;
    }
    onClick?.();
  };

  const handleSourceAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSourceClick?.();
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-[5px] border border-palette-beige/30 shadow-[0_2px_20px_rgba(24,37,64,0.03)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(24,37,64,0.06)] hover:border-palette-red/10 cursor-pointer group/card relative"
    >
      {/* HEADER */}
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div
            onClick={handleSourceAction}
            className="w-11 h-11 rounded-[5px] bg-palette-beige/20 p-[2px] border border-palette-beige shadow-sm cursor-pointer group/avatar relative"
          >
            <div className="w-full h-full rounded-[5px] overflow-hidden">
              <img
                src={data.sourceAvatar || `https://picsum.photos/seed/source${data.id}/100`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                alt={data.source}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white rounded-[5px] flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-[5px] animate-pulse"></div>
            </div>
          </div>

          <div>
            <div
              onClick={handleSourceAction}
              className="flex items-center gap-1.5 cursor-pointer group/title"
            >
              <h5 className="text-sm font-[800] text-gray-900 tracking-tight group-hover/title:text-palette-red transition-colors">
                {data.source}
              </h5>
              <span className="material-symbols-rounded text-palette-red" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-palette-tan/40 leading-none mt-1">
              <span className="text-palette-red bg-palette-red/5 px-1.5 py-0.5 rounded-[5px] uppercase tracking-wider text-[9px]">{data.category}</span>
              <span className="w-0.5 h-0.5 bg-palette-beige rounded-[5px]"></span>
              <span>{data.timestamp}</span>
              <span className="w-0.5 h-0.5 bg-palette-beige rounded-[5px]"></span>
              <button
                onClick={handleFollow}
                className={`uppercase tracking-tighter text-[10px] font-[900] transition-colors ${isFollowing ? 'text-palette-maroon/20 hover:text-palette-maroon/40' : 'text-palette-red hover:text-palette-maroon'}`}
              >
                {isFollowing ? 'Takipte' : 'Takip Et'}
              </button>
            </div>
          </div>
        </div>
        {/* PINNED INDICATOR */}
        {data.isPinned && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/5 border border-amber-100 rounded-[5px] text-amber-600 animate-in fade-in slide-in-from-right-4 duration-500">
            <span className="material-symbols-rounded" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>push_pin</span>
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline-block">ÖNE ÇIKAN</span>
          </div>
        )}
      </div>

      {/* CONTENT Title */}
      <div className="px-6 pt-2 pb-0.5">
        {data.type !== NewsType.EMBED && (
          <h3 className="text-[38px] font-[900] text-gray-900 tracking-[-0.01em] leading-tight group-hover/card:text-palette-red transition-colors">
            {data.title}
          </h3>
        )}
      </div>

      {/* MEDIA CONTENT */}
      <div className="px-6 pb-2 rounded-[5px] overflow-hidden">{renderContent()}</div>

      {/* INTERACTION BAR */}
      <div className="mt-0.5 px-6 py-1 border-t border-palette-beige/20 bg-white/50 backdrop-blur-md relative z-[100]">
        <div className="flex items-center justify-between">
          {/* Sol Grup: Paylaş + Yorum */}
          <div className="flex items-center gap-1 relative">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] text-palette-tan/50 hover:text-palette-red hover:bg-palette-red/5 transition-all duration-500 active:scale-95 group/share"
            >
              <span className="text-[12px] font-bold leading-none">{data.shares.toLocaleString()}</span>
              <span className="material-symbols-rounded leading-none animate-heartbeat-1" style={{ fontSize: '20px' }}>
                share
              </span>
              <span className="text-[10px] font-[900] uppercase tracking-widest leading-none">Paylaş</span>
            </button>

            {/* Paylaş Menüsü */}
            {showShareMenu && (
              <div
                ref={shareMenuRef}
                className="absolute bottom-full left-0 mb-4 bg-white/95 backdrop-blur-xl rounded-[12px] shadow-[0_25px_60px_rgba(24,37,64,0.2)] border border-palette-beige/30 p-1.5 min-w-[220px] z-[99999] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-1 gap-0.5">
                  <button onClick={shareToWhatsApp} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-[#25D366]/5 transition-all duration-300 group">
                    <div className="w-[20px] h-[20px] flex items-center justify-center text-[#25D366]/70 group-hover:text-[#25D366] group-hover:scale-110 transition-all">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.003 24l6.335-1.652a11.882 11.882 0 005.71 1.453h.006c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">WhatsApp</span>
                  </button>

                  <button onClick={shareToTelegram} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-[#0088cc]/5 transition-all duration-300 group">
                    <div className="w-[20px] h-[20px] flex items-center justify-center text-[#0088cc]/70 group-hover:text-[#0088cc] group-hover:scale-110 transition-all">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Telegram</span>
                  </button>

                  <button onClick={shareToTwitter} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-black/5 transition-all duration-300 group">
                    <div className="w-[20px] h-[20px] flex items-center justify-center text-black/70 group-hover:text-black group-hover:scale-110 transition-all">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">X (Twitter)</span>
                  </button>

                  <button onClick={shareToFacebook} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-[#1877F2]/5 transition-all duration-300 group">
                    <div className="w-[20px] h-[20px] flex items-center justify-center text-[#1877F2]/70 group-hover:text-[#1877F2] group-hover:scale-110 transition-all">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Facebook</span>
                  </button>

                  <button onClick={shareToInstagram} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-[#E4405F]/5 transition-all duration-300 group">
                    <div className="w-[20px] h-[20px] flex items-center justify-center text-[#E4405F]/70 group-hover:text-[#E4405F] group-hover:scale-110 transition-all">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Instagram</span>
                  </button>

                  <button onClick={shareToTikTok} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-black/5 transition-all duration-300 group">
                    <div className="w-[20px] h-[20px] flex items-center justify-center text-black/70 group-hover:text-black group-hover:scale-110 transition-all">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">TikTok</span>
                  </button>

                  <button onClick={shareToSocial} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-palette-red/5 transition-all duration-300 group">
                    <div className="w-[20px] h-[20px] flex items-center justify-center text-palette-red/70 group-hover:text-palette-red group-hover:scale-110 transition-all">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Nsosyal</span>
                  </button>

                  <div className="h-px bg-palette-beige/10 my-1 mx-2"></div>

                  <button onClick={copyLink} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-palette-beige/10 transition-all duration-300 group">
                    <div className="w-[20px] h-[20px] flex items-center justify-center text-palette-tan/60 group-hover:text-palette-tan group-hover:scale-110 transition-all">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Bağlantıyı kopyala</span>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] transition-all duration-500 group/comment text-palette-tan/50 hover:text-palette-maroon hover:bg-palette-tan/5"
            >
              <span
                className="material-symbols-rounded transition-all duration-300 animate-heartbeat-2"
                style={{
                  fontSize: '20px',
                  fontVariationSettings: showComments ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300",
                }}
              >
                chat_bubble
              </span>
              <span className="text-[12px] font-bold leading-none">{data.comments.toLocaleString()}</span>
            </button>
          </div>

          {/* Sağ Grup: Kaydet + Like/Dislike */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`flex items-center justify-center w-10 h-10 rounded-[5px] transition-all duration-500 group/bookmark ${isBookmarked
                ? 'text-palette-red bg-palette-red/5'
                : 'text-palette-tan/40 hover:text-palette-red hover:bg-palette-red/5'
                }`}
            >
              <span
                className="material-symbols-rounded transition-all duration-300 animate-heartbeat-3"
                style={{
                  fontSize: '22px',
                  fontVariationSettings: isBookmarked ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300",
                }}
              >
                bookmark
              </span>
            </button>

            {/* Premium Like/Dislike Capsule */}
            <div className="flex items-center bg-palette-beige/10 rounded-[5px] border border-palette-beige/30 p-1">
              <button
                onClick={handleLike}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-[5px] transition-all duration-300
                  ${isLiked
                    ? 'bg-palette-red text-white shadow-md'
                    : 'text-palette-maroon/60 hover:bg-white hover:text-palette-red'}
                `}
              >
                <span className="material-symbols-rounded !text-[20px]" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>
                  thumb_up
                </span>
                <span className="text-[12px] font-[900]">{likesCount.toLocaleString()}</span>
              </button>

              <div className="w-px h-4 bg-palette-beige/60 mx-1" />

              <button
                onClick={handleDislike}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-[5px] transition-all duration-300
                  ${isDisliked
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'text-palette-maroon/60 hover:bg-white hover:text-gray-900'}
                `}
              >
                <span className="material-symbols-rounded !text-[20px]" style={{ fontVariationSettings: isDisliked ? "'FILL' 1" : "'FILL' 0" }}>
                  thumb_down
                </span>
                <span className="text-[12px] font-[900]">{dislikesCount.toLocaleString()}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showComments && (
        <div onClick={(e) => e.stopPropagation()} className="animate-in fade-in slide-in-from-top-1 duration-300">
          <CommentSection />
        </div>
      )}
    </div>
  );
};

export default NewsCard;
