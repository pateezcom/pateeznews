
import React, { useState, useEffect, useRef } from 'react';
import {
    ChevronDown,
    Trash2,
    Share2,
    Plus,
    Edit3,
    Settings2,
    FileText,
    Globe,
    ExternalLink
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import { PostItem, QUILL_MODULES, QUILL_FORMATS } from './PostTextItem';
import { useLanguage } from '../../context/LanguageContext';

interface PostSocialItemProps {
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

const PostSocialItem: React.FC<PostSocialItemProps> = ({
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
    const previewRef = useRef<HTMLDivElement>(null);

    // Re-run scripts when embed code changes
    useEffect(() => {
        if (!previewRef.current || !item.mediaUrl) return;

        // This is a common trick to execute scripts in dangerouslySetInnerHTML
        const scripts = previewRef.current.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode?.replaceChild(newScript, oldScript);
        });

        // Some social platforms need window level triggers
        if ((window as any).twttr) (window as any).twttr.widgets?.load();
        if ((window as any).instgrm) (window as any).instgrm.Embeds?.process();
    }, [item.mediaUrl]);

    // Add standard width 552 to iframes in mediaUrl
    const getProcessedEmbed = (embed: string) => {
        if (!embed) return '';
        let processed = embed.trim();

        // Handle raw links
        if (processed.startsWith('http') && !processed.includes('<')) {
            // Nsosyal integration
            if (processed.includes('nsosyal.com')) {
                // Extract ID from URL (handles /post/ID, /p/ID, /embed/ID)
                const nsId = processed.split('/').filter(Boolean).pop()?.split('?')[0];
                return `<iframe src="https://nsosyal.com/embed/${nsId}" width="552" height="600" style="border:none; border-radius:3px; overflow:hidden; width:552px;" frameborder="0" scrolling="no" allowfullscreen="true"></iframe>`;
            }
            // Pinterest integration
            if (processed.includes('pin.it') || processed.includes('pinterest.com')) {
                // Short links (pin.it) must use the widget script as we can't resolve the ID on the client
                if (processed.includes('pin.it')) {
                    return `<div style="width:552px; display:flex; justify-content:center;"><a data-pin-do="embedPin" data-pin-width="large" href="${processed}"></a></div><script async defer src="//assets.pinterest.com/js/pinit.js"></script>`;
                }
                // Full links
                const pinId = processed.split('/').filter(Boolean).pop()?.split('?')[0];
                return `<iframe src="https://assets.pinterest.com/ext/embed.html?id=${pinId}" width="552" height="600" style="border:none; border-radius:3px; overflow:hidden; width:552px;" frameborder="0" scrolling="no" allowfullscreen="true"></iframe>`;
            }
            // Twitter / X fallback
            if (processed.includes('twitter.com') || processed.includes('x.com')) {
                return `<blockquote class="twitter-tweet" data-width="552"><a href="${processed}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
            }
            // Instagram fallback
            if (processed.includes('instagram.com/p/')) {
                return `<blockquote class="instagram-media" data-instgrm-permalink="${processed}" data-instgrm-version="14" style="width:552px; border-radius:3px; border:1px solid #dbdbdb; background:#fff; margin:1px; max-width:552px; min-width:326px; padding:0; width:calc(100% - 2px);"></blockquote><script async src="//www.instagram.com/embed.js"></script>`;
            }

            return `<div class="p-6 bg-palette-beige/5 border border-palette-tan/10 rounded-[3px] flex flex-col items-center gap-3 text-center">
                <ExternalLink size={24} className="text-palette-maroon/20" />
                <p className="text-[12px] font-bold text-palette-maroon/60 truncate max-w-full">${processed}</p>
                <a href="${processed}" target="_blank" class="px-4 py-2 bg-palette-maroon text-white text-[10px] font-black uppercase tracking-widest rounded-[3px] hover:opacity-90 transition-all">
                    BAĞLANTIYI AÇ
                </a>
            </div>`;
        }

        // Adjust iframe widths to 552
        processed = processed.replace(/width="(\d+)"/g, 'width="552"');
        processed = processed.replace(/width:(\s*\d+)px/g, 'width:552px');

        // Add default height if missing in iframe
        if (processed.includes('<iframe') && !processed.includes('height=')) {
            processed = processed.replace('<iframe', '<iframe height="600"');
        }

        return processed;
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
            <div className="flex-1 p-4 space-y-4">
                {/* BLOCK HEADER */}
                <div className="flex items-center justify-between border-b border-palette-tan/15 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-palette-beige/20 rounded-[3px] text-palette-maroon">
                            <Share2 size={18} />
                        </div>
                        <h3 className="text-base font-bold text-palette-maroon">{t('admin.post.social_block')}</h3>
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

                    {/* 2. MIDDLE ROW: EMBED CODE & PREVIEW */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* LEFT: EMBED INPUT */}
                        <div className="md:col-span-6 space-y-2">
                            <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">{t('admin.post.social_embed_code')}</label>
                            <textarea
                                value={item.mediaUrl || ''}
                                onChange={(e) => onUpdate(item.id, 'mediaUrl', e.target.value)}
                                className="w-full min-h-[300px] bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] p-4 text-xs font-mono text-palette-maroon focus:border-palette-red outline-none transition-all resize-y"
                                placeholder={t('admin.post.social_placeholder')}
                            />
                        </div>

                        {/* RIGHT: PREVIEW AREA */}
                        <div className="md:col-span-6 space-y-2">
                            <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">{t('admin.post.social_preview')}</label>
                            <div className="rounded-[3px] bg-palette-beige/5 border border-palette-tan/15 overflow-hidden flex flex-col items-center justify-center min-h-[300px] p-4 relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                                {item.mediaUrl ? (
                                    <div
                                        ref={previewRef}
                                        className="w-full flex justify-center scale-[0.85] origin-top"
                                        style={{ maxWidth: '552px' }}
                                        dangerouslySetInnerHTML={{ __html: getProcessedEmbed(item.mediaUrl) }}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-palette-tan/20">
                                        <Globe size={48} className="mb-2" />
                                        <span className="text-[10px] font-black tracking-widest uppercase">{t('admin.post.social_preview')}</span>
                                    </div>
                                )}
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
                                {showOptions ? t('common.less') : t('admin.post.extra_settings')}
                            </button>
                        </div>

                        {showOptions && (
                            <div className="animate-in slide-in-from-top-2 duration-300 w-full space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-black text-palette-tan ml-1 flex items-center gap-1.5 uppercase tracking-wider">
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

                                <div className="space-y-2">
                                    <label className="text-[13px] font-black text-palette-tan ml-1 flex items-center gap-1.5 uppercase tracking-wider">
                                        <FileText size={12} /> {t('admin.post.content_label')}
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

            {/* INJECT TYPES FOR SCRIPTS (to avoid TS errors) */}
            <script dangerouslySetInnerHTML={{
                __html: `
                window.twttr = window.twttr || {};
                window.instgrm = window.instgrm || {};
            `}} />
        </div>
    );
};

export default PostSocialItem;
