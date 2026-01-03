import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import { PostItem, QUILL_MODULES, QUILL_FORMATS } from './PostTextItem';
import { useLanguage } from '../../context/LanguageContext';

interface PostBeforeAfterItemProps {
    item: PostItem;
    index: number;
    totalItems: number;
    showBlockNumbers: boolean;
    onUpdate: (id: string, field: keyof PostItem, value: any) => void;
    onRemove: (id: string) => void;
    isDeletable?: boolean;
    onMoveUp?: (index: number) => void;
    onMoveDown?: (index: number) => void;
    onOpenFileManager: (id: string, subField?: string) => void;
    onOpenUrlMode: (id: string, subField?: string) => void;
    onOpenImageEditor: (id: string, subField?: string) => void;
}

const PostBeforeAfterItem: React.FC<PostBeforeAfterItemProps> = ({
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
    const [isBeforeLoading, setIsBeforeLoading] = useState(false);
    const [isAfterLoading, setIsAfterLoading] = useState(false);
    const [sliderPosition, setSliderPosition] = useState(50);

    const updateBeforeAfterData = (field: string, value: string) => {
        const currentData = item.beforeAfterData || {
            beforeImage: '',
            afterImage: '',
            beforeLabel: 'ÖNCE',
            afterLabel: 'SONRA'
        };
        onUpdate(item.id, 'beforeAfterData', {
            ...currentData,
            [field]: value
        });
    };

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
            <div className="flex-1 p-5 space-y-5">
                {/* 1. BLOCK HEADER */}
                <div className="flex items-center justify-between border-b border-palette-tan/15 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-[3px] flex items-center justify-center shadow-sm border border-blue-100/50">
                            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>swap_horiz</span>
                        </div>
                        <div>
                            <h3 className="text-base font-black text-palette-maroon leading-tight">{t('admin.post.iframe_block').replace('Iframe', 'Before & After')}</h3>
                            <p className="text-[11px] font-bold text-palette-tan/50 tracking-wide">{t('admin.post.before_after_desc')}</p>
                        </div>
                    </div>
                </div>

                {/* 2. MAIN TITLE ROW */}
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
                            value={item.title || ''}
                            onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
                            className="w-full h-9 bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 text-base font-bold text-palette-maroon outline-none focus:border-palette-red transition-all placeholder:text-palette-tan/20"
                            placeholder={t('admin.post.title_placeholder')}
                        />
                    </div>
                </div>

                {/* 3. BEFORE & AFTER IMAGES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                    {/* BEFORE SIDE */}
                    <div className="space-y-4 bg-palette-beige/5 p-4 rounded-[3px] border border-palette-tan/10 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-palette-maroon rounded-[3px] flex items-center justify-center text-white">
                                <span className="text-[10px] font-black">1</span>
                            </div>
                            <h4 className="text-[13px] font-black text-palette-maroon tracking-tight">{t('admin.post.before_settings')}</h4>
                        </div>

                        <div className="space-y-4">
                            {/* Image Box */}
                            <div className="rounded-[3px] bg-white border-2 border-dashed border-palette-tan/20 flex flex-col items-center justify-center overflow-hidden transition-all relative group w-full min-h-[220px]">
                                {item.beforeAfterData?.beforeImage ? (
                                    <div className="relative w-full h-full flex items-center justify-center bg-palette-beige/5 min-h-[220px]">
                                        <img
                                            src={item.beforeAfterData.beforeImage}
                                            onLoad={() => setIsBeforeLoading(false)}
                                            onError={() => setIsBeforeLoading(false)}
                                            className="max-w-full max-h-[220px] object-contain block"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onOpenImageEditor(item.id, 'beforeImage')}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-emerald-600 transition-all flex items-center justify-center"
                                                title={t('common.edit')}
                                            >
                                                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>edit_square</span>
                                            </button>
                                            <button
                                                onClick={() => updateBeforeAfterData('beforeImage', '')}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-palette-red transition-all flex items-center justify-center"
                                                title={t('common.delete')}
                                            >
                                                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>delete</span>
                                            </button>
                                        </div>
                                        {isBeforeLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 pointer-events-none">
                                                <span className="material-symbols-rounded animate-spin text-palette-maroon" style={{ fontSize: '22px' }}>progress_activity</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div
                                            onClick={() => onOpenFileManager(item.id, 'beforeImage')}
                                            className="flex flex-col items-center cursor-pointer group/pick mb-4"
                                        >
                                            <span className="material-symbols-rounded text-palette-tan/20 group-hover/pick:text-palette-maroon transition-all mb-2" style={{ fontSize: '48px' }}>add</span>
                                            <span className="text-[14px] font-bold text-palette-tan/50 px-4 text-center">Önce Resmini Seç</span>
                                        </div>
                                        <button
                                            onClick={() => onOpenUrlMode(item.id, 'beforeImage')}
                                            className="mt-2 text-[10px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                        >
                                            <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>public</span> URL VEYA YÜKLE
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 ml-1">
                                    <span className="material-symbols-rounded text-palette-tan/50" style={{ fontSize: '14px' }}>title</span>
                                    <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest">{t('admin.post.before_label')}</label>
                                </div>
                                <input
                                    type="text"
                                    value={item.beforeAfterData?.beforeLabel || ''}
                                    onChange={(e) => updateBeforeAfterData('beforeLabel', e.target.value)}
                                    className="w-full h-10 bg-white border border-palette-tan/20 rounded-[3px] px-4 text-sm font-bold text-palette-maroon outline-none focus:border-palette-red transition-all shadow-sm"
                                    placeholder="Örn: ÖNCE"
                                />
                            </div>
                        </div>
                    </div>

                    {/* AFTER SIDE */}
                    <div className="space-y-4 bg-palette-beige/5 p-4 rounded-[3px] border border-palette-tan/10 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-blue-600 rounded-[3px] flex items-center justify-center text-white">
                                <span className="text-[10px] font-black">2</span>
                            </div>
                            <h4 className="text-[13px] font-black text-palette-maroon tracking-tight">{t('admin.post.after_settings')}</h4>
                        </div>

                        <div className="space-y-4">
                            {/* Image Box */}
                            <div className="rounded-[3px] bg-white border-2 border-dashed border-palette-tan/20 flex flex-col items-center justify-center overflow-hidden transition-all relative group w-full min-h-[220px]">
                                {item.beforeAfterData?.afterImage ? (
                                    <div className="relative w-full h-full flex items-center justify-center bg-palette-beige/5 min-h-[220px]">
                                        <img
                                            src={item.beforeAfterData.afterImage}
                                            onLoad={() => setIsAfterLoading(false)}
                                            onError={() => setIsAfterLoading(false)}
                                            className="max-w-full max-h-[220px] object-contain block"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onOpenImageEditor(item.id, 'afterImage')}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-emerald-600 transition-all flex items-center justify-center"
                                                title={t('common.edit')}
                                            >
                                                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>edit_square</span>
                                            </button>
                                            <button
                                                onClick={() => updateBeforeAfterData('afterImage', '')}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-palette-red transition-all flex items-center justify-center"
                                                title={t('common.delete')}
                                            >
                                                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>delete</span>
                                            </button>
                                        </div>
                                        {isAfterLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 pointer-events-none">
                                                <span className="material-symbols-rounded animate-spin text-palette-maroon" style={{ fontSize: '22px' }}>progress_activity</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div
                                            onClick={() => onOpenFileManager(item.id, 'afterImage')}
                                            className="flex flex-col items-center cursor-pointer group/pick mb-4"
                                        >
                                            <span className="material-symbols-rounded text-palette-tan/20 group-hover/pick:text-palette-maroon transition-all mb-2" style={{ fontSize: '48px' }}>add</span>
                                            <span className="text-[14px] font-bold text-palette-tan/50 px-4 text-center">Sonra Resmini Seç</span>
                                        </div>
                                        <button
                                            onClick={() => onOpenUrlMode(item.id, 'afterImage')}
                                            className="mt-2 text-[10px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                        >
                                            <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>public</span> URL VEYA YÜKLE
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 ml-1">
                                    <span className="material-symbols-rounded text-palette-tan/50" style={{ fontSize: '14px' }}>title</span>
                                    <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest">{t('admin.post.after_label')}</label>
                                </div>
                                <input
                                    type="text"
                                    value={item.beforeAfterData?.afterLabel || ''}
                                    onChange={(e) => updateBeforeAfterData('afterLabel', e.target.value)}
                                    className="w-full h-10 bg-white border border-palette-tan/20 rounded-[3px] px-4 text-sm font-bold text-palette-maroon outline-none focus:border-palette-red transition-all shadow-sm"
                                    placeholder="Örn: SONRA"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. LIVE PREVIEW SECTION */}
                <div className="pt-8 border-t border-palette-tan/10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                            <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>auto_awesome</span>
                        </div>
                        <h4 className="text-[12px] font-black text-palette-maroon uppercase tracking-[0.2em]">{t('admin.post.live_preview')}</h4>
                    </div>

                    <div className="flex flex-col items-center bg-palette-beige/5 rounded-[3px] p-8 border border-palette-tan/5 relative overflow-hidden">
                        {/* Summary/Description Display */}
                        <div className="w-full max-w-2xl mb-4 px-1">
                            {item.description ? (
                                <div
                                    className="text-gray-600 text-sm leading-relaxed quill-content"
                                    dangerouslySetInnerHTML={{ __html: item.description }}
                                />
                            ) : (
                                <p className="text-gray-400 text-sm italic">{t('feed.empty')}</p>
                            )}
                        </div>

                        <div className="relative w-full max-w-2xl h-[450px] rounded-lg overflow-hidden shadow-2xl select-none group border border-palette-tan/10 bg-white">
                            {item.beforeAfterData?.afterImage ? (
                                <img
                                    src={item.beforeAfterData.afterImage}
                                    alt="After"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-300">
                                    <span className="material-symbols-rounded" style={{ fontSize: '64px' }}>image</span>
                                </div>
                            )}

                            {item.beforeAfterData?.beforeImage ? (
                                <div
                                    className="absolute inset-0 w-full h-full overflow-hidden z-10"
                                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                                >
                                    <img
                                        src={item.beforeAfterData.beforeImage}
                                        alt="Before"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </div>
                            ) : null}

                            {/* Slider Line */}
                            <div
                                className="absolute top-0 bottom-0 w-1 bg-white/80 cursor-ew-resize z-20 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-sm"
                                style={{ left: `${sliderPosition}%` }}
                            >
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.4)] border-4 border-white/20">
                                    <span className="material-symbols-rounded text-blue-600" style={{ fontSize: '18px' }}>swap_horiz</span>
                                </div>
                            </div>

                            {/* Invisible Range Input for Interaction */}
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={sliderPosition}
                                onChange={(e) => setSliderPosition(Number(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                            />

                            {/* Labels */}
                            <div className="absolute bottom-6 left-6 z-10 pointer-events-none transition-opacity duration-300" style={{ opacity: sliderPosition < 10 ? 0 : 1 }}>
                                <div className="bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-white/20 shadow-lg flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-white/50"></div>
                                    <span className="text-[11px] font-black uppercase tracking-widest leading-none mt-0.5">
                                        {item.beforeAfterData?.beforeLabel || 'ÖNCE'}
                                    </span>
                                </div>
                            </div>

                            <div className="absolute bottom-6 right-6 z-10 pointer-events-none transition-opacity duration-300" style={{ opacity: sliderPosition > 90 ? 0 : 1 }}>
                                <div className="bg-white/40 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-white/30 shadow-lg flex items-center gap-2">
                                    <span className="text-[11px] font-black uppercase tracking-widest leading-none mt-0.5 text-black">
                                        {item.beforeAfterData?.afterLabel || 'SONRA'}
                                    </span>
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                </div>
                            </div>

                            {/* Hint overlay */}
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 pointer-events-none z-20">
                                <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest">{t('admin.post.compare_hint')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ADDITIONAL SETTINGS */}
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={() => setShowOptions(!showOptions)}
                        className="text-[11px] font-black text-palette-tan/50 hover:text-palette-maroon transition-colors flex items-center gap-1.5 uppercase tracking-[0.15em]"
                    >
                        <span className={`material-symbols-rounded transition-transform duration-300 ${showOptions ? 'rotate-90' : ''}`} style={{ fontSize: '16px' }}>settings</span>
                        {t('admin.post.extra_settings_alt')}
                        <span className={`material-symbols-rounded transition-transform duration-300 ${showOptions ? 'rotate-180' : ''}`} style={{ fontSize: '18px' }}>expand_more</span>
                    </button>

                    {showOptions && (
                        <div className="mt-4 animate-in slide-in-from-top-2 duration-300 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-black text-palette-tan ml-1 uppercase tracking-wider">{t('admin.post.source')}</label>
                                <input
                                    type="text"
                                    value={item.source || ''}
                                    onChange={(e) => onUpdate(item.id, 'source', e.target.value)}
                                    className="w-full h-10 bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 text-sm font-bold text-palette-maroon outline-none focus:border-palette-red transition-all"
                                    placeholder={t('admin.post.source_placeholder')}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[12px] font-black text-palette-tan ml-1 uppercase tracking-wider">{t('common.description')}</label>
                                <div className="quill-modern-wrapper compact-quill border border-palette-tan/20 rounded-[3px] overflow-hidden focus-within:border-palette-red/40 transition-all shadow-sm bg-white">
                                    {(() => {
                                        const Quill: any = ReactQuill;
                                        return (
                                            <Quill
                                                theme="snow"
                                                value={item.description}
                                                onChange={(content: string) => onUpdate(item.id, 'description', content)}
                                                modules={QUILL_MODULES}
                                                formats={QUILL_FORMATS}
                                                placeholder="Bu blok hakkında kısa bir bilgi..."
                                                className="modern-quill-editor"
                                            />
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostBeforeAfterItem;
