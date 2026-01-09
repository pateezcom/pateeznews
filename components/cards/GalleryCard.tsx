
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsItem } from '../../types';

interface GalleryCardProps {
  data: NewsItem;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ data }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [maxHeight, setMaxHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tüm resimlerin boyutlarını yükle ve en yüksek olanı bul
  useEffect(() => {
    if (!data.mediaList || data.mediaList.length === 0) return;

    const loadImageDimensions = async () => {
      const containerWidth = containerRef.current?.offsetWidth || 800;

      const heights = await Promise.all(
        data.mediaList!.map((src) => {
          return new Promise<number>((resolve) => {
            const img = new Image();
            img.onload = () => {
              // Sadece yatay ve kare resimler hesaplamaya dahil (dikey resimler hariç)
              // Dikey resim: yükseklik > genişlik
              if (img.naturalHeight > img.naturalWidth) {
                resolve(0); // Dikey resim - hesaplamaya dahil etme
              } else {
                // Yatay veya kare resim - container genişliğine göre yüksekliği hesapla
                const scale = containerWidth / img.naturalWidth;
                const scaledHeight = img.naturalHeight * scale;
                resolve(scaledHeight);
              }
            };
            img.onerror = () => resolve(0);
            img.src = src;
          });
        })
      );

      const max = Math.max(...heights);
      if (max > 0) {
        setMaxHeight(max);
      }
    };

    loadImageDimensions();

    // Window resize'da yeniden hesapla
    const handleResize = () => loadImageDimensions();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data.mediaList]);

  // Otomatik slider geçişi (4 saniye aralıkla)
  useEffect(() => {
    if (!data.mediaList || data.mediaList.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.mediaList!.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [data.mediaList]);

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
    <div className="mt-1 space-y-3 overflow-hidden">
      <div className="px-1 mb-3">
        <p className="text-gray-600/80 text-[16px] leading-relaxed font-medium">{data.summary}</p>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden group select-none flex items-center justify-start"
        style={{ height: maxHeight > 0 ? `${maxHeight}px` : 'auto' }}
      >
        <img
          src={data.mediaList[currentSlide]}
          alt={`Slide ${currentSlide}`}
          className="max-w-full max-h-full object-contain transition-all duration-500"
        />
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/10 hover:bg-white/25 border border-white/20 rounded-full flex items-center justify-center text-black transition-all hover:scale-110"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/10 hover:bg-white/25 border border-white/20 rounded-full flex items-center justify-center text-black transition-all hover:scale-110"
        >
          <ChevronRight size={18} />
        </button>

        <div className="absolute top-4 right-4 z-20">
          <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-[5px] border border-white/10">
            <span className="text-xs font-bold text-white tracking-widest">
              {currentSlide + 1} <span className="text-white/50">/</span> {data.mediaList.length}
            </span>
          </div>
        </div>
        <div className="absolute bottom-4 left-6 right-0 z-20 flex justify-start gap-2">
          {data.mediaList.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
              className={`h-1.5 rounded-[5px] transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-palette-red' : 'w-1.5 bg-white/40 hover:bg-palette-red/60'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
