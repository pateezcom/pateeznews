import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import { ChevronDown, Trash2, Quote, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { PostItem, QUILL_MODULES, QUILL_FORMATS } from './PostTextItem';

interface PostQuoteItemProps {
    item: PostItem;
    index: number;
    totalItems: number;
    showBlockNumbers: boolean;
    onUpdate: (id: string, field: keyof PostItem, value: any) => void;
    onRemove: (id: string) => void;
    isDeletable?: boolean;
    onMoveUp?: (index: number) => void;
    onMoveDown?: (index: number) => void;
}

const PostQuoteItem: React.FC<PostQuoteItemProps> = ({
    item,
    index,
    totalItems,
    showBlockNumbers,
    onUpdate,
    onRemove,
    isDeletable = true,
    onMoveUp,
    onMoveDown
}) => {
    const { t } = useLanguage();
    const [showSource, setShowSource] = useState(false);

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
            <div className="flex-1 p-5 space-y-4 relative overflow-hidden">
                {/* DECORATIVE QUOTE ICON IN BACKGROUND */}
                <div className="absolute top-10 right-4 opacity-[0.03] pointer-events-none">
                    <Quote size={120} strokeWidth={2.5} />
                </div>

                {/* BLOCK HEADER */}
                <div className="flex items-center justify-between border-b border-palette-tan/15 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-palette-maroon/5 rounded-[3px] text-palette-maroon border border-palette-maroon/10 shadow-sm">
                            <Quote size={20} fill="currentColor" className="opacity-20" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-palette-maroon leading-tight">Özlü Söz / Paragraf</h3>
                            <p className="text-[11px] font-bold text-palette-tan/50 tracking-wide uppercase">Vurgulu metin veya alıntı bloğu</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 relative z-10">
                    {/* OPTIONAL TITLE/AUTHOR */}
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">Alıntı Sahibi / Başlık</label>
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
                                className="w-full h-10 bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 text-base font-bold text-palette-maroon outline-none focus:border-palette-red transition-all shadow-inner"
                                placeholder="Alıntı yapılan kişi veya kısa başlık..."
                            />
                        </div>
                    </div>

                    {/* RICH-TEXT EDITOR FOR QUOTE CONTENT */}
                    <div className="space-y-2 group/editor">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[13px] font-black text-palette-tan uppercase tracking-wider">İçerik (Alıntı Metni)</label>
                            <div className="flex items-center gap-2 text-palette-tan/30 group-focus-within/editor:text-palette-red/40 transition-colors">
                                <Sparkles size={12} />
                                <span className="text-[11px] font-bold">{t('admin.post.ai_support')}</span>
                            </div>
                        </div>
                        <div className="quill-modern-wrapper border border-palette-tan/20 rounded-[3px] overflow-hidden focus-within:border-palette-red/40 transition-all shadow-sm bg-white min-h-[150px]">
                            {(() => {
                                const Quill: any = ReactQuill;
                                return (
                                    <Quill
                                        theme="snow"
                                        value={item.description}
                                        onChange={(content: string) => onUpdate(item.id, 'description', content)}
                                        modules={QUILL_MODULES}
                                        formats={QUILL_FORMATS}
                                        placeholder="Alıntı metnini buraya yazın..."
                                        className="modern-quill-editor h-full italic-editor"
                                    />
                                );
                            })()}
                        </div>
                    </div>

                    {/* EXTRA SETTINGS */}
                    <div className="pt-1">
                        <button
                            type="button"
                            onClick={() => setShowSource(!showSource)}
                            className="text-[11px] font-black text-palette-tan/50 hover:text-palette-maroon transition-colors flex items-center gap-1.5 uppercase tracking-[0.15em] p-1 rounded hover:bg-palette-beige/20"
                        >
                            <ChevronDown size={14} className={`transition-transform duration-300 ${showSource ? 'rotate-180' : ''}`} />
                            Ek Ayarlar
                        </button>
                    </div>

                    {showSource && (
                        <div className="pt-2 animate-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <label className="text-[13px] font-black text-palette-tan ml-1 flex items-center gap-2 uppercase tracking-wider">Kaynak Linki</label>
                                <input
                                    type="text"
                                    value={item.source || ''}
                                    onChange={(e) => onUpdate(item.id, 'source', e.target.value)}
                                    className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 py-3 text-sm font-bold text-palette-maroon outline-none focus:border-palette-red transition-all"
                                    placeholder="Kaynak web sitesi veya link..."
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostQuoteItem;
