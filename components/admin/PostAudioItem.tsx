
import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronDown,
    Trash2,
    Music,
    Plus,
    Globe,
    Loader2,
    Settings2,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Mic
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import { PostItem, QUILL_MODULES, QUILL_FORMATS } from './PostTextItem';
import { useLanguage } from '../../context/LanguageContext';

interface PostAudioItemProps {
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

const youtubeMusicParser = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|music\.youtube\.com\/watch\?v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        const id = match[2];
        const isMusic = url.includes('music.youtube.com');
        return {
            id,
            embed: `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&controls=0&rel=0&showinfo=0&modestbranding=1&disablekb=1&fs=0&iv_load_policy=3&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`,
            thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
            isMusic
        };
    }
    return null;
};

const PostAudioItem: React.FC<PostAudioItemProps> = ({
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
    const [isAudioLoading, setIsAudioLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const ytInfo = youtubeMusicParser(item.mediaUrl);
    const isYoutube = !!ytInfo;

    useEffect(() => {
        if (!isYoutube && audioRef.current) {
            const audio = audioRef.current;
            const updateTime = () => setCurrentTime(audio.currentTime);
            const updateDuration = () => setDuration(audio.duration);
            audio.addEventListener('timeupdate', updateTime);
            audio.addEventListener('loadedmetadata', updateDuration);
            return () => {
                audio.removeEventListener('timeupdate', updateTime);
                audio.removeEventListener('loadedmetadata', updateDuration);
            };
        }
    }, [isYoutube, item.mediaUrl]);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isYoutube) {
            setIsPlaying(!isPlaying);
            return;
        }
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            const time = parseFloat(e.target.value);
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="group bg-white rounded-[3px] border border-palette-tan/20 shadow-md flex overflow-hidden animate-in slide-in-from-left duration-300 admin-font">
            {/* ACTIONS SIDEBAR */}
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
                    className={`w-8 h-8 flex items-center justify-center rounded-[3px] transition-all ${isDeletable ? "text-palette-tan/30 hover:text-white hover:bg-palette-red" : "text-palette-tan/10"}`}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-palette-tan/15 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-palette-beige/20 rounded-[3px] text-palette-maroon">
                            <Mic size={18} />
                        </div>
                        <h3 className="text-base font-bold text-palette-maroon">{t('admin.post.audio_block')}</h3>
                    </div>
                </div>

                <div className="space-y-4">
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
                                className="w-full h-9 bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 text-base font-bold text-palette-maroon outline-none focus:border-palette-red transition-all"
                                placeholder={t('admin.post.slider_title_placeholder')}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* AUDIO PLAYER PANEL */}
                        <div className="lg:col-span-5 space-y-2">
                            <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">{t('admin.post.audio_panel')}</label>
                            <div className="rounded-[3px] bg-palette-beige/5 border-2 border-dashed border-palette-tan/20 p-6 flex flex-col items-center justify-center min-h-[200px] relative transition-all overflow-hidden group">
                                {item.mediaUrl ? (
                                    <div className="w-full space-y-4 relative z-10">
                                        {isYoutube ? (
                                            <div className="relative w-full aspect-video rounded-[3px] overflow-hidden bg-black shadow-xl">
                                                {isPlaying ? (
                                                    <iframe
                                                        src={ytInfo.embed}
                                                        className="w-full h-full border-none"
                                                        allow="autoplay; encrypted-media"
                                                    />
                                                ) : (
                                                    <div className="relative w-full h-full">
                                                        <img
                                                            src={ytInfo.thumbnail}
                                                            className="w-full h-full object-cover opacity-60"
                                                            onError={(e) => (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${ytInfo.id}/hqdefault.jpg`}
                                                        />
                                                        <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center group/play">
                                                            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-100 group-hover/play:scale-110 transition-all">
                                                                <Play size={32} fill="currentColor" className="ml-1" />
                                                            </div>
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="absolute top-3 right-3 flex gap-2">
                                                    <button onClick={() => { onUpdate(item.id, 'mediaUrl', ''); setIsPlaying(false); }} className="p-2 bg-palette-red/80 hover:bg-palette-red rounded-[3px] text-white transition-all shadow-lg">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full bg-white/40 backdrop-blur-sm p-4 rounded-[3px] border border-palette-tan/10 shadow-lg space-y-4">
                                                <audio
                                                    ref={audioRef}
                                                    src={item.mediaUrl}
                                                    onLoadedData={() => setIsAudioLoading(false)}
                                                    onPlay={() => setIsPlaying(true)}
                                                    onPause={() => setIsPlaying(false)}
                                                    onEnded={() => setIsPlaying(false)}
                                                    muted={isMuted}
                                                />
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={togglePlay}
                                                        className="w-12 h-12 rounded-full bg-palette-maroon text-white flex items-center justify-center hover:bg-palette-red transition-all shadow-md active:scale-90"
                                                    >
                                                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                                                    </button>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex justify-between text-[10px] font-black text-palette-tan uppercase tracking-widest">
                                                            <span>{formatTime(currentTime)}</span>
                                                            <span>{formatTime(duration)}</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max={duration || 0}
                                                            value={currentTime}
                                                            onChange={handleProgressChange}
                                                            className="w-full h-1.5 bg-palette-beige rounded-full appearance-none cursor-pointer accent-palette-maroon"
                                                        />
                                                    </div>
                                                    <button onClick={toggleMute} className="text-palette-tan/60 hover:text-palette-maroon transition-colors">
                                                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                                    </button>
                                                    <button onClick={() => onUpdate(item.id, 'mediaUrl', '')} className="text-palette-tan/20 hover:text-palette-red transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {ytInfo?.isMusic && (
                                            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-palette-tan/40 uppercase tracking-widest">
                                                <Music size={12} /> YouTube Music İçeriği
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6">
                                        <div onClick={() => onOpenFileManager(item.id)} className="flex flex-col items-center cursor-pointer group/pick mb-4">
                                            <div className="w-14 h-14 rounded-full bg-palette-maroon/5 flex items-center justify-center mb-3 group-hover/pick:bg-palette-maroon/10 transition-all">
                                                <Plus size={28} className="text-palette-tan/40 group-hover/pick:text-palette-maroon transition-all" />
                                            </div>
                                            <span className="text-[13px] font-bold text-palette-tan/50 text-center">{t('admin.post.pick_audio')}</span>
                                        </div>
                                        <button
                                            onClick={() => onOpenUrlMode(item.id)}
                                            className="text-[10px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm transition-all flex items-center gap-1.5 uppercase tracking-widest"
                                        >
                                            <Globe size={11} /> {t('admin.post.add_video_url')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* DESCRIPTION EDITOR */}
                        <div className="lg:col-span-7 space-y-2 h-full flex flex-col">
                            <label className="text-[13px] font-black text-palette-tan ml-1">{t('common.description')}</label>
                            <div className="quill-modern-wrapper compact-quill border border-palette-tan/20 rounded-[3px] overflow-hidden focus-within:border-palette-red/40 transition-all bg-white flex-1 min-h-[180px]">
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

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => setShowOptions(!showOptions)}
                            className="text-[11px] font-black text-palette-tan/50 hover:text-palette-maroon transition-colors flex items-center gap-1 uppercase tracking-widest"
                        >
                            <ChevronDown size={14} className={`transition-transform duration-300 ${showOptions ? 'rotate-180' : ''}`} />
                            {showOptions ? t('common.less') : t('admin.post.extra_settings')}
                        </button>
                        {showOptions && (
                            <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[11px] font-black text-palette-tan ml-1 flex items-center gap-1.5 uppercase opacity-60 mb-1.5">
                                    <Settings2 size={12} /> {t('admin.post.source')}
                                </label>
                                <input
                                    type="text"
                                    value={item.source || ''}
                                    onChange={(e) => onUpdate(item.id, 'source', e.target.value)}
                                    className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 py-2 text-sm font-bold text-palette-maroon outline-none focus:border-palette-red transition-all"
                                    placeholder={t('admin.post.source_placeholder')}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostAudioItem;
