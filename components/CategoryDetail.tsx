
import React from 'react';
import { ArrowLeft, LayoutGrid, Zap, Filter, TrendingUp, Search } from 'lucide-react';
import { NEWS_FEED } from '../constants';
import NewsCard from './NewsCard';
import { SiteSettings } from '../types';

interface CategoryDetailProps {
  category: string;
  onBack: () => void;
  onNewsSelect: (id: string) => void;
  siteSettings?: SiteSettings | null;
}

const CategoryDetail: React.FC<CategoryDetailProps> = ({ category, onBack, onNewsSelect, siteSettings }) => {
  // Kategoriye ait haberleri filtrele (basit eşleşme için includes kullanıyoruz)
  const categoryNews = NEWS_FEED.filter(news => news.category.toLowerCase().includes(category.toLowerCase()));

  return (
    <div className="animate-in bg-white rounded-[5px] border border-gray-200 shadow-sm overflow-hidden mb-10">

      {/* Header Section */}
      <div className="p-8 md:p-10 border-b border-gray-50 bg-gray-50/30">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 text-gray-400 rounded-[5px] hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm group active:scale-90"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-white border border-gray-200 text-gray-400 rounded-[5px] hover:text-gray-900 transition-all shadow-sm">
              <Filter size={18} />
            </button>
            <button className="p-2.5 bg-white border border-gray-200 text-gray-400 rounded-[5px] hover:text-gray-900 transition-all shadow-sm">
              <TrendingUp size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-3">
              <LayoutGrid size={14} />
              Kategori Keşfi
            </div>
            <h1 className="text-4xl font-[900] text-gray-900 tracking-tight mb-3">{category} Dünyası</h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              {category} kategorisindeki en güncel, derinlemesine analizler ve son dakika gelişmeleri bir arada.
            </p>
          </div>

          <div className="flex items-center gap-4 py-4 px-6 bg-white border border-gray-100 rounded-[5px] shadow-sm">
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-900 leading-none">{categoryNews.length}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Haber</span>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-900 leading-none">12.4K</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Okunma</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content Area: 2-Column Grid matching publisher detail */}
      <div className="p-6 md:p-10 bg-gray-50/20">
        {categoryNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryNews.map(news => (
              <div key={news.id} className="w-full">
                <NewsCard
                  data={news}
                  onClick={() => onNewsSelect(news.id)}
                  siteSettings={siteSettings}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-24 bg-white rounded-[5px] border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-[5px] flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Zap size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Haber Bekleniyor</h3>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-widest px-8">
              Bu kategoriye henüz taze bir haber düşmedi. Takipte kal, ilk sen öğren!
            </p>
            <button
              onClick={onBack}
              className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-[5px] font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
            >
              Geri Dön
            </button>
          </div>
        )}
      </div>

      {/* Footer Newsletter Section */}
      <div className="p-12 border-t border-gray-100 bg-white">
        <div className="max-w-xl mx-auto text-center">
          <h4 className="text-xl font-black text-gray-900 mb-2">Bu Dünyayı Yakından Takip Et</h4>
          <p className="text-gray-500 text-sm font-medium mb-8">Haftalık {category} bültenine abone ol, en önemli gelişmeleri kaçırma.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="E-posta adresin..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-[5px] px-4 text-sm font-bold focus:bg-white focus:border-blue-400 focus:outline-none transition-all"
            />
            <button className="px-6 py-3 bg-blue-600 text-white rounded-[5px] font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              Kaydol
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CategoryDetail;
