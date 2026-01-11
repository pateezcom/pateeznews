
import React, { useState, useEffect, useRef } from 'react';
import { RotateCw } from 'lucide-react';
import { NewsItem } from '../../types';

interface FlipCardProps {
  data: NewsItem;
}

const FlipCard: React.FC<FlipCardProps> = ({ data }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardHeight, setCardHeight] = useState<number>(500);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data.flipData) return;

    const img1 = new Image();
    const img2 = new Image();
    let loadedCount = 0;

    const calculateHeight = () => {
      loadedCount++;
      if (loadedCount === 2) {
        const containerWidth = containerRef.current?.offsetWidth || 600;

        const isFrontVertical = img1.naturalHeight > img1.naturalWidth;
        const isBackVertical = img2.naturalHeight > img2.naturalWidth;

        if (isFrontVertical && isBackVertical) {
          setCardHeight(400);
        } else {
          const height1 = (containerWidth / img1.naturalWidth) * img1.naturalHeight;
          const height2 = (containerWidth / img2.naturalWidth) * img2.naturalHeight;
          // Küçüğe göre ayarla
          setCardHeight(Math.min(height1, height2));
        }
      }
    };

    img1.onload = calculateHeight;
    img2.onload = calculateHeight;
    img1.src = data.flipData.frontImage;
    img2.src = data.flipData.backImage;

    const handleResize = () => {
      if (img1.complete && img2.complete) {
        const containerWidth = containerRef.current?.offsetWidth || 600;
        if (img1.naturalHeight > img1.naturalWidth && img2.naturalHeight > img2.naturalWidth) {
          setCardHeight(400);
        } else {
          const height1 = (containerWidth / img1.naturalWidth) * img1.naturalHeight;
          const height2 = (containerWidth / img2.naturalWidth) * img2.naturalHeight;
          setCardHeight(Math.min(height1, height2));
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data.flipData]);

  if (!data.flipData) return null;

  return (
    <div className="mt-1 space-y-3 overflow-hidden">
      <div className="px-1 mb-3">
        <div
          className="rich-text-content text-gray-600/80 text-[16px] leading-relaxed font-medium text-left [&>p]:mb-0"
          dangerouslySetInnerHTML={{ __html: data.summary }}
        />
      </div>

      {/* Card Container with Perspective */}
      <div
        ref={containerRef}
        className="w-full cursor-pointer group perspective-1000 relative"
        onClick={(e) => {
          e.stopPropagation();
          setIsFlipped(!isFlipped);
        }}
        style={{
          perspective: '1000px',
          height: `${cardHeight}px`
        }}
      >
        {/* Inner Flipper Container */}
        <div
          className="relative w-full h-full transition-transform duration-700 ease-in-out transform-style-3d overflow-visible"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >

          {/* FRONT FACE */}
          <div
            className="absolute inset-0 w-full h-full backface-hidden flex items-center justify-center overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Creative Blurred Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src={data.flipData.frontImage}
                alt=""
                className="w-full h-full object-cover blur-[60px] opacity-40 scale-110"
              />
              <div className="absolute inset-0 bg-white/10" />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-[1] pointer-events-none" />
            <img src={data.flipData.frontImage} alt="Front" className="max-w-full max-h-full object-contain relative z-[2]" />

            {/* Front Content */}
            <div className="absolute bottom-0 left-0 w-full p-8 text-white z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-600/90 backdrop-blur-md px-3 py-1 rounded-[5px] text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/20">
                  Tıkla & Çevir
                </span>
              </div>
              {data.flipData.frontLink ? (
                <a
                  href={data.flipData.frontLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="block hover:opacity-80 transition-opacity"
                >
                  <h3 className="text-3xl font-black leading-tight mb-2 drop-shadow-md">{data.flipData.frontTitle}</h3>
                </a>
              ) : (
                <h3 className="text-3xl font-black leading-tight mb-2 drop-shadow-md">{data.flipData.frontTitle}</h3>
              )}
              {data.flipData.frontDescription && (
                <div
                  className="text-white/90 text-sm leading-relaxed mb-5 line-clamp-2 font-medium"
                  dangerouslySetInnerHTML={{ __html: data.flipData.frontDescription }}
                />
              )}
              <div className="flex items-center gap-2.5 text-white/70 text-[10px] font-bold uppercase tracking-widest">
                <div className="p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                  <RotateCw size={12} className="animate-spin-slow" />
                </div>
                <span>Arka Yüz İçin Tıkla</span>
              </div>
            </div>

            <div className="absolute top-5 right-5 bg-black/30 backdrop-blur-md p-2.5 rounded-full border border-white/20 z-10 shadow-lg group-hover:scale-110 transition-transform">
              <RotateCw size={18} className="text-white" />
            </div>
          </div>

          {/* BACK FACE */}
          <div
            className="absolute inset-0 w-full h-full backface-hidden flex items-center justify-center overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            {/* Creative Blurred Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src={data.flipData.backImage}
                alt=""
                className="w-full h-full object-cover blur-[60px] opacity-40 scale-110"
              />
              <div className="absolute inset-0 bg-white/10" />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-[1] pointer-events-none" />
            <img src={data.flipData.backImage} alt="Back" className="max-w-full max-h-full object-contain relative z-[2]" />

            {/* Back Content - Matches Front layout */}
            <div className="absolute bottom-0 left-0 w-full p-8 text-white z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-emerald-600/90 backdrop-blur-md px-3 py-1 rounded-[5px] text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/20">
                  Yanıt / Bilgi
                </span>
              </div>
              {data.flipData.backLink ? (
                <a
                  href={data.flipData.backLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="block hover:opacity-80 transition-opacity"
                >
                  <h3 className="text-3xl font-black leading-tight mb-2 drop-shadow-md">{data.flipData.backTitle}</h3>
                </a>
              ) : (
                <h3 className="text-3xl font-black leading-tight mb-2 drop-shadow-md">{data.flipData.backTitle}</h3>
              )}
              {data.flipData.backDescription && (
                <div
                  className="text-white/90 text-sm leading-relaxed mb-5 line-clamp-2 font-medium"
                  dangerouslySetInnerHTML={{ __html: data.flipData.backDescription }}
                />
              )}
              <div className="flex items-center gap-2.5 text-white/70 text-[10px] font-bold uppercase tracking-widest">
                <div className="p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                  <RotateCw size={12} className="animate-spin-slow" />
                </div>
                <span>Ön Yüz İçin Tıkla</span>
              </div>
            </div>

            <div className="absolute top-5 right-5 bg-black/30 backdrop-blur-md p-2.5 rounded-full border border-white/20 z-10 shadow-lg group-hover:scale-110 transition-transform">
              <RotateCw size={18} className="text-white" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FlipCard;
