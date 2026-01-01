import React, { useState } from 'react';
import {
    ChevronDown,
    Trash2,
    RotateCw,
    Plus,
    Settings2,
    FileText,
    Image as LucideImage,
    Type,
    ArrowRightLeft,
    Globe,
    Edit3,
    Loader2,
    Sparkles,
    Link as LinkIcon
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import { PostItem, QUILL_MODULES, QUILL_FORMATS } from './PostTextItem';
import { useLanguage } from '../../context/LanguageContext';

// Restricted Quill configuration for Flip Card descriptions (No links, no images)
// Font size, text color, and background color are enabled as requested.
const FLIP_QUILL_MODULES = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
    ],
};

const FLIP_QUILL_FORMATS = [
    'header', 'size',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'color', 'background'
];

interface PostFlipCardItemProps {
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

const PostFlipCardItem: React.FC<PostFlipCardItemProps> = ({
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
    const [isFrontLoading, setIsFrontLoading] = useState(false);
    const [isBackLoading, setIsBackLoading] = useState(false);
    const [isPreviewFlipped, setIsPreviewFlipped] = useState(false);

    const updateFlipData = (field: string, value: string) => {
        const currentData = item.flipData || {
            frontImage: '',
            backImage: '',
            frontTitle: '',
            backTitle: '',
            frontDescription: '',
            backDescription: ''
        };
        onUpdate(item.id, 'flipData', {
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
                                    <ChevronDown size={18} className="rotate-180" />
                                </button>
                            ) : <div className="w-8 h-8" />}

                            {index < totalItems - 1 ? (
                                <button
                                    onClick={() => onMoveDown?.(index)}
                                    className="w-8 h-8 flex items-center justify-center rounded-[3px] text-palette-tan/40 hover:text-palette-maroon hover:bg-white hover:shadow-sm transition-all active:scale-90"
                                    title={t('common.move_down')}
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
                    title={isDeletable ? t('admin.post.delete_block') : t('admin.post.not_deletable')}
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
                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-[3px] flex items-center justify-center shadow-sm border border-orange-100/50">
                            <RotateCw size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-palette-maroon leading-tight">{t('admin.post.iframe_block').replace('Iframe', 'Flip kart')}</h3>
                            <p className="text-[11px] font-bold text-palette-tan/50 tracking-wide">{t('admin.post.flip_desc')}</p>
                        </div>
                    </div>
                </div>

                {/* 2. MAIN TITLE ROW (Same as PostImageItem) */}
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
                            placeholder={t('admin.post.slider_title_placeholder')}
                        />
                    </div>
                </div>

                {/* 3. FLIP CARD SIDES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                    {/* Visual Connector Line for large screens */}
                    <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="bg-white p-2 rounded-full border border-palette-tan/15 shadow-sm text-palette-tan/40">
                            <ArrowRightLeft size={16} />
                        </div>
                    </div>

                    {/* FRONT SIDE */}
                    <div className="space-y-4 bg-palette-beige/5 p-4 rounded-[3px] border border-palette-tan/10 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-palette-red rounded-[3px] flex items-center justify-center text-white">
                                <span className="text-[10px] font-black">1</span>
                            </div>
                            <h4 className="text-[13px] font-black text-palette-maroon tracking-tight">{t('admin.post.front_settings')}</h4>
                        </div>

                        <div className="space-y-4">
                            {/* Image Box */}
                            <div className="rounded-[3px] bg-white border-2 border-dashed border-palette-tan/20 flex flex-col items-center justify-center overflow-hidden transition-all relative group w-full min-h-[220px]">
                                {item.flipData?.frontImage ? (
                                    <div className="relative w-full h-full flex items-center justify-center bg-palette-beige/5 min-h-[220px]">
                                        <img
                                            src={item.flipData.frontImage}
                                            onLoad={() => setIsFrontLoading(false)}
                                            onError={() => setIsFrontLoading(false)}
                                            className="max-w-full max-h-[220px] object-contain block"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onOpenImageEditor(item.id, 'frontImage')}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-emerald-600 transition-all"
                                                title={t('common.edit')}
                                            >
                                                <Edit3 size={20} />
                                            </button>
                                            <button
                                                onClick={() => updateFlipData('frontImage', '')}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-palette-red transition-all"
                                                title={t('common.delete')}
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                        {isFrontLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 pointer-events-none">
                                                <Loader2 size={22} className="animate-spin text-palette-maroon" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div
                                            onClick={() => onOpenFileManager(item.id, 'frontImage')}
                                            className="flex flex-col items-center cursor-pointer group/pick mb-4"
                                        >
                                            <Plus size={48} className="text-palette-tan/20 group-hover/pick:text-palette-maroon transition-all mb-2" />
                                            <span className="text-[14px] font-bold text-palette-tan/50 px-4 text-center">{t('admin.post.pick_image')} (Ön)</span>
                                        </div>
                                        <button
                                            onClick={() => onOpenUrlMode(item.id, 'frontImage')}
                                            className="mt-2 text-[10px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                        >
                                            <Globe size={11} /> {t('admin.post.url_or_upload')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 ml-1">
                                    <Type size={12} className="text-palette-tan/50" />
                                    <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest">{t('admin.post.front_title')}</label>
                                </div>
                                <input
                                    type="text"
                                    value={item.flipData?.frontTitle || ''}
                                    onChange={(e) => updateFlipData('frontTitle', e.target.value)}
                                    className="w-full h-10 bg-white border border-palette-tan/20 rounded-[3px] px-4 text-sm font-bold text-palette-maroon outline-none focus:border-palette-red transition-all shadow-sm"
                                    placeholder={t('admin.post.placeholder_example')}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 ml-1">
                                    <LinkIcon size={12} className="text-palette-tan/50" />
                                    <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest">{t('admin.post.front_link')}</label>
                                </div>
                                <input
                                    type="text"
                                    value={item.flipData?.frontLink || ''}
                                    onChange={(e) => updateFlipData('frontLink', e.target.value)}
                                    className="w-full h-10 bg-white border border-palette-tan/20 rounded-[3px] px-4 text-sm font-bold text-palette-maroon outline-none focus:border-palette-red transition-all shadow-sm"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 ml-1">
                                    <FileText size={12} className="text-palette-tan/50" />
                                    <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest">{t('admin.post.front_description')}</label>
                                </div>
                                <div className="quill-modern-wrapper compact-quill border border-palette-tan/20 rounded-[3px] overflow-hidden focus-within:border-palette-red/40 transition-all shadow-sm bg-white">
                                    {(() => {
                                        const Quill: any = ReactQuill;
                                        return (
                                            <Quill
                                                theme="snow"
                                                value={item.flipData?.frontDescription || ''}
                                                onChange={(content: string) => updateFlipData('frontDescription', content)}
                                                modules={FLIP_QUILL_MODULES}
                                                formats={FLIP_QUILL_FORMATS}
                                                placeholder={t('admin.post.desc_placeholder_front')}
                                                className="modern-quill-editor"
                                            />
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BACK SIDE */}
                    <div className="space-y-4 bg-palette-beige/5 p-4 rounded-[3px] border border-palette-tan/10 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-blue-600 rounded-[3px] flex items-center justify-center text-white">
                                <span className="text-[10px] font-black">2</span>
                            </div>
                            <h4 className="text-[13px] font-black text-palette-maroon tracking-tight">{t('admin.post.back_settings')}</h4>
                        </div>

                        <div className="space-y-4">
                            {/* Image Box */}
                            <div className="rounded-[3px] bg-white border-2 border-dashed border-palette-tan/20 flex flex-col items-center justify-center overflow-hidden transition-all relative group w-full min-h-[220px]">
                                {item.flipData?.backImage ? (
                                    <div className="relative w-full h-full flex items-center justify-center bg-palette-beige/5 min-h-[220px]">
                                        <img
                                            src={item.flipData.backImage}
                                            onLoad={() => setIsBackLoading(false)}
                                            onError={() => setIsBackLoading(false)}
                                            className="max-w-full max-h-[220px] object-contain block"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onOpenImageEditor(item.id, 'backImage')}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-emerald-600 transition-all"
                                                title={t('common.edit')}
                                            >
                                                <Edit3 size={20} />
                                            </button>
                                            <button
                                                onClick={() => updateFlipData('backImage', '')}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-palette-red transition-all"
                                                title={t('common.delete')}
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                        {isBackLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 pointer-events-none">
                                                <Loader2 size={22} className="animate-spin text-palette-maroon" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div
                                            onClick={() => onOpenFileManager(item.id, 'backImage')}
                                            className="flex flex-col items-center cursor-pointer group/pick mb-4"
                                        >
                                            <Plus size={48} className="text-palette-tan/20 group-hover/pick:text-palette-maroon transition-all mb-2" />
                                            <span className="text-[14px] font-bold text-palette-tan/50 px-4 text-center">{t('admin.post.pick_image')} (Arka)</span>
                                        </div>
                                        <button
                                            onClick={() => onOpenUrlMode(item.id, 'backImage')}
                                            className="mt-2 text-[10px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                        >
                                            <Globe size={11} /> {t('admin.post.url_or_upload')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 ml-1">
                                    <Type size={12} className="text-palette-tan/50" />
                                    <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest">{t('admin.post.back_title')}</label>
                                </div>
                                <input
                                    type="text"
                                    value={item.flipData?.backTitle || ''}
                                    onChange={(e) => updateFlipData('backTitle', e.target.value)}
                                    className="w-full h-10 bg-white border border-palette-tan/20 rounded-[3px] px-4 text-sm font-bold text-palette-maroon outline-none focus:border-palette-red transition-all shadow-sm"
                                    placeholder={t('admin.post.example_surprise')}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 ml-1">
                                    <LinkIcon size={12} className="text-palette-tan/50" />
                                    <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest">{t('admin.post.back_link')}</label>
                                </div>
                                <input
                                    type="text"
                                    value={item.flipData?.backLink || ''}
                                    onChange={(e) => updateFlipData('backLink', e.target.value)}
                                    className="w-full h-10 bg-white border border-palette-tan/20 rounded-[3px] px-4 text-sm font-bold text-palette-maroon outline-none focus:border-palette-red transition-all shadow-sm"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 ml-1">
                                    <FileText size={12} className="text-palette-tan/50" />
                                    <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest">{t('admin.post.back_description')}</label>
                                </div>
                                <div className="quill-modern-wrapper compact-quill border border-palette-tan/20 rounded-[3px] overflow-hidden focus-within:border-palette-red/40 transition-all shadow-sm bg-white">
                                    {(() => {
                                        const Quill: any = ReactQuill;
                                        return (
                                            <Quill
                                                theme="snow"
                                                value={item.flipData?.backDescription || ''}
                                                onChange={(content: string) => updateFlipData('backDescription', content)}
                                                modules={FLIP_QUILL_MODULES}
                                                formats={FLIP_QUILL_FORMATS}
                                                placeholder={t('admin.post.desc_placeholder_back')}
                                                className="modern-quill-editor"
                                            />
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. LIVE PREVIEW SECTION */}
                <div className="pt-8 border-t border-palette-tan/10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                            <Sparkles size={14} />
                        </div>
                        <h4 className="text-[12px] font-black text-palette-maroon uppercase tracking-[0.2em]">{t('admin.post.live_preview')}</h4>
                    </div>

                    <div className="flex justify-center bg-palette-beige/5 rounded-[3px] p-8 border border-palette-tan/5 relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                        <div
                            className="w-full max-w-[340px] h-[460px] cursor-pointer perspective-1000 relative z-10"
                            onClick={() => setIsPreviewFlipped(!isPreviewFlipped)}
                            style={{ perspective: '1000px' }}
                        >
                            <div
                                className="relative w-full h-full transition-transform duration-700 ease-in-out shadow-2xl rounded-lg"
                                style={{
                                    transformStyle: 'preserve-3d',
                                    transform: isPreviewFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                }}
                            >
                                {/* FRONT FACE */}
                                <div
                                    className="absolute inset-0 w-full h-full rounded-lg overflow-hidden bg-white border border-palette-tan/10 backface-hidden"
                                    style={{ backfaceVisibility: 'hidden' }}
                                >
                                    {item.flipData?.frontImage ? (
                                        <>
                                            <img src={item.flipData.frontImage} alt="Front" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                            <div className="absolute bottom-0 left-0 w-full p-6 text-white text-left">
                                                <div className="flex items-center gap-1.5 mb-2.5">
                                                    <span className="bg-blue-600 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 animate-pulse">
                                                        {t('admin.post.click_to_flip')}
                                                    </span>
                                                </div>
                                                {item.flipData?.frontLink ? (
                                                    <a
                                                        href={item.flipData.frontLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="block hover:text-palette-red transition-colors"
                                                    >
                                                        <h3 className="text-2xl font-black leading-tight mb-2 drop-shadow-md">{item.flipData?.frontTitle || 'Ön Başlık Buraya'}</h3>
                                                    </a>
                                                ) : (
                                                    <h3 className="text-2xl font-black leading-tight mb-2 drop-shadow-md">{item.flipData?.frontTitle || 'Ön Başlık Buraya'}</h3>
                                                )}
                                                {item.flipData?.frontDescription && (
                                                    <div
                                                        className="text-white/90 text-[11px] leading-relaxed mb-4 line-clamp-3 overflow-hidden opacity-80"
                                                        dangerouslySetInnerHTML={{ __html: item.flipData.frontDescription }}
                                                    />
                                                )}
                                                <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold">
                                                    <RotateCw size={12} className="animate-spin-slow" />
                                                    <span className="uppercase tracking-widest">{t('admin.post.flip_for_back')}</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white bg-palette-maroon/95">
                                            <div className="w-12 h-1 bg-palette-red rounded-full mb-6"></div>
                                            {item.flipData?.frontLink ? (
                                                <a
                                                    href={item.flipData.frontLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="block hover:text-palette-red transition-colors"
                                                >
                                                    <h3 className="text-2xl font-black mb-4 leading-tight drop-shadow-md">{item.flipData?.frontTitle || 'Ön Başlık Buraya'}</h3>
                                                </a>
                                            ) : (
                                                <h3 className="text-2xl font-black mb-4 leading-tight drop-shadow-md">{item.flipData?.frontTitle || 'Ön Başlık Buraya'}</h3>
                                            )}
                                            {item.flipData?.frontDescription && (
                                                <div
                                                    className="text-gray-100 text-[11px] leading-relaxed font-medium mb-8 line-clamp-8 overflow-hidden max-w-[280px]"
                                                    dangerouslySetInnerHTML={{ __html: item.flipData.frontDescription }}
                                                />
                                            )}
                                            <div className="flex items-center gap-2 bg-white text-palette-maroon px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.15em] shadow-xl hover:bg-palette-beige transition-colors">
                                                <RotateCw size={12} className="animate-spin-slow" />
                                                <span>{t('admin.post.click_to_flip')}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/20">
                                        <RotateCw size={16} className="text-white" />
                                    </div>
                                </div>

                                {/* BACK FACE */}
                                <div
                                    className="absolute inset-0 w-full h-full rounded-lg overflow-hidden bg-gray-950 backface-hidden"
                                    style={{
                                        backfaceVisibility: 'hidden',
                                        transform: 'rotateY(180deg)'
                                    }}
                                >
                                    {item.flipData?.backImage ? (
                                        <>
                                            <img src={item.flipData.backImage} alt="Back" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                            <div className="absolute bottom-0 left-0 w-full p-6 text-white text-left">
                                                {item.flipData?.backLink ? (
                                                    <a
                                                        href={item.flipData.backLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="block hover:text-palette-red transition-colors"
                                                    >
                                                        <h3 className="text-2xl font-black leading-tight mb-2 drop-shadow-md">{item.flipData?.backTitle || 'Arka Başlık Buraya'}</h3>
                                                    </a>
                                                ) : (
                                                    <h3 className="text-2xl font-black leading-tight mb-2 drop-shadow-md">{item.flipData?.backTitle || 'Arka Başlık Buraya'}</h3>
                                                )}
                                                {item.flipData?.backDescription && (
                                                    <div
                                                        className="text-white/90 text-[11px] leading-relaxed mb-4 line-clamp-3 overflow-hidden opacity-80"
                                                        dangerouslySetInnerHTML={{ __html: item.flipData.backDescription }}
                                                    />
                                                )}
                                                <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold">
                                                    <RotateCw size={12} className="animate-spin-slow" />
                                                    <span className="uppercase tracking-widest text-[9px]">{t('admin.post.go_back')}</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white bg-gray-900/90">
                                            <div className="w-12 h-1 bg-blue-500 rounded-full mb-6"></div>
                                            {item.flipData?.backLink ? (
                                                <a
                                                    href={item.flipData.backLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="block hover:text-palette-red transition-colors"
                                                >
                                                    <h3 className="text-2xl font-black mb-4 leading-tight drop-shadow-md">{item.flipData?.backTitle || 'Arka Başlık Buraya'}</h3>
                                                </a>
                                            ) : (
                                                <h3 className="text-2xl font-black mb-4 leading-tight drop-shadow-md">{item.flipData?.backTitle || 'Arka Başlık Buraya'}</h3>
                                            )}
                                            {item.flipData?.backDescription && (
                                                <div
                                                    className="text-gray-200 text-[11px] leading-relaxed font-medium mb-8 line-clamp-8 overflow-hidden max-w-[280px]"
                                                    dangerouslySetInnerHTML={{ __html: item.flipData.backDescription }}
                                                />
                                            )}
                                            <div className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.15em] shadow-xl hover:bg-blue-50 transition-colors">
                                                <RotateCw size={12} />
                                                <span>{t('admin.post.go_back')}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/20">
                                        <RotateCw size={16} className="text-white" />
                                    </div>
                                </div>
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
                        <Settings2 size={13} className={`transition-transform duration-300 ${showOptions ? 'rotate-90' : ''}`} />
                        {t('admin.post.extra_settings_alt')}
                        <ChevronDown size={14} className={`transition-transform duration-300 ${showOptions ? 'rotate-180' : ''}`} />
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
                                                placeholder={t('admin.post.block_info_help')}
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

export default PostFlipCardItem;
