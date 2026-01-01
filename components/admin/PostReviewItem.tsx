import React, { useState } from 'react';
import {
    ChevronDown,
    Trash2,
    Award,
    Plus,
    Settings2,
    Image as LucideImage,
    Globe,
    Edit3,
    Check,
    X,
    BarChart3,
    TrendingUp,
    Star,
    FileText
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import { PostItem, QUILL_MODULES, QUILL_FORMATS } from './PostTextItem';
import { useLanguage } from '../../context/LanguageContext';

interface PostReviewItemProps {
    item: PostItem;
    index: number;
    totalItems: number;
    showBlockNumbers: boolean;
    onUpdate: (id: string, field: keyof PostItem, value: any) => void;
    onRemove: (id: string) => void;
    isDeletable?: boolean;
    onMoveUp?: (index: number) => void;
    onMoveDown?: (index: number) => void;
    onOpenFileManager: (id: string, subField?: string, optionId?: string) => void;
    onOpenUrlMode: (id: string, subField?: string, optionId?: string) => void;
    onOpenImageEditor: (id: string, subField?: string, optionId?: string) => void;
}

const PostReviewItem: React.FC<PostReviewItemProps> = ({
    item,
    index,
    totalItems,
    showBlockNumbers,
    onUpdate,
    onRemove,
    isDeletable = true,
    onMoveUp,
    onMoveDown,
    onOpenFileManager,
    onOpenUrlMode,
    onOpenImageEditor
}) => {
    const { t } = useLanguage();
    const [showOptions, setShowOptions] = useState(false);

    // Initialization
    React.useEffect(() => {
        if (!item.reviewData) {
            onUpdate(item.id, 'reviewData', {
                productName: '',
                productImage: '',
                score: 85,
                pros: ['Harika tasarım', 'Yüksek performans'],
                cons: ['Yüksek fiyat'],
                breakdown: [
                    { label: 'Tasarım', score: 90 },
                    { label: 'Performans', score: 95 },
                    { label: 'Fiyat', score: 70 }
                ],
                verdict: 'Genel olarak sınıfının en iyi ürünlerinden biri.'
            });
        }
    }, []);

    const reviewData = item.reviewData || {
        productName: '',
        productImage: '',
        score: 0,
        pros: [],
        cons: [],
        breakdown: [],
        verdict: ''
    };

    // Auto-calculate score whenever breakdown changes
    React.useEffect(() => {
        if (reviewData.breakdown.length > 0) {
            const total = reviewData.breakdown.reduce((acc, curr) => acc + curr.score, 0);
            const avg = Math.round(total / reviewData.breakdown.length);
            if (avg !== reviewData.score) {
                onUpdate(item.id, 'reviewData', { ...reviewData, score: avg });
            }
        }
    }, [reviewData.breakdown]);

    const updateReviewField = (field: string, value: any) => {
        onUpdate(item.id, 'reviewData', { ...reviewData, [field]: value });
    };

    const addList = (type: 'pros' | 'cons') => {
        updateReviewField(type, [...reviewData[type], '']);
    };

    const updateList = (type: 'pros' | 'cons', idx: number, val: string) => {
        const newList = [...reviewData[type]];
        newList[idx] = val;
        updateReviewField(type, newList);
    };

    const removeList = (type: 'pros' | 'cons', idx: number) => {
        updateReviewField(type, reviewData[type].filter((_, i) => i !== idx));
    };

    const addBreakdown = () => {
        updateReviewField('breakdown', [...reviewData.breakdown, { label: '', score: 80 }]);
    };

    const updateBreakdown = (idx: number, field: 'label' | 'score', val: any) => {
        const newBreakdown = [...reviewData.breakdown];
        newBreakdown[idx] = { ...newBreakdown[idx], [field]: val };
        updateReviewField('breakdown', newBreakdown);
    };

    const removeBreakdown = (idx: number) => {
        updateReviewField('breakdown', reviewData.breakdown.filter((_, i) => i !== idx));
    };

    return (
        <div className="group bg-white rounded-[3px] border border-palette-tan/20 shadow-md flex overflow-hidden animate-in slide-in-from-left duration-300 admin-font">
            {/* SIDEBAR ACTIONS */}
            <div className="w-12 shrink-0 bg-palette-beige/5 border-r border-palette-tan/10 flex flex-col items-center py-6 justify-between transition-colors group-hover:bg-palette-beige/10">
                <div className="flex flex-col gap-2">
                    {totalItems > 1 && (
                        <>
                            {index > 0 ? (
                                <button
                                    onClick={() => onMoveUp?.(index)}
                                    className="w-8 h-8 flex items-center justify-center rounded-[3px] text-palette-tan/40 hover:text-palette-maroon hover:bg-white hover:shadow-sm transition-all active:scale-90"
                                >
                                    <ChevronDown size={18} className="rotate-180" />
                                </button>
                            ) : <div className="w-8 h-8" />}

                            {index < totalItems - 1 ? (
                                <button
                                    onClick={() => onMoveDown?.(index)}
                                    className="w-8 h-8 flex items-center justify-center rounded-[3px] text-palette-tan/40 hover:text-palette-maroon hover:bg-white hover:shadow-sm transition-all active:scale-90"
                                >
                                    <ChevronDown size={18} />
                                </button>
                            ) : <div className="w-8 h-8" />}
                        </>
                    )}
                </div>

                <button
                    onClick={() => isDeletable && onRemove(item.id)}
                    disabled={!isDeletable}
                    className={`w-8 h-8 flex items-center justify-center rounded-[3px] transition-all ${isDeletable
                        ? "text-palette-tan/30 hover:text-white hover:bg-palette-red hover:shadow-md active:scale-90"
                        : "text-palette-tan/10 cursor-not-allowed"
                        }`}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 p-5 space-y-6">
                {/* 1. BLOCK HEADER */}
                <div className="flex items-center justify-between border-b border-palette-tan/15 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-[3px] flex items-center justify-center shadow-sm border border-emerald-100/50">
                            <Award size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-palette-maroon leading-tight">İnceleme Bloğu</h3>
                            <p className="text-[11px] font-bold text-palette-tan/50 tracking-wide">Puanlamalı ürün inceleme sistemi</p>
                        </div>
                    </div>
                </div>

                {/* 2. PRODUCT NAME & OVERALL SCORE */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div className="md:col-span-10 space-y-1.5">
                        <label className="text-[13px] font-black text-palette-tan ml-1">Ürün / Konu Adı</label>
                        <div className="flex items-center gap-3">
                            {showBlockNumbers && (
                                <div className="w-9 h-9 shrink-0 rounded-[3px] bg-palette-maroon text-white flex items-center justify-center text-base font-black shadow-md shadow-palette-maroon/10">
                                    {item.orderNumber || (index + 1)}
                                </div>
                            )}
                            <input
                                type="text"
                                value={reviewData.productName}
                                onChange={(e) => updateReviewField('productName', e.target.value)}
                                className="w-full h-10 bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 text-base font-bold text-palette-maroon outline-none focus:border-palette-red transition-all shadow-inner"
                                placeholder="İncelenen ürün veya konu adı..."
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[13px] font-black text-palette-tan ml-1 text-center block">Genel Skor</label>
                        <div className="h-10 bg-palette-maroon text-white rounded-[3px] flex items-center justify-center gap-1.5 shadow-lg shadow-palette-maroon/20 border border-palette-maroon relative overflow-hidden group/score">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 origin-left transition-transform duration-1000 scale-x-[var(--score-width)]" style={{ '--score-width': `${reviewData.score / 100}` } as any} />
                            <Star size={14} className="text-palette-yellow animate-pulse" />
                            <span className="text-xl font-black leading-none">{reviewData.score}</span>
                            <span className="text-[10px] font-bold opacity-60">/100</span>
                        </div>
                    </div>
                </div>

                {/* 3. PRODUCT IMAGE & VERDICT */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* LEFT: IMAGE AREA */}
                    <div className="md:col-span-4 space-y-2">
                        <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">İnceleme Görseli</label>
                        <div className="rounded-[3px] bg-palette-beige/5 border-2 border-dashed border-palette-tan/20 flex flex-col items-center justify-center overflow-hidden transition-all relative group w-full min-h-[240px]">
                            {reviewData.productImage ? (
                                <div className="relative w-full h-full flex items-center justify-center bg-palette-beige/5 min-h-[240px]">
                                    <img
                                        src={reviewData.productImage}
                                        className="max-w-full max-h-[240px] object-contain block p-2"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onOpenImageEditor(item.id, 'reviewData.productImage')}
                                            className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-emerald-600 transition-all shadow-xl hover:scale-110"
                                        >
                                            <Edit3 size={20} />
                                        </button>
                                        <button
                                            onClick={() => updateReviewField('productImage', '')}
                                            className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-palette-red transition-all shadow-xl hover:scale-110"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div
                                        onClick={() => onOpenFileManager(item.id, 'reviewData.productImage')}
                                        className="flex flex-col items-center cursor-pointer group/pick mb-4 hover:scale-105 transition-transform"
                                    >
                                        <Plus size={48} className="text-palette-tan/20 group-hover/pick:text-palette-maroon transition-all mb-2" />
                                        <span className="text-[14px] font-bold text-palette-tan/50 px-4 text-center">Görsel Seç / Yükle</span>
                                    </div>
                                    <button
                                        onClick={() => onOpenUrlMode(item.id, 'reviewData.productImage')}
                                        className="mt-2 text-[10px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                    >
                                        <Globe size={11} /> URL VEYA YÜKLE
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: VERDICT EDITOR */}
                    <div className="md:col-span-8 h-full flex flex-col">
                        <div className="space-y-2 group/editor flex-1 flex flex-col">
                            <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider flex items-center gap-2">
                                <FileText size={14} className="text-palette-maroon" /> Buzz Kararı (Verdict)
                            </label>
                            <div className="quill-modern-wrapper compact-quill border border-palette-tan/20 rounded-[3px] overflow-hidden focus-within:border-palette-red/40 transition-all shadow-sm bg-white flex-1 min-h-[240px]">
                                {(() => {
                                    const Quill: any = ReactQuill;
                                    return (
                                        <Quill
                                            theme="snow"
                                            value={reviewData.verdict || ''}
                                            onChange={(content: string) => updateReviewField('verdict', content)}
                                            modules={QUILL_MODULES}
                                            formats={QUILL_FORMATS}
                                            placeholder="Ürün hakkındaki nihai kararınızı detaylıca yazın..."
                                            className="modern-quill-editor h-full"
                                        />
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. PROS & CONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PROS */}
                    <div className="space-y-3 bg-emerald-50/20 p-5 rounded-[3px] border border-emerald-100 shadow-sm relative overflow-hidden group/pros">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/pros:opacity-10 transition-opacity">
                            <Check size={80} strokeWidth={3} />
                        </div>
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="bg-emerald-500 p-1 rounded-full text-white shadow-lg shadow-emerald-500/20"><Check size={12} strokeWidth={4} /></div>
                                <h4 className="text-emerald-900 font-black text-xs uppercase tracking-widest">Artılar</h4>
                            </div>
                            <button onClick={() => addList('pros')} className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><Plus size={16} /></button>
                        </div>
                        <div className="space-y-2 relative z-10">
                            {reviewData.pros.map((pro, idx) => (
                                <div key={idx} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <input
                                        type="text"
                                        value={pro}
                                        onChange={(e) => updateList('pros', idx, e.target.value)}
                                        className="flex-1 h-9 bg-white/80 border border-emerald-200 rounded-[3px] px-3 text-xs font-bold text-emerald-900 outline-none focus:border-emerald-500 shadow-inner"
                                        placeholder="Bir artı ekleyin..."
                                    />
                                    <button onClick={() => removeList('pros', idx)} className="text-rose-300 hover:text-rose-600 px-1 transition-colors"><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CONS */}
                    <div className="space-y-3 bg-rose-50/20 p-5 rounded-[3px] border border-rose-100 shadow-sm relative overflow-hidden group/cons">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/cons:opacity-10 transition-opacity">
                            <X size={80} strokeWidth={3} />
                        </div>
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="bg-rose-500 p-1 rounded-full text-white shadow-lg shadow-rose-500/20"><X size={12} strokeWidth={4} /></div>
                                <h4 className="text-rose-900 font-black text-xs uppercase tracking-widest">Eksiler</h4>
                            </div>
                            <button onClick={() => addList('cons')} className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"><Plus size={16} /></button>
                        </div>
                        <div className="space-y-2 relative z-10">
                            {reviewData.cons.map((con, idx) => (
                                <div key={idx} className="flex gap-2 animate-in fade-in slide-in-from-right-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <input
                                        type="text"
                                        value={con}
                                        onChange={(e) => updateList('cons', idx, e.target.value)}
                                        className="flex-1 h-9 bg-white/80 border border-rose-200 rounded-[3px] px-3 text-xs font-bold text-rose-900 outline-none focus:border-rose-500 shadow-inner"
                                        placeholder="Bir eksi ekleyin..."
                                    />
                                    <button onClick={() => removeList('cons', idx)} className="text-rose-300 hover:text-rose-600 px-1 transition-colors"><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 5. BREAKDOWN */}
                <div className="space-y-5 pt-6 border-t border-palette-tan/10 bg-palette-beige/5 -mx-5 px-5 pb-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-black text-palette-maroon text-[12px] uppercase tracking-widest flex items-center gap-2">
                                <BarChart3 size={16} className="text-blue-500" /> Detaylı Puanlama
                            </h4>
                            <p className="text-[10px] font-bold text-palette-tan/50 mt-1 italic">* Puanların ortalaması genel skoru belirler.</p>
                        </div>
                        <button
                            onClick={addBreakdown}
                            className="text-[10px] font-black text-blue-600 hover:text-white uppercase tracking-widest flex items-center gap-1.5 bg-blue-50 hover:bg-blue-600 px-3 py-1.5 rounded-[3px] transition-all border border-blue-200 shadow-sm"
                        >
                            <Plus size={14} /> Kriter Ekle
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {reviewData.breakdown.map((item, idx) => {
                            const handleSliderInteraction = (e: React.MouseEvent | MouseEvent) => {
                                const container = document.getElementById(`slider-container-${idx}`);
                                if (!container) return;
                                const rect = container.getBoundingClientRect();
                                const x = (e as MouseEvent).clientX;
                                const pos = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
                                updateBreakdown(idx, 'score', Math.round(pos * 100));
                            };

                            const handleMouseDown = (e: React.MouseEvent) => {
                                handleSliderInteraction(e);
                                const onMouseMove = (moveEvent: MouseEvent) => handleSliderInteraction(moveEvent);
                                const onMouseUp = () => {
                                    window.removeEventListener('mousemove', onMouseMove);
                                    window.removeEventListener('mouseup', onMouseUp);
                                };
                                window.addEventListener('mousemove', onMouseMove);
                                window.addEventListener('mouseup', onMouseUp);
                            };

                            return (
                                <div key={idx} className="flex flex-col gap-3 bg-white p-4 rounded-[3px] border border-palette-tan/15 shadow-sm relative group/item hover:border-blue-400/50 transition-all animate-in fade-in duration-500">
                                    <div className="flex items-center justify-between gap-3">
                                        <input
                                            type="text"
                                            value={item.label}
                                            onChange={(e) => updateBreakdown(idx, 'label', e.target.value)}
                                            className="flex-1 bg-transparent border-none text-[13px] font-black text-palette-maroon outline-none placeholder:text-palette-tan/30"
                                            placeholder="Kriter (örn: Tasarım)"
                                        />
                                        <button onClick={() => removeBreakdown(idx)} className="opacity-0 group-hover/item:opacity-100 transition-opacity text-rose-300 hover:text-rose-600 p-1"><X size={14} /></button>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div
                                            id={`slider-container-${idx}`}
                                            className="relative flex-1 h-6 flex items-center cursor-pointer group/slider"
                                            onMouseDown={handleMouseDown}
                                        >
                                            {/* Track */}
                                            <div className="w-full h-1.5 bg-palette-beige/20 rounded-full overflow-hidden border border-palette-tan/5 shadow-inner">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ease-out shadow-lg ${item.score >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-emerald-500/20' :
                                                            (item.score >= 50 ? 'bg-gradient-to-r from-blue-400 to-blue-600 shadow-blue-500/20' :
                                                                'bg-gradient-to-r from-rose-400 to-rose-600 shadow-rose-500/20')
                                                        }`}
                                                    style={{ width: `${item.score}%` }}
                                                />
                                            </div>
                                            {/* Handle Dot */}
                                            <div
                                                className={`absolute w-3.5 h-3.5 rounded-full bg-white shadow-xl border-2 transition-all duration-200 transform -translate-x-1/2 group-hover/slider:scale-125 z-10 ${item.score >= 80 ? 'border-emerald-500' : (item.score >= 50 ? 'border-blue-500' : 'border-rose-500')
                                                    }`}
                                                style={{ left: `${item.score}%` }}
                                            />
                                        </div>

                                        {/* Score Display Tooltip-like */}
                                        <div className={`w-10 h-6 shrink-0 rounded-[2px] flex items-center justify-center text-[11px] font-black text-white shadow-md transition-all ${item.score >= 80 ? 'bg-emerald-600 shadow-emerald-600/20' : (item.score >= 50 ? 'bg-blue-600 shadow-blue-600/20' : 'bg-rose-600 shadow-rose-600/20')
                                            }`}>
                                            {item.score}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ADDITIONAL SETTINGS */}
                <div className="pt-2 space-y-3">
                    <button
                        type="button"
                        onClick={() => setShowOptions(!showOptions)}
                        className="text-[11px] font-black text-palette-tan/50 hover:text-palette-maroon transition-colors flex items-center gap-1.5 uppercase tracking-[0.15em] p-1 rounded hover:bg-palette-beige/20"
                    >
                        <Settings2 size={13} className={`transition-transform duration-300 ${showOptions ? 'rotate-90' : ''}`} />
                        Ek Ayarlar
                        <ChevronDown size={14} className={`transition-transform duration-300 ${showOptions ? 'rotate-180' : ''}`} />
                    </button>

                    {showOptions && (
                        <div className="animate-in slide-in-from-top-2 duration-300 w-full pt-2">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-black text-palette-tan ml-1 flex items-center gap-1.5">
                                    <Settings2 size={12} /> {t('admin.post.image_source')}
                                </label>
                                <input
                                    type="text"
                                    value={item.source || ''}
                                    onChange={(e) => onUpdate(item.id, 'source', e.target.value)}
                                    className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 py-2 text-sm font-bold text-palette-maroon outline-none focus:border-palette-red transition-all"
                                    placeholder={t('admin.post.source_placeholder')}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostReviewItem;
