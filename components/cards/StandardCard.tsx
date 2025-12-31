
import React from 'react';
import { NewsItem } from '../../types';

interface StandardCardProps {
  data: NewsItem;
}

const StandardCard: React.FC<StandardCardProps> = ({ data }) => {
  return (
    <div className="mt-4 space-y-4">
      <div className="px-1 mb-4">
        <p className="text-gray-600 text-sm leading-relaxed">{data.summary}</p>
      </div>
      <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
        <img 
          src={data.thumbnail} 
          alt={data.title}
          className="w-full h-auto object-cover max-h-[600px] transition-transform duration-1000 group-hover:scale-[1.02]" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export default StandardCard;
