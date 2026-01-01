
import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { NewsItem } from '../../types';

interface FlipCardProps {
  data: NewsItem;
}

const FlipCard: React.FC<FlipCardProps> = ({ data }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!data.flipData) return null;

  return (
    <div className="mt-4 space-y-4">
      <div className="px-1 mb-2">
        <p className="text-gray-600 text-sm leading-relaxed">{data.summary}</p>
      </div>

      {/* Card Container with Perspective */}
      <div
        className="w-full h-[500px] cursor-pointer group perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ perspective: '1000px' }}
      >
        {/* Inner Flipper Container */}
        <div
          className="relative w-full h-full transition-transform duration-700 ease-in-out transform-style-3d shadow-xl rounded-lg"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >

          {/* FRONT FACE */}
          <div
            className="absolute inset-0 w-full h-full backface-hidden rounded-lg overflow-hidden bg-white border border-gray-100"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <img src={data.flipData.frontImage} alt="Front" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* Front Content */}
            <div className="absolute bottom-0 left-0 w-full p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
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
                  <h3 className="text-3xl font-black leading-none mb-1">{data.flipData.frontTitle}</h3>
                </a>
              ) : (
                <h3 className="text-3xl font-black leading-none mb-1">{data.flipData.frontTitle}</h3>
              )}
              {data.flipData.frontDescription && (
                <div
                  className="text-white/90 text-sm leading-relaxed mb-4 quill-content"
                  dangerouslySetInnerHTML={{ __html: data.flipData.frontDescription }}
                />
              )}
              <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
                <RotateCw size={14} className="animate-spin-slow" />
                <span>Arkası için dokun</span>
              </div>
            </div>

            {/* Top Right Badge */}
            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/20">
              <RotateCw size={20} className="text-white" />
            </div>
          </div>

          {/* BACK FACE */}
          <div
            className="absolute inset-0 w-full h-full backface-hidden rounded-lg overflow-hidden bg-gray-900"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <img src={data.flipData.backImage} alt="Back" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/40 to-black/80" />

            {/* Back Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-1 bg-blue-500 rounded-full mb-6"></div>
              {data.flipData.backLink ? (
                <a
                  href={data.flipData.backLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="block hover:opacity-80 transition-opacity"
                >
                  <h3 className="text-3xl font-black text-white mb-4 leading-tight">{data.flipData.backTitle}</h3>
                </a>
              ) : (
                <h3 className="text-3xl font-black text-white mb-4 leading-tight">{data.flipData.backTitle}</h3>
              )}
              {data.flipData.backDescription && (
                <div
                  className="text-gray-200 text-sm leading-relaxed font-medium mb-8 max-w-sm quill-content"
                  dangerouslySetInnerHTML={{ __html: data.flipData.backDescription }}
                />
              )}

              <button
                className="group/btn flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <RotateCw size={14} className="group-hover/btn:-rotate-180 transition-transform duration-500" />
                <span>Geri Dön</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FlipCard;
