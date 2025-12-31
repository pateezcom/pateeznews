import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import { ChevronDown, Trash2, FileText, Sparkles, Plus } from 'lucide-react';

export interface PostItem {
    id: string;
    title: string;
    description: string;
    mediaUrl?: string;
    source?: string;
    createdAt?: number;
    orderNumber?: number;
}

export const QUILL_MODULES = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image', 'video'],
        ['clean'],
        ['blockquote', 'code-block']
    ],
};

export const QUILL_FORMATS = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link', 'image', 'video',
    'blockquote', 'code-block'
];

interface PostTextItemProps {
    item: PostItem;
    index: number;
    totalItems: number;
    showBlockNumbers: boolean;
    onUpdate: (id: string, field: keyof PostItem, value: any) => void;
    onRemove: (id: string) => void;
    onMoveUp?: (index: number) => void;
    onMoveDown?: (index: number) => void;
}

const PostTextItem: React.FC<PostTextItemProps> = ({
    item,
    index,
    totalItems,
    showBlockNumbers,
    onUpdate,
    onRemove,
    onMoveUp,
    onMoveDown
}) => {
    const [showSource, setShowSource] = useState(false);
    return (
        <div className="group bg-white rounded-[3px] border border-palette-tan/20 shadow-md flex overflow-hidden animate-in slide-in-from-left duration-300 admin-font">
            {/* INTEGRATED SIDEBAR ACTIONS */}
            <div className="w-16 shrink-0 bg-palette-beige/10 border-r border-palette-tan/15 flex flex-col items-center py-4 gap-6">
                {totalItems > 1 && (
                    <div className="flex flex-col gap-1.5">
                        {index > 0 && (
                            <button
                                onClick={() => onMoveUp?.(index)}
                                className="p-2.5 bg-white border border-palette-tan/20 rounded-[3px] text-palette-tan hover:text-palette-maroon hover:shadow-sm transition-all active:scale-90"
                            >
                                <ChevronDown size={18} className="rotate-180" />
                            </button>
                        )}
                        {index < totalItems - 1 && (
                            <button
                                onClick={() => onMoveDown?.(index)}
                                className="p-2.5 bg-white border border-palette-tan/20 rounded-[3px] text-palette-tan hover:text-palette-maroon hover:shadow-sm transition-all active:scale-90"
                            >
                                <ChevronDown size={18} />
                            </button>
                        )}
                    </div>
                )}

                <div className="mt-auto flex flex-col items-center gap-4">
                    <button
                        onClick={() => onRemove(item.id)}
                        className="p-3 bg-white border border-palette-tan/20 rounded-[3px] text-palette-tan hover:text-white hover:bg-palette-red hover:border-palette-red transition-all shadow-sm active:scale-95"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 p-4 space-y-3">
                {/* BLOCK HEADER */}
                <div className="flex items-center justify-between border-b border-palette-tan/15 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-palette-beige/20 rounded-[3px] text-palette-maroon">
                            <FileText size={18} />
                        </div>
                        <h3 className="text-base font-bold text-palette-maroon">Metin İçerik Bloğu</h3>
                    </div>
                </div>

                <div className="space-y-2.5">
                    {/* TITLE FIELD WITH BLOCK NUMBER */}
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-black text-palette-tan ml-1">Blok Başlığı</label>
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
                                className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 py-1.5 text-base font-bold text-palette-maroon outline-none focus:border-palette-red transition-all placeholder:text-palette-tan/20"
                                placeholder="Başlık Girin (Opsiyonel)..."
                            />
                        </div>
                    </div>

                    {/* INTEGRATED PROFESSIONAL RICH-TEXT EDITOR */}
                    <div className="space-y-2 group/editor">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[13px] font-black text-palette-tan">İçerik Metni (Zengin Metin Editörü)</label>
                            <div className="flex items-center gap-2 text-palette-tan/30 group-focus-within/editor:text-palette-red/40 transition-colors">
                                <Sparkles size={12} />
                                <span className="text-[12px] font-bold">AI Yazım Desteği Aktif</span>
                            </div>
                        </div>
                        <div className="quill-modern-wrapper border border-palette-tan/20 rounded-[3px] overflow-hidden focus-within:border-palette-red/40 transition-all shadow-sm bg-white">
                            <ReactQuill
                                theme="snow"
                                value={item.description}
                                onChange={(content) => onUpdate(item.id, 'description', content)}
                                modules={QUILL_MODULES}
                                formats={QUILL_FORMATS}
                                placeholder="Haberinizin Bu Bölümündeki Hikayeyi Tüm Detaylarıyla Buraya Aktarın..."
                                className="modern-quill-editor"
                            />
                        </div>
                    </div>

                    {/* TOGGLE FOR MORE OPTIONS */}
                    <div className="pt-1 flex justify-start">
                        <button
                            type="button"
                            onClick={() => setShowSource(!showSource)}
                            className="text-[11px] font-black text-palette-tan/50 hover:text-palette-maroon transition-colors flex items-center gap-1 uppercase tracking-widest"
                        >
                            <ChevronDown size={14} className={`transition-transform duration-300 ${showSource ? 'rotate-180' : ''}`} />
                            {showSource ? 'Daha Az' : 'Daha Fazla (Kaynak vb.)'}
                        </button>
                    </div>

                    {/* HIDDEN SOURCE SECTION */}
                    {showSource && (
                        <div className="pt-2 animate-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <label className="text-[13px] font-black text-palette-tan ml-1">Kaynak</label>
                                <input
                                    type="text"
                                    value={item.source || ''}
                                    onChange={(e) => onUpdate(item.id, 'source', e.target.value)}
                                    className="w-full bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 py-2 text-sm font-bold text-palette-maroon outline-none focus:border-palette-red transition-all"
                                    placeholder="Haber Kaynağını Belirleyin..."
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostTextItem;
