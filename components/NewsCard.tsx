
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
      className="bg-white rounded-[5px] border border-palette-beige/30 shadow-[0_2px_20px_rgba(24,37,64,0.03)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(24,37,64,0.06)] hover:border-palette-red/10 cursor-pointer group/card relative"
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
      <div className="px-6 pb-2 rounded-[5px]">{renderContent()}</div>

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
                    <div className="w-[18px] h-[18px] flex items-center justify-center text-[#25D366]/70 group-hover:text-[#25D366] group-hover:scale-110 transition-all">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72 1.541 3.91 10.114 5.711 5.711h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">WhatsApp</span>
                  </button>

                  <button onClick={shareToTelegram} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-[#0088cc]/5 transition-all duration-300 group">
                    <div className="w-[18px] h-[18px] flex items-center justify-center text-[#0088cc]/70 group-hover:text-[#0088cc] group-hover:scale-110 transition-all">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M11.944 0C5.346 0 0 5.346 0 11.944s5.346 11.944 11.944 11.944 11.944-5.346 11.944-11.944S18.542 0 11.944 0zm5.808 8.358l-1.916 9.034c-.145.642-.525.8-.1.442l-2.92-2.152-1.41 1.356c-.156.156-.287.287-.588.287l.21-2.977 5.418-4.894c.235-.21-.051-.326-.366-.117l-6.696 4.215-2.885-.902c-.627-.196-.64-.627.13-.926l11.272-4.344c.523-.19.98.124.84.927z" /></svg>
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Telegram</span>
                  </button>

                  <button onClick={shareToTwitter} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-black/5 transition-all duration-300 group">
                    <div className="w-[18px] h-[18px] flex items-center justify-center text-black/70 group-hover:text-black group-hover:scale-110 transition-all">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">X (Twitter)</span>
                  </button>

                  <button onClick={shareToFacebook} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-[#1877F2]/5 transition-all duration-300 group">
                    <div className="w-[18px] h-[18px] flex items-center justify-center text-[#1877F2]/70 group-hover:text-[#1877F2] group-hover:scale-110 transition-all">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Facebook</span>
                  </button>

                  <button onClick={shareToInstagram} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-[#E4405F]/5 transition-all duration-300 group">
                    <div className="w-[18px] h-[18px] flex items-center justify-center text-[#E4405F]/70 group-hover:text-[#E4405F] group-hover:scale-110 transition-all">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.848 0-3.204.012-3.584.07-4.849.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Instagram</span>
                  </button>

                  <button onClick={shareToTikTok} className="w-full h-[38px] flex items-center gap-3 px-3 rounded-[8px] hover:bg-black/5 transition-all duration-300 group">
                    <div className="w-[18px] h-[18px] flex items-center justify-center text-black/70 group-hover:text-black group-hover:scale-110 transition-all">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.13-1.31-.12 3.31-.16 6.61-.04 9.91-.14 2.23-1.33 4.41-3.37 5.42-2.04 1.01-4.71.93-6.62-.27-2.02-1.11-3.23-3.39-3.06-5.69.06-2.31 1.51-4.5 3.73-5.23 1.14-.38 2.37-.41 3.55-.2v3.91c-.91-.25-1.92-.12-2.71.39-.81.42-1.39 1.27-1.43 2.19-.04 1.1.72 2.12 1.77 2.4 1.05.31 2.25-.09 2.87-1.01.27-.4.38-.88.35-1.36-.01-4.66.01-9.33.01-14z" /></svg>
                    </div>
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
