
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle2, Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { NewsItem, NewsType } from '../types';
import CommentSection from './CommentSection';
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

interface NewsCardProps {
  data: NewsItem;
  onClick?: () => void;
  onSourceClick?: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ data, onClick, onSourceClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(data.likes || 0);
  const [savesCount, setSavesCount] = useState(data.shares || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Kullanıcı ve mevcut like/save durumunu kontrol et
  useEffect(() => {
    const checkUserAndStatus = async () => {
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
            .single();

          if (likeData) setIsLiked(true);

          // Kaydetme durumunu kontrol et
          const { data: saveData } = await supabase
            .from('post_saves')
            .select('id')
            .eq('post_id', data.id)
            .eq('user_id', user.id)
            .single();

          if (saveData) setIsBookmarked(true);
        }
      } catch (error) {
        // Kullanıcı giriş yapmamış veya hata
      }
    };

    checkUserAndStatus();
  }, [data.id]);

  // Beğeni işlemi (giriş gerektirir)
  const handleLike = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    // Giriş yapmamışsa uyarı göster
    if (!userId) {
      alert('Beğenmek için giriş yapmalısınız.');
      return;
    }

    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

    setIsLoading(true);
    try {
      if (newIsLiked) {
        await supabase.from('post_likes').insert({ post_id: data.id, user_id: userId });
        await supabase.from('posts').update({ likes_count: likesCount + 1 }).eq('id', data.id);
      } else {
        await supabase.from('post_likes').delete().eq('post_id', data.id).eq('user_id', userId);
        await supabase.from('posts').update({ likes_count: Math.max(0, likesCount - 1) }).eq('id', data.id);
      }
    } catch (error) {
      setIsLiked(!newIsLiked);
      setLikesCount(prev => newIsLiked ? prev - 1 : prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [isLiked, isLoading, userId, data.id, likesCount]);

  // Kaydetme işlemi (giriş gerektirir)
  const handleSave = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    // Giriş yapmamışsa uyarı göster
    if (!userId) {
      alert('Kaydetmek için giriş yapmalısınız.');
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
    } finally {
      setIsLoading(false);
    }
  }, [isBookmarked, isLoading, userId, data.id]);

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
      alert('Link kopyalandı!');
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
      className="bg-white rounded-[5px] border border-palette-beige/30 shadow-[0_2px_20px_rgba(24,37,64,0.03)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(24,37,64,0.06)] hover:border-palette-red/10 cursor-pointer group/card"
    >
      {/* HEADER */}
      <div className="px-6 pt-6 pb-2 flex items-start justify-between">
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
            </div>
          </div>
        </div>
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
      <div className="px-6 pb-2">{renderContent()}</div>

      {/* INTERACTION BAR */}
      <div className="mt-0.5 px-6 py-1 border-t border-palette-beige/20 bg-white/50 backdrop-blur-md">
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
                className="absolute bottom-full left-0 mb-4 bg-white/95 backdrop-blur-xl rounded-[12px] shadow-[0_25px_60px_rgba(24,37,64,0.2)] border border-palette-beige/30 p-1.5 min-w-[220px] z-[9999] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-palette-beige/10 mb-1">
                  <span className="text-[9px] font-[900] text-palette-tan/40 uppercase tracking-[0.2em]">Haber Paylaş</span>
                  <button
                    onClick={() => setShowShareMenu(false)}
                    className="w-6 h-6 flex items-center justify-center text-palette-tan/20 hover:text-palette-red transition-all active:scale-95 hover:bg-palette-red/5 rounded-full"
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>close</span>
                  </button>
                </div>

                <div className="px-1 py-1 mb-1">
                  <button onClick={() => setShowShareMenu(false)} className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-palette-beige/10 text-palette-tan/60 hover:text-gray-900 transition-all active:scale-90">
                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>arrow_back</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-0.5">
                  <button onClick={shareToWhatsApp} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-[#25D366]/5 transition-all duration-300 group">
                    <span className="material-symbols-rounded text-[#25D366]/70 group-hover:text-[#25D366] group-hover:scale-110 transition-all" style={{ fontSize: '18px' }}>chat</span>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">WhatsApp</span>
                  </button>

                  <button onClick={shareToTelegram} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-[#0088cc]/5 transition-all duration-300 group">
                    <span className="material-symbols-rounded text-[#0088cc]/70 group-hover:text-[#0088cc] group-hover:scale-110 transition-all" style={{ fontSize: '18px' }}>send</span>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Telegram</span>
                  </button>

                  <button onClick={shareToTwitter} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-black/5 transition-all duration-300 group">
                    <span className="material-symbols-rounded text-black/70 group-hover:text-black group-hover:scale-110 transition-all" style={{ fontSize: '18px' }}>tag</span>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">X (Twitter)</span>
                  </button>

                  <button onClick={shareToFacebook} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-[#1877F2]/5 transition-all duration-300 group">
                    <span className="material-symbols-rounded text-[#1877F2]/70 group-hover:text-[#1877F2] group-hover:scale-110 transition-all" style={{ fontSize: '18px' }}>thumb_up</span>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Facebook</span>
                  </button>

                  <button onClick={shareToInstagram} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-[#E4405F]/5 transition-all duration-300 group">
                    <span className="material-symbols-rounded text-[#E4405F]/70 group-hover:text-[#E4405F] group-hover:scale-110 transition-all" style={{ fontSize: '18px' }}>camera_alt</span>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Instagram</span>
                  </button>

                  <button onClick={shareToTikTok} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-black/5 transition-all duration-300 group">
                    <span className="material-symbols-rounded text-black/70 group-hover:text-black group-hover:scale-110 transition-all" style={{ fontSize: '18px' }}>music_note</span>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">TikTok</span>
                  </button>

                  <button onClick={shareToSocial} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-palette-red/5 transition-all duration-300 group">
                    <span className="material-symbols-rounded text-palette-red/70 group-hover:text-palette-red group-hover:scale-110 transition-all" style={{ fontSize: '18px' }}>share</span>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Sosyal</span>
                  </button>

                  <div className="h-px bg-palette-beige/10 my-1 mx-2"></div>

                  <button onClick={copyLink} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-palette-beige/10 transition-all duration-300 group">
                    <span className="material-symbols-rounded text-palette-tan/60 group-hover:text-palette-tan group-hover:scale-110 transition-all" style={{ fontSize: '18px' }}>link</span>
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

          {/* Sağ Grup: Kaydet + Beğen */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] transition-all duration-500 group/bookmark ${isBookmarked
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
              <span className="text-[12px] font-bold leading-none">
                {savesCount.toLocaleString()}
              </span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] transition-all duration-500 group/like ${isLiked
                ? 'bg-palette-red/5 text-palette-red'
                : 'text-palette-tan/50 hover:text-palette-red hover:bg-palette-red/5'
                }`}
            >
              <span
                className="material-symbols-rounded transition-all duration-300 animate-heartbeat-4"
                style={{
                  fontSize: '22px',
                  fontVariationSettings: isLiked ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300",
                }}
              >
                favorite
              </span>
              <span className="text-[12px] font-bold leading-none">
                {likesCount.toLocaleString()}
              </span>
            </button>
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
