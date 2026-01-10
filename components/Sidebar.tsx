
import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { NavigationItem } from '../types';
import Footer from './Footer';

interface SidebarProps {
  items: NavigationItem[];
  activeCategory?: string | null;
  onPublisherItemClick?: (publisher: string) => void;
  onCategoryItemClick?: (category: string | null) => void;
}

// 🌈 SIRA TABANLI RENK MOTORU (SEQUENTIAL COLOR ENGINE) - Consistency with brand aesthetics
const ICON_COLORS = [
  '#FF6B00', '#448AFF', '#9C27B0', '#E91E63', '#3F51B5', '#00BCD4',
  '#4CAF50', '#FF5252', '#FF9800', '#673AB7', '#2196F3', '#009688'
];

const Sidebar: React.FC<SidebarProps> = ({ items, activeCategory, onCategoryItemClick }) => {
  const { t } = useLanguage();

  // 1. Root items are considered "Ana Kategoriler"
  const rootItems = useMemo(() => {
    return items.filter(i => !i.parent_id || i.parent_id === 'root')
      .sort((a, b) => a.order_index - b.order_index);
  }, [items]);

  // 2. Detect selected item and its root ancestor
  const selectedItem = useMemo(() => {
    if (!activeCategory) return null;
    return items.find(i => i.value === activeCategory || i.label === activeCategory);
  }, [activeCategory, items]);

  const findRootId = (itemId: string | null): string | null => {
    if (!itemId) return null;
    const item = items.find(i => i.id === itemId);
    if (!item) return null;
    if (!item.parent_id || item.parent_id === 'root') return item.id;
    return findRootId(item.parent_id);
  };

  const selectedRootId = useMemo(() => selectedItem ? findRootId(selectedItem.id) : null, [selectedItem, items]);

  // 3. Group children of the selected root category
  const children = useMemo(() => {
    if (!selectedRootId) return [];
    return items.filter(i => i.parent_id === selectedRootId).sort((a, b) => a.order_index - b.order_index);
  }, [selectedRootId, items]);

  const districts = children.filter(c => c.type === 'district');
  const categoriesSub = children.filter(c =>
    (c.type === 'category' || c.type === 'dropdown' || c.type === 'link' || !c.type) &&
    c.type !== 'trends' &&
    c.type !== 'district' &&
    c.type !== 'header'
  );
  const trendsSub = children.filter(c => c.type === 'trends');

  const renderIcon = (iconName: string, size = 20, color?: string, isSelected = false) => {
    if (!iconName) return null;
    return (
      <span
        className="material-symbols-rounded transition-all duration-300"
        style={{
          fontSize: `${size}px`,
          color: isSelected ? 'inherit' : (color || 'inherit'),
          fontWeight: isSelected ? '700' : '500'
        }}
      >
        {iconName.toLowerCase()}
      </span>
    );
  };

  return (
    <div className="w-[300px] h-full flex flex-col border-r border-palette-beige/20 overflow-y-auto overflow-x-hidden no-scrollbar py-8 gap-10">

      {/* 1. ANA KATEGORİ SECTION */}
      <div className="px-3">
        <h3 className="text-[10px] font-black text-palette-tan/40 uppercase tracking-[0.2em] mb-4 ml-1">ANA KATEGORİ</h3>
        <div className="flex flex-col gap-1">
          {rootItems.map((item, index) => {
            const isActive = selectedRootId === item.id;
            const iconColor = ICON_COLORS[index % ICON_COLORS.length];

            return (
              <button
                key={item.id}
                onClick={() => onCategoryItemClick?.(item.value || item.label)}
                className={`w-full relative flex items-center py-2.5 px-3 rounded-[5px] transition-all group ${isActive ? 'text-palette-red bg-palette-beige/5' : 'text-gray-600 hover:bg-palette-beige/10'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`transition-all duration-500 ${isActive ? 'text-emerald-500 scale-110' : 'text-gray-400'}`}>
                    {renderIcon(isActive ? 'where_to_vote' : (item.icon || 'grid_view'), 20, isActive ? undefined : iconColor, isActive)}
                  </div>
                  <span className={`text-[14px] font-bold tracking-tight ${isActive ? 'text-gray-900 font-black' : ''}`}>
                    {t(item.label)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DYNAMIC SUB-SECTIONS (Grouped by Type) */}
      {selectedRootId && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-left-4 duration-700">

          {/* İLÇELER HEADER & ITEMS */}
          {districts.length > 0 && (
            <div className="px-3">
              <h3 className="text-[10px] font-black text-palette-tan/40 uppercase tracking-[0.2em] mb-3 ml-1">İLÇELER</h3>
              <div className="flex flex-col gap-1">
                {districts.map((child, idx) => {
                  const isActive = activeCategory === child.value || activeCategory === child.label;
                  const iconColor = ICON_COLORS[(idx + 8) % ICON_COLORS.length];
                  return (
                    <button
                      key={child.id}
                      onClick={() => onCategoryItemClick?.(child.value || child.label)}
                      className={`w-full flex items-center gap-3 py-2 px-3 rounded-[5px] transition-all group ${isActive ? 'text-palette-red bg-palette-beige/5' : 'text-gray-600 hover:bg-palette-beige/10'}`}
                    >
                      <div className={`transition-all duration-500 ${isActive ? 'text-emerald-500 scale-110' : ''}`}>
                        {renderIcon(isActive ? 'where_to_vote' : (child.icon || 'location_on'), 18, isActive ? undefined : iconColor, isActive)}
                      </div>
                      <span className={`text-[13px] font-bold tracking-tight ${isActive ? 'text-gray-900 font-black' : ''}`}>
                        {t(child.label)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* KATEGORİLER HEADER & ITEMS */}
          {categoriesSub.length > 0 && (
            <div className="px-3">
              <h3 className="text-[10px] font-black text-palette-tan/40 uppercase tracking-[0.2em] mb-3 ml-1">KATEGORİLER</h3>
              <div className="flex flex-col gap-1">
                {categoriesSub.map((child, idx) => {
                  const isActive = activeCategory === child.value || activeCategory === child.label;
                  const iconColor = ICON_COLORS[(idx + 5) % ICON_COLORS.length];
                  return (
                    <button
                      key={child.id}
                      onClick={() => onCategoryItemClick?.(child.value || child.label)}
                      className={`w-full flex items-center gap-3 py-2 px-3 rounded-[5px] transition-all group ${isActive ? 'text-palette-red' : 'text-gray-600 hover:bg-palette-beige/10'}`}
                    >
                      <div className={`transition-colors ${isActive ? 'text-palette-red' : ''}`}>
                        {renderIcon(child.icon || 'grid_view', 18, iconColor, isActive)}
                      </div>
                      <span className={`text-[13px] font-bold tracking-tight ${isActive ? 'text-gray-900 font-black' : ''}`}>
                        {t(child.label)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TRENDLER HEADER & ITEMS */}
          {trendsSub.length > 0 && (
            <div className="px-3">
              <h3 className="text-[10px] font-black text-palette-tan/40 uppercase tracking-[0.2em] mb-3 ml-1">TRENDLER</h3>
              <div className="flex flex-col gap-1">
                {trendsSub.map((child, idx) => {
                  const isActive = activeCategory === child.value || activeCategory === child.label;
                  const iconColor = ICON_COLORS[(idx + 2) % ICON_COLORS.length];
                  return (
                    <button
                      key={child.id}
                      onClick={() => onCategoryItemClick?.(child.value || child.label)}
                      className={`w-full flex items-center gap-3 py-2 px-3 rounded-[5px] transition-all group ${isActive ? 'text-palette-red' : 'text-gray-600 hover:bg-palette-beige/10'}`}
                    >
                      <div className={`transition-colors ${isActive ? 'text-palette-red' : ''}`}>
                        {renderIcon(child.icon || 'trending_up', 18, iconColor, isActive)}
                      </div>
                      <span className={`text-[13px] font-bold tracking-tight ${isActive ? 'text-gray-900 font-black' : ''}`}>
                        {t(child.label)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      <Footer />
    </div>
  );
};

export default Sidebar;
