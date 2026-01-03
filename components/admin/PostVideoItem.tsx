
import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import { PostItem, QUILL_MODULES, QUILL_FORMATS } from './PostTextItem';
import { useLanguage } from '../../context/LanguageContext';

interface PostVideoItemProps {
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
}

const youtubeParser = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        const id = match[2];
        const isShorts = url.includes('/shorts/');
        // Ultra-minimalist embed: no controls, no info, no branding, no keyboard shortcuts
        return {
            id,
            embed: `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&rel=0&showinfo=0&modestbranding=1&disablekb=1&fs=0&iv_load_policy=3&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`,
            thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
            isShorts
        };
    }
    return null;
};

const PostVideoItem: React.FC<PostVideoItemProps> = ({
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
    onOpenUrlMode
}) => {
    const { t } = useLanguage();
    const [showOptions, setShowOptions] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const ytInfo = youtubeParser(item.mediaUrl);
    const isYoutube = !!ytInfo;

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isYoutube) {
            setIsPlaying(!isPlaying);
            return;
        }
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleFullscreen = (e: React.MouseEvent) => {
        e.stopPropagation();
        const element = isYoutube ? containerRef.current : videoRef.current;
        if (element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            }
        }
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
                                    title="Yukarı Taşı"
                                >
                                    <span className="material-symbols-rounded rotate-180" style={{ fontSize: '20px' }}>expand_more</span>
                                </button>
                            ) : <div className="w-8 h-8" />}

                            {index < totalItems - 1 ? (
                                <button
                                    onClick={() => onMoveDown?.(index)}
                                    className="w-8 h-8 flex items-center justify-center rounded-[3px] text-palette-tan/40 hover:text-palette-maroon hover:bg-white hover:shadow-sm transition-all active:scale-90"
                                    title="Aşağı Taşı"
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
                            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>videocam</span>
                        </div>
                        <h3 className="text-base font-bold text-palette-maroon">{t('admin.post.video_block')}</h3>
                    </div>
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

                    {/* 2. MIDDLE ROW: VIDEO PLAYER & EDITOR SIDE BY SIDE */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* LEFT: VIDEO AREA */}
                        <div className="md:col-span-12 lg:col-span-5 space-y-2">
                            <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">{t('admin.post.video_panel')}</label>
                            <div
                                ref={containerRef}
                                className={`rounded-[3px] bg-palette-beige/5 border-2 border-dashed border-palette-tan/20 flex flex-col items-center justify-center overflow-hidden transition-all relative group w-full min-h-[250px] ${ytInfo?.isShorts ? 'aspect-[9/16] md:max-w-[300px] mx-auto' : 'aspect-video'}`}
                            >
                                {item.mediaUrl ? (
                                    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
                                        {isYoutube ? (
                                            isPlaying ? (
                                                <iframe
                                                    src={ytInfo.embed}
                                                    className="w-full h-full border-none"
                                                    allow="autoplay; encrypted-media; fullscreen"
                                                    allowFullScreen
                                                />
                                            ) : (
                                                <div className="relative w-full h-full">
                                                    <img
                                                        src={ytInfo.thumbnail}
                                                        className="w-full h-full object-cover opacity-60"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${ytInfo.id}/hqdefault.jpg`;
                                                        }}
                                                    />
                                                </div>
                                            )
                                        ) : (
                                            <video
                                                ref={videoRef}
                                                src={item.mediaUrl}
                                                onLoadedData={() => setIsVideoLoading(false)}
                                                onPlay={() => setIsPlaying(true)}
                                                onPause={() => setIsPlaying(false)}
                                                className="w-full h-full object-contain"
                                                muted={isMuted}
                                                playsInline
                                                loop
                                            />
                                        )}

                                        {/* CUSTOM COMPACT CONTROLS */}
                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between gap-3 z-[5]">
                                            <div className="flex items-center gap-2">
                                                <button onClick={togglePlay} className="p-1.5 bg-white/20 hover:bg-white/40 rounded-[3px] text-white transition-all flex items-center justify-center">
                                                    {isPlaying ? <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>pause</span> : <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>play_arrow</span>}
                                                </button>
                                                {!isYoutube && (
                                                    <button onClick={toggleMute} className="p-1.5 bg-white/20 hover:bg-white/40 rounded-[3px] text-white transition-all flex items-center justify-center">
                                                        {isMuted ? <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>volume_off</span> : <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>volume_up</span>}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={handleFullscreen} className="p-1.5 bg-white/20 hover:bg-white/40 rounded-[3px] text-white transition-all flex items-center justify-center">
                                                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>fullscreen</span>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onUpdate(item.id, 'mediaUrl', ''); setIsPlaying(false); }}
                                                    className="p-1.5 bg-palette-red/80 hover:bg-palette-red rounded-[3px] text-white transition-all flex items-center justify-center"
                                                    title={t('common.delete')}
                                                >
                                                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* CENTER PLAY OVERLAY */}
                                        {!isPlaying && (!isYoutube ? !isVideoLoading : true) && (
                                            <button
                                                onClick={togglePlay}
                                                className="absolute inset-0 flex items-center justify-center group/play z-[4]"
                                            >
                                                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-100 group-hover/play:scale-110 transition-all">
                                                    <span className="material-symbols-rounded" style={{ fontSize: '36px' }}>play_arrow</span>
                                                </div>
                                            </button>
                                        )}

                                        {!isYoutube && isVideoLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                                                <span className="material-symbols-rounded animate-spin text-white" style={{ fontSize: '24px' }}>progress_activity</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div
                                            onClick={() => onOpenFileManager(item.id)}
                                            className="flex flex-col items-center cursor-pointer group/pick mb-4"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-palette-maroon/5 flex items-center justify-center mb-3 group-hover/pick:bg-palette-maroon/10 transition-all">
                                                <span className="material-symbols-rounded text-palette-tan/40 group-hover/pick:text-palette-maroon transition-all" style={{ fontSize: '32px' }}>add</span>
                                            </div>
                                            <span className="text-[14px] font-bold text-palette-tan/50 px-4 text-center group-hover/pick:text-palette-maroon transition-all">{t('admin.post.pick_video')}</span>
                                        </div>
                                        <button
                                            onClick={() => onOpenUrlMode(item.id)}
                                            className="mt-2 text-[10px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                        >
                                            <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>public</span> {t('admin.post.add_video_url')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: RICH TEXT EDITOR */}
                        <div className="md:col-span-12 lg:col-span-7 h-full flex flex-col">
                            <div className="space-y-2 group/editor flex-1 flex flex-col">
                                <label className="text-[13px] font-black text-palette-tan ml-1">{t('common.description')}</label>
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

export default PostVideoItem;
