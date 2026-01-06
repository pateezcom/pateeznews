import React, { useState } from 'react';
import { Swords, Users, Zap, CheckCircle2 } from 'lucide-react';
import { NewsItem } from '../../types';
import AnimatedNumber from '../ui/AnimatedNumber';

interface VSCardProps {
  data: NewsItem;
}

const VSCard: React.FC<VSCardProps> = ({ data }) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOption, setVotedOption] = useState<string | null>(null);
  const [imageRatio, setImageRatio] = useState<'vertical' | 'horizontal'>('horizontal');

  React.useEffect(() => {
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

  const left = data.options?.[0];
  const right = data.options?.[1];

  // Derive dynamic percentages including local vote state
  const displayTotalVotes = hasVoted ? (data.totalVotes || 0) + 1 : (data.totalVotes || 0);
  const leftVotes = (votedOption === left?.id && hasVoted) ? (left?.votes || 0) + 1 : (left?.votes || 0);
  const rightVotes = (votedOption === right?.id && hasVoted) ? (right?.votes || 0) + 1 : (right?.votes || 0);

  const leftPct = displayTotalVotes > 0 ? Math.round((leftVotes / displayTotalVotes) * 100) : 50;
  const rightPct = 100 - leftPct;

  return (
    <div className="mt-1 space-y-4">
      {/* VS SUMMARY SECTION - StandardCard Style */}
      <div className="px-1 mb-3">
        <p className="text-gray-600/80 text-[16px] leading-relaxed font-medium">
          {data.summary}
        </p>
      </div>

      {/* MAIN THUMBNAIL CONTAINER */}
      <div className={`relative rounded-[5px] overflow-hidden shadow-lg border border-palette-beige/50 bg-black/5 flex items-center justify-center transition-all duration-700 ${imageRatio === 'vertical' ? 'h-[400px]' : 'w-full h-auto'}`}>
        {/* Background Blur Effect */}
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover blur-2xl opacity-20 scale-110"
          style={{ backgroundImage: `url(${data.thumbnail})` }}
        />
        <img
          src={data.thumbnail}
          className={`relative z-10 transition-transform duration-1000 group-hover:scale-105 ${imageRatio === 'vertical' ? 'w-auto h-full max-w-full object-contain' : 'w-full h-auto block'}`}
        />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-palette-maroon/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-4 left-4 z-30 flex items-center gap-3">
          <div className="bg-palette-red p-2 rounded-[5px] text-white shadow-xl animate-bounce-subtle">
            <Swords size={20} />
          </div>
          <span className="text-white text-[11px] font-[900] uppercase tracking-widest bg-palette-maroon/40 px-3 py-1.5 rounded-[5px] backdrop-blur-sm">DÜELLO ARENASI</span>
        </div>
      </div>

      <div className="bg-white p-2 rounded-[5px] border border-palette-beige shadow-sm overflow-hidden">
        {/* VS ITEM TITLE - Elite & Modern Style */}
        {(data.items?.[0]?.title || (data as any).blockTitle) && (
          <div className="pt-4 pb-2 px-4 text-center">
            <h3 className="text-[18px] font-[900] italic text-palette-maroon tracking-tighter uppercase leading-none drop-shadow-sm">
              {data.items?.[0]?.title || (data as any).blockTitle}
            </h3>
            <div className="w-12 h-[3px] bg-palette-red/10 mx-auto mt-2 rounded-full" />
          </div>
        )}

        <div className="relative flex items-stretch h-[320px] rounded-[5px] overflow-hidden bg-black/5">
          {/* LEFT SIDE */}
          <button
            onClick={() => handleVote(left!.id)}
            disabled={hasVoted}
            className={`relative transition-all duration-[1200ms] cubic-bezier(0.23, 1, 0.32, 1) overflow-hidden group/left`}
            style={{ flex: hasVoted ? leftPct : 50 }}
          >
            <img src={left!.image} className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ${!hasVoted ? 'group-hover/left:scale-110' : ''}`} />
            <div className={`absolute inset-0 transition-opacity duration-700 ${hasVoted ? (votedOption === left!.id ? 'bg-palette-maroon/20' : 'bg-black/60 brightness-50 grayscale-[0.8]') : 'bg-gradient-to-r from-palette-maroon/60 to-transparent group-hover/left:opacity-40'}`} />

            <div className={`absolute inset-0 p-6 flex flex-col justify-end items-center text-center transition-all duration-700 ${hasVoted ? 'opacity-100' : 'opacity-80'}`}>
              <span className={`text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2 transition-transform duration-700 ${hasVoted ? 'scale-110 origin-center' : ''}`}>{left!.text}</span>
              {hasVoted && (
                <div className="flex flex-col items-center animate-in slide-in-from-left duration-700">
                  <div className="text-white text-5xl font-[900] italic tracking-tighter leading-none"><AnimatedNumber value={leftPct} /></div>
                  <div className="text-white/80 text-[10px] font-black uppercase tracking-widest mt-2 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-[2px] self-center">
                    <AnimatedNumber value={leftVotes} suffix=" OY" />
                  </div>
                </div>
              )}
            </div>

            {hasVoted && votedOption === left!.id && (
              <div className="absolute top-4 left-4 bg-palette-red text-white p-1.5 rounded-full shadow-lg border-2 border-white animate-bounce-subtle z-30">
                <CheckCircle2 size={16} strokeWidth={3} />
              </div>
            )}
          </button>

          {/* VS CENTER BADGE */}
          <div
            className="absolute top-0 bottom-0 z-20 flex items-center justify-center pointer-events-none transition-all duration-[1200ms] cubic-bezier(0.23, 1, 0.32, 1)"
            style={{ left: hasVoted ? `${leftPct}%` : '50%' }}
          >
            <div className="w-[2px] h-full bg-white/40 shadow-[0_0_20px_rgba(255,255,255,0.6)] z-10 backdrop-blur-md" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
              <div className="w-[66px] h-[66px] bg-white rounded-[10px] flex items-center justify-center p-1.5 transform rotate-45 border-[3px] border-white/40 shadow-xl">
                <div className="w-full h-full rounded-[6px] bg-palette-tan flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-palette-tan to-palette-maroon" />
                  <span className="relative z-10 font-[1000] italic text-2xl text-white tracking-tight transform -rotate-45 mb-0.5 mr-1 drop-shadow-lg">
                    VS
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <button
            onClick={() => handleVote(right!.id)}
            disabled={hasVoted}
            className={`relative transition-all duration-[1200ms] cubic-bezier(0.23, 1, 0.32, 1) overflow-hidden group/right`}
            style={{ flex: hasVoted ? rightPct : 50 }}
          >
            <img src={right!.image} className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ${!hasVoted ? 'group-hover/right:scale-110' : ''}`} />
            <div className={`absolute inset-0 transition-opacity duration-700 ${hasVoted ? (votedOption === right!.id ? 'bg-palette-maroon/20' : 'bg-black/60 brightness-50 grayscale-[0.8]') : 'bg-gradient-to-l from-palette-maroon/60 to-transparent group-hover/right:opacity-40'}`} />

            <div className={`absolute inset-0 p-6 flex flex-col justify-end items-center text-center transition-all duration-700 ${hasVoted ? 'opacity-100' : 'opacity-80'}`}>
              <span className={`text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2 transition-transform duration-700 ${hasVoted ? 'scale-110 origin-center' : ''}`}>{right!.text}</span>
              {hasVoted && (
                <div className="flex flex-col items-center animate-in slide-in-from-right duration-700">
                  <div className="text-white text-5xl font-[900] italic tracking-tighter leading-none"><AnimatedNumber value={rightPct} /></div>
                  <div className="text-white/80 text-[10px] font-black uppercase tracking-widest mt-2 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-[2px] self-center">
                    <AnimatedNumber value={rightVotes} suffix=" OY" />
                  </div>
                </div>
              )}
            </div>

            {hasVoted && votedOption === right!.id && (
              <div className="absolute top-4 right-4 bg-palette-red text-white p-1.5 rounded-full shadow-lg border-2 border-white animate-bounce-subtle z-30">
                <CheckCircle2 size={16} strokeWidth={3} />
              </div>
            )}
          </button>
        </div>

        <div className="p-4 flex items-center justify-center gap-2 text-palette-tan/40">
          <div className="p-1 rounded-[4px] bg-palette-beige/50 border border-palette-tan/10"><Users size={14} /></div>
          <span className="text-[10px] font-[900] uppercase tracking-[0.15em]">
            <AnimatedNumber value={hasVoted ? (data.totalVotes || 0) + 1 : (data.totalVotes || 0)} suffix=" Oy Verildi" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default VSCard;
