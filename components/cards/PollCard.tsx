
import React, { useState } from 'react';
import { CheckCircle2, Users } from 'lucide-react';
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
    <div className="mt-1 space-y-4 overflow-hidden">
    {/* SUMMARY - Creative Style */}
    <div className="px-1 mb-2">
      <p className="text-palette-maroon/60 text-[15px] leading-relaxed">
        <span className="font-[500] italic" dangerouslySetInnerHTML={{ __html: data.summary }} />
      </p>
    </div>

      {/* MAIN POLL CONTAINER */}
      <div className="relative bg-gradient-to-br from-palette-beige/10 via-white to-palette-beige/5 rounded-[5px] border border-palette-beige/40 overflow-hidden shadow-sm">

        {/* IMAGE SECTION */}
        {data.thumbnail && (
          <div className="relative w-full overflow-hidden group/image">
            <img
              src={data.thumbnail}
              alt={data.title}
              className="w-full h-auto object-contain transition-transform duration-[2s] group-hover/image:scale-[1.02]"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

            {/* Category Badge - Bottom Right */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-palette-red px-3 py-1.5 rounded-[3px] shadow-lg">
                <span className="material-symbols-rounded text-white" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
                  poll
                </span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Anket</span>
              </div>
            </div>

            {/* Live Indicator - Top Left */}
            <div className="absolute top-4 left-4 z-20">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-[3px] border border-white/10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Canlı</span>
              </div>
            </div>
          </div>
        )}

        {/* POLL QUESTION TITLE */}
        {(data as any).blockTitle && (
          <div className="px-6 pt-6 pb-4">
            <h3 className="text-[20px] md:text-[24px] font-[900] text-palette-maroon tracking-tight leading-snug">
              {(data as any).blockTitle}
              {(!String((data as any).blockTitle).trim().endsWith('?') && !String((data as any).blockTitle).trim().endsWith('!')) ? '?' : ''}
            </h3>
            {(data as any).blockDescription && (
              <div
                className="mt-2 text-[13px] font-[600] text-palette-tan/60 leading-relaxed [&>p]:m-0"
                dangerouslySetInnerHTML={{ __html: (data as any).blockDescription }}
              />
            )}
          </div>
        )}

        {/* OPTIONS GRID */}
        <div className={`px-6 pb-6 ${(data as any).blockTitle ? 'pt-0' : 'pt-6'}`}>
          <div className={`grid ${columnClass} gap-3`}>
            {data.options?.map((option, index) => {
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
                  className={`group relative flex flex-col rounded-[5px] overflow-hidden transition-all duration-500 bg-palette-beige/5 border ${hasVoted
                    ? isSelected
                      ? 'ring-2 ring-palette-maroon shadow-xl z-10 border-palette-maroon/40'
                      : 'opacity-40 grayscale-[50%] scale-[0.98] border-palette-beige/30'
                    : 'border-palette-beige/40 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99]'
                    }`}
                >
                    {/* Image Container - Fixed Height with Blurred Background */}
                    <div className="relative w-full h-[240px] overflow-hidden">
                      {/* Blurred Background Fill */}
                      <div
                        className="absolute inset-0 bg-center bg-cover blur-2xl opacity-50 scale-110"
                        style={{ backgroundImage: `url(${option.image})` }}
                      />
                      {/* Main Image - Object Contain */}
                      <img
                        src={option.image}
                        alt={option.text}
                        className={`relative z-10 w-full h-full object-contain transition-transform duration-700 ${!hasVoted ? 'group-hover:scale-105' : ''}`}
                      />

                      {/* Hover Overlay - Before Vote */}
                      {!hasVoted && (
                        <div className="absolute inset-0 z-20 bg-gradient-to-t from-palette-maroon/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                          <span className="text-white text-[10px] font-black uppercase tracking-widest">Oy Ver</span>
                        </div>
                      )}

                      {/* Result Overlay - After Vote */}
                      {hasVoted && (
                        <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center transition-all duration-500 ${isSelected ? 'bg-palette-maroon/70' : 'bg-black/50'}`}>
                          {/* Percentage */}
                          <div className="text-white text-5xl font-[1000] italic tracking-tighter drop-shadow-lg animate-in zoom-in duration-500">
                            <AnimatedNumber value={percentage} suffix="" />%
                          </div>
                          {/* Vote Count */}
                          <div className="text-white/80 text-[11px] font-bold mt-1 animate-in fade-in slide-in-from-bottom-2 duration-700">
                            {currentOptionVotes} oy
                          </div>
                          {/* Selected Check */}
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-8 h-8 bg-white text-palette-maroon rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                              <CheckCircle2 size={20} strokeWidth={3} />
                            </div>
                          )}
                          {/* Progress Bar Inside */}
                          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                            <div
                              className={`h-full transition-all duration-[1500ms] ease-out ${isSelected ? 'bg-white' : 'bg-white/50'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Option Label */}
                    <div className={`px-4 py-3 transition-colors duration-300 ${hasVoted && isSelected ? 'bg-palette-maroon/5' : 'bg-white'}`}>
                      <span className={`text-[13px] font-[800] text-left block line-clamp-1 ${isSelected && hasVoted ? 'text-palette-maroon' : 'text-palette-maroon/70'}`}>
                        {option.text}
                      </span>
                    </div>
                  </button>
                );
              }

              // TEXT OPTIONS
              return (
                <button
                  key={option.id}
                  disabled={hasVoted}
                  onClick={() => handleVote(option.id)}
                  className={`group relative w-full rounded-[5px] transition-all duration-400 bg-white border overflow-hidden ${hasVoted
                    ? isSelected
                      ? 'border-palette-maroon/50 shadow-sm'
                      : 'border-palette-beige/30 opacity-60'
                    : 'border-palette-beige/50 hover:border-palette-tan hover:bg-palette-beige/[0.03] active:scale-[0.99]'
                    }`}
                >
                  {/* Progress Bar Background */}
                  {hasVoted && (
                    <div
                      className={`absolute left-0 top-0 bottom-0 transition-all duration-[1200ms] ease-out ${isSelected ? 'bg-palette-maroon/10' : 'bg-palette-beige/40'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {/* Radio Circle */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isSelected && hasVoted
                        ? 'border-palette-maroon bg-palette-maroon'
                        : hasVoted
                          ? 'border-palette-beige/50'
                          : 'border-palette-beige group-hover:border-palette-tan'
                        }`}>
                        {isSelected && hasVoted && (
                          <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in duration-200" />
                        )}
                      </div>

                      {/* Option Text */}
                      <span className={`text-[15px] font-[700] tracking-tight transition-colors ${isSelected && hasVoted ? 'text-palette-maroon' : 'text-palette-maroon/70'
                        }`}>
                        {option.text}
                      </span>
                    </div>

                    {/* Percentage, Votes & Check */}
                    {hasVoted && (
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <span className={`text-[14px] font-[900] tabular-nums block ${isSelected ? 'text-palette-maroon' : 'text-palette-tan/60'}`}>
                            <AnimatedNumber value={percentage} suffix="%" />
                          </span>
                          <span className="text-[10px] font-[600] text-palette-tan/50">
                            {currentOptionVotes} oy
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 size={18} className="text-palette-maroon animate-in zoom-in duration-300" />
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* FOOTER - Minimal Stats */}
        <div className="px-6 py-4 bg-palette-beige/[0.04] border-t border-palette-beige/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-palette-tan/50">
            <Users size={14} />
            <span className="text-[11px] font-[800] tracking-wide">
              <AnimatedNumber value={hasVoted ? (data.totalVotes || 0) + 1 : (data.totalVotes || 0)} suffix="" /> katılımcı
            </span>
          </div>
          {hasVoted && (
            <div className="flex items-center gap-1.5 text-emerald-600 animate-in fade-in slide-in-from-right-2 duration-500">
              <CheckCircle2 size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Oy verildi</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollCard;
