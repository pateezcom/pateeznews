
import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { NewsItem } from '../../types';

interface BeforeAfterCardProps {
  data: NewsItem;
}

const BeforeAfterCard: React.FC<BeforeAfterCardProps> = ({ data }) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleBeforeAfterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  if (!data.beforeAfterData) return null;

  return (
    <div className="mt-1 space-y-3">
      <div className="px-1 mb-3">
        <p className="text-gray-600/80 text-[16px] leading-relaxed font-medium">{data.summary}</p>
      </div>

      <div className="relative w-full h-[450px] rounded-[5px] overflow-hidden shadow-2xl select-none group border border-gray-100">
        {/* AFTER IMAGE (Background - Full) */}
        <img
          src={data.beforeAfterData.afterImage}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* BEFORE IMAGE (Clipped on top) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={data.beforeAfterData.beforeImage}
            alt="Before"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white/80 cursor-ew-resize z-20 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-sm"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Handle Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-[5px] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.4)] transform active:scale-95 transition-transform border-4 border-white/20">
            <ArrowLeftRight size={18} className="text-blue-600" />
          </div>
        </div>

        {/* Invisible Range Input for Interaction */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={handleBeforeAfterChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
        />

        {/* Labels - Modern Style */}
        <div className="absolute bottom-6 left-6 z-10 pointer-events-none transition-opacity duration-300" style={{ opacity: sliderPosition < 10 ? 0 : 1 }}>
          <div className="bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-[5px] border border-white/20 shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-[5px] bg-white/50"></div>
            <span className="text-[11px] font-black uppercase tracking-widest leading-none mt-0.5">
              {data.beforeAfterData.beforeLabel}
            </span>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 z-10 pointer-events-none transition-opacity duration-300" style={{ opacity: sliderPosition > 90 ? 0 : 1 }}>
          <div className="bg-white/40 backdrop-blur-md text-white px-4 py-2 rounded-[5px] border border-white/30 shadow-lg flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest leading-none mt-0.5 text-black">
              {data.beforeAfterData.afterLabel}
            </span>
            <div className="w-2 h-2 rounded-[5px] bg-blue-500 animate-pulse"></div>
          </div>
        </div>

        {/* Hint overlay */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-[5px] border border-white/10 pointer-events-none">
          <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest">Karşılaştırmak için kaydır</span>
        </div>

      </div>
    </div>
  );
};

export default BeforeAfterCard;
