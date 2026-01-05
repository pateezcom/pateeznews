
import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Sun, Cloud, CloudRain, CloudSun, DollarSign, Euro, Bitcoin, Coins, UserPlus, CheckCircle2, MapPin, Mail, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const RightSidebar: React.FC = () => {
   const { t } = useLanguage();

   const trending = [
      { id: '01', title: 'Dolar Kuru Rekor Kırdı', hits: '128K', category: 'EKONOMİ', rising: true },
      { id: '02', title: 'Derbi Hazırlıkları Başladı', hits: '85K', category: 'SPOR', rising: true },
      { id: '03', title: 'Togg T10F Tanıtıldı', hits: '64K', category: 'TEKNOLOJİ', rising: false },
      { id: '04', title: 'Oscar Adayları Belli Oldu', hits: '42K', category: 'SANAT', rising: true },
   ];

   const markets = [
      { symbol: 'USDT', name: 'Tether/TL', price: '34.42', change: '%0.45', isUp: true, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
      { symbol: 'EUR', name: 'Euro/TL', price: '37.15', change: '%0.12', isUp: true, icon: Euro, color: 'text-palette-tan', bg: 'bg-palette-beige/50' },
      { symbol: 'GA', name: 'Gram Altın', price: '2.450', change: '%-0.23', isUp: false, icon: Coins, color: 'text-amber-600', bg: 'bg-amber-50' },
      { symbol: 'BTC', name: 'Bitcoin', price: '$64.200', change: '%1.85', isUp: true, icon: Bitcoin, color: 'text-orange-500', bg: 'bg-orange-50' },
   ];

   const forecast = [
      { day: 'Pzt', icon: CloudSun, temp: '24°' },
      { day: 'Sal', icon: Sun, temp: '26°' },
      { day: 'Çar', icon: CloudRain, temp: '21°' },
      { day: 'Per', icon: Cloud, temp: '22°' },
      { day: 'Cum', icon: Sun, temp: '25°' },
   ];

   const suggestions = [
      { name: 'Uzay Kaşifi', handle: '@uzaykasifi', img: 'space', bg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400' },
      { name: 'Gurme Buzz', handle: '@gurmebuzz', img: 'food', bg: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400' },
   ];

   return (
      <div className="flex flex-col gap-8 pt-2 pb-10">

         {/* 1. Weather Widget */}
         <div className="bg-white rounded-[5px] border border-palette-beige/60 shadow-sm overflow-hidden relative group">
            <div className="p-6 pb-0 flex items-start justify-between">
               <div>
                  <div className="flex items-center gap-1.5 text-palette-tan/40 mb-2">
                     <MapPin size={12} />
                     <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('right.weather')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="text-4xl font-[900] text-gray-900 tracking-tighter">24°</span>
                     <div className="flex flex-col">
                        <span className="text-xs font-black text-palette-tan">Parçalı Bulutlu</span>
                        <span className="text-[10px] text-palette-tan/40 font-bold">Hissedilen 26°</span>
                     </div>
                  </div>
               </div>
               <div className="w-12 h-12 bg-orange-50 rounded-[5px] flex items-center justify-center">
                  <Sun size={28} className="text-orange-400" />
               </div>
            </div>

            <div className="mt-8 grid grid-cols-5 border-t border-palette-beige/40 bg-palette-beige/5">
               {forecast.map((day, idx) => (
                  <div key={idx} className={`flex flex-col items-center justify-center py-4 gap-2 ${idx !== forecast.length - 1 ? 'border-r border-palette-beige/40' : ''} hover:bg-white transition-colors cursor-default`}>
                     <span className="text-[9px] font-black text-palette-tan/30 uppercase">{day.day}</span>
                     <day.icon size={16} className="text-palette-tan/60" />
                     <span className="text-[11px] font-black text-gray-900">{day.temp}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* 2. Buzz Gündem (Trending) */}
         <div className="bg-white rounded-[5px] border border-palette-beige/60 shadow-sm overflow-hidden">
            <div className="p-6 pb-2 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-palette-red rounded-[5px]"></div>
                  <h3 className="font-bold text-gray-900 uppercase tracking-[0.12em] text-[13px]">{t('right.agenda')}</h3>
               </div>
               <span className="text-[9px] font-black text-palette-red bg-palette-red/5 px-2 py-1 rounded-[5px] border border-palette-red/10 animate-pulse">{t('right.live')}</span>
            </div>

            <div className="flex flex-col p-3 space-y-1">
               {trending.map((item, idx) => (
                  <div key={idx} className="group relative flex items-center gap-5 p-4 rounded-[5px] hover:bg-palette-beige/20 transition-all duration-300 cursor-pointer border border-transparent hover:border-palette-beige/50">
                     <div className="flex flex-col items-center">
                        <span className="text-2xl font-[900] text-palette-tan/10 group-hover:text-palette-tan/30 transition-colors leading-none italic">
                           {item.id}
                        </span>
                     </div>

                     <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                           <span className="text-[8px] font-black text-palette-tan/40 uppercase tracking-[0.2em]">{item.category}</span>
                           <span className="text-[9px] font-bold text-palette-tan/30">{item.hits}</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-gray-900 leading-snug group-hover:text-palette-red transition-colors line-clamp-2 tracking-tight">
                           {item.title}
                        </h4>
                     </div>

                     {item.rising && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-[5px] bg-palette-beige/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                           <TrendingUp size={14} className="text-emerald-500" />
                        </div>
                     )}
                  </div>
               ))}
            </div>

            <button className="w-full py-4 text-[10px] font-black text-palette-tan/40 uppercase tracking-[0.2em] hover:bg-palette-beige/20 hover:text-gray-900 transition-all border-t border-palette-beige/40">
               Tüm Gündemi Keşfet
            </button>
         </div>

         {/* 3. Markets Widget */}
         <div className="bg-white rounded-[5px] border border-palette-beige/60 shadow-sm overflow-hidden">
            <div className="p-6 pb-2 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-palette-tan/20 rounded-[5px]"></div>
                  <h3 className="font-bold text-gray-900 uppercase tracking-[0.12em] text-[13px]">{t('right.markets')}</h3>
               </div>
               <button className="text-[10px] font-bold text-palette-tan/40 hover:text-palette-red uppercase tracking-widest transition-colors">{t('right.all')}</button>
            </div>
            <div className="p-3 space-y-1.5">
               {markets.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-[5px] hover:bg-palette-beige/10 transition-all border border-transparent hover:border-palette-beige/30 cursor-pointer group">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-[5px] ${m.bg} ${m.color} flex items-center justify-center shadow-sm border border-black/5`}>
                           <m.icon size={18} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[11px] font-black text-gray-900">{m.symbol}</span>
                           <span className="text-[9px] font-bold text-palette-tan/30 uppercase tracking-tighter">{m.name}</span>
                        </div>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-palette-tan">{m.price}</span>
                        <span className={`text-[9px] font-black flex items-center gap-0.5 mt-0.5 ${m.isUp ? 'text-emerald-500' : 'text-palette-red'}`}>
                           {m.isUp ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
                           {m.change}
                        </span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* 4. Buzz Radar (Suggestions) */}
         <div>
            <div className="flex items-center justify-between px-3 mb-4">
               <div className="flex items-center gap-2">
                  <Zap size={16} className="text-palette-red" />
                  <h3 className="font-bold text-gray-900 uppercase tracking-[0.12em] text-[13px]">Buzz Radar</h3>
               </div>
               <button className="text-[10px] font-bold text-palette-tan/40 hover:underline uppercase tracking-widest">{t('right.all')}</button>
            </div>

            <div className="space-y-4">
               {suggestions.map((source, i) => (
                  <div key={i} className="group bg-white rounded-[5px] border border-palette-beige/60 p-4 shadow-sm hover:shadow-xl hover:border-palette-tan/10 transition-all duration-500 cursor-pointer relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-16 bg-palette-beige/10">
                        <img src={source.bg} className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
                     </div>

                     <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-[5px] bg-white p-1 shadow-2xl border border-palette-beige relative z-10 group-hover:scale-105 transition-transform duration-500">
                              <img src={`https://picsum.photos/seed/${source.img}/100`} alt={source.name} className="w-full h-full object-cover rounded-[5px]" />
                           </div>
                           <div className="mt-1">
                              <div className="flex items-center gap-1.5">
                                 <h5 className="text-sm font-black text-gray-900">{source.name}</h5>
                                 <CheckCircle2 size={12} className="text-palette-tan fill-palette-tan/5" />
                              </div>
                              <p className="text-[10px] text-palette-tan/40 font-bold uppercase tracking-widest">{source.handle}</p>
                           </div>
                        </div>
                        <button className="w-10 h-10 bg-palette-tan text-white rounded-[5px] flex items-center justify-center hover:bg-gray-900 transition-all shadow-lg shadow-palette-tan/20 active:scale-90">
                           <UserPlus size={16} strokeWidth={2.5} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* 5. Newsletter Box */}
         <div className="bg-gradient-to-br from-gray-900 to-palette-tan rounded-[5px] p-7 text-white shadow-2xl shadow-palette-tan/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-[5px] blur-[50px] -translate-y-10 translate-x-10 group-hover:bg-white/20 transition-all duration-700"></div>
            <div className="relative z-10">
               <div className="w-10 h-10 bg-white/10 rounded-[5px] flex items-center justify-center mb-5 border border-white/10">
                  <Mail size={20} />
               </div>
               <h4 className="font-bold text-xl leading-tight mb-2 tracking-tighter">{t('right.newsletter_title')}</h4>
               <p className="text-[11px] text-white/60 mb-6 font-bold uppercase tracking-widest leading-relaxed">Gündemi kaçırma, her sabah özet cebine gelsin.</p>
               <div className="flex flex-col gap-3">
                  <input
                     type="email"
                     placeholder="E-posta Adresi"
                     className="w-full bg-white/10 border border-white/20 rounded-[5px] px-5 py-3.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all font-bold"
                  />
                  <button className="w-full bg-white text-gray-900 py-3.5 rounded-[5px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-palette-beige transition-all shadow-xl active:scale-95">
                     ABONE OL
                  </button>
               </div>
            </div>
         </div>

      </div>
   );
};

export default RightSidebar;
