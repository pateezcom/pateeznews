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
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);

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

  // Dynamic Flex & Position Logic
  const leftFlex = hasVoted ? leftPct : (hoveredSide === 'left' ? 55 : (hoveredSide === 'right' ? 45 : 50));
  const rightFlex = 100 - leftFlex;

  return (
    <div className="mt-1 space-y-4 overflow-hidden">
      {/* VS SUMMARY SECTION - StandardCard Style */}
      <div className="px-1 mb-3">
        <div
          className="rich-text-content text-gray-600/80 text-[16px] leading-relaxed font-medium text-left [&>p]:mb-0"
          dangerouslySetInnerHTML={{ __html: data.summary }}
        />
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
        <div className="absolute bottom-4 left-4 z-30 group/arena transform-gpu">
          <div className="flex items-center rounded-[4px] overflow-hidden shadow-[0_12px_24px_-8px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-md">
            {/* Icon section with animated glow */}
            <div className="bg-palette-red p-2.5 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
              <Swords size={18} className="text-white animate-bounce-subtle relative z-10" />
            </div>
            {/* Text section with sophisticated typography */}
            <div className="bg-palette-maroon/85 px-4 py-2 border-l border-white/5 leading-none flex flex-col justify-center">
              <span className="text-white text-[11px] font-[1000] uppercase tracking-[0.2em] drop-shadow-md">
                DÜELLO BAŞLASIN
              </span>
              <div className="h-[1px] w-full bg-gradient-to-r from-palette-red to-transparent mt-1 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-2 rounded-[5px] border border-palette-beige shadow-sm overflow-hidden">
        {/* VS ITEM TITLE - Elite & Modern Style */}
        {(data.items?.[0]?.title || (data as any).blockTitle) && (
          <div className="pt-4 pb-2 px-4 text-left">
            <h3 className="text-[18px] font-[900] italic text-palette-maroon tracking-tighter uppercase leading-none drop-shadow-sm">
              {data.items?.[0]?.title || (data as any).blockTitle}
            </h3>
            <div className="w-12 h-[3px] bg-palette-red/10 mt-2 rounded-full" />
          </div>
        )}

        <div className="relative flex items-stretch h-[320px] rounded-[5px] overflow-hidden bg-black/5" style={{ contain: 'layout style paint' }}>
          {/* LEFT SIDE */}
          <button
            onClick={() => handleVote(left!.id)}
            onMouseEnter={() => !hasVoted && setHoveredSide('left')}
            onMouseLeave={() => setHoveredSide(null)}
            disabled={hasVoted}
            className="relative overflow-hidden group/left"
            style={{
              width: `${leftFlex}%`,
              transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'width',
              contain: 'strict'
            }}
          >
            <img
              src={left!.image}
              className={`absolute inset-0 w-full h-full object-cover ${!hasVoted ? 'group-hover/left:scale-110' : ''}`}
              style={{
                transform: 'translate3d(0, 0, 0)',
                transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'transform',
                backfaceVisibility: 'hidden'
              }}
            />
            <div
              className={`absolute inset-0 ${hasVoted ? (votedOption === left!.id ? 'bg-palette-maroon/20' : 'bg-black/60 brightness-50 grayscale-[0.8]') : 'bg-gradient-to-r from-palette-maroon/60 to-transparent group-hover/left:opacity-40'}`}
              style={{
                transition: 'opacity 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: 'opacity'
              }}
            />

            <div className={`absolute inset-0 p-6 flex flex-col justify-end items-start text-left ${hasVoted ? 'opacity-100' : 'opacity-80'}`} style={{ transition: 'opacity 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
              <span
                className={`text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${hasVoted ? 'scale-110 origin-left' : ''}`}
                style={{ transition: 'transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
              >{left!.text}</span>
              {hasVoted && (
                <div className="flex flex-col items-start animate-in slide-in-from-left duration-700">
                  <div className="text-white text-5xl font-[900] italic tracking-tighter leading-none"><AnimatedNumber value={leftPct} /></div>
                  <div className="text-white/80 text-[10px] font-black uppercase tracking-widest mt-2 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-[2px] self-start">
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

          {/* VS CENTER BADGE - Professional & Premium News Style */}
          <div
            className="absolute top-0 bottom-0 z-40 flex items-center justify-center pointer-events-none"
            style={{
              left: `${leftFlex}%`,
              transition: 'left 600ms cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'left',
              transform: 'translate3d(0, 0, 0)'
            }}
          >
            {/* Elegant Vertical Divider Line */}
            <div className="w-[1.5px] h-full bg-gradient-to-b from-transparent via-white/40 to-transparent z-10" />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40" style={{ transform: 'translate3d(-50%, -50%, 0)' }}>
              <div className="relative group/vs">
                {/* Subtle Back Glow */}
                <div className="absolute inset-0 bg-white/10 blur-xl rounded-full scale-110" />

                {/* Main Diamond Container */}
                <div className="relative w-[68px] h-[68px] transform rotate-45 flex items-center justify-center p-[2.5px] shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
                  {/* Outer Premium Border with Gradient Hit */}
                  <div className="absolute inset-0 rounded-[12px] border-[2.5px] border-white/90 bg-white" />

                  {/* Inner Core */}
                  <div className="relative w-full h-full rounded-[8px] overflow-hidden flex items-center justify-center shadow-inner">
                    {/* Deep Metallic Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1B2838] via-[#0F172A] to-[#020617]" />

                    {/* Subtle Lightning Icon Backdrop */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-15 transform -rotate-45">
                      <Zap size={52} fill="white" className="text-white blur-[0.5px]" />
                    </div>

                    {/* Glossy Reflect Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20" />

                    {/* VS Text - Bold, Centered & High End */}
                    <span className="relative z-10 font-[1000] italic text-[24px] text-white tracking-[-0.05em] transform -rotate-45 mr-1 drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)]">
                      VS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <button
            onClick={() => handleVote(right!.id)}
            onMouseEnter={() => !hasVoted && setHoveredSide('right')}
            onMouseLeave={() => setHoveredSide(null)}
            disabled={hasVoted}
            className="relative overflow-hidden group/right"
            style={{
              width: `${rightFlex}%`,
              transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'width',
              contain: 'strict'
            }}
          >
            <img
              src={right!.image}
              className={`absolute inset-0 w-full h-full object-cover ${!hasVoted ? 'group-hover/right:scale-110' : ''}`}
              style={{
                transform: 'translate3d(0, 0, 0)',
                transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'transform',
                backfaceVisibility: 'hidden'
              }}
            />
            <div
              className={`absolute inset-0 ${hasVoted ? (votedOption === right!.id ? 'bg-palette-maroon/20' : 'bg-black/60 brightness-50 grayscale-[0.8]') : 'bg-gradient-to-l from-palette-maroon/60 to-transparent group-hover/right:opacity-40'}`}
              style={{
                transition: 'opacity 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: 'opacity'
              }}
            />

            <div className={`absolute inset-0 p-6 flex flex-col justify-end items-start text-left ${hasVoted ? 'opacity-100' : 'opacity-80'}`} style={{ transition: 'opacity 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
              <span
                className={`text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${hasVoted ? 'scale-110 origin-left' : ''}`}
                style={{ transition: 'transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
              >{right!.text}</span>
              {hasVoted && (
                <div className="flex flex-col items-start animate-in slide-in-from-right duration-700">
                  <div className="text-white text-5xl font-[900] italic tracking-tighter leading-none"><AnimatedNumber value={rightPct} /></div>
                  <div className="text-white/80 text-[10px] font-black uppercase tracking-widest mt-2 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-[2px] self-start">
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

        <div className="p-4 flex items-center justify-start gap-2 text-palette-tan/40">
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
