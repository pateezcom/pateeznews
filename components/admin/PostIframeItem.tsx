import React, { useState } from 'react';
import { ChevronDown, Trash2, Globe, Code, Settings2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { PostItem } from './PostTextItem';

interface PostIframeItemProps {
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

const PostIframeItem: React.FC<PostIframeItemProps> = ({
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
    const [showOptions, setShowOptions] = useState(false);

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
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-[3px] flex items-center justify-center shadow-sm border border-indigo-100/50">
                            <Code size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-palette-maroon leading-tight">{t('admin.post.iframe_block')}</h3>
                            <p className="text-[11px] font-bold text-palette-tan/50 tracking-wide uppercase">{t('admin.post.iframe_desc')}</p>
                        </div>
                    </div>
                </div>

                {/* 2. TITLE FIELD */}
                <div className="space-y-1.5">
                    <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">{t('admin.post.optional_title')}</label>
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
                            placeholder={t('admin.post.iframe_placeholder')}
                        />
                    </div>
                </div>

                {/* 3. IFRAME CODE AREA */}
                <div className="space-y-2">
                    <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider flex items-center gap-2">
                        <Globe size={14} className="text-indigo-600" /> {t('admin.post.iframe_label')}
                    </label>
                    <div className="relative group/textarea">
                        <textarea
                            value={item.description}
                            onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                            className="w-full min-h-[120px] bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] p-4 text-sm font-mono text-indigo-900 outline-none focus:border-palette-red transition-all shadow-inner resize-y"
                            placeholder='<iframe src="..." width="100%" height="400"></iframe>'
                        />
                        <div className="absolute top-2 right-2 opacity-20 group-focus-within/textarea:opacity-40 transition-opacity">
                            <Code size={16} />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-palette-tan/40 italic ml-1">
                        {t('admin.post.iframe_help')}
                    </p>
                </div>

                {/* 4. PREVIEW AREA (IF CODE EXISTS) */}
                {item.description && item.description.includes('<iframe') && (
                    <div className="space-y-2 pt-2">
                        <label className="text-[11px] font-black text-palette-tan/60 ml-1 uppercase tracking-widest">{t('admin.post.preview')}</label>
                        <div
                            className="w-full rounded-[3px] border border-palette-tan/10 bg-palette-beige/5 overflow-hidden flex items-center justify-center p-4 min-h-[100px]"
                            dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                    </div>
                )}

                {/* ADDITIONAL SETTINGS */}
                <div className="pt-2 space-y-3">
                    <button
                        type="button"
                        onClick={() => setShowOptions(!showOptions)}
                        className="text-[11px] font-black text-palette-tan/50 hover:text-palette-maroon transition-colors flex items-center gap-1.5 uppercase tracking-[0.15em] p-1 rounded hover:bg-palette-beige/20"
                    >
                        <Settings2 size={13} className={`transition-transform duration-300 ${showOptions ? 'rotate-90' : ''}`} />
                        {t('admin.post.extra_settings_alt')}
                        <ChevronDown size={14} className={`transition-transform duration-300 ${showOptions ? 'rotate-180' : ''}`} />
                    </button>

                    {showOptions && (
                        <div className="animate-in slide-in-from-top-2 duration-300 w-full pt-2">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-black text-palette-tan ml-1 flex items-center gap-1.5 uppercase tracking-wider">
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

export default PostIframeItem;
