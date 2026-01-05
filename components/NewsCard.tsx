
import React, { useState } from 'react';
import { CheckCircle2, Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { NewsItem, NewsType } from '../types';
import CommentSection from './CommentSection';

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
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] transition-all duration-500 group/like ${isLiked
                ? 'bg-palette-red/5 text-palette-red'
                : 'text-palette-tan/50 hover:text-palette-red hover:bg-palette-red/5'
                }`}
            >
              <span
                className="material-symbols-rounded transition-all duration-300"
                style={{
                  fontSize: '22px',
                  fontVariationSettings: isLiked ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300",
                }}
              >
                favorite
              </span>
              <span className="text-[12px] font-bold">
                {(isLiked ? data.likes + 1 : data.likes).toLocaleString()}
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] transition-all duration-500 group/comment text-palette-tan/50 hover:text-palette-maroon hover:bg-palette-tan/5"
            >
              <span
                className="material-symbols-rounded transition-all duration-300"
                style={{
                  fontSize: '20px',
                  fontVariationSettings: showComments ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300",
                }}
              >
                chat_bubble
              </span>
              <span className="text-[12px] font-bold">{data.comments.toLocaleString()}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsBookmarked(!isBookmarked);
              }}
              className={`w-9 h-9 flex items-center justify-center rounded-[5px] transition-all duration-500 group/bookmark ${isBookmarked
                ? 'text-palette-red bg-palette-red/5'
                : 'text-palette-tan/40 hover:text-palette-red hover:bg-palette-red/5'
                }`}
            >
              <span
                className="material-symbols-rounded transition-all duration-300"
                style={{
                  fontSize: '22px',
                  fontVariationSettings: isBookmarked ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 300",
                }}
              >
                bookmark
              </span>
            </button>

            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 px-2 py-1.5 rounded-[5px] text-palette-tan/50 hover:text-palette-red transition-all duration-500 active:scale-95 group/share"
            >
              <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>
                ios_share
              </span>
              <span className="text-[10px] font-[900] uppercase tracking-widest">Paylaş</span>
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
