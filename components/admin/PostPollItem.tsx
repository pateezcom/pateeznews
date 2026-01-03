import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import { PostItem, QUILL_MODULES, QUILL_FORMATS } from './PostTextItem';
import { useLanguage } from '../../context/LanguageContext';

interface PostPollItemProps {
    item: PostItem;
    index: number;
    totalItems: number;
    showBlockNumbers: boolean;
    onUpdate: (id: string, field: keyof PostItem, value: any) => void;
    onRemove: (id: string) => void;
    isDeletable?: boolean;
    onMoveUp?: (index: number) => void;
    onMoveDown?: (index: number) => void;
    onOpenFileManager: (id: string, subField?: string, optionId?: string) => void;
    onOpenUrlMode: (id: string, subField?: string, optionId?: string) => void;
    onOpenImageEditor: (id: string, subField?: string, optionId?: string) => void;
}

const PostPollItem: React.FC<PostPollItemProps> = ({
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
    const [isMainImageLoading, setIsMainImageLoading] = useState(false);

    // Default values if missing - User wants Image Poll with 2 columns as default
    const isImagePoll = item.isImagePoll !== undefined ? item.isImagePoll : true;
    const pollColumns = item.pollColumns || 2;

    // Initialization: If new poll, add 2 options immediately
    React.useEffect(() => {
        if (!item.options || item.options.length === 0) {
            const initialOptions = [
                { id: Math.random().toString(36).substr(2, 9), text: '', votes: 0, image: '' },
                { id: Math.random().toString(36).substr(2, 9), text: '', votes: 0, image: '' }
            ];
            onUpdate(item.id, 'options', initialOptions);
        }
        // Force defaults in parent state if they don't exist
        if (item.isImagePoll === undefined) onUpdate(item.id, 'isImagePoll', true);
        if (item.pollColumns === undefined) onUpdate(item.id, 'pollColumns', 2);
    }, []);

    const handleAddOption = () => {
        const currentOptions = item.options || [];
        const newOption = {
            id: Math.random().toString(36).substr(2, 9),
            text: '',
            votes: 0,
            image: ''
        };
        onUpdate(item.id, 'options', [...currentOptions, newOption]);
    };

    const handleRemoveOption = (optionId: string) => {
        const currentOptions = item.options || [];
        onUpdate(item.id, 'options', currentOptions.filter(o => o.id !== optionId));
    };

    const handleUpdateOption = (optionId: string, field: string, value: any) => {
        const currentOptions = item.options || [];
        onUpdate(item.id, 'options', currentOptions.map(o =>
            o.id === optionId ? { ...o, [field]: value } : o
        ));
    };

    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIdx(index);
        e.dataTransfer.effectAllowed = 'move';
        // Add a ghost image or effect if desired
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedIdx === null || draggedIdx === index) return;

        const currentOptions = [...(item.options || [])];
        const draggedItem = currentOptions[draggedIdx];
        currentOptions.splice(draggedIdx, 1);
        currentOptions.splice(index, 0, draggedItem);

        onUpdate(item.id, 'options', currentOptions);
        setDraggedIdx(index);
    };

    const handleDragEnd = () => {
        setDraggedIdx(null);
    };

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
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-[3px] flex items-center justify-center shadow-sm border border-indigo-100/50 flex">
                            <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>bar_chart</span>
                        </div>
                        <div>
                            <h3 className="text-base font-black text-palette-maroon leading-tight">Anket Bloğu</h3>
                            <p className="text-[11px] font-bold text-palette-tan/50 tracking-wide">Etkileşimli anket sistemi</p>
                        </div>
                    </div>
                </div>

                {/* 2. TITLE & MAIN IMAGE */}
                <div className="space-y-4">
                    <div className="space-y-1.5 w-full">
                        <label className="text-[13px] font-black text-palette-tan ml-1">Anket Sorusu / Başlık</label>
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
                                className="w-full h-10 bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 text-base font-bold text-palette-maroon outline-none focus:border-palette-red transition-all shadow-inner"
                                placeholder="Soru buraya gelecek..."
                            />
                        </div>
                    </div>

                    {/* 2. MAIN IMAGE & DESCRIPTION (Matching PostImageItem) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* LEFT: IMAGE AREA */}
                        <div className="md:col-span-4 space-y-2">
                            <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">Anket Ana Resmi</label>
                            <div className="rounded-[3px] bg-palette-beige/5 border-2 border-dashed border-palette-tan/20 flex flex-col items-center justify-center overflow-hidden transition-all relative group w-full min-h-[220px]">
                                {item.mediaUrl ? (
                                    <div className="relative w-full h-full flex items-center justify-center bg-palette-beige/5 min-h-[220px]">
                                        <img
                                            src={item.mediaUrl}
                                            onLoad={() => setIsMainImageLoading(false)}
                                            className="max-w-full max-h-[220px] object-contain block"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onOpenImageEditor(item.id, 'mediaUrl')}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-emerald-600 transition-all flex items-center justify-center"
                                            >
                                                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>edit_square</span>
                                            </button>
                                            <button
                                                onClick={() => onUpdate(item.id, 'mediaUrl', '')}
                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-palette-red transition-all flex items-center justify-center"
                                            >
                                                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div
                                            onClick={() => onOpenFileManager(item.id, 'mediaUrl')}
                                            className="flex flex-col items-center cursor-pointer group/pick mb-4"
                                        >
                                            <span className="material-symbols-rounded text-palette-tan/20 group-hover/pick:text-palette-maroon transition-all mb-2" style={{ fontSize: '48px' }}>add</span>
                                            <span className="text-[14px] font-bold text-palette-tan/50 px-4 text-center">Görsel Seç / Yükle</span>
                                        </div>
                                        <button
                                            onClick={() => onOpenUrlMode(item.id, 'mediaUrl')}
                                            className="mt-2 text-[10px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                        >
                                            <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>public</span> URL VEYA YÜKLE
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: DESCRIPTION EDITOR */}
                        <div className="md:col-span-8 h-full flex flex-col">
                            <div className="space-y-2 group/editor flex-1 flex flex-col">
                                <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">Anket Açıklaması</label>
                                <div className="quill-modern-wrapper compact-quill border border-palette-tan/20 rounded-[3px] overflow-hidden focus-within:border-palette-red/40 transition-all shadow-sm bg-white flex-1 min-h-[220px]">
                                    {(() => {
                                        const Quill: any = ReactQuill;
                                        return (
                                            <Quill
                                                theme="snow"
                                                value={item.description || ''}
                                                onChange={(content: string) => onUpdate(item.id, 'description', content)}
                                                modules={QUILL_MODULES}
                                                formats={QUILL_FORMATS}
                                                placeholder="Bu anket hakkında kısa bir açıklama veya not yazın..."
                                                className="modern-quill-editor h-full"
                                            />
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. FORMAT SELECTOR */}
                    <div className="space-y-6 pt-6 border-t border-palette-tan/15">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-black text-palette-tan/60 uppercase tracking-widest leading-none">Cevap Formatı</span>
                            <div className="flex bg-palette-tan/5 p-1 rounded-[3px] border border-palette-tan/10 shadow-inner overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onUpdate(item.id, 'isImagePoll', true);
                                        onUpdate(item.id, 'pollColumns', 2);
                                    }}
                                    className={`w-14 h-11 flex items-center justify-center transition-all ${isImagePoll && pollColumns === 2 ? 'bg-white text-palette-maroon shadow-md border border-palette-tan/20 rounded-[3px]' : 'text-palette-tan/40 hover:text-palette-maroon/60'}`}
                                    title="2'li Resim Izgarası"
                                >
                                    <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>grid_view</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onUpdate(item.id, 'isImagePoll', true);
                                        onUpdate(item.id, 'pollColumns', 3);
                                    }}
                                    className={`w-14 h-11 flex items-center justify-center transition-all ${isImagePoll && pollColumns === 3 ? 'bg-white text-palette-maroon shadow-md border border-palette-tan/20 rounded-[3px]' : 'text-palette-tan/40 hover:text-palette-maroon/60'}`}
                                    title="3'lü Resim Izgarası"
                                >
                                    <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>view_module</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onUpdate(item.id, 'isImagePoll', false);
                                    }}
                                    className={`w-14 h-11 flex items-center justify-center transition-all ${!isImagePoll ? 'bg-white text-palette-maroon shadow-md border border-palette-tan/20 rounded-[3px]' : 'text-palette-tan/40 hover:text-palette-maroon/60'}`}
                                    title="Liste Görünümü"
                                >
                                    <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>list</span>
                                </button>
                            </div>
                        </div>

                        {/* 4. OPTIONS LIST/GRID */}
                        <div className="space-y-4">
                            <div className={isImagePoll
                                ? `grid gap-5 ${pollColumns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`
                                : 'flex flex-col gap-3'
                            }>
                                {item.options?.map((option, idx) => (
                                    <div
                                        key={option.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, idx)}
                                        onDragOver={(e) => handleDragOver(e, idx)}
                                        onDragEnd={handleDragEnd}
                                        className={`group/card bg-white border border-palette-tan/20 rounded-[3px] transition-all hover:border-palette-maroon/30 shadow-sm relative flex ${isImagePoll ? 'flex-col' : 'flex-row items-center h-14 px-4 gap-4'} ${draggedIdx === idx ? 'opacity-50 border-palette-red border-dashed' : ''}`}
                                    >
                                        {/* Drag Handle */}
                                        <div className="absolute top-2 left-2 z-30 opacity-0 group-hover/card:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-palette-tan/40">
                                            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>drag_indicator</span>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => handleRemoveOption(option.id)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-palette-red text-white rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all z-20 shadow-lg hover:rotate-90"
                                        >
                                            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>close</span>
                                        </button>

                                        {isImagePoll ? (
                                            <>
                                                <div className="aspect-video w-full bg-palette-beige/5 border-b border-palette-tan/10 relative overflow-hidden group/img">
                                                    {option.image ? (
                                                        <div className="w-full h-full p-2">
                                                            <img src={option.image} className="w-full h-full object-contain rounded-[2px]" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => onOpenImageEditor(item.id, 'options', option.id)}
                                                                    className="p-2 bg-white/20 backdrop-blur-md rounded-[3px] text-white hover:bg-emerald-600 transition-all flex items-center justify-center"
                                                                >
                                                                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>edit_square</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateOption(option.id, 'image', '')}
                                                                    className="p-2 bg-white/20 backdrop-blur-md rounded-[3px] text-white hover:bg-palette-red transition-all flex items-center justify-center"
                                                                >
                                                                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center py-4 px-4 text-center">
                                                            <div
                                                                onClick={() => onOpenFileManager(item.id, 'options', option.id)}
                                                                className="flex flex-col items-center cursor-pointer group/pick mb-3"
                                                            >
                                                                <span className="material-symbols-rounded text-palette-tan/20 group-hover/pick:text-palette-maroon transition-all mb-1" style={{ fontSize: '32px' }}>add</span>
                                                                <span className="text-[11px] font-bold text-palette-tan/50 leading-tight">Görsel Seç / Yükle</span>
                                                            </div>
                                                            <button
                                                                onClick={() => onOpenUrlMode(item.id, 'options', option.id)}
                                                                className="mt-1 text-[9px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                                            >
                                                                <span className="material-symbols-rounded" style={{ fontSize: '12px' }}>public</span> URL VEYA YÜKLE
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-3 bg-white">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-[9px] font-black text-palette-tan/30 shrink-0">#{idx + 1}</span>
                                                        <input
                                                            type="text"
                                                            value={option.text}
                                                            onChange={(e) => handleUpdateOption(option.id, 'text', e.target.value)}
                                                            className="w-full bg-transparent border-none text-[13px] font-bold text-palette-maroon outline-none placeholder:text-palette-tan/20 p-0"
                                                            placeholder="Cevap metni..."
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2 pt-2 border-t border-palette-tan/5">
                                                        <div className="flex items-center gap-1.5 bg-palette-beige/5 px-2 py-1 rounded-[2px] border border-palette-tan/10">
                                                            <span className="material-symbols-rounded text-palette-tan/40" style={{ fontSize: '12px' }}>group</span>
                                                            <input
                                                                type="number"
                                                                value={option.votes}
                                                                onChange={(e) => handleUpdateOption(option.id, 'votes', parseInt(e.target.value) || 0)}
                                                                className="w-12 bg-transparent text-[11px] font-black text-palette-maroon text-center outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-[10px] font-black text-palette-tan/30 shrink-0 w-6">#{idx + 1}</span>
                                                <input
                                                    type="text"
                                                    value={option.text}
                                                    onChange={(e) => handleUpdateOption(option.id, 'text', e.target.value)}
                                                    className="flex-1 bg-transparent border-none text-[14px] font-bold text-palette-maroon outline-none placeholder:text-palette-tan/20 h-full p-0"
                                                    placeholder="Cevap metni buraya gelecek..."
                                                />
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <div className="flex items-center gap-2 bg-palette-beige/5 px-3 py-1.5 rounded-[2px] border border-palette-tan/10">
                                                        <span className="material-symbols-rounded text-palette-tan/40" style={{ fontSize: '14px' }}>group</span>
                                                        <input
                                                            type="number"
                                                            value={option.votes}
                                                            onChange={(e) => handleUpdateOption(option.id, 'votes', parseInt(e.target.value) || 0)}
                                                            className="w-16 bg-transparent text-[12px] font-black text-palette-maroon text-center outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center pt-2">
                                <button
                                    type="button"
                                    onClick={handleAddOption}
                                    className="flex items-center gap-2 px-6 py-2 bg-white border border-palette-tan/30 text-palette-tan hover:text-palette-maroon hover:border-palette-maroon hover:shadow-md rounded-[3px] transition-all group/add shadow-sm"
                                >
                                    <span className="material-symbols-rounded group-hover/add:rotate-90 transition-transform duration-300" style={{ fontSize: '18px' }}>add</span>
                                    <span className="text-[11px] font-black uppercase tracking-[0.15em]">Cevap Ekle</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ADDITIONAL SETTINGS */}
                    <div className="pt-2 space-y-3">
                        <button
                            type="button"
                            onClick={() => setShowOptions(!showOptions)}
                            className="text-[11px] font-black text-palette-tan/50 hover:text-palette-maroon transition-colors flex items-center gap-1.5 uppercase tracking-[0.15em] p-1 rounded hover:bg-palette-beige/20"
                        >
                            <span className={`material-symbols-rounded transition-transform duration-300 ${showOptions ? 'rotate-90' : ''}`} style={{ fontSize: '16px' }}>settings</span>
                            Ek Ayarlar
                            <span className={`material-symbols-rounded transition-transform duration-300 ${showOptions ? 'rotate-180' : ''}`} style={{ fontSize: '18px' }}>expand_more</span>
                        </button>

                        {showOptions && (
                            <div className="animate-in slide-in-from-top-2 duration-300 w-full pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-black text-palette-tan ml-1 flex items-center gap-1.5">
                                        <span className="material-symbols-rounded" style={{ fontSize: '12px' }}>settings</span> {t('admin.post.image_source')}
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

export default PostPollItem;
