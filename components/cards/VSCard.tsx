
import React, { useState } from 'react';
import { Swords, Users, Zap } from 'lucide-react';
import { NewsItem } from '../../types';
import AnimatedNumber from '../ui/AnimatedNumber';

interface VSCardProps {
  data: NewsItem;
}

const VSCard: React.FC<VSCardProps> = ({ data }) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOption, setVotedOption] = useState<string | null>(null);

  const handleVote = (id: string) => {
    if (hasVoted) return;
    setVotedOption(id);
    setHasVoted(true);
  };

  const left = data.options?.[0];
  const right = data.options?.[1];
  const leftPct = data.totalVotes ? Math.round((left!.votes / data.totalVotes) * 100) : 50;
  const rightPct = 100 - leftPct;

  return (
    <div className="mt-1 space-y-3">
      <div className="relative h-[200px] rounded-[5px] overflow-hidden shadow-lg border border-palette-beige group">
        <img src={data.thumbnail} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-palette-maroon/70 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <div className="bg-palette-red p-2 rounded-[5px] text-white shadow-xl animate-pulse">
            <Swords size={20} />
          </div>
          <span className="text-white text-sm font-black uppercase tracking-widest">DÜELLO ARENASI</span>
        </div>
      </div>

      <div className="bg-white p-2 rounded-[5px] border border-palette-beige shadow-sm overflow-hidden">
        <div className="p-4 text-center">
          <h4 className="text-[16px] font-medium text-gray-600/80 leading-relaxed">{data.summary}</h4>
        </div>

        <div className="relative flex items-stretch h-[280px] rounded-[5px] overflow-hidden">
          <button
            onClick={() => handleVote(left!.id)}
            className="relative transition-all duration-1000 overflow-hidden"
            style={{ flex: hasVoted ? leftPct : 1 }}
          >
            <img src={left!.image} className="absolute inset-0 w-full h-full object-cover" />
            <div className={`absolute inset-0 ${hasVoted ? 'bg-palette-maroon/60' : 'bg-gradient-to-r from-palette-maroon/80 to-transparent'}`} />
            <div className="absolute inset-0 p-4 flex flex-col justify-end">
              <span className="text-white text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">{left!.text}</span>
              {hasVoted && (
                <div className="flex flex-col">
                  <div className="text-white text-4xl font-black leading-none"><AnimatedNumber value={leftPct} /></div>
                  <div className="text-white/60 text-[10px] font-bold uppercase tracking-tighter mt-1">
                    <AnimatedNumber value={votedOption === left!.id ? left!.votes + 1 : left!.votes} suffix=" OY" />
                  </div>
                </div>
              )}
            </div>
          </button>

          <div
            className="absolute top-0 bottom-0 z-20 flex items-center justify-center pointer-events-none transition-all duration-[1000ms] cubic-bezier(0.65, 0, 0.35, 1)"
            style={{ left: hasVoted ? `${leftPct}%` : '50%' }}
          >
            <div className="w-[1.5px] h-full bg-white/60 shadow-[0_0_15px_rgba(255,255,255,0.4)] z-10 backdrop-blur-sm" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 filter drop-shadow-lg">
              <div className="relative group/badge">
                <div className="w-[70px] h-[70px] bg-white rounded-[5px] flex items-center justify-center shadow-[0_8px_30px_rgba(24,37,64,0.2)] p-1">
                  <div className="w-full h-full rounded-[5px] bg-palette-tan flex items-center justify-center relative overflow-hidden border border-palette-tan/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-palette-tan to-palette-maroon" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Zap size={36} className="text-white transform -rotate-12" />
                    </div>
                    <div className="absolute top-0 right-0 w-8 h-8 bg-palette-red blur-xl opacity-30" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 bg-palette-red blur-xl opacity-30" />
                    <span className="relative z-10 font-[900] italic text-2xl text-white tracking-tighter transform -skew-x-6 drop-shadow-md">
                      VS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleVote(right!.id)}
            className="relative transition-all duration-1000 overflow-hidden"
            style={{ flex: hasVoted ? rightPct : 1 }}
          >
            <img src={right!.image} className="absolute inset-0 w-full h-full object-cover" />
            <div className={`absolute inset-0 ${hasVoted ? 'bg-palette-maroon/60' : 'bg-gradient-to-l from-palette-maroon/80 to-transparent'}`} />
            <div className="absolute inset-0 p-4 flex flex-col justify-end text-right">
              <span className="text-white text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">{right!.text}</span>
              {hasVoted && (
                <div className="flex flex-col items-end">
                  <div className="text-white text-4xl font-black leading-none"><AnimatedNumber value={rightPct} /></div>
                  <div className="text-white/60 text-[10px] font-bold uppercase tracking-tighter mt-1">
                    <AnimatedNumber value={votedOption === right!.id ? right!.votes + 1 : right!.votes} suffix=" OY" />
                  </div>
                </div>
              )}
            </div>
          </button>
        </div>
        <div className="p-4 flex items-center justify-center gap-2 text-palette-tan/30">
          <div className="p-1 rounded-[5px] bg-palette-beige/50"><Users size={14} /></div>
          <span className="text-[10px] font-bold uppercase tracking-widest">
            <AnimatedNumber value={hasVoted ? (data.totalVotes || 0) + 1 : (data.totalVotes || 0)} suffix=" Oy Verildi" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default VSCard;
