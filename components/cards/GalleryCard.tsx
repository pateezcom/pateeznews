
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { NewsItem } from '../../types';

interface GalleryCardProps {
  data: NewsItem;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ data }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.mediaList) {
      setCurrentSlide((prev) => (prev + 1) % data.mediaList!.length);
    }
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.mediaList) {
      setCurrentSlide((prev) => (prev - 1 + data.mediaList!.length) % data.mediaList!.length);
    }
  };

  if (!data.mediaList || data.mediaList.length === 0) return null;

  return (
    <div className="mt-4 space-y-4">
      <div className="px-1 mb-2">
        <p className="text-gray-600 text-sm leading-relaxed">{data.summary}</p>
      </div>

      <div className="relative bg-black rounded-[5px] overflow-hidden shadow-lg group select-none aspect-[4/5] sm:aspect-square md:aspect-[4/3]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 blur-xl scale-110 transition-all duration-700"
          style={{ backgroundImage: `url(${data.mediaList[currentSlide]})` }}
        />
        <div className="absolute inset-0 flex items-center justify-center z-10 p-1">
          <img
            src={data.mediaList[currentSlide]}
            alt={`Slide ${currentSlide}`}
            className="max-w-full max-h-full object-contain rounded-[5px] shadow-sm transition-all duration-500"
          />
        </div>
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/20 rounded-[5px] flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/20 rounded-[5px] flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
        >
          <ChevronRight size={24} />
        </button>
        <div className="absolute top-4 left-4 z-20">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-[5px] border border-white/10">
            <ImageIcon size={14} className="text-white" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Galeri</span>
          </div>
        </div>
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-[5px] border border-white/10">
            <span className="text-xs font-bold text-white tracking-widest">
              {currentSlide + 1} <span className="text-white/50">/</span> {data.mediaList.length}
            </span>
          </div>
        </div>
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
          {data.mediaList.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
              className={`h-1.5 rounded-[5px] transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
