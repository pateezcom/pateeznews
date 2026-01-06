
import React, { useState, useEffect } from 'react';
import { Check, X, BarChart3, Award } from 'lucide-react';
import { NewsItem } from '../../types';
import AnimatedNumber from '../ui/AnimatedNumber';

interface ReviewCardProps {
  data: NewsItem;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ data }) => {
  if (!data.reviewData) return null;
  const { productName, productImage, score, pros, cons, breakdown, verdict } = data.reviewData;

  const [imageRatio, setImageRatio] = useState<'vertical' | 'horizontal'>('horizontal');

  useEffect(() => {
    const url = productImage || data.thumbnail;
    if (url) {
      const img = new Image();
      img.onload = () => {
        if (img.height > img.width) {
          setImageRatio('vertical');
        } else {
          setImageRatio('horizontal');
        }
      };
      img.src = url;
    }
  }, [productImage, data.thumbnail]);

  // Skor rengi belirleme
  let scoreColor = 'text-emerald-500';
  let scoreBg = 'bg-emerald-50';
  let scoreBorder = 'border-emerald-200';

  if (score < 50) {
    scoreColor = 'text-rose-500';
    scoreBg = 'bg-rose-50';
    scoreBorder = 'border-rose-200';
  } else if (score < 80) {
    scoreColor = 'text-amber-500';
    scoreBg = 'bg-amber-50';
    scoreBorder = 'border-amber-200';
  }

  return (
    <div className="mt-1 space-y-3">
      <div className="px-1 mb-3">
        <p className="text-gray-600/80 text-[16px] leading-relaxed font-medium">{data.summary}</p>
      </div>

      <div className="bg-white rounded-[5px] border border-gray-200 overflow-hidden shadow-sm">
        {/* Header Section - Modern Dynamic Sizing */}
        <div className={`relative w-full bg-gray-900 group overflow-hidden flex items-center justify-center transition-all duration-700 ${imageRatio === 'vertical' ? 'h-[400px]' : 'h-auto min-h-[240px]'
          }`}>
          {/* Background Blur for empty spaces in Vertical mode */}
          {imageRatio === 'vertical' && (
            <div
              className="absolute inset-0 bg-center bg-no-repeat bg-cover blur-2xl opacity-20 scale-110"
              style={{ backgroundImage: `url(${productImage || data.thumbnail})` }}
            />
          )}

          <img
            src={productImage || data.thumbnail}
            alt={productName}
            className={`relative z-10 transition-transform duration-1000 group-hover:scale-105 ${imageRatio === 'vertical' ? 'h-full w-auto object-contain' : 'w-full h-auto block'
              }`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (data.thumbnail && target.src !== data.thumbnail) {
                target.src = data.thumbnail;
              }
            }}
          />
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
          <div className="absolute bottom-0 left-0 w-full p-6 text-white z-30">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-[5px] mb-2">
                  İnceleme
                </span>
                <h3 className="text-3xl font-black leading-none tracking-tight">{productName}</h3>
              </div>
              <div className={`w-20 h-20 rounded-[5px] ${scoreBg} ${scoreBorder} border-4 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-md transform rotate-3`}>
                <span className={`text-2xl font-black ${scoreColor} leading-none`}>
                  <AnimatedNumber value={score} suffix="" />
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">PUAN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Pros */}
            <div className="bg-emerald-50/50 rounded-[5px] p-5 border border-emerald-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-500 p-1 rounded-[5px] text-white"><Check size={14} strokeWidth={4} /></div>
                <h4 className="text-emerald-900 font-extrabold text-sm uppercase tracking-wide">Artılar</h4>
              </div>
              <ul className="space-y-3">
                {pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-emerald-900 text-xs font-bold leading-relaxed">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="bg-rose-50/50 rounded-[5px] p-5 border border-rose-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-rose-500 p-1 rounded-[5px] text-white"><X size={14} strokeWidth={4} /></div>
                <h4 className="text-rose-900 font-extrabold text-sm uppercase tracking-wide">Eksiler</h4>
              </div>
              <ul className="space-y-3">
                {cons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <X size={16} className="text-rose-600 mt-0.5 flex-shrink-0" />
                    <span className="text-rose-900 text-xs font-bold leading-relaxed">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Breakdown Progress Bars */}
          <div className="space-y-4 mb-8">
            <h4 className="font-extrabold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-500" /> Detaylı Puanlama
            </h4>
            <div className="space-y-3">
              {breakdown.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="text-gray-900">{item.score}/100</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-[5px] overflow-hidden">
                    <div
                      className={`h-full rounded-[5px] transition-all duration-1000 ease-out ${item.score >= 90 ? 'bg-emerald-500' : (item.score >= 70 ? 'bg-blue-500' : 'bg-amber-500')
                        }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verdict Box */}
          <div className="bg-gray-900 text-white rounded-[5px] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-[5px] blur-[60px] opacity-20" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 text-blue-300">
                <Award size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Buzz Kararı</span>
              </div>
              <div
                className="text-sm leading-relaxed font-medium text-gray-300 italic [&>p]:mb-0"
                dangerouslySetInnerHTML={{ __html: verdict }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
