
import React from 'react';
import { NewsItem } from '../../types';

interface StandardCardProps {
  data: NewsItem;
}

const StandardCard: React.FC<StandardCardProps> = ({ data }) => {
  return (
    <div className="mt-1 space-y-3">
      <div className="px-1 mb-3">
        <p className="text-gray-600/80 text-[16px] leading-relaxed font-medium">{data.summary}</p>
      </div>
      <div className="relative rounded-lg overflow-hidden group flex items-center justify-center">
        <img
          src={data.thumbnail}
          alt={data.title}
          className="w-auto h-auto max-w-full max-h-[400px] object-contain transition-transform duration-1000 group-hover:scale-[1.02]"
        />
      </div>
    </div>
  );
};

export default StandardCard;
