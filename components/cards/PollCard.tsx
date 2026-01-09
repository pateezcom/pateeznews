
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, Users, HelpCircle } from 'lucide-react';
import { NewsItem } from '../../types';
import AnimatedNumber from '../ui/AnimatedNumber';

interface PollCardProps {
  data: NewsItem;
}

const PollCard: React.FC<PollCardProps> = ({ data }) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOption, setVotedOption] = useState<string | null>(null);
  const [imageRatio, setImageRatio] = useState<'vertical' | 'horizontal'>('horizontal');

  useEffect(() => {
    if (data.thumbnail) {
      const img = new Image();
      img.onload = () => {
        if (img.height > img.width) {
          setImageRatio('vertical');
        } else {
          setImageRatio('horizontal');
        }
      };
      img.src = data.thumbnail;
    }
  }, [data.thumbnail]);

  const handleVote = (id: string) => {
    if (hasVoted) return;
    setVotedOption(id);
    setHasVoted(true);
  };

  const isImage = data.isImagePoll;
  const columnClass = isImage ? (data.pollColumns === 3 ? 'grid-cols-3' : 'grid-cols-2') : 'grid-cols-1';

  return (
    <div className="mt-1 space-y-4 overflow-hidden">
      {/* CREATIVE POLL HEADER AREA */}
      <div className="px-1 mb-6 mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-palette-red flex items-center justify-center text-white shadow-xl rotate-3">
              <BarChart3 size={24} />
            </div>
            {/* Live Indicator */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full animate-pulse shadow-sm" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-palette-red uppercase tracking-[0.3em] leading-none mb-1">Pateez Özel Anket</span>
            <div className="h-1 w-12 bg-palette-red/20 rounded-full" />
          </div>
        </div>

        {/* SUBTITLE (SUMMARY) */}
        <div
          className="rich-text-content text-gray-900 text-[20px] md:text-[24px] leading-tight font-[1000] italic border-l-4 border-palette-red pl-6 py-2 transition-all duration-500 hover:border-palette-maroon"
          dangerouslySetInnerHTML={{ __html: data.summary }}
        />
      </div>

      {/* MAIN IMAGE CONTAINER */}
      <div className="relative rounded-[5px] overflow-hidden shadow-lg group border border-palette-beige/50 bg-black/5 flex items-center justify-center min-h-[200px]">
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover blur-2xl opacity-30 scale-110"
          style={{ backgroundImage: `url(${data.thumbnail})` }}
        />
        <img
          src={data.thumbnail}
          alt={data.title}
          className="w-auto h-auto max-w-full max-h-[400px] object-contain transition-transform duration-1000 group-hover:scale-[1.05] relative z-10"
        />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-palette-maroon/40 to-transparent" />
        <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2">
          <div className="bg-palette-red p-1.5 rounded-[5px] text-white shadow-lg animate-bounce-subtle">
            <BarChart3 size={18} />
          </div>
          <span className="text-white text-[10px] font-black uppercase tracking-widest bg-palette-maroon/30 px-2 py-1 rounded-[5px]">{data.category}</span>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-palette-beige/30 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden relative group/card hover:border-palette-red/20 transition-all duration-500 mt-6 text-left">
        {/* Abstract Background Element */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-palette-red/5 rounded-full blur-[60px] pointer-events-none group-hover/card:bg-palette-red/10 transition-all duration-1000" />

        {/* POLL TITLE AREA INSIDE CARD */}
        {(data as any).blockTitle && (
          <div className="pb-8 mb-6 px-1 text-left relative z-10 border-b border-gray-50">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-palette-maroon text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-palette-maroon/20">
                <HelpCircle size={12} strokeWidth={3} />
                KATILIMINIZI BEKLİYORUZ
              </span>
            </div>
            <h3 className="text-[26px] md:text-[30px] font-[1000] text-palette-maroon tracking-tighter leading-[1.1] drop-shadow-sm">
              {(data as any).blockTitle}
              {(!String((data as any).blockTitle).trim().endsWith('?') && !String((data as any).blockTitle).trim().endsWith('!')) ? '?' : ''}
            </h3>
            <div className="w-20 h-[5px] bg-palette-red mt-5 rounded-full" />
          </div>
        )}

        <div className={`grid ${columnClass} gap-4 relative z-10`}>
          {data.options?.map((option) => {
            const isSelected = votedOption === option.id;
            const displayTotalVotes = hasVoted ? (data.totalVotes || 0) + 1 : (data.totalVotes || 0);
            const currentOptionVotes = (isSelected && hasVoted) ? (option.votes || 0) + 1 : (option.votes || 0);
            const percentage = displayTotalVotes > 0 ? Math.round((currentOptionVotes / displayTotalVotes) * 100) : 0;

            if (isImage) {
              return (
                <button
                  key={option.id}
                  disabled={hasVoted}
                  onClick={() => handleVote(option.id)}
                  className={`relative group flex flex-col rounded-xl overflow-hidden transition-all duration-700 border ${hasVoted
                    ? isSelected
                      ? 'opacity-100 scale-[1.03] z-20 shadow-2xl border-palette-red'
                      : 'opacity-40 grayscale-[0.5] scale-[0.97] border-palette-beige/50'
                    : 'hover:scale-[1.02] hover:shadow-xl border-palette-beige/80 hover:border-palette-red/30'
                    }`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                    <img
                      src={option.image}
                      alt={option.text}
                      className={`w-full h-full object-cover transition-transform duration-1000 ${!hasVoted ? 'group-hover:scale-110' : ''} ${isSelected && hasVoted ? 'scale-105' : ''}`}
                    />
                    {hasVoted && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none flex flex-col justify-end p-4">
                        <div className={`flex flex-col items-start ${isSelected ? 'text-white' : 'text-white/70'}`}>
                          <span className="text-4xl font-[1000] italic tracking-tighter leading-none mb-1">
                            <AnimatedNumber value={percentage} />
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-[2px]">
                            <AnimatedNumber value={currentOptionVotes} suffix=" OY" />
                          </span>
                        </div>
                      </div>
                    )}
                    {isSelected && hasVoted && (
                      <div className="absolute top-3 right-3 bg-white text-palette-red p-1.5 rounded-full shadow-lg animate-in zoom-in duration-500 scale-110">
                        <CheckCircle2 size={16} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className={`p-4 text-left transition-all duration-500 ${isSelected && hasVoted ? 'bg-palette-red text-white' : 'bg-white text-palette-maroon'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-[1000] capitalize tracking-tight leading-tight line-clamp-2 flex-1">
                        {option.text}
                      </p>
                      {isSelected && hasVoted && <CheckCircle2 size={16} className="text-white shrink-0" />}
                    </div>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={option.id}
                disabled={hasVoted}
                onClick={() => handleVote(option.id)}
                className={`group relative flex flex-col w-full rounded-xl overflow-hidden transition-all duration-700 border-2 ${hasVoted
                  ? isSelected
                    ? 'border-palette-red shadow-lg bg-palette-red/5'
                    : 'border-palette-beige/30 opacity-50 grayscale-[0.3]'
                  : 'border-palette-beige hover:border-palette-red/30 hover:bg-palette-red/[0.02]'
                  }`}
              >
                {hasVoted && (
                  <div
                    className={`absolute left-0 top-0 bottom-0 transition-all duration-[1500ms] cubic-bezier(0.16, 1, 0.3, 1) ${isSelected ? 'bg-palette-red/10' : 'bg-palette-beige/20'}`}
                    style={{ width: `${percentage}%` }}
                  />
                )}
                <div className="relative px-6 py-5 flex justify-between items-center gap-4">
                  <span className={`text-[16px] font-[1000] tracking-tight transition-colors duration-500 ${isSelected && hasVoted ? 'text-palette-red' : 'text-palette-maroon'}`}>
                    {option.text}
                  </span>
                  {hasVoted && (
                    <div className="flex items-center gap-4 animate-in slide-in-from-right duration-700">
                      <div className="flex flex-col items-end">
                        <span className={`text-2xl font-[1000] italic leading-none ${isSelected ? 'text-palette-red' : 'text-palette-maroon/40'}`}>
                          <AnimatedNumber value={percentage} />
                        </span>
                        <span className="text-[9px] font-black text-palette-maroon/30 uppercase mt-1 tracking-widest">
                          <AnimatedNumber value={currentOptionVotes} suffix=" oy" />
                        </span>
                      </div>
                      {isSelected && (
                        <div className="text-palette-red animate-in zoom-in duration-500">
                          <CheckCircle2 size={20} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 pt-8 border-t border-palette-beige/50 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-palette-beige/30 text-palette-tan flex items-center justify-center border border-palette-tan/10 shadow-inner">
              <Users size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-[1000] text-palette-maroon tracking-tight">
                <AnimatedNumber value={hasVoted ? (data.totalVotes || 0) + 1 : (data.totalVotes || 0)} />
              </span>
              <span className="text-[9px] font-black text-palette-tan uppercase tracking-widest opacity-60">Toplam Katılım</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm shadow-emerald-500/5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            SONUÇLAR CANLI
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollCard;
