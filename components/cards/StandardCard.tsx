
import React from 'react';
import { NewsItem } from '../../types';

interface StandardCardProps {
  data: NewsItem;
}

const StandardCard: React.FC<StandardCardProps> = ({ data }) => {
  return (
    <div className="mt-1 space-y-3 overflow-hidden">
      <div className="px-1 mb-3">
        <div
          className="rich-text-content text-gray-600/80 text-[16px] leading-relaxed font-medium text-left [&>p]:mb-0"
          dangerouslySetInnerHTML={{ __html: data.summary }}
        />
      </div>
      <div className="relative rounded-lg overflow-hidden group flex items-center justify-center">
        <img
          src={data.thumbnail}
          alt={data.title}
          className="w-auto h-auto max-w-full max-h-[400px] object-contain transition-transform duration-1000 group-hover:scale-[1.02] mx-auto"
        />
      </div>
    </div>
  );
};

export default StandardCard;
