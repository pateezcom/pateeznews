
import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import { PostItem, QUILL_MODULES, QUILL_FORMATS } from './PostTextItem';
import { useLanguage } from '../../context/LanguageContext';

interface PostFileItemProps {
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

const getFileIcon = (fileName: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(ext)) return <span className="material-symbols-rounded text-red-500" style={{ fontSize: '40px' }}>description</span>;
    if (['doc', 'docx'].includes(ext)) return <span className="material-symbols-rounded text-blue-500" style={{ fontSize: '40px' }}>text_snippet</span>;
    if (['xls', 'xlsx'].includes(ext)) return <span className="material-symbols-rounded text-emerald-500" style={{ fontSize: '40px' }}>table_chart</span>;
    if (['ppt', 'pptx'].includes(ext)) return <span className="material-symbols-rounded text-orange-500" style={{ fontSize: '40px' }}>present_to_all</span>;
    if (['txt', 'md'].includes(ext)) return <span className="material-symbols-rounded text-slate-500" style={{ fontSize: '40px' }}>article</span>;
    return <span className="material-symbols-rounded text-palette-tan" style={{ fontSize: '40px' }}>draft</span>;
};

const PostFileItem: React.FC<PostFileItemProps> = ({
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
    const [showOptions, setShowOptions] = useState(false);

    const fileName = item.mediaUrl?.split('/').pop() || '';

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
                                    <span className="material-symbols-rounded rotate-180" style={{ fontSize: '20px' }}>expand_more</span>
                                </button>
                            ) : <div className="w-8 h-8" />}
                            {index < totalItems - 1 ? (
                                <button
                                    onClick={() => onMoveDown?.(index)}
                                    className="w-8 h-8 flex items-center justify-center rounded-[3px] text-palette-tan/40 hover:text-palette-maroon hover:bg-white hover:shadow-sm transition-all active:scale-90"
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
                    className={`w-8 h-8 flex items-center justify-center rounded-[3px] transition-all ${isDeletable ? "text-palette-tan/30 hover:text-white hover:bg-palette-red" : "text-palette-tan/10"}`}
                >
                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                </button>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-palette-tan/15 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-palette-beige/20 rounded-[3px] text-palette-maroon">
                            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>attach_file</span>
                        </div>
                        <h3 className="text-base font-bold text-palette-maroon">{t('admin.post.file_block')}</h3>
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
                        {/* FILE PREVIEW PANEL */}
                        <div className="lg:col-span-4 space-y-2">
                            <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">{t('admin.post.file_panel')}</label>
                            <div className="rounded-[3px] bg-palette-beige/5 border-2 border-dashed border-palette-tan/20 p-6 flex flex-col items-center justify-center min-h-[180px] relative transition-all overflow-hidden group">
                                {item.mediaUrl ? (
                                    <div className="w-full flex flex-col items-center space-y-4 relative z-10 animate-in fade-in zoom-in duration-300">
                                        <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-palette-tan/10 relative group-hover:scale-105 transition-transform">
                                            {getFileIcon(fileName)}
                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-palette-maroon text-white flex items-center justify-center shadow-lg border-2 border-white">
                                                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>download</span>
                                            </div>
                                        </div>
                                        <div className="text-center space-y-1 w-full px-2">
                                            <p className="text-[12px] font-black text-palette-maroon truncate max-w-full" title={fileName}>
                                                {fileName}
                                            </p>
                                            <p className="text-[10px] font-bold text-palette-tan/40 uppercase tracking-widest">
                                                {fileName.split('.').pop()} {t('admin.post.asset_label')}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 w-full pt-2">
                                            <a
                                                href={item.mediaUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 h-9 flex items-center justify-center gap-2 bg-white border border-palette-tan/20 text-palette-maroon rounded-[3px] text-[10px] font-black tracking-widest hover:bg-palette-maroon hover:text-white transition-all shadow-sm"
                                            >
                                                <span className="material-symbols-rounded" style={{ fontSize: '12px' }}>open_in_new</span> {t('common.view')}
                                            </a>
                                            <button
                                                onClick={() => onUpdate(item.id, 'mediaUrl', '')}
                                                className="w-9 h-9 flex items-center justify-center bg-palette-red/10 text-palette-red rounded-[3px] hover:bg-palette-red hover:text-white transition-all group/del"
                                            >
                                                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6">
                                        <div onClick={() => onOpenFileManager(item.id)} className="flex flex-col items-center cursor-pointer group/pick">
                                            <div className="w-14 h-14 rounded-full bg-palette-maroon/5 flex items-center justify-center mb-3 group-hover/pick:bg-palette-maroon/10 transition-all border border-transparent group-hover/pick:border-palette-maroon/10">
                                                <span className="material-symbols-rounded text-palette-tan/40 group-hover/pick:text-palette-maroon transition-all" style={{ fontSize: '28px' }}>add</span>
                                            </div>
                                            <span className="text-[13px] font-bold text-palette-tan/50 text-center uppercase tracking-widest">{t('admin.post.pick_file')}</span>
                                            <div className="mt-4 flex flex-wrap justify-center gap-1 opacity-40 grayscale group-hover/pick:grayscale-0 group-hover/pick:opacity-100 transition-all">
                                                <span className="text-[8px] font-black bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-[2px]">PDF</span>
                                                <span className="text-[8px] font-black bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-[2px]" >DOCX</span>
                                                <span className="text-[8px] font-black bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-[2px]" >XLSX</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* DESCRIPTION EDITOR */}
                        <div className="lg:col-span-8 space-y-2 h-full flex flex-col">
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
                            <span className={`material-symbols-rounded transition-transform duration-300 ${showOptions ? 'rotate-180' : ''}`} style={{ fontSize: '18px' }}>expand_more</span>
                            {showOptions ? t('common.less') : t('admin.post.extra_settings')}
                        </button>
                        {showOptions && (
                            <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[11px] font-black text-palette-tan ml-1 flex items-center gap-1.5 uppercase opacity-60 mb-1.5">
                                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>settings</span> Dosya Kaynağı
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

export default PostFileItem;
