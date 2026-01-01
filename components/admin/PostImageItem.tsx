
import React, { useState } from 'react';
import {
    ChevronDown,
    Trash2,
    Image as LucideImage,
    Plus,
    Globe,
    Edit3,
    Loader2,
    Settings2
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import { PostItem, QUILL_MODULES, QUILL_FORMATS } from './PostTextItem';

interface PostImageItemProps {
    item: PostItem;
    index: number;
    totalItems: number;
    showBlockNumbers: boolean;
    onUpdate: (id: string, field: keyof PostItem, value: any) => void;
    onRemove: (id: string) => void;
    isDeletable?: boolean;
    onMoveUp?: (index: number) => void;
    onMoveDown?: (index: number) => void;
    onOpenFileManager: (id: string) => void;
    onOpenUrlMode: (id: string) => void;
    onOpenImageEditor: (id: string) => void;
}

const PostImageItem: React.FC<PostImageItemProps> = ({
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
    const [showOptions, setShowOptions] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);

    return (
        <div className="group bg-white rounded-[3px] border border-palette-tan/20 shadow-md flex overflow-hidden animate-in slide-in-from-left duration-300 admin-font">
            {/* MINIMALIST SIDEBAR ACTIONS */}
            <div className="w-12 shrink-0 bg-palette-beige/5 border-r border-palette-tan/10 flex flex-col items-center py-6 justify-between transition-colors group-hover:bg-palette-beige/10">
                <div className="flex flex-col gap-2">
                    {totalItems > 1 && (
                        <>
                            {index > 0 ? (
                                <button
                                    onClick={() => onMoveUp?.(index)}
                                    className="w-8 h-8 flex items-center justify-center rounded-[3px] text-palette-tan/40 hover:text-palette-maroon hover:bg-white hover:shadow-sm transition-all active:scale-90"
                                    title="Yukarı Taşı"
                                >
                                    <ChevronDown size={18} className="rotate-180" />
                                </button>
                            ) : <div className="w-8 h-8" />}

                            {index < totalItems - 1 ? (
                                <button
                                    onClick={() => onMoveDown?.(index)}
                                    className="w-8 h-8 flex items-center justify-center rounded-[3px] text-palette-tan/40 hover:text-palette-maroon hover:bg-white hover:shadow-sm transition-all active:scale-90"
                                    title="Aşağı Taşı"
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
                    title={isDeletable ? "Bloğu Sil" : "Bu blok silinemez"}
                    className={`w-8 h-8 flex items-center justify-center rounded-[3px] transition-all ${isDeletable
                        ? "text-palette-tan/30 hover:text-white hover:bg-palette-red hover:shadow-md active:scale-90"
                        : "text-palette-tan/10 cursor-not-allowed"
                        }`}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 p-4 space-y-4">
                {/* BLOCK HEADER */}
                <div className="flex items-center justify-between border-b border-palette-tan/15 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-palette-beige/20 rounded-[3px] text-palette-maroon">
                            <LucideImage size={18} />
                        </div>
                        <h3 className="text-base font-bold text-palette-maroon">Görsel İçerik Bloğu</h3>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* 1. TOP ROW: TITLE & BLOCK NUMBER */}
                    <div className="space-y-1.5 w-full">
                        <label className="text-[13px] font-black text-palette-tan ml-1">Başlık</label>
                        <div className="flex items-center gap-3">
                            {showBlockNumbers && (
                                <div className="w-9 h-9 shrink-0 rounded-[3px] bg-palette-maroon text-white flex items-center justify-center text-base font-black shadow-md shadow-palette-maroon/10">
                                    {item.orderNumber || (index + 1)}
                                </div>
                            )}
                            <input
                                type="text"
                                value={item.title}
                                onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
                                className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 py-2 text-base font-bold text-palette-maroon outline-none focus:border-palette-red transition-all placeholder:text-palette-tan/20"
                                placeholder="Başlık Girin (Opsiyonel)"
                            />
                        </div>
                    </div>

                    {/* 2. MIDDLE ROW: IMAGE & EDITOR SIDE BY SIDE */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* LEFT: IMAGE AREA */}
                        <div className="md:col-span-4 space-y-2">
                            <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">Görsel Paneli</label>
                            <div className="rounded-[3px] bg-palette-beige/5 border-2 border-dashed border-palette-tan/20 flex flex-col items-center justify-center overflow-hidden transition-all relative group w-full min-h-[220px]">
                                {item.mediaUrl ? (
                                    <div className="relative w-full h-full flex items-center justify-center bg-palette-beige/5 min-h-[220px]">
                                        <img
                                            src={item.mediaUrl}
                                            onLoad={() => setIsImageLoading(false)}
                                            onError={() => setIsImageLoading(false)}
                                            className="max-w-full max-h-[220px] object-contain block"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onOpenImageEditor(item.id)}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-emerald-600 transition-all"
                                                title="Düzenle"
                                            >
                                                <Edit3 size={20} />
                                            </button>
                                            <button
                                                onClick={() => onUpdate(item.id, 'mediaUrl', '')}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-palette-red transition-all"
                                                title="Sil"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                        {isImageLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 pointer-events-none">
                                                <Loader2 size={22} className="animate-spin text-palette-maroon" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div
                                            onClick={() => onOpenFileManager(item.id)}
                                            className="flex flex-col items-center cursor-pointer group/pick mb-4"
                                        >
                                            <Plus size={48} className="text-palette-tan/20 group-hover/pick:text-palette-maroon transition-all mb-2" />
                                            <span className="text-[14px] font-bold text-palette-tan/50 px-4 text-center">Görsel Seç</span>
                                        </div>
                                        <button
                                            onClick={() => onOpenUrlMode(item.id)}
                                            className="mt-2 text-[10px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                        >
                                            <Globe size={11} /> URL İLE EKLE
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: RICH TEXT EDITOR */}
                        <div className="md:col-span-8 h-full flex flex-col">
                            <div className="space-y-2 group/editor flex-1 flex flex-col">
                                <label className="text-[13px] font-black text-palette-tan ml-1">Görsel Açıklaması (Zengin Metin)</label>
                                <div className="quill-modern-wrapper compact-quill border border-palette-tan/20 rounded-[3px] overflow-hidden focus-within:border-palette-red/40 transition-all shadow-sm bg-white flex-1 min-h-[200px]">
                                    {(() => {
                                        const Quill: any = ReactQuill;
                                        return (
                                            <Quill
                                                theme="snow"
                                                value={item.description}
                                                onChange={(content: string) => onUpdate(item.id, 'description', content)}
                                                modules={QUILL_MODULES}
                                                formats={QUILL_FORMATS}
                                                placeholder="Görsel hakkında detaylı bilgi veya hikaye buraya..."
                                                className="modern-quill-editor h-full"
                                            />
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. BOTTOM ROW: OPTIONS & SOURCE */}
                    <div className="space-y-3 pt-2">
                        <div className="flex justify-start">
                            <button
                                type="button"
                                onClick={() => setShowOptions(!showOptions)}
                                className="text-[11px] font-black text-palette-tan/50 hover:text-palette-maroon transition-colors flex items-center gap-1 uppercase tracking-widest"
                            >
                                <ChevronDown size={14} className={`transition-transform duration-300 ${showOptions ? 'rotate-180' : ''}`} />
                                {showOptions ? 'Daha Az' : 'Ek Ayarlar (Kaynak vb.)'}
                            </button>
                        </div>

                        {showOptions && (
                            <div className="animate-in slide-in-from-top-2 duration-300 w-full">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-black text-palette-tan ml-1 flex items-center gap-1.5">
                                        <Settings2 size={12} /> Görsel Kaynağı
                                    </label>
                                    <input
                                        type="text"
                                        value={item.source || ''}
                                        onChange={(e) => onUpdate(item.id, 'source', e.target.value)}
                                        className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 py-2 text-sm font-bold text-palette-maroon outline-none focus:border-palette-red transition-all"
                                        placeholder="Fotoğraf: [İsim/Ajans]..."
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

export default PostImageItem;
