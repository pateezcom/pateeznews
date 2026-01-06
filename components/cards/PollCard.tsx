
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

      <div className="bg-white p-6 rounded-[5px] border border-palette-beige shadow-sm overflow-hidden">
        {/* POLL TITLE - Reference to VSCard logic if available */}
        {(data as any).blockTitle && (
          <div className="pb-5 px-1 text-center">
            <h3 className="text-[20px] font-[900] italic text-palette-maroon tracking-tighter uppercase leading-none">
              {(data as any).blockTitle}
            </h3>
            <div className="w-16 h-[4px] bg-palette-red/10 mx-auto mt-3 rounded-full" />
          </div>
        )}

        <div className={`grid ${columnClass} gap-4`}>
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
                  className={`relative group flex flex-col rounded-[6px] overflow-hidden transition-all duration-700 ${hasVoted
                    ? (isSelected
                      ? 'opacity-100 scale-[1.02] z-20 shadow-xl border-palette-tan/20'
                      : 'opacity-40 grayscale-[0.8] scale-[0.98] border-palette-beige/50'
                    )
                    : 'hover:scale-[1.01] hover:shadow-lg border-palette-beige'
                    } border`}
                  style={{
                    transition: 'all 800ms cubic-bezier(0.19, 1, 0.22, 1)',
                  }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-black/5">
                    <img
                      src={option.image}
                      className={`w-full h-full object-contain transition-transform duration-1000 ${!hasVoted ? 'group-hover:scale-110' : ''
                        } ${isSelected && hasVoted ? 'scale-105' : ''}`}
                    />

                    {/* Dark Overlay for better text legibility when results shown */}
                    {hasVoted && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    )}

                    {hasVoted && (
                      <div className="absolute inset-0 flex flex-col justify-end p-4 items-center text-center">
                        <div className={`animate-in slide-in-from-bottom-4 duration-700 flex flex-col items-center ${isSelected ? 'text-white' : 'text-white/60'}`}>
                          <span className="text-4xl font-[1000] italic tracking-tighter leading-none mb-1">
                            <AnimatedNumber value={percentage} />
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-[2px]">
                            <AnimatedNumber value={currentOptionVotes} suffix=" OY" />
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Selection Checkmark */}
                    {isSelected && hasVoted && (
                      <div className="absolute top-3 left-3 bg-palette-red text-white p-1 rounded-full shadow-lg border-2 border-white animate-bounce-subtle z-30">
                        <CheckCircle2 size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  <div className={`p-3 text-center transition-colors duration-500 ${isSelected && hasVoted ? 'bg-palette-tan text-white' : 'bg-white text-palette-tan/80'
                    }`}>
                    <p className={`text-[12px] font-black capitalize tracking-tight leading-tight line-clamp-2`}>
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
                className={`relative group flex flex-col w-full rounded-[5px] overflow-hidden transition-all duration-700 border ${hasVoted
                  ? (isSelected
                    ? 'border-palette-tan/20 shadow-md bg-palette-tan/[0.02]'
                    : 'border-palette-beige/50 opacity-50 grayscale'
                  )
                  : 'border-palette-beige hover:border-palette-tan/30 hover:bg-black/[0.02]'
                  }`}
                style={{
                  transition: 'all 700ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {/* Progress Bar Background */}
                {hasVoted && (
                  <div
                    className={`absolute left-0 top-0 bottom-0 transition-all duration-[1500ms] cubic-bezier(0.16, 1, 0.3, 1) ${isSelected ? 'bg-palette-tan/[0.05]' : 'bg-black/[0.02]'
                      }`}
                    style={{ width: `${percentage}%` }}
                  />
                )}

                <div className="relative px-5 py-4 flex justify-between items-center gap-4">
                  <span className={`text-[14px] font-[800] capitalize tracking-tight text-left transition-all duration-500 ${isSelected && hasVoted ? 'text-palette-tan' : 'text-palette-tan/80'
                    }`}>
                    {option.text}
                  </span>

                  {hasVoted && (
                    <div className="flex items-center gap-4 animate-in slide-in-from-right duration-700">
                      <div className="flex flex-col items-end">
                        <span className={`text-2xl font-[1000] italic leading-none ${isSelected ? 'text-palette-tan' : 'text-palette-tan/40'
                          }`}>
                          <AnimatedNumber value={percentage} />
                        </span>
                        <span className="text-[9px] font-black text-palette-tan/30 uppercase mt-1 tracking-widest">
                          <AnimatedNumber value={currentOptionVotes} suffix=" oy" />
                        </span>
                      </div>

                      {isSelected && (
                        <div className="text-palette-red animate-in zoom-in duration-500">
                          <CheckCircle2 size={18} strokeWidth={3} className="drop-shadow-sm" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 pt-4 border-t border-palette-beige flex justify-center items-center gap-3">
          <div className="p-1.5 rounded-[4px] bg-palette-beige text-palette-tan/40 border border-palette-tan/5">
            <Users size={14} />
          </div>
          <span className="text-[11px] font-[900] text-palette-tan/40 uppercase tracking-[0.2em]">
            <AnimatedNumber value={hasVoted ? (data.totalVotes || 0) + 1 : (data.totalVotes || 0)} suffix=" Toplam Katılım" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default PollCard;
