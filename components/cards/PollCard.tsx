
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, Users } from 'lucide-react';
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
    <div className="mt-1 space-y-4">
      {/* SUBTITLE (SUMMARY) - StandardCard Style */}
      <div className="px-1 mb-3">
        <p className="text-gray-600/80 text-[16px] leading-relaxed font-medium">
          {data.summary}
        </p>
      </div>

      {/* MAIN IMAGE CONTAINER - StandardCard Logic */}
      <div className="relative rounded-[5px] overflow-hidden shadow-lg group border border-palette-beige/50 bg-black/5 flex items-center justify-center min-h-[200px]">
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover blur-2xl opacity-30 scale-110"
          style={{ backgroundImage: `url(${data.thumbnail})` }}
        />
        <img
          src={data.thumbnail}
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

      <div className="bg-palette-beige/20 p-5 rounded-[5px] border border-palette-beige/50 shadow-inner">

        <div className={`grid ${columnClass} gap-3`}>
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
                  className={`relative flex flex-col rounded-[5px] overflow-hidden transition-all duration-700 bg-white shadow-sm border-0 ${hasVoted ? (isSelected ? 'bg-palette-red/[0.03] shadow-2xl shadow-palette-red/10 ring-1 ring-palette-red/10' : 'opacity-50 grayscale-[0.5]') : 'hover:shadow-md hover:ring-1 hover:ring-palette-red/5'
                    }`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-palette-beige/5">
                    {/* Subtle Background Layer */}
                    <div
                      className="absolute inset-0 bg-center bg-no-repeat bg-cover blur-lg opacity-10 scale-105"
                      style={{ backgroundImage: `url(${option.image})` }}
                    />
                    <img src={option.image} className="relative z-10 w-full h-full object-contain p-2" />

                    {hasVoted && (
                      <div className="absolute inset-0 z-20 pointer-events-none p-2">
                        {/* Top Right Result Pill - Executive & Minimal */}
                        <div className="absolute top-2 right-2">
                          <div className={`px-2.5 py-1 rounded-[3px] backdrop-blur-xl text-white shadow-lg border border-white/10 flex items-baseline gap-1.5 transition-all duration-700 ${isSelected ? 'bg-palette-red/90' : 'bg-black/40'}`}>
                            <span className="text-[13px] font-black leading-none tracking-tighter"><AnimatedNumber value={percentage} /></span>
                            <span className="text-[8px] font-bold uppercase tracking-widest opacity-80"><AnimatedNumber value={currentOptionVotes} suffix=" OY" /></span>
                          </div>
                        </div>

                        {/* Selection Indicator - Simple & Modern */}
                        {isSelected && (
                          <div className="absolute top-2 left-2 bg-palette-red text-white p-1 rounded-[3px] shadow-lg border border-white/20 animate-in fade-in zoom-in duration-500">
                            <CheckCircle2 size={12} strokeWidth={3} />
                          </div>
                        )}

                        {/* Bottom Glow Progress Line */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/5">
                          <div
                            className={`h-full transition-all duration-[1500ms] cubic-bezier(0.16, 1, 0.3, 1) ${isSelected ? 'bg-palette-red shadow-[0_0_8px_rgba(185,28,28,0.5)]' : 'bg-palette-tan/30'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Premium Answer Text Section - No Border */}
                  <div className={`relative overflow-hidden transition-all duration-500 ${isSelected ? 'bg-gradient-to-r from-palette-red/[0.06] via-palette-red/[0.02] to-transparent' : 'bg-white'}`}>
                    {/* Left Accent Bar for Selected */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-palette-red" />
                    )}

                    <p className={`px-3 py-3 text-[11px] font-black tracking-tight line-clamp-1 transition-all duration-500 ${isSelected ? 'text-palette-red pl-4' : 'text-palette-tan/70 text-center'}`}>
                      {option.text}
                    </p>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={option.id}
                disabled={hasVoted}
                onClick={() => handleVote(option.id)}
                className="relative group overflow-hidden bg-white border border-palette-beige rounded-[5px] p-4 transition-all hover:border-palette-red/40 active:scale-[0.98] disabled:active:scale-100"
              >
                {hasVoted && (
                  <div
                    className={`absolute left-0 top-0 bottom-0 transition-all duration-[1200ms] cubic-bezier(0.25, 1, 0.5, 1) ${isSelected ? 'bg-palette-red/5' : 'bg-palette-beige/30'}`}
                    style={{ width: `${percentage}%` }}
                  />
                )}
                <div className="relative flex justify-between items-center gap-3">
                  <span className={`text-sm font-bold text-left ${hasVoted && isSelected ? 'text-palette-red' : 'text-palette-tan/80'}`}>
                    {option.text}
                  </span>
                  {hasVoted && (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-palette-maroon leading-none">
                          <AnimatedNumber value={percentage} />
                        </span>
                        <span className="text-[10px] font-bold text-palette-tan/30 mt-0.5 tracking-tight">
                          <AnimatedNumber value={currentOptionVotes} suffix=" oy" />
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 size={16} className="text-palette-red ml-1" />}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-palette-beige/50 flex justify-center">
          <span className="text-[10px] font-bold text-palette-tan/40 uppercase tracking-widest flex items-center gap-2">
            <div className="p-1 rounded-[5px] bg-palette-beige/50"><Users size={12} /></div>
            <AnimatedNumber value={hasVoted ? (data.totalVotes || 0) + 1 : (data.totalVotes || 0)} suffix=" Toplam Katılım" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default PollCard;
