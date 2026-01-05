
import React from 'react';
import {
  TrendingUp, Award, Clapperboard, Gamepad2, Heart,
  Microscope, Globe, Smartphone, ArrowLeft, Search,
  Zap, Star, Flame, LayoutGrid
} from 'lucide-react';

interface Category {
  id: string;
  label: string;
  icon: any;
  color: string;
  bg: string;
  description: string;
  count: string;
  trending?: boolean;
}

const CATEGORIES: Category[] = [
  { id: '1', label: 'Trendler', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50', description: 'Şu an dünyada ve Türkiye\'de en çok konuşulan her şey.', count: '1.2K Haber', trending: true },
  { id: '2', label: 'Teknoloji', icon: Smartphone, color: 'text-cyan-500', bg: 'bg-cyan-50', description: 'Yapay zeka, yeni cihazlar, sızıntılar ve gelecek vizyonu.', count: '850+ Haber' },
  { id: '3', label: 'Gündem', icon: Globe, color: 'text-green-500', bg: 'bg-green-50', description: 'Siyaset, ekonomi ve toplumsal olaylardan anlık gelişmeler.', count: '2.4K Haber' },
  { id: '4', label: 'Spor', icon: Award, color: 'text-blue-500', bg: 'bg-blue-50', description: 'Futbol, basketbol ve tüm spor dallarından canlı skorlar.', count: '640+ Haber' },
  { id: '5', label: 'Sinema', icon: Clapperboard, color: 'text-purple-500', bg: 'bg-purple-50', description: 'Film incelemeleri, dizi önerileri ve Hollywood haberleri.', count: '420+ Haber' },
  { id: '6', label: 'Yaşam', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50', description: 'Sağlık, stil, beslenme ve kaliteli yaşam rehberi.', count: '530+ Haber' },
  { id: '7', label: 'Bilim', icon: Microscope, color: 'text-indigo-500', bg: 'bg-indigo-50', description: 'Uzay keşifleri, kuantum fiziği ve bilimsel devrimler.', count: '310+ Haber' },
  { id: '8', label: 'Oyun', icon: Gamepad2, color: 'text-red-500', bg: 'bg-red-50', description: 'E-spor dünyası, oyun rehberleri ve yeni nesil konsollar.', count: '780+ Haber' },
];

interface CategoriesListProps {
  onBack: () => void;
  onCategorySelect: (label: string) => void;
}

const CategoriesList: React.FC<CategoriesListProps> = ({ onBack, onCategorySelect }) => {
  return (
    <div className="animate-in bg-white rounded-[5px] border border-gray-200 shadow-sm overflow-hidden mb-10">

      {/* Header Section */}
      <div className="p-8 md:p-12 border-b border-gray-50 bg-gray-50/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Ana Akış</span>
          </button>

          <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-[5px] shadow-sm w-full max-w-md focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-200 transition-all">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Kategori ara..."
              className="bg-transparent border-none outline-none text-sm font-bold w-full text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-[5px] text-[10px] font-black uppercase tracking-widest mb-4">
            <LayoutGrid size={14} />
            Buzz Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-[900] text-gray-900 tracking-tight mb-4">Keşfete Başla</h1>
          <p className="text-gray-500 text-lg font-medium leading-relaxed">
            Sadece ilgini çeken dünyalara dal. Buzz ekosistemindeki binlerce haberi kategorize ettik.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="p-8 md:p-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.label)}
              className="group relative flex flex-col p-6 rounded-[5px] border border-gray-100 bg-white hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/40 transition-all duration-500 text-left overflow-hidden"
            >
              {/* Card Decoration */}
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-[5px] ${cat.bg} opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl -z-0`} />

              <div className={`w-14 h-14 ${cat.bg} ${cat.color} rounded-[5px] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10`}>
                <cat.icon size={28} strokeWidth={2.5} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">{cat.label}</h3>
                  {cat.trending && <Flame size={14} className="text-orange-500 animate-pulse" />}
                </div>
                <p className="text-xs text-gray-500 font-bold leading-relaxed mb-6 line-clamp-2">
                  {cat.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cat.count}</span>
                  <div className="w-8 h-8 rounded-[5px] bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Zap size={14} />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Banner */}
      <div className="mx-8 md:mx-12 mb-12 p-8 bg-gray-900 rounded-[5px] relative overflow-hidden group cursor-pointer">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-[5px] blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">
              <Star size={14} fill="currentColor" />
              Günün Popüleri
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Yapay Zeka Devrimi mi?</h2>
            <p className="text-gray-400 text-sm font-medium">Bu hafta Teknoloji kategorisinde en çok okunan başlıkları gör.</p>
          </div>
          <button
            onClick={() => onCategorySelect('Teknoloji')}
            className="px-8 py-3 bg-white text-gray-900 rounded-[5px] font-black text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95"
          >
            Hemen Oku
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesList;
