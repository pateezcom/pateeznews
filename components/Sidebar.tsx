
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Footer from './Footer';
import { useLanguage } from '../context/LanguageContext';
import { NavigationItem } from '../types';

interface SidebarProps {
  items?: NavigationItem[];
  onPublisherItemClick?: (name: string) => void;
  onCategoryItemClick?: (category: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items: propItems, onPublisherItemClick, onCategoryItemClick }) => {
  const { currentLang, t } = useLanguage();
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [activeParentTop, setActiveParentTop] = useState<string | null>(localStorage.getItem('buzz_active_parent_top'));
  const [activeParentCat, setActiveParentCat] = useState<string | null>(localStorage.getItem('buzz_active_parent_cat'));
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('buzz_sidebar_context');
    return saved ? JSON.parse(saved) : {};
  });

  const publishers = [
    { name: 'Buzz Tech', img: 'https://picsum.photos/seed/tech/100' },
    { name: 'Buzz Culture', img: 'https://picsum.photos/seed/culture/100' },
    { name: 'Buzz Business', img: 'https://picsum.photos/seed/business/100' },
    { name: 'Buzz Sport', img: 'https://picsum.photos/seed/sport/100' },
    { name: 'Buzz Science', img: 'https://picsum.photos/seed/science/100' },
  ];

  useEffect(() => {
    if (propItems) {
      setItems(propItems);
    }
  }, [propItems]);

  const renderIcon = (iconName: string, size = 18) => {
    if (!iconName) return null;
    return (
      <span
        className="material-symbols-rounded"
        style={{ fontSize: `${size}px`, fontVariationSettings: "'FILL' 0, 'wght' 400" }}
      >
        {iconName.toLowerCase()}
      </span>
    );
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.type === 'category' && item.value) {
      onCategoryItemClick?.(item.value);
    }
    if (item.type === 'link' && item.value) {
      onCategoryItemClick?.(item.value.replace('/', ''));
    }
  };

  const getChildren = (parentId: string) => items.filter(i => i.parent_id === parentId);

  // Top Section: Currently selected City/Parent
  const cityRoot = items.find(i => i.label === 'Şehirler' || i.label === t('sidebar.cities'));
  const selectedCityId = selections[cityRoot?.id || ''];
  const selectedCity = items.find(i => i.id === selectedCityId);

  // Dynamic Category Items:
  const dynamicCategoryItems = selectedCityId
    ? getChildren(selectedCityId)
    : items.filter(i => !i.parent_id && i.id !== cityRoot?.id);

  return (
    <div className="flex flex-col gap-8 py-4">

      {/* 1. TOP SECTION (CITIES) */}
      <div className="px-1 flex flex-col gap-0.5">
        {cityRoot && (
          <div className="relative">
            <button
              onClick={() => {
                const isExpanded = activeParentTop === cityRoot.id;
                setActiveParentTop(isExpanded ? null : cityRoot.id);
                if (!isExpanded) localStorage.setItem('buzz_active_parent_top', cityRoot.id);
                else localStorage.removeItem('buzz_active_parent_top');
              }}
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-palette-beige/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className={`transition-colors ${selectedCityId ? 'text-palette-red' : 'text-palette-tan/20'}`}>
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>location_on</span>
                </div>
                <span className={`text-[13px] font-bold ${selectedCityId ? 'text-gray-900' : 'text-palette-tan/60'}`}>
                  {selectedCity ? selectedCity.label : cityRoot.label}
                </span>
              </div>
              <span className={`material-symbols-rounded text-palette-tan/20 transition-transform ${activeParentTop === cityRoot.id ? 'rotate-180' : ''}`} style={{ fontSize: '20px' }}>expand_more</span>
            </button>

            {activeParentTop === cityRoot.id && (
              <div className="mt-1 ml-9 flex flex-col items-start gap-1 border-l border-palette-beige py-1 animate-in fade-in slide-in-from-top-1">
                {getChildren(cityRoot.id).map(child => {
                  if (child.type === 'header') {
                    return (
                      <div key={child.id} className="px-3 py-1.5 pt-3">
                        <span className="text-[10px] font-black text-palette-tan/40 uppercase tracking-widest">
                          {child.label}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <button
                      key={child.id}
                      onClick={() => {
                        handleItemClick(child);
                        const newSelections = { ...selections, [cityRoot.id]: child.id };
                        setSelections(newSelections);
                        localStorage.setItem('buzz_sidebar_context', JSON.stringify(newSelections));
                        setActiveParentTop(null);
                        localStorage.removeItem('buzz_active_parent_top');
                        setActiveParentCat(null);
                      }}
                      className={`text-[12px] font-bold px-3 py-1.5 transition-colors w-full text-left rounded-lg ${selectedCityId === child.id ? 'text-palette-red bg-palette-red/5' : 'text-palette-tan/40 hover:text-palette-tan hover:bg-palette-beige/5'}`}
                    >
                      {child.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. PUBLISHERS */}
      <div className="px-3">
        <h3 className="text-[10px] font-black text-palette-tan/20 uppercase tracking-[0.2em] mb-3">{t('sidebar.publishers')}</h3>
        <div className="flex flex-col gap-1">
          {publishers.map((pub) => (
            <button
              key={pub.name}
              onClick={() => onPublisherItemClick?.(pub.name)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-palette-beige/10 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-palette-beige/40">
                <img src={pub.img} className="w-full h-full object-cover" alt={pub.name} />
              </div>
              <span className="text-[13px] font-bold text-palette-tan/60 group-hover:text-gray-900 transition-colors">{pub.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. CATEGORIES (DYNAMIC SECTION) */}
      <div className="px-3">
        <h3 className="text-[10px] font-black text-palette-tan/20 uppercase tracking-[0.2em] mb-3">{t('sidebar.categories')}</h3>

        <div className="flex flex-col gap-0.5">
          {dynamicCategoryItems
            .filter(item => {
              const label = item.label.toLowerCase();
              return label !== 'gündem' && label !== 'video';
            })
            .map((item) => {
              if (item.type === 'header') {
                return (
                  <div key={item.id} className="pt-4 pb-2 px-3">
                    <span className="text-[10px] font-black text-palette-tan/40 uppercase tracking-widest">
                      {item.label}
                    </span>
                  </div>
                );
              }

              const children = getChildren(item.id);
              const isExpanded = activeParentCat === item.id;
              const selectedChildId = selections[item.id];
              const selectedChild = children.find(c => c.id === selectedChildId);
              const isSelected = !!selectedChildId;

              return (
                <div key={item.id} className="w-full">
                  <button
                    onClick={() => {
                      if (children.length > 0) {
                        const next = isExpanded ? null : item.id;
                        setActiveParentCat(next);
                        if (next) localStorage.setItem('buzz_active_parent_cat', next);
                        else localStorage.removeItem('buzz_active_parent_cat');
                      } else {
                        handleItemClick(item);
                      }
                    }}
                    className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-all ${isSelected ? 'bg-palette-red/5' : 'hover:bg-palette-beige/10'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`transition-colors ${isSelected ? 'text-palette-red' : 'text-palette-tan/20'}`}>
                        {renderIcon(item.icon, 19)}
                      </div>
                      <span className={`text-[13px] font-bold ${isSelected ? 'text-gray-900' : 'text-palette-tan/60'}`}>
                        {selectedChild && !isExpanded ? selectedChild.label : item.label}
                      </span>
                    </div>
                    {children.length > 0 && (
                      <span className={`material-symbols-rounded text-palette-tan/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ fontSize: '20px' }}>expand_more</span>
                    )}
                  </button>

                  {isExpanded && children.length > 0 && (
                    <div className="mt-1 ml-9 flex flex-col items-start gap-1 border-l border-palette-beige py-1 animate-in fade-in slide-in-from-top-1">
                      {children.map(child => (
                        <button
                          key={child.id}
                          onClick={() => {
                            handleItemClick(child);
                            const newSelections = { ...selections, [item.id]: child.id };
                            setSelections(newSelections);
                            localStorage.setItem('buzz_sidebar_context', JSON.stringify(newSelections));
                            setActiveParentCat(null);
                            localStorage.removeItem('buzz_active_parent_cat');
                          }}
                          className={`text-[12px] font-bold px-3 py-1.5 transition-colors w-full text-left rounded-lg ${selectedChildId === child.id ? 'text-palette-red bg-palette-red/5' : 'text-palette-tan/40 hover:text-palette-tan hover:bg-palette-beige/5'}`}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Sidebar;
