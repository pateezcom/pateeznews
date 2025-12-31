
import React, { useState, useEffect } from 'react';
import PostTextItem, { PostItem } from './PostTextItem';
import 'react-quill/dist/quill.snow.css';
import { useDropzone } from 'react-dropzone';

// Premium Quill Overrides
const QUILL_CUSTOM_STYLE = `
  .quill-modern-wrapper .ql-toolbar.ql-snow {
    border: none !important;
    background: #fdfaf5 !important;
    border-bottom: 1px solid #e8e2d9 !important;
    padding: 12px 16px !important;
    border-radius: 3px 3px 0 0 !important;
  }
  .quill-modern-wrapper .ql-container.ql-snow {
    border: none !important;
    font-family: inherit !important;
    font-size: 15px !important;
    color: #4a0404 !important;
    min-height: 200px !important;
  }
  .quill-modern-wrapper .ql-editor {
    padding: 24px !important;
    line-height: 1.6 !important;
  }
  .quill-modern-wrapper .ql-editor.ql-blank::before {
    color: rgba(140, 120, 100, 0.3) !important;
    font-style: normal !important;
    font-weight: 500 !important;
    left: 24px !important;
  }
  .quill-modern-wrapper .ql-snow .ql-stroke {
    stroke: #8c7864 !important;
  }
  .quill-modern-wrapper .ql-snow .ql-fill {
    fill: #8c7864 !important;
  }
  .quill-modern-wrapper .ql-snow .ql-picker {
    color: #8c7864 !important;
    font-weight: 600 !important;
  }
`;
import {
    X, Upload, ImageIcon, Zap, Languages, Layout, Trash2, CheckCircle2,
    Plus, Image as LucideImage, Type, List,
    Save, FileText, Settings2,
    Globe, Loader2, Share2,
    Calendar, Clock, SortAsc, SortDesc, Hash, Video, ShieldCheck, ListOrdered, Utensils, BarChart2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { storageService, MediaItem } from '../../services/storageService';
import 'react-quill/dist/quill.snow.css';
import { useLanguage } from '../../context/LanguageContext';

const PostManagement: React.FC = () => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        summary: '',
        category: 'Gündem',
        thumbnail: '',
        seoTitle: '',
        seoDescription: '',
        keywords: '',
        slug: '',
        factChecked: false,
        schemaType: 'NewsArticle',
        publishAt: '',
        items: [] as PostItem[]
    });

    const [showBlockNumbers, setShowBlockNumbers] = useState(true);
    const [activeSort, setActiveSort] = useState<'asc' | 'desc' | null>('asc');
    const [isUrlMode, setIsUrlMode] = useState(false);
    const [showFileManager, setShowFileManager] = useState(false);
    const [localFiles, setLocalFiles] = useState<any[]>([]);
    const [validatingUrl, setValidatingUrl] = useState(false);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [tempUrl, setTempUrl] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [activeDetailTab, setActiveDetailTab] = useState<'article' | 'quiz' | 'poll' | 'video' | 'contents' | 'recipe'>('article');

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        const files = await storageService.getFiles();
        setLocalFiles(files);
    };

    const validateImageUrl = (url: string): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
            setTimeout(() => resolve(false), 5000);
        });
    };

    const handleUrlSubmit = async () => {
        if (!tempUrl) {
            setUrlError('Lütfen bir URL girin');
            return;
        }
        setValidatingUrl(true);
        setUrlError(null);
        const isValid = await validateImageUrl(tempUrl);
        if (isValid) {
            setFormData({ ...formData, thumbnail: tempUrl });
            setIsUrlMode(false);
            setTempUrl('');
        } else {
            setUrlError('Geçersiz görsel URL adresi');
        }
        setValidatingUrl(false);
    };

    const handleAddItem = () => {
        const nextOrder = formData.items.length > 0
            ? Math.max(...formData.items.map(i => i.orderNumber || 0)) + 1
            : 1;
        const newItem: PostItem = {
            id: Math.random().toString(36).substr(2, 9),
            title: '',
            description: '',
            mediaUrl: '',
            createdAt: Date.now(),
            orderNumber: nextOrder
        };
        const newItems = [...formData.items, newItem];
        if (activeSort) {
            newItems.sort((a, b) => {
                const numA = a.orderNumber || 0;
                const numB = b.orderNumber || 0;
                return activeSort === 'asc' ? numA - numB : numB - numA;
            });
        }
        setFormData({ ...formData, items: newItems });
    };

    const handleUpdateItem = (id: string, field: keyof PostItem, value: string) => {
        const updatedItems = formData.items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        setFormData({ ...formData, items: updatedItems });
    };

    const handleRemoveItem = (id: string) => {
        const filtered = formData.items.filter(item => item.id !== id);
        if (activeSort) {
            filtered.sort((a, b) => {
                const numA = a.orderNumber || 0;
                const numB = b.orderNumber || 0;
                return activeSort === 'asc' ? numA - numB : numB - numA;
            });
        }
        setFormData({ ...formData, items: filtered });
    };

    const handleSortItems = (order: 'asc' | 'desc') => {
        const itemsWithNumbers = formData.items.map((item, idx) => ({
            ...item,
            orderNumber: item.orderNumber || (idx + 1)
        }));
        const sorted = [...itemsWithNumbers].sort((a, b) => {
            const numA = a.orderNumber || 0;
            const numB = b.orderNumber || 0;
            if (order === 'asc') return numA - numB;
            return numB - numA;
        });
        setFormData({ ...formData, items: sorted });
        setShowBlockNumbers(true);
        setActiveSort(order);
    };

    const handleMoveItem = (index: number, direction: 'up' | 'down') => {
        const newItems = [...formData.items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return;
        const currentItem = { ...newItems[index] };
        const targetItem = { ...newItems[targetIndex] };
        const tempOrder = currentItem.orderNumber;
        currentItem.orderNumber = targetItem.orderNumber;
        targetItem.orderNumber = tempOrder;
        newItems[index] = currentItem;
        newItems[targetIndex] = targetItem;
        if (activeSort) {
            newItems.sort((a, b) => {
                const numA = a.orderNumber || 0;
                const numB = b.orderNumber || 0;
                return activeSort === 'asc' ? numA - numB : numB - numA;
            });
        }
        setFormData({ ...formData, items: newItems });
    };

    const handleTitleChange = (val: string) => {
        const slug = val.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
            .slice(0, 50);
        setFormData({
            ...formData,
            title: val,
            slug: slug,
            seoTitle: val.slice(0, 60),
            seoDescription: formData.summary || val.slice(0, 160)
        });
    };

    const handleSummaryChange = (val: string) => {
        setFormData({
            ...formData,
            summary: val,
            seoDescription: val.slice(0, 160)
        });
    };

    return (
        <div className="animate-in fade-in duration-500 admin-font">
            <style dangerouslySetInnerHTML={{ __html: QUILL_CUSTOM_STYLE }} />
            {/* MODERN COMPACT HEADER */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-[3px] border border-palette-tan/20 shadow-sm">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-palette-maroon">
                            {formData.id ? 'Haberi Düzenle' : 'Yeni Haber'}
                        </h2>
                        <p className="text-[13px] font-bold text-palette-tan/50 tracking-wider">İçerik ve SEO Entegre Panel</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-6 items-start">
                {/* MAIN CONTENT AREA */}
                <div className="flex-1 space-y-6">
                    {/* JOINED TABS AND CONTENT SECTION */}
                    <div className="bg-white rounded-[3px] border border-palette-tan/20 shadow-sm overflow-hidden">
                        {/* PREMIUM TAB NAVIGATION - IMAGE STYLE */}
                        <div className="border-b border-palette-tan/15 bg-white">
                            <div className="flex h-24">
                                {[
                                    { id: 'article', label: 'Article', icon: FileText },
                                    { id: 'quiz', label: 'Quiz', icon: CheckCircle2 },
                                    { id: 'poll', label: 'Poll', icon: BarChart2 },
                                    { id: 'video', label: 'Video', icon: Video },
                                    { id: 'contents', label: 'Table of Contents', icon: ListOrdered },
                                    { id: 'recipe', label: 'Recipe', icon: Utensils }
                                ].map((tab, idx, arr) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveDetailTab(tab.id as any)}
                                        className={`
                                            flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group
                                            ${idx !== arr.length - 1 ? 'border-r border-palette-tan/10' : ''}
                                            ${activeDetailTab === tab.id
                                                ? 'bg-palette-beige/20 text-palette-maroon'
                                                : 'text-palette-tan/40 hover:bg-palette-beige/5 hover:text-palette-maroon'}
                                        `}
                                    >
                                        <tab.icon
                                            size={28}
                                            strokeWidth={1.5}
                                            className={`${activeDetailTab === tab.id ? 'text-palette-maroon' : 'text-palette-tan/30 group-hover:text-palette-maroon'} transition-colors`}
                                        />
                                        <span className={`text-[12px] uppercase font-black tracking-widest ${activeDetailTab === tab.id ? 'opacity-100' : 'opacity-60'}`}>
                                            {tab.label}
                                        </span>

                                        {/* ACTIVE TRIANGLE POINTER (Points into content area) */}
                                        {activeDetailTab === tab.id && (
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white z-20" />
                                        )}
                                        {activeDetailTab === tab.id && (
                                            <div className="absolute top-[calc(100%+0.5px)] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] border-t-palette-tan/20 z-10" />
                                        )}

                                        {activeDetailTab === tab.id && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-palette-maroon" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* BASIC & SEO INTEGRATED INFO */}
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-3 border-b border-palette-tan/15 pb-4">
                                <FileText size={18} className="text-palette-red" />
                                <h3 className="text-base font-bold text-palette-maroon uppercase tracking-widest">İçerik Bilgileri</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-palette-tan ml-1">Haber Başlığı</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        placeholder="Başlık girin..."
                                        className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] p-3.5 text-[18px] font-bold text-palette-maroon focus:border-palette-red outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-bold text-palette-tan ml-1">Kısa Özet (Spot)</label>
                                    <textarea
                                        rows={2}
                                        value={formData.summary}
                                        onChange={(e) => handleSummaryChange(e.target.value)}
                                        placeholder="Haber özeti..."
                                        className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] p-3.5 text-base font-medium text-palette-maroon focus:border-palette-red outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>

                            {/* AUTOMATED SEO SECTION */}
                            <div className="mt-8 pt-8 border-t border-palette-tan/15 space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Settings2 size={18} className="text-palette-tan" />
                                        <h3 className="text-[13px] font-bold text-palette-tan uppercase tracking-tighter">SEO & AI (Otomatik Yapılandırma)</h3>
                                    </div>
                                    <span className="text-[11px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-[3px] border border-green-100 italic">Google AI Ready</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-bold text-palette-tan/60">SEO Başlık</label>
                                        <input
                                            type="text"
                                            value={formData.seoTitle}
                                            onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                                            className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] p-2 text-sm font-bold text-palette-maroon outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-bold text-palette-tan/60">URL (Slug)</label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] p-2 text-sm font-bold text-palette-red outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-bold text-palette-tan/60">Meta Açıklama</label>
                                    <input
                                        type="text"
                                        value={formData.seoDescription}
                                        onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                                        className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] p-2 text-sm font-medium text-palette-tan outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-bold text-palette-tan/60">Meta Etiketleri (Keywords)</label>
                                    <div className="flex flex-wrap gap-2 p-2 bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] min-h-[38px] transition-all focus-within:border-palette-red/40">
                                        {formData.keywords.split(',').filter(t => t.trim() !== '').map((tag, idx) => (
                                            <span key={idx} className="flex items-center gap-1.5 px-2 py-0.5 bg-palette-maroon text-white text-[11px] font-bold rounded-[3px] animate-in zoom-in duration-200">
                                                {tag.trim()}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newTags = formData.keywords.split(',').filter((_, i) => i !== idx);
                                                        setFormData({ ...formData, keywords: newTags.join(',') });
                                                    }}
                                                    className="hover:text-palette-beige transition-colors"
                                                >
                                                    <X size={10} strokeWidth={3} />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ',') {
                                                    e.preventDefault();
                                                    const val = tagInput.trim().replace(',', '');
                                                    if (val) {
                                                        const currentTags = formData.keywords ? formData.keywords.split(',').map(t => t.trim()) : [];
                                                        if (!currentTags.includes(val)) {
                                                            setFormData({ ...formData, keywords: [...currentTags, val].filter(t => t).join(',') });
                                                        }
                                                        setTagInput('');
                                                    }
                                                } else if (e.key === 'Backspace' && !tagInput && formData.keywords) {
                                                    const currentTags = formData.keywords.split(',');
                                                    currentTags.pop();
                                                    setFormData({ ...formData, keywords: currentTags.join(',') });
                                                }
                                            }}
                                            placeholder={formData.keywords ? "" : "Enter ile ekle..."}
                                            className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-palette-tan min-w-[120px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ITEM LIST CONTROLS */}
                    <div className="flex justify-center items-center py-4">
                        <div className="inline-flex bg-white border border-palette-tan/20 rounded-[3px] p-1.5 shadow-sm gap-1">
                            <button
                                onClick={() => handleSortItems('asc')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-[3px] text-[12px] font-black transition-all active:scale-95 group ${activeSort === 'asc'
                                    ? 'bg-palette-maroon text-white shadow-md shadow-palette-maroon/20 scale-[1.02]'
                                    : 'text-palette-tan hover:text-palette-maroon hover:bg-palette-beige/30'
                                    }`}
                            >
                                <SortAsc size={16} /> NUMERIC ASC
                            </button>
                            <button
                                onClick={() => handleSortItems('desc')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-[3px] text-[12px] font-black transition-all active:scale-95 group ${activeSort === 'desc'
                                    ? 'bg-palette-maroon text-white shadow-md shadow-palette-maroon/20 scale-[1.02]'
                                    : 'text-palette-tan hover:text-palette-maroon hover:bg-palette-beige/30'
                                    }`}
                            >
                                <SortDesc size={16} /> DESC LIST
                            </button>
                            <button
                                onClick={() => setShowBlockNumbers(!showBlockNumbers)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-[3px] text-[12px] font-black transition-all active:scale-95 group ${!showBlockNumbers
                                    ? 'bg-palette-maroon text-white shadow-md shadow-palette-maroon/20 scale-[1.02]'
                                    : 'text-palette-tan hover:text-palette-maroon hover:bg-palette-beige/30'
                                    }`}
                            >
                                <Hash size={15} /> {!showBlockNumbers ? 'HİDE NUMBERS' : 'SHOW NUMBERS'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {formData.items.map((item, index) => (
                            <PostTextItem
                                key={item.id}
                                item={item}
                                index={index}
                                totalItems={formData.items.length}
                                showBlockNumbers={showBlockNumbers}
                                onUpdate={handleUpdateItem}
                                onRemove={handleRemoveItem}
                                onMoveUp={(idx) => handleMoveItem(idx, 'up')}
                                onMoveDown={(idx) => handleMoveItem(idx, 'down')}
                            />
                        ))}

                        <div className="flex pt-4">
                            <button
                                onClick={handleAddItem}
                                className="flex items-center gap-2 px-4 py-2 bg-palette-maroon text-white rounded-[3px] text-[11px] font-black tracking-[0.2em] hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-palette-maroon/10"
                            >
                                <Plus size={14} /> METİN EKLE
                            </button>
                        </div>

                        {formData.items.length === 0 && (
                            <div className="py-20 bg-white border-2 border-dashed border-palette-tan/20 rounded-[3px] flex flex-col items-center justify-center text-palette-tan/40">
                                <Layout size={40} strokeWidth={1} className="mb-4 opacity-20" />
                                <p className="text-[14px] font-black tracking-[0.3em] uppercase">Henüz İçerik Bloğu Eklenmedi</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* SIDEBAR */}
                <div className="w-96 shrink-0 space-y-6">
                    <div className="bg-white p-6 rounded-[3px] border border-palette-tan/20 shadow-sm space-y-5">
                        <div className="space-y-4">
                            <h4 className="text-[13px] font-bold text-palette-tan ml-1 border-b border-palette-tan/15 pb-2 uppercase tracking-widest">Haber Kapağı</h4>
                            <div className="rounded-[3px] bg-palette-beige/5 border-2 border-dashed border-palette-tan/20 flex flex-col items-center justify-center overflow-hidden transition-all relative group aspect-video">
                                {formData.thumbnail ? (
                                    <div className="relative w-full h-full">
                                        <img src={formData.thumbnail} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                            <button
                                                onClick={() => setFormData({ ...formData, thumbnail: '' })}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-palette-red transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div onClick={() => setShowFileManager(true)} className="flex flex-col items-center cursor-pointer group/pick mb-2">
                                            <Plus size={40} className="text-palette-tan/20 group-hover/pick:text-palette-maroon transition-all mb-2" />
                                            <span className="text-[13px] font-bold text-palette-tan/50 px-4 text-center">Görsel Seç</span>
                                        </div>
                                        <button
                                            onClick={() => { setIsUrlMode(true); setTempUrl(''); setUrlError(null); }}
                                            className="mt-2 text-[10px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                        >
                                            <Globe size={11} /> URL İLE EKLE
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[13px] font-bold text-palette-tan ml-1 border-b border-palette-tan/15 pb-2 uppercase tracking-widest">Kategori</h4>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-palette-beige/20 border border-palette-tan/20 rounded-[3px] p-3 text-sm font-bold text-palette-maroon outline-none cursor-pointer"
                            >
                                <option>Gündem</option>
                                <option>Teknoloji</option>
                                <option>Spor</option>
                                <option>Ekonomi</option>
                                <option>Magazin</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[3px] border border-palette-tan/20 shadow-sm space-y-5">
                        <div className="space-y-4">
                            <h4 className="text-[13px] font-bold text-palette-tan ml-1 border-b border-palette-tan/15 pb-2 uppercase tracking-widest">Yayınlama</h4>

                            <div className="flex items-center justify-between p-4 bg-palette-beige/10 rounded-[3px] border border-palette-tan/20">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} className={formData.factChecked ? 'text-green-500' : 'text-palette-tan/30'} />
                                    <span className="text-[13px] font-bold text-palette-maroon">Fact-Check</span>
                                </div>
                                <button onClick={() => setFormData({ ...formData, factChecked: !formData.factChecked })} className={`w-10 h-5 rounded-full relative transition-all ${formData.factChecked ? 'bg-green-500' : 'bg-palette-tan/20'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.factChecked ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-palette-tan/60 ml-1">İLERİ TARİHLİ YAYIN</label>
                                <input
                                    type="datetime-local"
                                    value={formData.publishAt}
                                    onChange={(e) => setFormData({ ...formData, publishAt: e.target.value })}
                                    className="w-full bg-palette-beige/10 border border-palette-tan/20 rounded-[3px] p-3 text-sm font-bold text-palette-maroon outline-none"
                                />
                            </div>

                            <div className="pt-4 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="flex items-center justify-center gap-2 py-2.5 bg-palette-red text-white rounded-[3px] font-black text-[11px] tracking-widest hover:opacity-90 transition-all shadow-lg shadow-palette-red/10">
                                        YAYINLA
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-2.5 bg-palette-maroon text-white rounded-[3px] font-black text-[11px] tracking-widest hover:opacity-90 transition-all shadow-lg shadow-palette-maroon/10">
                                        TASLAK
                                    </button>
                                </div>
                                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-palette-tan text-white rounded-[3px] font-black text-[11px] tracking-widest hover:opacity-90 transition-all shadow-lg shadow-palette-tan/10">
                                    İLERİ TARİHLİ KAYDET
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MEDIA MANAGER MODAL */}
            {showFileManager && (
                <MediaManagerModal
                    onClose={() => setShowFileManager(false)}
                    onSelect={(src) => {
                        setFormData({ ...formData, thumbnail: src });
                        setShowFileManager(false);
                        setUrlError(null);
                    }}
                    localFiles={localFiles}
                    setLocalFiles={setLocalFiles}
                />
            )}

            {/* URL MODE MODAL */}
            {isUrlMode && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsUrlMode(false)} />
                    <div className="bg-white w-full max-w-sm rounded-[3px] overflow-hidden shadow-2xl relative p-8 animate-in zoom-in duration-300 border border-palette-tan/20">
                        <div className="text-center space-y-5">
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-3 bg-palette-beige/20 rounded-full">
                                    <Globe size={24} className="text-palette-maroon" />
                                </div>
                                <h3 className="text-lg font-black text-palette-maroon tracking-tight uppercase">Görsel URL Adresi</h3>
                                <p className="text-[11px] font-bold text-palette-tan/50 leading-relaxed max-w-[200px] mx-auto">
                                    Eklemek istediğiniz görselin doğrudan bağlantısını aşağıya yapıştırın.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <input
                                    autoFocus
                                    type="url"
                                    value={tempUrl}
                                    onChange={(e) => setTempUrl(e.target.value)}
                                    placeholder="https://örnek.com/gorsel.jpg"
                                    className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-3 py-2.5 text-sm font-bold text-palette-maroon outline-none focus:border-palette-maroon transition-all placeholder:text-palette-tan/20"
                                />
                                {urlError && <p className="text-xs font-bold text-red-500 animate-pulse">{urlError}</p>}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleUrlSubmit}
                                    disabled={validatingUrl}
                                    className="flex-1 py-2.5 bg-palette-maroon text-white font-black text-[11px] tracking-widest rounded-[3px] hover:bg-palette-red transition-all shadow-md active:scale-95"
                                >
                                    {validatingUrl ? 'DOGRULANIYOR...' : 'GÖRSELİ GETİR'}
                                </button>
                                <button onClick={() => setIsUrlMode(false)} className="px-5 py-2.5 bg-palette-beige/20 text-palette-tan font-black text-[11px] tracking-widest rounded-[3px] hover:bg-palette-beige/40 transition-all">
                                    İPTAL
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MediaManagerModal: React.FC<{
    onClose: () => void;
    onSelect: (src: string) => void;
    localFiles: any[];
    setLocalFiles: React.Dispatch<React.SetStateAction<any[]>>;
}> = ({ onClose, onSelect, localFiles, setLocalFiles }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            setUploading(true);
            setUploadPreview(URL.createObjectURL(file));
            setUploadProgress(20);
            try {
                const timer = setInterval(() => setUploadProgress(p => p < 90 ? p + 10 : p), 200);
                const result = await storageService.uploadFile(file);
                clearInterval(timer);
                setUploadProgress(100);
                if (result) {
                    setLocalFiles(prev => [result, ...prev]);
                    setSelectedImage(result.src);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setTimeout(() => { setUploading(false); setUploadPreview(null); }, 500);
            }
        },
        accept: 'image/*'
    });

    const filteredFiles = localFiles.filter(f => f.value.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="bg-white w-full max-w-6xl h-[75vh] rounded-[3px] overflow-hidden shadow-2xl relative flex flex-col border border-palette-tan/20">
                <div className="p-4 border-b border-palette-tan/10 flex items-center justify-between bg-white">
                    <h3 className="text-lg font-black text-palette-maroon tracking-widest">MEDYA KÜTÜPHANESİ</h3>
                    <input
                        type="text"
                        placeholder="Ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-xs w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 py-2 text-sm font-bold text-palette-maroon outline-none"
                    />
                    <button onClick={onClose} className="text-palette-tan hover:text-palette-maroon"><X size={24} /></button>
                </div>
                <div className="flex-1 flex overflow-hidden">
                    <div className="w-64 border-r border-palette-tan/10 p-4 space-y-4 shrink-0 bg-palette-beige/5">
                        <div {...getRootProps()} className={`border-2 border-dashed rounded-[3px] p-6 text-center cursor-pointer transition-all ${isDragActive ? 'border-palette-maroon bg-white' : 'border-palette-tan/20 hover:border-palette-maroon'}`}>
                            <input {...getInputProps()} />
                            <Upload size={32} className="mx-auto mb-2 text-palette-tan/30" />
                            <p className="text-[12px] font-black text-palette-maroon tracking-tighter">GÖRSEL YÜKLE</p>
                        </div>
                        {uploading && (
                            <div className="p-3 bg-white border border-palette-tan/20 rounded-[3px]">
                                <div className="flex items-center gap-2 mb-2">
                                    <img src={uploadPreview || ''} className="w-8 h-8 rounded-[3px] object-cover" />
                                    <div className="flex-1 text-[11px] font-bold text-palette-maroon truncate">Yükleniyor...</div>
                                </div>
                                <div className="w-full h-1 bg-palette-beige rounded-full overflow-hidden">
                                    <div className="h-full bg-palette-red transition-all" style={{ width: `${uploadProgress}%` }} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto bg-white custom-scrollbar">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.id}
                                    onClick={() => setSelectedImage(file.src)}
                                    className={`relative aspect-square rounded-[3px] border-2 transition-all cursor-pointer overflow-hidden ${selectedImage === file.src ? 'border-palette-red ring-4 ring-palette-red/10' : 'border-palette-tan/10 hover:border-palette-maroon'}`}
                                >
                                    <img src={file.thumb || file.src} className="w-full h-full object-cover" />
                                    {selectedImage === file.src && (
                                        <div className="absolute top-2 right-2 bg-palette-red text-white rounded-full p-1"><CheckCircle2 size={12} /></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-palette-tan/10 flex justify-end gap-3 bg-palette-beige/5">
                    <button onClick={onClose} className="px-6 py-2.5 text-[12px] font-black text-palette-tan tracking-widest hover:text-palette-maroon">İPTAL</button>
                    <button
                        disabled={!selectedImage || uploading}
                        onClick={() => selectedImage && onSelect(selectedImage)}
                        className="px-8 py-2.5 bg-palette-maroon text-white rounded-[3px] text-[12px] font-black tracking-[0.2em] shadow-lg shadow-palette-maroon/10 disabled:opacity-50"
                    >
                        SEÇ VE EKLE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostManagement;
