
import React, { useState, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import { useDropzone } from 'react-dropzone';
import { PostItem, QUILL_MODULES, QUILL_FORMATS } from './PostTextItem';
import { storageService } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';

interface PostSliderImageItemProps {
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
}

const PostSliderImageItem: React.FC<PostSliderImageItemProps> = ({
    item,
    index,
    totalItems,
    showBlockNumbers,
    onUpdate,
    onRemove,
    isDeletable = true,
    onMoveUp,
    onMoveDown,
    onOpenFileManager
}) => {
    const { t } = useLanguage();
    const [showDescription, setShowDescription] = useState(false);
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setUploading(true);
        try {
            const uploadPromises = acceptedFiles.map(file => storageService.uploadFile(file));
            const results = await Promise.all(uploadPromises);
            const newUrls = results.filter(r => r !== null).map(r => r!.src);
            const currentUrls = item.mediaUrls || (item.mediaUrl ? [item.mediaUrl] : []);
            onUpdate(item.id, 'mediaUrls', [...currentUrls, ...newUrls]);
        } catch (error) {
            console.error('Slider upload failed:', error);
        } finally {
            setUploading(false);
        }
    }, [item.id, item.mediaUrls, item.mediaUrl, onUpdate]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: true,
        noClick: true // We handle click manually to open File Manager
    });

    const removeImage = (imgIndex: number) => {
        const currentUrls = item.mediaUrls || [];
        const newUrls = currentUrls.filter((_, i) => i !== imgIndex);
        onUpdate(item.id, 'mediaUrls', newUrls);
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
                            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>gallery_thumbnail</span>
                        </div>
                        <h3 className="text-base font-bold text-palette-maroon">{t('admin.post.slider_block')}</h3>
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

                {/* 1. TOP ROW: TITLE & BLOCK NUMBER */}
                <div className="space-y-1.5 w-full">
                    <label className="text-[13px] font-black text-palette-tan ml-1">{t('admin.post.title')}</label>
                    <div className="flex items-center gap-3">
                        {showBlockNumbers && (
                            <div className="w-9 h-9 shrink-0 rounded-[3px] bg-palette-tan text-white flex items-center justify-center text-base font-black shadow-md shadow-palette-tan/10">
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

                {/* 2. LARGE DROPZONE AREA WITH INTEGRATED PREVIEWS */}
                <div className="space-y-2">
                    <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">{t('admin.post.slider_images')}</label>
                    <div
                        {...getRootProps()}
                        onClick={() => onOpenFileManager(item.id)}
                        className={`
                            relative min-h-[220px] rounded-[3px] border-2 border-dashed transition-all cursor-pointer p-4
                            ${isDragActive ? 'border-palette-red bg-palette-red/5' : 'border-palette-tan/20 bg-palette-beige/5 hover:border-palette-maroon/40'}
                        `}
                    >
                        <input {...getInputProps()} />

                        {/* BACKGROUND PROMPT - ALWAYS VISIBLE BUT FADED WHEN LOADED */}
                        <div className={`
                            absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity duration-500
                            ${(item.mediaUrls && item.mediaUrls.length > 0) ? 'opacity-[0.05] pointer-events-none' : 'opacity-100'}
                        `}>
                            <div className="w-16 h-16 rounded-full bg-palette-maroon/10 flex items-center justify-center text-palette-maroon">
                                <span className="material-symbols-rounded" style={{ fontSize: '32px' }}>upload</span>
                            </div>
                            <div className="text-center">
                                <p className="text-base font-black text-palette-maroon uppercase tracking-widest">{t('admin.post.slider_pick')}</p>
                                <p className="text-[12px] font-bold text-palette-tan/60 mt-1">{t('admin.post.slider_help')}</p>
                            </div>
                        </div>

                        {/* FOREGROUND: SCANNING/UPLOADING STATE */}
                        {uploading && (
                            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                                <span className="material-symbols-rounded animate-spin text-palette-maroon" style={{ fontSize: '40px' }}>progress_activity</span>
                                <span className="text-[13px] font-bold text-palette-maroon">{t('admin.post.uploading_images')}</span>
                            </div>
                        )}

                        {/* FOREGROUND: IMAGE PREVIEWS GRID */}
                        {(item.mediaUrls && item.mediaUrls.length > 0) && (
                            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {item.mediaUrls.map((url, i) => {
                                    const fileName = url.split('/').pop()?.split('?')[0] || `Görsel ${i + 1}`;
                                    return (
                                        <div key={i} className="group/img flex flex-col gap-2">
                                            <div className="relative aspect-square rounded-[3px] overflow-hidden bg-white border border-palette-tan/10 shadow-sm transition-all hover:shadow-md">
                                                <img src={url} className="w-full h-full object-contain" alt={fileName} />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                                        className="p-2 bg-palette-red text-white rounded-[3px] hover:scale-110 transition-all shadow-lg flex items-center justify-center"
                                                        title={t('common.delete')}
                                                    >
                                                        <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>close</span>
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-[1px] font-black uppercase tracking-tighter">
                                                    #{i + 1}
                                                </div>
                                            </div>
                                            <p className="text-[9px] font-bold text-palette-tan/60 truncate px-1 text-center bg-palette-beige/10 py-0.5 rounded-[2px]" title={fileName}>
                                                {fileName}
                                            </p>
                                            <input
                                                type="text"
                                                value={(item.altTexts || [])[i] || ''}
                                                onChange={(e) => {
                                                    const newAltTexts = [...(item.altTexts || [])];
                                                    // Fill with empty strings if array is too short
                                                    while (newAltTexts.length <= i) newAltTexts.push('');
                                                    newAltTexts[i] = e.target.value;
                                                    onUpdate(item.id, 'altTexts', newAltTexts);
                                                }}
                                                className="text-[10px] bg-white border border-palette-tan/20 rounded-[2px] px-1 py-0.5 outline-none focus:border-palette-red transition-all"
                                                placeholder="Alt Text"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. DETAILS SECTION */}
                <div className="pt-0">
                    <div className="flex justify-start">
                        <button
                            type="button"
                            onClick={() => setShowDescription(!showDescription)}
                            className="text-[11px] font-black text-palette-tan/50 hover:text-palette-maroon transition-colors flex items-center gap-1 uppercase tracking-widest py-2"
                        >
                            <span className={`material-symbols-rounded transition-transform duration-300 ${showDescription ? 'rotate-180' : ''}`} style={{ fontSize: '18px' }}>expand_more</span>
                            {showDescription ? t('common.less') : t('admin.post.slider_details')}
                        </button>
                    </div>

                    {showDescription && (
                        <div className="animate-in slide-in-from-top-2 duration-300 w-full space-y-4 mt-2">
                            {/* SOURCE INSIDE COLLAPSIBLE */}
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-black text-palette-tan ml-1 flex items-center gap-1.5 uppercase tracking-wider">
                                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>settings</span> {t('admin.post.image_source')}
                                </label>
                                <input
                                    type="text"
                                    value={item.source || ''}
                                    onChange={(e) => onUpdate(item.id, 'source', e.target.value)}
                                    className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 py-2 text-sm font-bold text-palette-maroon outline-none focus:border-palette-red transition-all placeholder:font-normal"
                                    placeholder={t('admin.post.source_placeholder')}
                                />
                            </div>

                            {/* DESCRIPTION INSIDE COLLAPSIBLE */}
                            <div className="space-y-2">
                                <label className="text-[13px] font-black text-palette-tan ml-1 flex items-center gap-1.5 uppercase tracking-wider">
                                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>description</span> {t('admin.post.image_desc')}
                                </label>
                                <div className="quill-modern-wrapper compact-quill border border-palette-tan/20 rounded-[3px] overflow-hidden focus-within:border-palette-red/40 transition-all shadow-sm bg-white min-h-[160px]">
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

export default PostSliderImageItem;
