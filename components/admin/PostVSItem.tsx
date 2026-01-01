import React, { useState } from 'react';
import {
    ChevronDown,
    Trash2,
    Swords,
    Plus,
    Settings2,
    Image as LucideImage,
    Globe,
    Edit3,
    Users,
    Zap,
    X,
    TrendingUp
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import { PostItem, QUILL_MODULES, QUILL_FORMATS } from './PostTextItem';
import { useLanguage } from '../../context/LanguageContext';

interface PostVSItemProps {
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

const PostVSItem: React.FC<PostVSItemProps> = ({
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
    const [isMainImageLoading, setIsMainImageLoading] = useState(false);

    // Initialization: If new VS, add exactly 2 options immediately
    React.useEffect(() => {
        if (!item.options || item.options.length !== 2) {
            const initialOptions = [
                { id: Math.random().toString(36).substr(2, 9), text: 'Sol Taraf', votes: 0, image: '' },
                { id: Math.random().toString(36).substr(2, 9), text: 'Sağ Taraf', votes: 0, image: '' }
            ];
            onUpdate(item.id, 'options', initialOptions);
        }
    }, []);

    const handleUpdateOption = (optionId: string, field: string, value: any) => {
        const currentOptions = item.options || [];
        onUpdate(item.id, 'options', currentOptions.map(o =>
            o.id === optionId ? { ...o, [field]: value } : o
        ));
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
            <div className="flex-1 p-5 space-y-5">
                {/* 1. BLOCK HEADER */}
                <div className="flex items-center justify-between border-b border-palette-tan/15 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-[3px] flex items-center justify-center shadow-sm border border-rose-100/50">
                            <Swords size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-palette-maroon leading-tight">VS / Düello Bloğu</h3>
                            <p className="text-[11px] font-bold text-palette-tan/50 tracking-wide">İki seçenekli karşılaştırma sistemi</p>
                        </div>
                    </div>
                </div>

                {/* 2. TITLE & MAIN IMAGE */}
                <div className="space-y-4">
                    <div className="space-y-1.5 w-full">
                        <label className="text-[13px] font-black text-palette-tan ml-1">Düello Başlığı / Soru</label>
                        <div className="flex items-center gap-3">
                            {showBlockNumbers && (
                                <div className="w-9 h-9 shrink-0 rounded-[3px] bg-palette-maroon text-white flex items-center justify-center text-base font-black shadow-md shadow-palette-maroon/10">
                                    {item.orderNumber || (index + 1)}
                                </div>
                            )}
                            <input
                                type="text"
                                value={item.title || ''}
                                onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
                                className="w-full h-10 bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 text-base font-bold text-palette-maroon outline-none focus:border-palette-red transition-all shadow-inner"
                                placeholder="Düello sorusu buraya gelecek..."
                            />
                        </div>
                    </div>

                    {/* MAIN IMAGE & DESCRIPTION */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* LEFT: IMAGE AREA */}
                        <div className="md:col-span-4 space-y-2">
                            <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">Düello Ana Resmi</label>
                            <div className="rounded-[3px] bg-palette-beige/5 border-2 border-dashed border-palette-tan/20 flex flex-col items-center justify-center overflow-hidden transition-all relative group w-full min-h-[220px]">
                                {item.mediaUrl ? (
                                    <div className="relative w-full h-full flex items-center justify-center bg-palette-beige/5 min-h-[220px]">
                                        <img
                                            src={item.mediaUrl}
                                            onLoad={() => setIsMainImageLoading(false)}
                                            className="max-w-full max-h-[220px] object-contain block"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onOpenImageEditor(item.id, 'mediaUrl')}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-emerald-600 transition-all"
                                            >
                                                <Edit3 size={20} />
                                            </button>
                                            <button
                                                onClick={() => onUpdate(item.id, 'mediaUrl', '')}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-palette-red transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div
                                            onClick={() => onOpenFileManager(item.id, 'mediaUrl')}
                                            className="flex flex-col items-center cursor-pointer group/pick mb-4"
                                        >
                                            <Plus size={48} className="text-palette-tan/20 group-hover/pick:text-palette-maroon transition-all mb-2" />
                                            <span className="text-[14px] font-bold text-palette-tan/50 px-4 text-center">Görsel Seç / Yükle</span>
                                        </div>
                                        <button
                                            onClick={() => onOpenUrlMode(item.id, 'mediaUrl')}
                                            className="mt-2 text-[10px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                        >
                                            <Globe size={11} /> URL VEYA YÜKLE
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: DESCRIPTION EDITOR */}
                        <div className="md:col-span-8 h-full flex flex-col">
                            <div className="space-y-2 group/editor flex-1 flex flex-col">
                                <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">Düello Açıklaması</label>
                                <div className="quill-modern-wrapper compact-quill border border-palette-tan/20 rounded-[3px] overflow-hidden focus-within:border-palette-red/40 transition-all shadow-sm bg-white flex-1 min-h-[220px]">
                                    {(() => {
                                        const Quill: any = ReactQuill;
                                        return (
                                            <Quill
                                                theme="snow"
                                                value={item.description || ''}
                                                onChange={(content: string) => onUpdate(item.id, 'description', content)}
                                                modules={QUILL_MODULES}
                                                formats={QUILL_FORMATS}
                                                placeholder="Bu düello hakkında kısa bir açıklama veya not yazın..."
                                                className="modern-quill-editor h-full"
                                            />
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VS OPTIONS AREA */}
                <div className="space-y-6 pt-6 border-t border-palette-tan/15 relative">
                    <div className="flex flex-col items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-palette-tan/60 uppercase tracking-widest leading-none">Düello Seçenekleri</span>
                    </div>

                    <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                        {item.options?.slice(0, 2).map((option, idx) => (
                            <div
                                key={option.id}
                                className="group/card bg-white border border-palette-tan/20 rounded-[3px] transition-all hover:border-palette-maroon/30 shadow-sm relative flex flex-col"
                            >
                                <div className="aspect-video w-full bg-palette-beige/5 border-b border-palette-tan/10 relative overflow-hidden group/img">
                                    {option.image ? (
                                        <div className="w-full h-full p-2">
                                            <img src={option.image} className="w-full h-full object-contain rounded-[2px]" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => onOpenImageEditor(item.id, 'options', option.id)}
                                                    className="p-2 bg-white/20 backdrop-blur-md rounded-[3px] text-white hover:bg-emerald-600 transition-all"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateOption(option.id, 'image', '')}
                                                    className="p-2 bg-white/20 backdrop-blur-md rounded-[3px] text-white hover:bg-palette-red transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center py-4 px-4 text-center">
                                            <div
                                                onClick={() => onOpenFileManager(item.id, 'options', option.id)}
                                                className="flex flex-col items-center cursor-pointer group/pick mb-3"
                                            >
                                                <Plus size={32} className="text-palette-tan/20 group-hover/pick:text-palette-maroon transition-all mb-1" />
                                                <span className="text-[11px] font-bold text-palette-tan/50 leading-tight">Görsel Seç / Yükle</span>
                                            </div>
                                            <button
                                                onClick={() => onOpenUrlMode(item.id, 'options', option.id)}
                                                className="mt-1 text-[9px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                            >
                                                <Globe size={11} /> URL VEYA YÜKLE
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[9px] font-black text-palette-tan/30 shrink-0">{idx === 0 ? 'SOL' : 'SAĞ'}</span>
                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(e) => handleUpdateOption(option.id, 'text', e.target.value)}
                                            className="w-full bg-transparent border-none text-[13px] font-bold text-palette-maroon outline-none placeholder:text-palette-tan/20 p-0"
                                            placeholder="Seçenek metni..."
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 pt-2 border-t border-palette-tan/5">
                                        <div className="flex items-center gap-1.5 bg-palette-beige/5 px-2 py-1 rounded-[2px] border border-palette-tan/10">
                                            <Users size={12} className="text-palette-tan/40" />
                                            <input
                                                type="number"
                                                value={option.votes}
                                                onChange={(e) => handleUpdateOption(option.id, 'votes', parseInt(e.target.value) || 0)}
                                                className="w-12 bg-transparent text-[11px] font-black text-palette-maroon text-center outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* VS MIDDLE BADGE */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden sm:block">
                            <div className="w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(24,37,64,0.2)] p-1 border border-palette-tan/10">
                                <div className="w-full h-full rounded-full bg-palette-tan flex items-center justify-center relative overflow-hidden border border-palette-tan/50">
                                    <div className="absolute inset-0 bg-gradient-to-br from-palette-tan to-palette-maroon" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                        <Zap size={24} className="text-white transform -rotate-12" />
                                    </div>
                                    <span className="relative z-10 font-[900] italic text-lg text-white tracking-tighter transform -skew-x-6 drop-shadow-md">
                                        VS
                                    </span>
                                </div>
                            </div>
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
        </div>
    );
};

export default PostVSItem;
