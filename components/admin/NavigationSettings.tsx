
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';
import {
  Menu,
  Move,
  Plus,
  Trash2,
  Edit3,
  Save,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Layout,
  Link as LinkIcon,
  Folder,
  Hash,
  Loader2,
  X,
  Type,
  MousePointer2,
  List,
  MapPin,
  Zap,
  Globe,
  Settings,
  CornerDownRight,
  TrendingUp,
  Award,
  Clapperboard,
  Gamepad2,
  Heart,
  Microscope,
  Smartphone,
  Flag,
  Music,
  Camera,
  Info,
  Home,
  Star,
  Palette,
  ShoppingBag,
  Coffee,
  Car,
  Plane,
  Users,
  FileText,
  Bell,
  Shield,
  CreditCard,
  History,
  LayoutGrid,
  Search,
  Check
} from 'lucide-react';
import { NavigationMenu, NavigationItem } from '../../types';

const ICON_OPTIONS = [
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'Award', icon: Award },
  { name: 'Clapperboard', icon: Clapperboard },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Heart', icon: Heart },
  { name: 'Microscope', icon: Microscope },
  { name: 'Globe', icon: Globe },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'MapPin', icon: MapPin },
  { name: 'Flag', icon: Flag },
  { name: 'List', icon: List },
  { name: 'CheckCircle2', icon: CheckCircle2 },
  { name: 'LayoutGrid', icon: LayoutGrid },
  { name: 'Zap', icon: Zap },
  { name: 'Music', icon: Music },
  { name: 'Camera', icon: Camera },
  { name: 'Info', icon: Info },
  { name: 'Home', icon: Home },
  { name: 'Star', icon: Star },
  { name: 'Palette', icon: Palette },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Coffee', icon: Coffee },
  { name: 'Car', icon: Car },
  { name: 'Plane', icon: Plane },
  { name: 'Users', icon: Users },
  { name: 'FileText', icon: FileText },
  { name: 'Bell', icon: Bell },
  { name: 'Shield', icon: Shield },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'History', icon: History }
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
    if (!parent) return 0; // Orphan check
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
        { menu_id: menuId, label: 'Şehirler', type: 'dropdown', icon: 'MapPin', order_index: 0 },
        { menu_id: menuId, label: 'Trend Başlıklar', type: 'header', icon: 'TrendingUp', order_index: 10 },
      ];

      for (const item of itemsToInsert) {
        const { data: parentItem } = await supabase.from('navigation_items').insert(item).select().single();

        if (item.label === 'Şehirler' && parentItem) {
          const { data: nigde } = await supabase.from('navigation_items').insert({
            menu_id: menuId, parent_id: parentItem.id, label: 'Niğde', type: 'dropdown', value: 'nigde', icon: 'MapPin', order_index: 1
          }).select().single();

          await supabase.from('navigation_items').insert({
            menu_id: menuId, parent_id: parentItem.id, label: 'İstanbul', type: 'category', value: 'istanbul', icon: 'MapPin', order_index: 2
          });

          if (nigde) {
            await supabase.from('navigation_items').insert({
              menu_id: menuId, parent_id: nigde.id, label: 'Trendler', type: 'link', value: '/nigde-trend', icon: 'TrendingUp', order_index: 3
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
      // Sadece sıralamayı güncelle
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

    const TypeIcon = item.type === 'dropdown' ? Folder : item.type === 'header' ? Type : item.type === 'category' ? Hash : LinkIcon;

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
        style={{ marginLeft: `${Math.min(depth * 2, 6)}rem` }} // Limit depth indentation
      >
        {/* Visual Guide Lines */}
        {depth > 0 && (
          <div className="absolute left-0 top-0 bottom-0 flex">
            {Array.from({ length: depth }).map((_, i) => (
              <div key={i} className="w-8 border-r border-dashed border-palette-tan/10 h-full opacity-50"></div>
            ))}
          </div>
        )}

        <div className="text-palette-tan/20 group-hover:text-palette-tan/60 cursor-grab active:cursor-grabbing pl-2 relative z-10">
          <Move size={16} />
        </div>

        <div className="flex-1 flex items-center gap-4 relative z-10">
          {depth > 0 && (
            <div className="text-palette-tan/30 -ml-2">
              <CornerDownRight size={16} />
            </div>
          )}

          <div className={`w-9 h-9 rounded-[3px] flex items-center justify-center shadow-sm flex-shrink-0 ${item.type === 'dropdown' ? 'bg-orange-50 text-orange-600' :
            item.type === 'header' ? 'bg-palette-tan/5 text-palette-maroon' :
              item.type === 'category' ? 'bg-blue-50 text-blue-600' :
                'bg-emerald-50 text-emerald-600'
            }`}>
            <TypeIcon size={16} strokeWidth={2.5} />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-palette-maroon leading-tight truncate">{item.label}</h4>
              {parentItem && <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 hidden sm:inline-block truncate max-w-[100px]"><span className="opacity-50">Üst:</span> {parentItem.label}</span>}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-palette-tan/40 tracking-widest bg-palette-beige/30 px-1.5 py-0.5 rounded">{t(`nav_settings.type.${item.type}`)}</span>
              {item.value && <span className="text-[9px] font-medium text-palette-tan/30 font-mono flex items-center gap-1 truncate max-w-[150px]"><span className="w-1 h-1 bg-palette-tan/30 rounded-[3px]"></span>{item.value}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 relative z-10 bg-white pl-2">
          <button onClick={() => openModal(item)} className="p-2 text-palette-tan/40 hover:text-blue-600 hover:bg-blue-50 rounded-[3px] transition-colors border border-transparent hover:border-blue-100">
            <Edit3 size={16} />
          </button>
          <button onClick={() => handleDeleteItem(item.id, item.label)} className="p-2 text-palette-tan/40 hover:text-red-600 hover:bg-red-50 rounded-[3px] transition-colors border border-transparent hover:border-red-100">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  // Safe Options Generator
  const parentOptions = useMemo(() => {
    const options: React.ReactNode[] = [];

    // 1. Level 0 Items
    const roots = items.filter(i => !i.parent_id);

    roots.forEach(root => {
      // Prevent selecting itself as parent
      if (editingItem && root.id === editingItem.id) return;

      options.push(
        <option key={root.id} value={root.id} className="font-bold text-gray-900 bg-gray-50">
          {root.label} (Ana Menü)
        </option>
      );

      // 2. Level 1 Items (Children of Roots)
      const children = items.filter(i => i.parent_id === root.id);
      children.forEach(child => {
        if (editingItem && child.id === editingItem.id) return;

        // Only show level 1 items as parents to restrict to max 3 levels (Root -> L1 -> L2)
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
            <Plus size={16} strokeWidth={3} />
            <span>{t('nav_settings.add_item')}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* LEFT SIDEBAR: MENUS */}
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
                  {activeMenuId === menu.id && <CheckCircle2 size={16} />}
                </div>
                <p className={`text-[11px] ${activeMenuId === menu.id ? 'text-white/60' : 'text-palette-tan/40'}`}>{menu.description}</p>
              </button>
            )) : (
              <div className="text-center p-6 bg-white rounded-[3px] border border-palette-tan/15 border-dashed">
                <p className="text-[11px] text-palette-tan/40 font-bold mb-3">Menü Bulunamadı</p>
                <button
                  onClick={createDefaultMenu}
                  disabled={seeding}
                  className="w-full py-2 bg-palette-tan/10 text-palette-tan rounded-[3px] text-[10px] font-black hover:bg-palette-tan hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  {seeding ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                  {t('nav_settings.create_default')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CONTENT: ITEMS */}
        <div className="lg:col-span-3">
          <div className="bg-palette-beige/20 border border-palette-tan/25 rounded-[3px] p-6 min-h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-palette-tan/30" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-white rounded-[3px] flex items-center justify-center mb-4 shadow-sm border border-palette-tan/15">
                  <List size={24} className="text-palette-tan/30" />
                </div>
                <p className="text-sm font-bold text-palette-maroon mb-4">{t('nav_settings.empty')}</p>
                {activeMenuId && (
                  <button
                    onClick={() => openModal()}
                    className="px-6 py-2 bg-white border border-palette-tan/15 rounded-[3px] text-palette-tan text-xs font-bold hover:border-palette-tan transition-all"
                  >
                    İlk Öğeyi Ekle
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

      {/* MODAL */}
      {showItemModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/90 backdrop-blur-md animate-in fade-in" onClick={() => !saving && setShowItemModal(false)} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 flex flex-col">

            <div className="px-8 py-6 border-b border-palette-tan/15 flex items-center justify-between bg-palette-beige/10">
              <h3 className="text-lg font-black text-palette-maroon tracking-tight flex items-center gap-2">
                <div className="p-1.5 bg-palette-red rounded-[3px] text-white shadow-md">
                  {editingItem ? <Edit3 size={16} /> : <Plus size={16} strokeWidth={3} />}
                </div>
                {editingItem ? 'Öğeyi Düzenle' : t('nav_settings.add_item')}
              </h3>
              <button onClick={() => setShowItemModal(false)} className="p-1.5 text-palette-tan/40 hover:text-palette-red transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-5">
              {/* DİL SEÇİMİ (YENİ) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-palette-tan/50 ml-1 flex items-center gap-1.5">
                  <Globe size={12} /> DİL SEÇİMİ
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
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/30 pointer-events-none group-hover:text-palette-maroon transition-colors" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-palette-tan/50 ml-1">{t('nav_settings.form.label')}</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={e => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Örn: Niğde"
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
                  <label className="text-[11px] font-black text-palette-tan/50 ml-1">Bağlı Olduğu Menü</label>
                  <select
                    value={formData.parent_id}
                    onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full h-11 px-4 bg-palette-beige/30 border border-palette-tan/10 rounded-[3px] text-sm font-bold text-palette-maroon outline-none focus:bg-white focus:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all appearance-none cursor-pointer"
                  >
                    <option value="root">-- Ana Seviye --</option>
                    {parentOptions}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-palette-tan/50 ml-1">{t('nav_settings.form.value')}</label>
                <div className="relative">
                  <Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/30" size={16} />
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
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-white rounded-[3px] flex items-center justify-center text-palette-tan shadow-sm border border-palette-beige group-hover:bg-palette-tan group-hover:text-white transition-all">
                      {formData.icon ? (
                        (() => {
                          const IconComp = ICON_OPTIONS.find(i => i.name === formData.icon)?.icon || MousePointer2;
                          return <IconComp size={16} />;
                        })()
                      ) : <MousePointer2 size={16} />}
                    </div>
                    <span className={`text-sm font-bold ${formData.icon ? 'text-palette-maroon' : 'text-palette-tan/30'}`}>
                      {formData.icon || 'İkon Seçin...'}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-palette-tan/20" />
                </div>
                <p className="text-[11px] text-palette-tan/40 font-bold ml-1">Kategori veya Menü Öğesi İçin Bir Temsilci İkon Seçin.</p>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-palette-beige bg-palette-beige/10 flex items-center justify-end gap-3">
              <button onClick={() => setShowItemModal(false)} className="px-5 py-2.5 font-black text-[11px] text-palette-tan/40 hover:text-palette-maroon tracking-widest">İptal</button>
              <button
                onClick={handleSaveItem}
                disabled={saving || !formData.label}
                className="flex items-center gap-2 px-8 py-3 bg-palette-tan text-white rounded-[3px] font-black text-[11px] tracking-widest hover:bg-palette-maroon shadow-xl active:scale-95 disabled:opacity-40 transition-all"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{editingItem ? t('nav_settings.form.save_btn') : t('nav_settings.form.add_btn')}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-sm animate-in fade-in" onClick={() => !saving && setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-[3px] shadow-[0_20px_70px_rgba(0,0,0,0.2)] w-full max-w-sm overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 p-8 text-center">
            <div className="w-20 h-20 bg-red-50 text-palette-red rounded-[3px] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-palette-maroon tracking-tight mb-3">{t('nav_settings.delete_title')}</h3>
            <p className="text-[13px] font-bold text-palette-tan/60 leading-relaxed mb-8">
              <span className="text-palette-maroon">"{itemToDelete?.label}"</span> {t('nav_settings.delete_confirm').replace('{name}', '')} <br />
              <span className="text-palette-red/70">{t('nav_settings.delete_warning')}</span>
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                disabled={saving}
                className="w-full h-12 bg-palette-red text-white rounded-[3px] font-black text-[11px] tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-palette-red/20 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {t('common.delete_kalici')}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={saving}
                className="w-full h-12 bg-palette-beige/30 text-palette-tan rounded-[3px] font-black text-[11px] tracking-widest hover:bg-palette-beige/50 transition-all"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS MODAL (Success/Error) */}
      {statusModal.show && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/20 backdrop-blur-[2px] animate-in fade-in" onClick={() => setStatusModal({ ...statusModal, show: false })} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-xs overflow-hidden animate-in slide-in-from-bottom-4 border border-palette-tan/15 p-6 text-center">
            <div className={`w-14 h-14 rounded-[3px] flex items-center justify-center mx-auto mb-4 ${statusModal.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {statusModal.type === 'error' ? <X size={24} strokeWidth={3} /> : <CheckCircle2 size={24} strokeWidth={3} />}
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

      {/* ICON PICKER MODAL */}
      {showIconPicker && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-md animate-in fade-in" onClick={() => setShowIconPicker(false)} />
          <div className="relative bg-white rounded-[3px] shadow-[0_40px_100px_rgba(0,0,0,0.3)] w-full max-w-2xl h-[600px] overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 flex flex-col">

            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-palette-tan/15 flex items-center justify-between bg-palette-beige/5">
              <div>
                <h3 className="text-2xl font-black text-palette-maroon tracking-tight">İkon Kütüphanesi</h3>
                <p className="text-[11px] font-bold text-palette-tan/40 tracking-widest mt-1">Kategori İçin En Uygun İkonu Seçin</p>
              </div>
              <button
                onClick={() => setShowIconPicker(false)}
                className="w-12 h-12 flex items-center justify-center bg-palette-beige/30 hover:bg-palette-red hover:text-white rounded-[3px] transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-8 pb-4">
              <div className="relative group">
                <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-palette-tan/20 group-focus-within:text-palette-tan transition-colors" />
                <input
                  type="text"
                  placeholder="İkon ismine göre ara..."
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  className="w-full h-16 pl-14 pr-6 bg-palette-beige/10 border-2 border-palette-tan/15 rounded-[3px] text-lg font-bold outline-none focus:border-palette-tan focus:bg-white focus:ring-8 focus:ring-palette-tan/5 transition-all"
                />
              </div>
            </div>

            {/* Icons Grid */}
            <div className="flex-1 overflow-y-auto px-8 pb-10 no-scrollbar">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {ICON_OPTIONS.filter(opt => opt.name.toLowerCase().includes(iconSearch.toLowerCase())).map((opt) => (
                  <button
                    key={opt.name}
                    onClick={() => {
                      setFormData({ ...formData, icon: opt.name });
                      setShowIconPicker(false);
                      setIconSearch('');
                    }}
                    className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[3px] border-2 transition-all group ${formData.icon === opt.name
                      ? 'bg-palette-tan border-palette-tan text-white shadow-2xl scale-105'
                      : 'bg-white border-palette-tan/15 text-palette-tan/40 hover:border-palette-tan/20 hover:text-palette-maroon hover:shadow-xl'
                      }`}
                  >
                    <div className={`p-3 rounded-[3px] transition-transform duration-500 ${formData.icon === opt.name ? 'bg-white/10' : 'bg-palette-beige/30 group-hover:scale-110 group-hover:rotate-3'}`}>
                      <opt.icon size={28} strokeWidth={formData.icon === opt.name ? 2.5 : 2} />
                    </div>
                    <span className="text-[11px] font-black tracking-widest opacity-80">{opt.name}</span>
                    {formData.icon === opt.name && <Check size={14} className="mt-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-palette-beige/5 border-t border-palette-tan/15 text-center">
              <p className="text-[12px] font-bold text-palette-tan/30">Toplam {ICON_OPTIONS.length} Adet Curated İkon Listeleniyor</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default NavigationSettings;
