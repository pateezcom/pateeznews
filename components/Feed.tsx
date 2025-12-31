
import React, { useState } from 'react';
import StoryBar from './StoryBar';
import NewsCard from './NewsCard';
import { Clock, Flame } from 'lucide-react';
import { NewsItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { NEWS_FEED } from '../constants';

interface FeedProps {
  newsData: NewsItem[];
  onNewsSelect: (id: string) => void;
  onSourceClick?: (name: string) => void;
}

const Feed: React.FC<FeedProps> = ({ newsData, onNewsSelect, onSourceClick }) => {
  const [activeFilter, setActiveFilter] = useState<'latest' | 'popular'>('latest');
  const { t } = useLanguage();

  const displayData = React.useMemo(() => {
    const baExample = NEWS_FEED.find(n => n.id === 'n_ba_1');
    const flipExample = NEWS_FEED.find(n => n.id === 'n_flip_1');

    const sortedData = activeFilter === 'popular'
      ? [...newsData].sort((a, b) => b.likes - a.likes)
      : newsData;

    // Örnekleri listenin en başına sabitlemek için önce mevcut listeden çıkarıyoruz (varsalar)
    const dataWithoutExamples = sortedData.filter(n => n.id !== 'n_ba_1' && n.id !== 'n_flip_1');

    return [
      ...(baExample ? [baExample] : []),
      ...(flipExample ? [flipExample] : []),
      ...dataWithoutExamples
    ];
  }, [newsData, activeFilter]);

  return (
    <div className="flex flex-col gap-6 pb-4">
      <StoryBar />

      <div className="px-1 mt-2 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight leading-none font-display">
              {t('feed.title_prefix')} <span className="text-palette-tan font-medium opacity-60">{t('feed.title_suffix')}</span>
            </h2>
          </div>

          <div className="flex p-1.5 bg-palette-beige/10 rounded-2xl border border-palette-beige/20 backdrop-blur-sm self-start sm:self-auto shadow-inner">
            <button
              onClick={() => setActiveFilter('latest')}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold tracking-tight transition-all duration-500 ${activeFilter === 'latest'
                ? 'bg-palette-red text-white shadow-xl shadow-palette-red/20 scale-100'
                : 'text-palette-tan hover:text-palette-red'
                }`}
            >
              <Clock size={14} strokeWidth={2.5} />
              {t('feed.latest')}
            </button>

            <button
              onClick={() => setActiveFilter('popular')}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold tracking-tight transition-all duration-500 ${activeFilter === 'popular'
                ? 'bg-palette-red text-white shadow-xl shadow-palette-red/20 scale-100'
                : 'text-palette-tan hover:text-palette-red'
                }`}
            >
              <Flame size={14} strokeWidth={2.5} />
              {t('feed.popular')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {displayData.map((news) => (
          <NewsCard
            key={news.id}
            data={news}
            onClick={() => onNewsSelect(news.id)}
            onSourceClick={() => onSourceClick?.(news.source)}
          />
        ))}
        {displayData.length === 0 && (
          <div className="text-center py-20 bg-palette-beige/5 rounded-[40px] border border-dashed border-palette-beige/40">
            <span className="text-palette-tan font-bold tracking-widest text-xs uppercase">{t('feed.empty')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
