
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { NavigationMenu, NavigationItem } from '../../types';

// Google Material Symbols Icon List (Optimized for News/Portal)
const ICON_OPTIONS = [
  'home', 'trending_up', 'workspace_premium', 'movie', 'sports_esports', 'favorite', 'microscope',
  'public', 'smartphone', 'location_on', 'flag', 'list', 'check_circle', 'grid_view', 'bolt',
  'music_note', 'photo_camera', 'info', 'star', 'palette', 'shopping_bag', 'coffee', 'directions_car',
  'flight', 'notifications', 'shield', 'credit_card', 'history', 'video_library', 'newspaper', 'tv',
  'local_fire_department', 'rocket_launch', 'monitoring', 'mic', 'headset', 'monitor', 'laptop',
  'memory', 'database', 'code', 'terminal', 'cloud', 'wb_sunny', 'brightness_2', 'umbrella', 'air',
  'restaurant', 'local_pizza', 'sports_bar', 'wine_bar', 'ghost', 'featured_seasonal', 'forest',
  'terrain', 'waves', 'directions_boat', 'domain', 'business_center', 'payments', 'account_balance_wallet',
  'person', 'group', 'lock', 'key', 'visibility', 'mail', 'call', 'chat', 'calendar_month', 'schedule',
  'menu_book', 'library_books', 'school', 'target', 'fitness_center', 'swords', 'search'
];

interface Language {
  code: string;
  name: string;
}

const NavigationSettings: React.FC = () => {
  const { t } = useLanguage();
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('tr');

  // Modal States
  const [showItemModal, setShowItemModal] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);

  // Custom Confirmation States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, label: string } | null>(null);
  const [statusModal, setStatusModal] = useState<{ show: boolean, type: 'error' | 'success', message: string }>({ show: false, type: 'success', message: '' });

  // Drag & Drop
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    label: '',
    type: 'link',
    value: '',
    icon: '',
    parent_id: 'root' as string,
    language_code: 'tr'
  });

  useEffect(() => {
    fetchMenus();
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (activeMenuId) {
      fetchItems(activeMenuId);
    }
  }, [activeMenuId]);

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase.from('languages').select('code, name');
      if (error) throw error;
      setLanguages(data || []);
    } catch (error) {
      console.error("Error fetching languages:", error);
    }
  };

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('navigation_menus').select('*');
      if (error) throw error;
      setMenus(data || []);
      if (data && data.length > 0 && !activeMenuId) {
        setActiveMenuId(data[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async (menuId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .eq('menu_id', menuId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Recursive depth calculation
  const getItemDepth = (itemId: string | null, allItems: NavigationItem[]): number => {
    if (!itemId) return 0;
    const parent = allItems.find(i => i.id === itemId);
    if (!parent) return 0;
    return 1 + getItemDepth(parent.parent_id, allItems);
  };

  const createDefaultMenu = async () => {
    setSeeding(true);
    try {
      const { data: menuData, error: menuError } = await supabase
        .from('navigation_menus')
        .insert({ code: 'sidebar_main', name: 'Ana Sidebar', description: 'Sol taraftaki ana navigasyon menüsü.' })
        .select()
        .single();

      if (menuError) throw menuError;
      const menuId = menuData.id;

      // Temel Öğeler
      const itemsToInsert = [
        { menu_id: menuId, label: 'Şehirler', type: 'dropdown', icon: 'location_on', order_index: 0 },
        { menu_id: menuId, label: 'Trend Başlıklar', type: 'header', icon: 'trending_up', order_index: 10 },
      ];

      for (const item of itemsToInsert) {
        const { data: parentItem } = await supabase.from('navigation_items').insert(item).select().single();

        if (item.label === 'Şehirler' && parentItem) {
          const { data: nigde } = await supabase.from('navigation_items').insert({
            menu_id: menuId, parent_id: parentItem.id, label: 'Niğde', type: 'dropdown', value: 'nigde', icon: 'location_on', order_index: 1
          }).select().single();

          await supabase.from('navigation_items').insert({
            menu_id: menuId, parent_id: parentItem.id, label: 'İstanbul', type: 'category', value: 'istanbul', icon: 'location_on', order_index: 2
          });

          if (nigde) {
            await supabase.from('navigation_items').insert({
              menu_id: menuId, parent_id: nigde.id, label: 'Trendler', type: 'link', value: '/nigde-trend', icon: 'trending_up', order_index: 3
            });
          }
        }
      }

      await fetchMenus();
    } catch (err: any) {
      setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', err.message) });
    } finally {
      setSeeding(false);
    }
  };

  const handleDragSort = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;

    const _items = [...items];
    const draggedItemContent = _items[dragItem.current];

    _items.splice(dragItem.current, 1);
    _items.splice(dragOverItem.current, 0, draggedItemContent);

    dragItem.current = null;
    dragOverItem.current = null;
    setItems(_items);

    try {
      for (let i = 0; i < _items.length; i++) {
        await supabase.from('navigation_items').update({ order_index: i }).eq('id', _items[i].id);
      }
    } catch (error) {
      console.error("Sorting error:", error);
      if (activeMenuId) fetchItems(activeMenuId);
    }
  };

  const handleSaveItem = async () => {
    if (!activeMenuId || !formData.label) return;
    setSaving(true);
    try {
      const payload = {
        menu_id: activeMenuId,
        label: formData.label,
        type: formData.type,
        value: formData.value,
        icon: formData.icon,
        parent_id: formData.parent_id === 'root' ? null : (formData.parent_id || null),
        order_index: editingItem ? editingItem.order_index : items.length,
        language_code: formData.language_code
      };

      if (editingItem) {
        await supabase.from('navigation_items').update(payload).eq('id', editingItem.id);
      } else {
        await supabase.from('navigation_items').insert(payload);
      }

      setShowItemModal(false);
      fetchItems(activeMenuId);
    } catch (error) {
      console.error(error);
      setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', error.message) });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = (id: string, label: string) => {
    setItemToDelete({ id, label });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setSaving(true);
    try {
      await supabase.from('navigation_items').delete().eq('id', itemToDelete.id);
      setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error: any) {
      console.error(error);
      setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', error.message) });
    } finally {
      setSaving(false);
    }
  };

  const openModal = (item?: NavigationItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        label: item.label,
        type: item.type,
        value: item.value || '',
        icon: item.icon || '',
        parent_id: item.parent_id || 'root',
        language_code: item.language_code || 'tr'
      });
    } else {
      setEditingItem(null);
      setFormData({
        label: '',
        type: 'link',
        value: '',
        icon: '',
        parent_id: 'root',
        language_code: 'tr'
      });
    }
    setShowItemModal(true);
  };

  const renderItemRow = (item: NavigationItem, index: number) => {
    const depth = getItemDepth(item.parent_id, items);
    const parentItem = items.find(i => i.id === item.parent_id);

    return (
      <div
        key={item.id}
        draggable
        onDragStart={() => dragItem.current = index}
        onDragEnter={() => dragOverItem.current = index}
        onDragEnd={handleDragSort}
        onDragOver={(e) => e.preventDefault()}
        className={`group flex items-center gap-4 p-3 rounded-[3px] border mb-2 cursor-move transition-all relative overflow-hidden ${dragItem.current === index
          ? 'opacity-50 border-dashed border-blue-400 bg-blue-50 scale-[0.98]'
          : 'bg-white border-palette-tan/20 hover:border-palette-tan/40 hover:shadow-sm'
          }`}
        style={{ marginLeft: `${Math.min(depth * 3, 9)}rem` }}
      >
        <div className="text-palette-tan/20 group-hover:text-palette-tan/60 cursor-grab active:cursor-grabbing pl-2 relative z-10">
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>drag_indicator</span>
        </div>

        <div className="flex-1 flex items-center gap-4 relative z-10">
          {depth > 0 && (
            <div className="text-palette-tan/30 -ml-2">
              <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>subdirectory_arrow_right</span>
            </div>
          )}

          <div className={`w-9 h-9 rounded-[3px] flex items-center justify-center shadow-sm flex-shrink-0 ${item.type === 'dropdown' ? 'bg-orange-50 text-orange-600' :
            item.type === 'header' ? 'bg-palette-tan/5 text-palette-maroon' :
              item.type === 'category' ? 'bg-blue-50 text-blue-600' :
                'bg-emerald-50 text-emerald-600'
            }`}>
            {item.icon ? (
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{item.icon.toLowerCase()}</span>
            ) : (
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>list</span>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-palette-maroon leading-tight truncate">{item.label}</h4>
              {parentItem && <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 hidden sm:inline-block truncate max-w-[100px]"><span className="opacity-50">{t('nav_settings.menu_select')}:</span> {parentItem.label}</span>}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-palette-tan/40 tracking-widest bg-palette-beige/30 px-1.5 py-0.5 rounded">{t(`nav_settings.type.${item.type}`)}</span>
              {item.value && <span className="text-[9px] font-medium text-palette-tan/30 font-mono flex items-center gap-1 truncate max-w-[150px]"><span className="w-1 h-1 bg-palette-tan/30 rounded-[3px]"></span>{item.value}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 relative z-10 bg-white pl-2">
          <button onClick={() => openModal(item)} className="p-2 text-palette-tan/40 hover:text-blue-600 hover:bg-blue-50 rounded-[3px] transition-colors border border-transparent hover:border-blue-100 flex items-center justify-center">
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>edit_square</span>
          </button>
          <button onClick={() => handleDeleteItem(item.id, item.label)} className="p-2 text-palette-tan/40 hover:text-red-600 hover:bg-red-50 rounded-[3px] transition-colors border border-transparent hover:border-red-100 flex items-center justify-center">
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>delete</span>
          </button>
        </div>
      </div>
    );
  };

  const parentOptions = useMemo(() => {
    const options: React.ReactNode[] = [];
    const roots = items.filter(i => !i.parent_id);
    roots.forEach(root => {
      if (editingItem && root.id === editingItem.id) return;
      options.push(
        <option key={root.id} value={root.id} className="font-bold text-gray-900 bg-gray-50">
          {root.label}
        </option>
      );
      const children = items.filter(i => i.parent_id === root.id);
      children.forEach(child => {
        if (editingItem && child.id === editingItem.id) return;
        options.push(
          <option key={child.id} value={child.id} className="text-gray-600">
            &nbsp;&nbsp;&nbsp;↳ {child.label}
          </option>
        );
      });
    });
    return options;
  }, [items, editingItem]);

  return (
    <div className="animate-in fade-in duration-500 admin-font pb-20 text-palette-tan mx-auto">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 px-2">
        <div>
          <h2 className="text-3xl font-black text-palette-maroon tracking-tighter leading-none mb-2">{t('nav_settings.page_title')}</h2>
          <p className="text-[12px] font-bold text-palette-tan/50 tracking-wider">{t('nav_settings.page_desc')}</p>
        </div>

        {activeMenuId && (
          <button
            onClick={() => openModal()}
            className="h-10 px-8 bg-palette-red text-white rounded-[3px] font-black text-[11px] tracking-widest hover:bg-primary-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>add</span>
            <span>{t('nav_settings.add_item')}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-[11px] font-black text-palette-tan/40 px-1">{t('nav_settings.menu_select')}</h3>
          <div className="space-y-2">
            {menus.length > 0 ? menus.map(menu => (
              <button
                key={menu.id}
                onClick={() => setActiveMenuId(menu.id)}
                className={`w-full text-left p-4 rounded-[3px] border transition-all ${activeMenuId === menu.id
                  ? 'bg-palette-maroon border-palette-maroon text-white shadow-xl scale-105'
                  : 'bg-white border-palette-tan/15 text-palette-tan hover:border-palette-tan/30'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">{menu.name}</span>
                  {activeMenuId === menu.id && <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>check_circle</span>}
                </div>
                <p className={`text-[11px] ${activeMenuId === menu.id ? 'text-white/60' : 'text-palette-tan/40'}`}>{menu.description}</p>
              </button>
            )) : (
              <div className="text-center p-6 bg-white rounded-[3px] border border-palette-tan/15 border-dashed">
                <p className="text-[11px] text-palette-tan/40 font-bold mb-3">{t('stories.empty_state')}</p>
                <button
                  onClick={createDefaultMenu}
                  disabled={seeding}
                  className="w-full py-2 bg-palette-tan/10 text-palette-tan rounded-[3px] text-[10px] font-black hover:bg-palette-tan hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  {seeding ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '14px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>bolt</span>}
                  {t('nav_settings.create_default')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-palette-beige/20 border border-palette-tan/25 rounded-[3px] p-6 min-h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <span className="material-symbols-rounded animate-spin text-palette-tan/30" style={{ fontSize: '32px' }}>progress_activity</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-white rounded-[3px] flex items-center justify-center mb-4 shadow-sm border border-palette-tan/15">
                  <span className="material-symbols-rounded text-palette-tan/30" style={{ fontSize: '24px' }}>list</span>
                </div>
                <p className="text-sm font-bold text-palette-maroon mb-4">{t('nav_settings.empty')}</p>
                {activeMenuId && (
                  <button
                    onClick={() => openModal()}
                    className="px-6 py-2 bg-white border border-palette-tan/15 rounded-[3px] text-palette-tan text-xs font-bold hover:border-palette-tan transition-all"
                  >
                    {t('nav_settings.add_item')}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {items.map((item, index) => renderItemRow(item, index))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showItemModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/90 backdrop-blur-md animate-in fade-in" onClick={() => !saving && setShowItemModal(false)} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 flex flex-col">
            <div className="px-8 py-6 border-b border-palette-tan/15 flex items-center justify-between bg-palette-beige/10">
              <h3 className="text-lg font-black text-palette-maroon tracking-tight flex items-center gap-2">
                <div className="p-1.5 bg-palette-red rounded-[3px] text-white shadow-md flex items-center justify-center">
                  {editingItem ? <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>edit_square</span> : <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>add</span>}
                </div>
                {editingItem ? t('common.edit') : t('nav_settings.add_item')}
              </h3>
              <button onClick={() => setShowItemModal(false)} className="p-1.5 text-palette-tan/40 hover:text-palette-red transition-colors flex items-center justify-center"><span className="material-symbols-rounded" style={{ fontSize: '20px' }}>close</span></button>
            </div>

            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-palette-tan/50 ml-1 flex items-center gap-1.5">
                  <span className="material-symbols-rounded" style={{ fontSize: '12px' }}>public</span> {t('lang.page_title')}
                </label>
                <div className="relative group">
                  <select
                    value={formData.language_code}
                    onChange={e => setFormData({ ...formData, language_code: e.target.value })}
                    className="w-full h-11 px-4 bg-palette-beige/30 border border-palette-tan/10 rounded-[3px] text-sm font-bold text-palette-maroon outline-none focus:bg-white focus:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all appearance-none cursor-pointer"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/30 pointer-events-none group-hover:text-palette-maroon transition-colors" style={{ fontSize: '14px' }}>expand_more</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-palette-tan/50 ml-1">{t('nav_settings.form.label')}</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={e => setFormData({ ...formData, label: e.target.value })}
                  placeholder={t('nav_settings.form.label_placeholder')}
                  className="w-full h-11 px-4 bg-palette-beige/30 border border-palette-tan/10 rounded-[3px] text-sm font-bold text-palette-maroon outline-none focus:bg-white focus:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-palette-tan/50 ml-1">{t('nav_settings.form.type')}</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-11 px-4 bg-palette-beige/30 border border-palette-tan/10 rounded-[3px] text-sm font-bold text-palette-maroon outline-none focus:bg-white focus:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all appearance-none cursor-pointer"
                  >
                    <option value="link">{t('nav_settings.type.link')}</option>
                    <option value="dropdown">{t('nav_settings.type.dropdown')}</option>
                    <option value="category">{t('nav_settings.type.category')}</option>
                    <option value="header">{t('nav_settings.type.header')}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-palette-tan/50 ml-1">{t('nav_settings.menu_select')}</label>
                  <select
                    value={formData.parent_id}
                    onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full h-11 px-4 bg-palette-beige/30 border border-palette-tan/10 rounded-[3px] text-sm font-bold text-palette-maroon outline-none focus:bg-white focus:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all appearance-none cursor-pointer"
                  >
                    <option value="root">-- {t('nav_settings.create_default')} --</option>
                    {parentOptions}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-palette-tan/50 ml-1">{t('nav_settings.form.value')}</label>
                <div className="relative">
                  <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/30" style={{ fontSize: '16px' }}>settings</span>
                  <input
                    type="text"
                    value={formData.value}
                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === 'link' ? '/sayfa-adi' : 'kategori-kodu'}
                    className="w-full h-11 pl-11 pr-4 bg-palette-beige/30 border border-palette-tan/10 rounded-[3px] text-sm font-bold text-palette-maroon outline-none focus:bg-white focus:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-palette-tan/50 ml-1">{t('nav_settings.form.icon')}</label>
                <div
                  onClick={() => setShowIconPicker(true)}
                  className="w-full h-11 px-4 bg-palette-beige/30 border border-palette-tan/10 rounded-[3px] flex items-center justify-between cursor-pointer hover:bg-white hover:border-palette-tan transition-all group"
                >
                  <div className="w-7 h-7 bg-white rounded-[3px] flex items-center justify-center text-palette-tan shadow-sm border border-palette-beige group-hover:bg-palette-tan group-hover:text-white transition-all overflow-hidden shrink-0">
                    <span className="material-symbols-rounded" style={{ fontSize: '16px', width: '16px', height: '16px' }}>
                      {(formData.icon || 'interests').toLowerCase()}
                    </span>
                  </div>
                  <span className={`text-sm font-bold truncate max-w-[180px] ${formData.icon ? 'text-palette-maroon' : 'text-palette-tan/30'}`}>
                    {formData.icon || t('nav_settings.form.icon')}
                  </span>
                  <span className="material-symbols-rounded text-palette-tan/20" style={{ fontSize: '16px' }}>chevron_right</span>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-palette-beige bg-palette-beige/10 flex items-center justify-end gap-3">
              <button onClick={() => setShowItemModal(false)} className="px-5 py-2.5 font-black text-[11px] text-palette-tan/40 hover:text-palette-maroon tracking-widest">{t('common.cancel')}</button>
              <button
                onClick={handleSaveItem}
                disabled={saving || !formData.label}
                className="flex items-center gap-2 px-8 py-3 bg-palette-tan text-white rounded-[3px] font-black text-[11px] tracking-widest hover:bg-palette-maroon shadow-xl active:scale-95 disabled:opacity-40 transition-all"
              >
                {saving ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>save</span>}
                <span>{editingItem ? t('nav_settings.form.save_btn') : t('nav_settings.form.add_btn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-sm animate-in fade-in" onClick={() => !saving && setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 p-8 text-center">
            <div className="w-20 h-20 bg-red-50 text-palette-red rounded-[3px] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <span className="material-symbols-rounded" style={{ fontSize: '32px' }}>delete</span>
            </div>
            <h3 className="text-xl font-black text-palette-maroon tracking-tight mb-3">{t('nav_settings.delete_title')}</h3>
            <p className="text-[13px] font-bold text-palette-tan/60 leading-relaxed mb-8">
              <span className="text-palette-maroon">"{itemToDelete?.label}"</span> {t('nav_settings.delete_confirm').replace('{name}', '')}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                disabled={saving}
                className="w-full h-12 bg-palette-red text-white rounded-[3px] font-black text-[11px] tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-palette-red/20 flex items-center justify-center gap-2"
              >
                {saving ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>delete</span>}
                {t('common.delete_kalici')}
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full h-12 bg-palette-beige/30 text-palette-tan rounded-[3px] font-black text-[11px] tracking-widest hover:bg-palette-beige/50 transition-all">
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showIconPicker && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-md animate-in fade-in" onClick={() => setShowIconPicker(false)} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-2xl h-[600px] overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 flex flex-col">
            <div className="px-10 py-8 border-b border-palette-tan/15 flex items-center justify-between bg-palette-beige/5">
              <div>
                <h3 className="text-2xl font-black text-palette-maroon tracking-tight">{t('nav_settings.form.icon')}</h3>
                <p className="text-[11px] font-bold text-palette-tan/40 tracking-widest mt-1">Google Material Icons</p>
              </div>
              <button onClick={() => setShowIconPicker(false)} className="w-12 h-12 flex items-center justify-center bg-palette-beige/30 hover:bg-palette-red hover:text-white rounded-[3px] transition-all flex items-center justify-center"><span className="material-symbols-rounded" style={{ fontSize: '24px' }}>close</span></button>
            </div>

            <div className="p-8 pb-4 space-y-4">
              <div className="relative group">
                <span className="material-symbols-rounded absolute left-5 top-1/2 -translate-y-1/2 text-palette-tan/20 group-focus-within:text-palette-tan transition-colors" style={{ fontSize: '22px' }}>search</span>
                <input
                  type="text"
                  placeholder={t('nav_settings.icon_search_placeholder')}
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  className="w-full h-16 pl-14 pr-6 bg-palette-beige/10 border-2 border-palette-tan/15 rounded-[3px] text-lg font-bold outline-none focus:border-palette-tan transition-all"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-palette-tan/40 uppercase tracking-widest ml-1 mb-1.5 block">Manuel İkon Adı</label>
                  <input
                    type="text"
                    placeholder={t('nav_settings.icon_manual_placeholder')}
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full h-11 px-4 bg-palette-beige/5 border border-palette-tan/10 rounded-[3px] text-sm font-bold text-palette-maroon outline-none focus:bg-white focus:border-palette-tan transition-all"
                  />
                </div>
                <div className="pt-5">
                  <a href="https://fonts.google.com/icons?icon.set=Material+Symbols" target="_blank" rel="noopener noreferrer" className="h-11 px-4 flex items-center gap-2 bg-blue-50 text-blue-600 rounded-[3px] text-[11px] font-black hover:bg-blue-600 hover:text-white transition-all border border-blue-100">
                    <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>public</span> {t('nav_settings.all_icons')}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-10 no-scrollbar">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {ICON_OPTIONS.filter(opt => opt.toLowerCase().includes(iconSearch.toLowerCase())).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setFormData({ ...formData, icon: opt });
                      setShowIconPicker(false);
                      setIconSearch('');
                    }}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-[3px] border transition-all group ${formData.icon === opt
                      ? 'bg-palette-tan border-palette-tan text-white shadow-xl scale-105'
                      : 'bg-white border-palette-tan/10 text-palette-tan/40 hover:border-palette-tan/20 hover:text-palette-maroon overflow-hidden'
                      }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center overflow-hidden shrink-0">
                      <span className="material-symbols-rounded select-none" style={{ fontSize: '24px', width: '24px', height: '24px' }}>{opt}</span>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tighter truncate w-full text-center px-0.5">{opt.replace(/_/g, ' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {statusModal.show && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/20 backdrop-blur-[2px] animate-in fade-in" onClick={() => setStatusModal({ ...statusModal, show: false })} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-xs overflow-hidden animate-in slide-in-from-bottom-4 border border-palette-tan/15 p-6 text-center">
            <div className={`w-14 h-14 rounded-[3px] flex items-center justify-center mx-auto mb-4 ${statusModal.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {statusModal.type === 'error' ? <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>close</span> : <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>check_circle</span>}
            </div>
            <p className="text-sm font-bold text-palette-maroon mb-6 leading-relaxed">{statusModal.message}</p>
            <button
              onClick={() => setStatusModal({ ...statusModal, show: false })}
              className="w-full py-3 bg-palette-tan text-white rounded-[3px] font-black text-[11px] tracking-widest hover:bg-palette-maroon transition-all"
            >
              {t('common.ok')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationSettings;
