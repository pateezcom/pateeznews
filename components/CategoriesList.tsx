
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import {
  ArrowLeft, Search, Zap, Flame, LayoutGrid, Eye, MessageCircle, Heart, Share2, TrendingUp
} from 'lucide-react';

interface Category {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
  description: string;
  count: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  trendingScore: number;
}

// 🎨 Project Balanced Colors (Aligned with Sidebar & Brand)
const CATEGORY_STYLES = [
  { color: 'text-[#FF6B00]', bg: 'bg-[#FF6B00]/5', border: 'border-[#FF6B00]/10' },
  { color: 'text-[#448AFF]', bg: 'bg-[#448AFF]/5', border: 'border-[#448AFF]/10' },
  { color: 'text-[#9C27B0]', bg: 'bg-[#9C27B0]/5', border: 'border-[#9C27B0]/10' },
  { color: 'text-[#E91E63]', bg: 'bg-[#E91E63]/5', border: 'border-[#E91E63]/10' },
  { color: 'text-[#3F51B5]', bg: 'bg-[#3F51B5]/5', border: 'border-[#3F51B5]/10' },
  { color: 'text-[#00BCD4]', bg: 'bg-[#00BCD4]/5', border: 'border-[#00BCD4]/10' },
  { color: 'text-[#4CAF50]', bg: 'bg-[#4CAF50]/5', border: 'border-[#4CAF50]/10' },
  { color: 'text-[#FF5252]', bg: 'bg-[#FF5252]/5', border: 'border-[#FF5252]/10' },
];

interface CategoriesListProps {
  onBack: () => void;
  onCategorySelect: (value: string) => void;
}

const CategoriesList: React.FC<CategoriesListProps> = ({ onBack, onCategorySelect }) => {
  const { currentLang, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Categories from Nav Items
        const { data: navData, error: navError } = await supabase
          .from('navigation_items')
          .select('*')
          .eq('type', 'category')
          .eq('is_active', true)
          .eq('language_code', currentLang.code)
          .order('order_index');

        if (navError) throw navError;

        // 2. Fetch Post Metrics
        const { data: postMetrics, error: metricsError } = await supabase
          .from('posts')
          .select('category, likes_count, comments_count, shares_count')
          .eq('status', 'published')
          .eq('language_code', currentLang.code);

        if (metricsError) throw metricsError;

        const stats: Record<string, any> = {};
        postMetrics?.forEach(p => {
          if (!p.category) return;
          if (!stats[p.category]) stats[p.category] = { count: 0, likes: 0, comments: 0, shares: 0, views: 0 };
          stats[p.category].count += 1;
          stats[p.category].likes += (p.likes_count || 0);
          stats[p.category].comments += (p.comments_count || 0);
          stats[p.category].shares += (p.shares_count || 0);
          stats[p.category].views += (p.likes_count || 0);
        });

        if (navData) {
          const mapped = navData.map((item, idx) => {
            const style = CATEGORY_STYLES[idx % CATEGORY_STYLES.length];
            const val = item.value || item.label;
            const s = stats[val] || stats[item.label] || { count: 0, likes: 0, comments: 0, shares: 0, views: 0 };
            return {
              id: item.id,
              label: item.label,
              value: val,
              icon: item.icon || 'grid_view',
              ...style,
              description:
                t(`${item.label}.description`) !== `${item.label}.description` ? t(`${item.label}.description`) :
                  t(`cat.${val.toLowerCase()}.description`) !== `cat.${val.toLowerCase()}.description` ? t(`cat.${val.toLowerCase()}.description`) :
                    `${t(item.label)} kategorisindeki en son haberler.`,
              count: s.count,
              likes: s.likes,
              comments: s.comments,
              shares: s.shares,
              views: s.views,
              trendingScore: s.likes + (s.comments * 2) + s.shares
            };
          });
          setCategories(mapped);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveData();
  }, [currentLang.code, t]);

  const filteredCategories = useMemo(() => {
    return categories.filter(cat =>
      t(cat.label).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm, t]);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage]);

  const totalPages = Math.ceil(filteredCategories.length / pageSize);

  const popularCategory = useMemo(() => {
    if (categories.length === 0) return null;
    return [...categories].sort((a, b) => b.trendingScore - a.trendingScore)[0];
  }, [categories]);

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="bg-white rounded-[5px] border border-gray-200 overflow-hidden mb-10 min-h-screen flex flex-col">

      {/* 🚀 MINIMAL HEADER */}
      <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-palette-red font-bold text-[11px] uppercase tracking-widest transition-all"
          >
            <ArrowLeft size={16} />
            <span>{t('admin.post.go_back') || 'GERİ DÖN'}</span>
          </button>

          <div className="relative w-full md:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Kategori ara..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-[5px] text-sm font-medium focus:border-palette-red outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-palette-red text-[10px] font-black uppercase tracking-[0.2em] mb-2">
          <LayoutGrid size={14} />
          CANLI HABER HAVUZU
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Kategorileri Keşfet</h1>
      </div>

      {/* 📦 COMPACT CATEGORY LIST/GRID */}
      <div className="p-6 md:p-8 flex-1">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-40 bg-gray-50 animate-pulse rounded-[5px] border border-gray-100" />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Sonuç bulunamadı</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategorySelect(cat.value)}
                className="group flex flex-col p-5 rounded-[5px] border border-gray-100 bg-white hover:border-palette-red/30 hover:shadow-lg transition-all text-left"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 ${cat.bg} ${cat.color} rounded-[5px] flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>{cat.icon.toLowerCase()}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-palette-red transition-colors leading-tight">{t(cat.label)}</h3>
                    <p className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-wider">{cat.count} HABER</p>
                  </div>
                </div>

                <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-4 h-10">
                  {cat.description}
                </p>

                {/* 📊 MINIMAL METRICS - VERTICAL STACKED (Alt Alta) */}
                <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-50">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">İzlenme</span>
                    <span className="text-xs font-black text-gray-700">{formatNumber(cat.views)}</span>
                  </div>
                  <div className="flex flex-col items-center border-l border-gray-50">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Beğeni</span>
                    <span className="text-xs font-black text-gray-700">{formatNumber(cat.likes)}</span>
                  </div>
                  <div className="flex flex-col items-center border-l border-gray-50">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Yorum</span>
                    <span className="text-xs font-black text-gray-700">{formatNumber(cat.comments)}</span>
                  </div>
                  <div className="flex flex-col items-center border-l border-gray-50">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Paylaşım</span>
                    <span className="text-xs font-black text-gray-700">{formatNumber(cat.shares)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 📄 MINIMAL PAGINATION */}
      {totalPages > 1 && !loading && (
        <div className="p-6 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {filteredCategories.length} KATEGORİ
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-[5px] border border-gray-200 text-gray-400 hover:text-palette-red disabled:opacity-30"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="text-xs font-black text-gray-900 mx-2">{currentPage} / {totalPages}</span>
            <button
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-[5px] border border-gray-200 text-gray-400 hover:text-palette-red disabled:opacity-30 rotate-180"
            >
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 🌟 INTEGRATED SMALL BANNER (Haftanın Yıldızı) */}
      {!loading && popularCategory && currentPage === 1 && (
        <div className="m-6 md:m-8 p-8 bg-gray-900 rounded-[5px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-palette-red rounded-full blur-[80px] opacity-20" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-palette-red text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                <TrendingUp size={14} />
                HAFTANIN YILDIZI
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                {t(popularCategory.label)} <span className="text-gray-400 font-normal">| Trendlere Göz At</span>
              </h2>
              <p className="text-gray-400 text-sm font-medium">
                Bu hafta {formatNumber(popularCategory.views)} kişi tarafından incelendi. En güncel haberleri kaçırmayın.
              </p>
            </div>
            <button
              onClick={() => onCategorySelect(popularCategory.value)}
              className="shrink-0 px-8 py-3 bg-white text-gray-900 rounded-[5px] font-black text-xs h-fit hover:bg-palette-red hover:text-white transition-all shadow-xl"
            >
              HEMEN KEŞFET
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesList;
