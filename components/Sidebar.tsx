
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  TrendingUp,
  Award,
  Clapperboard,
  Gamepad2,
  Heart,
  Microscope,
  Globe,
  Smartphone,
  ChevronRight,
  MapPin,
  ChevronDown,
  ChevronUp,
  Flag,
  CheckCircle2,
  List,
  LayoutGrid,
  Zap
} from 'lucide-react';
import Footer from './Footer';
import { useLanguage } from '../context/LanguageContext';
import { NavigationItem } from '../types';

const ICON_MAP: Record<string, any> = {
  TrendingUp, Award, Clapperboard, Gamepad2, Heart, Microscope, Globe, Smartphone,
  MapPin, Flag, List, CheckCircle2, LayoutGrid, Zap
};

interface SidebarProps {
  onPublishersClick?: () => void;
  onPublisherItemClick?: (name: string) => void;
  onStoriesClick?: () => void;
  onCategoriesTitleClick?: () => void;
  onCategoryItemClick?: (label: string) => void;
  items?: NavigationItem[];
}

const Sidebar: React.FC<SidebarProps> = ({
  onPublishersClick,
  onPublisherItemClick,
  onStoriesClick,
  onCategoriesTitleClick,
  onCategoryItemClick,
  items: propItems
}) => {
  const [items, setItems] = useState<NavigationItem[]>(propItems || []);
  const [activeParentTop, setActiveParentTop] = useState<string | null>(localStorage.getItem('buzz_active_parent_top'));
  const [activeParentCat, setActiveParentCat] = useState<string | null>(localStorage.getItem('buzz_active_parent_cat'));

  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('buzz_sidebar_context');
    return saved ? JSON.parse(saved) : {};
  });

  const { t } = useLanguage();

  const publishers = [
    { name: 'Buzz Tech', img: 'https://picsum.photos/seed/tech/100' },
    { name: 'Buzz Culture', img: 'https://picsum.photos/seed/culture/100' },
    { name: 'Buzz History', img: 'https://picsum.photos/seed/history/100' },
    { name: 'Buzz Gaming', img: 'https://picsum.photos/seed/gaming/100' },
  ];

  useEffect(() => {
    if (propItems && propItems.length > 0) {
      setItems(propItems);
      return;
    }
    const fetchNavigation = async () => {
      try {
        const { data: menuData } = await supabase.from('navigation_menus').select('id').eq('code', 'sidebar_main').single();
        if (menuData) {
          const { data: itemsData } = await supabase
            .from('navigation_items')
            .select('*')
            .eq('menu_id', menuData.id)
            .order('order_index');
          if (itemsData) setItems(itemsData);
        }
      } catch (e) { }
    };
    fetchNavigation();
  }, [propItems]);

  const renderIcon = (iconName: string, size = 18) => {
    const Icon = ICON_MAP[iconName] || List;
    return <Icon size={size} />;
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
  // If a city is selected, show its children as the main list in the category section.
  // Otherwise, show default top-level categories.
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
                  <MapPin size={20} strokeWidth={2.5} />
                </div>
                <span className={`text-[13px] font-bold ${selectedCityId ? 'text-gray-900' : 'text-palette-tan/60'}`}>
                  {selectedCity ? selectedCity.label : cityRoot.label}
                </span>
              </div>
              <ChevronDown size={14} className={`text-palette-tan/20 transition-transform ${activeParentTop === cityRoot.id ? 'rotate-180' : ''}`} />
            </button>

            {activeParentTop === cityRoot.id && (
              <div className="mt-1 ml-9 flex flex-col items-start gap-1 border-l border-palette-beige py-1 animate-in fade-in slide-in-from-top-1">
                {getChildren(cityRoot.id).map(child => (
                  <button
                    key={child.id}
                    onClick={() => {
                      handleItemClick(child);
                      const newSelections = { ...selections, [cityRoot.id]: child.id };
                      setSelections(newSelections);
                      localStorage.setItem('buzz_sidebar_context', JSON.stringify(newSelections));
                      setActiveParentTop(null);
                      localStorage.removeItem('buzz_active_parent_top');
                      // Reset active cat expansion when switching city
                      setActiveParentCat(null);
                    }}
                    className={`text-[12px] font-bold px-3 py-1.5 transition-colors w-full text-left rounded-lg ${selectedCityId === child.id ? 'text-palette-red bg-palette-red/5' : 'text-palette-tan/40 hover:text-palette-tan hover:bg-palette-beige/5'}`}
                  >
                    {child.label}
                  </button>
                ))}
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
          {dynamicCategoryItems.map((item) => {
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
                  className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-all ${isSelected ? 'bg-palette-red/5' : 'hover:bg-palette-beige/10'
                    }`}
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
                    <ChevronDown size={14} className={`text-palette-tan/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
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
