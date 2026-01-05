
import React, { useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, Users } from 'lucide-react';
import { NewsItem } from '../../types';
import AnimatedNumber from '../ui/AnimatedNumber';

interface PollCardProps {
  data: NewsItem;
}

const PollCard: React.FC<PollCardProps> = ({ data }) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOption, setVotedOption] = useState<string | null>(null);

  const handleVote = (id: string) => {
    if (hasVoted) return;
    setVotedOption(id);
    setHasVoted(true);
  };

  const isImage = data.isImagePoll;
  const columnClass = isImage ? (data.pollColumns === 3 ? 'grid-cols-3' : 'grid-cols-2') : 'grid-cols-1';

  return (
    <div className="mt-4 space-y-4">
      <div className="relative aspect-video rounded-[5px] overflow-hidden shadow-md group border border-palette-beige/50">
        <img src={data.thumbnail} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-palette-maroon/60 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <div className="bg-palette-red p-1.5 rounded-[5px] text-white shadow-lg animate-bounce-subtle">
            <BarChart3 size={18} />
          </div>
          <span className="text-white text-[10px] font-black uppercase tracking-widest bg-palette-maroon/30 px-2 py-1 rounded-[5px]">{data.category}</span>
        </div>
      </div>

      <div className="bg-palette-beige/20 p-5 rounded-[5px] border border-palette-beige/50 shadow-inner">
        <div className="flex items-center gap-3 mb-5">
          <TrendingUp className="text-palette-red" size={20} />
          <h4 className="text-xl font-extrabold text-palette-maroon tracking-tight">{data.summary}</h4>
        </div>

        <div className={`grid ${columnClass} gap-3`}>
          {data.options?.map((option) => {
            const percentage = data.totalVotes ? Math.round((option.votes / data.totalVotes) * 100) : 0;
            const isSelected = votedOption === option.id;
            const currentOptionVotes = isSelected ? option.votes + 1 : option.votes;

            if (isImage) {
              return (
                <button
                  key={option.id}
                  disabled={hasVoted}
                  onClick={() => handleVote(option.id)}
                  className={`relative flex flex-col rounded-[5px] overflow-hidden transition-all duration-500 bg-white border-2 ${hasVoted ? (isSelected ? 'border-palette-red shadow-lg' : 'opacity-40 grayscale blur-[0.2px] border-transparent') : 'border-transparent hover:border-palette-red/30'
                    }`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img src={option.image} className="w-full h-full object-cover" />
                    {hasVoted && (
                      <div className="absolute inset-0 bg-palette-maroon/70 flex flex-col items-center justify-center p-2">
                        <div className="text-white text-2xl font-black leading-none">
                          <AnimatedNumber value={percentage} />
                        </div>
                        <div className="text-white/70 text-[10px] font-bold uppercase mt-1 tracking-tighter">
                          <AnimatedNumber value={currentOptionVotes} suffix=" Oy" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-2 text-[11px] font-bold text-palette-tan line-clamp-1">{option.text}</div>
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
