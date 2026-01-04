
import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import { PostItem, QUILL_MODULES, QUILL_FORMATS } from './PostTextItem';
import { useLanguage } from '../../context/LanguageContext';

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
    const { t } = useLanguage();
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
                                    title={t('common.move_up')}
                                >
                                    <span className="material-symbols-rounded rotate-180" style={{ fontSize: '20px' }}>expand_more</span>
                                </button>
                            ) : <div className="w-8 h-8" />}

                            {index < totalItems - 1 ? (
                                <button
                                    onClick={() => onMoveDown?.(index)}
                                    className="w-8 h-8 flex items-center justify-center rounded-[3px] text-palette-tan/40 hover:text-palette-maroon hover:bg-white hover:shadow-sm transition-all active:scale-90"
                                    title={t('common.move_down')}
                                >
                                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>expand_more</span>
                                </button>
                            ) : <div className="w-8 h-8" />}
                        </>
                    )}
                </div>

                <button
                    onClick={() => isDeletable && onRemove(item.id)}
                    disabled={!isDeletable}
                    title={isDeletable ? t('admin.post.delete_block') : t('admin.post.not_deletable')}
                    className={`w-8 h-8 flex items-center justify-center rounded-[3px] transition-all ${isDeletable
                        ? "text-palette-tan/30 hover:text-white hover:bg-palette-red hover:shadow-md active:scale-90"
                        : "text-palette-tan/10 cursor-not-allowed"
                        }`}
                >
                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                </button>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 p-4 space-y-4">
                {/* BLOCK HEADER */}
                <div className="flex items-center justify-between border-b border-palette-tan/15 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-palette-beige/20 rounded-[3px] text-palette-maroon">
                            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>image</span>
                        </div>
                        <h3 className="text-base font-bold text-palette-maroon">{t('admin.post.image_block')}</h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={item.showOnHomepage || false}
                            onChange={(e) => onUpdate(item.id, 'showOnHomepage', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-palette-tan/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-palette-maroon"></div>
                        <span className="ml-2 text-[11px] font-bold text-palette-tan uppercase tracking-wider">{t('admin.post.show_on_homepage')}</span>
                    </label>
                </div>

                <div className="space-y-4">
                    {/* 1. TOP ROW: TITLE & BLOCK NUMBER */}
                    <div className="space-y-1.5 w-full">
                        <label className="text-[13px] font-black text-palette-tan ml-1">{t('admin.post.title')}</label>
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
                                className="w-full h-9 bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 text-base font-bold text-palette-maroon outline-none focus:border-palette-red transition-all placeholder:text-palette-tan/20"
                                placeholder={t('admin.post.slider_title_placeholder')}
                            />
                        </div>
                    </div>

                    {/* 2. MIDDLE ROW: IMAGE & EDITOR SIDE BY SIDE */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* LEFT: IMAGE AREA */}
                        <div className="md:col-span-4 space-y-2">
                            <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">{t('admin.post.image_panel')}</label>
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
                                                title={t('common.edit')}
                                            >
                                                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>edit</span>
                                            </button>
                                            <button
                                                onClick={() => onUpdate(item.id, 'mediaUrl', '')}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-palette-red transition-all"
                                                title={t('common.delete')}
                                            >
                                                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>delete</span>
                                            </button>
                                        </div>
                                        {isImageLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 pointer-events-none">
                                                <span className="material-symbols-rounded animate-spin text-palette-maroon" style={{ fontSize: '22px' }}>progress_activity</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div
                                            onClick={() => onOpenFileManager(item.id)}
                                            className="flex flex-col items-center cursor-pointer group/pick mb-4"
                                        >
                                            <span className="material-symbols-rounded text-palette-tan/20 group-hover/pick:text-palette-maroon transition-all mb-2" style={{ fontSize: '48px' }}>add</span>
                                            <span className="text-[14px] font-bold text-palette-tan/50 px-4 text-center">{t('admin.post.pick_image')}</span>
                                        </div>
                                        <button
                                            onClick={() => onOpenUrlMode(item.id)}
                                            className="mt-2 text-[10px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                        >
                                            <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>public</span> {t('admin.post.url_or_upload')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: RICH TEXT EDITOR */}
                        <div className="md:col-span-8 h-full flex flex-col">
                            <div className="space-y-2 group/editor flex-1 flex flex-col">
                                <label className="text-[13px] font-black text-palette-tan ml-1">{t('admin.post.image_desc')}</label>
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
                                                placeholder={t('admin.post.content_placeholder')}
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
                                <span className={`material-symbols-rounded transition-transform duration-300 ${showOptions ? 'rotate-180' : ''}`} style={{ fontSize: '18px' }}>expand_more</span>
                                {showOptions ? t('common.less') : t('admin.post.extra_settings')}
                            </button>
                        </div>

                        {showOptions && (
                            <div className="animate-in slide-in-from-top-2 duration-300 w-full">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-black text-palette-tan ml-1 flex items-center gap-1.5">
                                        <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>settings</span> {t('admin.post.image_source')}
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

export default PostImageItem;
