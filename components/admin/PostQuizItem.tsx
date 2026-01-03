import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import { useLanguage } from '../../context/LanguageContext';
import { PostItem, QUILL_MODULES, QUILL_FORMATS } from './PostTextItem';

interface PostQuizItemProps {
    item: PostItem;
    index: number;
    totalItems: number;
    showBlockNumbers: boolean;
    onUpdate: (id: string, field: keyof PostItem, value: any) => void;
    onRemove: (id: string) => void;
    isDeletable?: boolean;
    onMoveUp?: (index: number) => void;
    onMoveDown?: (index: number) => void;
    onOpenFileManager?: (id: string, subField: string, optionId?: string) => void;
    onOpenUrlMode?: (id: string, subField: string, optionId?: string) => void;
    onOpenImageEditor?: (id: string, subField: string, optionId?: string) => void;
}

const PostQuizItem: React.FC<PostQuizItemProps> = ({
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
    const defaultQuizData = {
        quizType: 'personality',
        results: [],
        questions: [],
        questionSorting: 'asc' as 'asc' | 'desc' | 'hidden',
        allowMultiple: false,
        showResults: true,
        endDate: ''
    };
    const data = { ...defaultQuizData, ...item.quizData };

    const updateData = (updates: any) => {
        onUpdate(item.id, 'quizData', { ...data, ...updates });
    };

    const handleAddResult = () => {
        const newResult = {
            id: Math.random().toString(36).substr(2, 9),
            title: '',
            image: '',
            description: '',
            minScore: 0,
            maxScore: 0,
            answerCount: 0
        };
        updateData({ results: [...data.results, newResult] });
    };

    const handleRemoveResult = (resId: string) => {
        updateData({ results: data.results.filter(r => r.id !== resId) });
    };

    const handleUpdateResult = (resId: string, field: string, value: any) => {
        updateData({
            results: data.results.map(r => r.id === resId ? { ...r, [field]: value } : r)
        });
    };

    const handleAddQuestion = () => {
        const newQuestion = {
            id: Math.random().toString(36).substr(2, 9),
            title: '',
            image: '',
            description: '',
            showOnCover: true,
            layout: 'list' as const,
            answers: [
                { id: Math.random().toString(36).substr(2, 9), text: '', image: '', resultId: '', isCorrect: false },
                { id: Math.random().toString(36).substr(2, 9), text: '', image: '', resultId: '', isCorrect: false }
            ]
        };
        updateData({ questions: [...data.questions, newQuestion] });
    };

    const handleRemoveQuestion = (qId: string) => {
        updateData({ questions: data.questions.filter(q => q.id !== qId) });
    };

    const handleUpdateQuestion = (qId: string, field: string, value: any) => {
        updateData({
            questions: data.questions.map(q => q.id === qId ? { ...q, [field]: value } : q)
        });
    };

    const handleAddAnswer = (qId: string) => {
        const newAnswer = { id: Math.random().toString(36).substr(2, 9), text: '', image: '', resultId: '', isCorrect: false };
        updateData({
            questions: data.questions.map(q => q.id === qId ? { ...q, answers: [...q.answers, newAnswer] } : q)
        });
    };

    const handleRemoveAnswer = (qId: string, ansId: string) => {
        updateData({
            questions: data.questions.map(q => q.id === qId ? { ...q, answers: q.answers.filter(a => a.id !== ansId) } : q)
        });
    };

    const handleUpdateAnswer = (qId: string, ansId: string, field: string, value: any) => {
        updateData({
            questions: data.questions.map(q => q.id === qId ? {
                ...q,
                answers: q.answers.map(a => a.id === ansId ? { ...a, [field]: value } : a)
            } : q)
        });
    };

    const Quill: any = ReactQuill;

    return (
        <div className="space-y-4 animate-in slide-in-from-top-4 duration-500 admin-font">
            {/* 1. QUIZ CONTROL AREA (FLOATING TABS) */}
            <div className="flex justify-center mb-6">
                <div className="flex justify-center gap-4">
                    {[
                        { id: 'personality', label: 'Kişilik Testi', icon: 'person', activeColor: 'bg-indigo-600' },
                        { id: 'trivia', label: 'Bilgi Yarışması', icon: 'quiz', activeColor: 'bg-emerald-600' },
                        { id: 'checklist', label: 'Kontrol Listesi', icon: 'checklist', activeColor: 'bg-orange-600' }
                    ].map(type => (
                        <button
                            key={type.id}
                            onClick={() => updateData({ quizType: type.id })}
                            className={`flex items-center gap-3 px-4 py-3 rounded-[3px] transition-all duration-300 group/tab ${data.quizType === type.id
                                ? 'bg-white shadow-lg border-b-2 border-palette-maroon -translate-y-1'
                                : 'bg-transparent border-b-2 border-transparent opacity-50 hover:opacity-100'}`}
                        >
                            <div className={`w-9 h-9 rounded-[3px] flex items-center justify-center transition-all ${data.quizType === type.id ? type.activeColor + ' text-white scale-110 shadow-md' : 'bg-palette-tan/10 text-palette-tan group-hover/tab:bg-palette-maroon/10 group-hover/tab:text-palette-maroon'}`}>
                                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{type.icon}</span>
                            </div>
                            <span className={`text-[12px] font-black tracking-[0.1em] ${data.quizType === type.id ? 'text-palette-maroon' : 'text-palette-tan'}`}>
                                {type.label.toUpperCase()}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. INDEPENDENT RESULT CARDS */}
            <div className="space-y-6">
                {data.results.map((res, resIdx) => (
                    <div key={res.id} className="group bg-white rounded-[3px] border border-palette-tan/20 shadow-md flex overflow-hidden animate-in slide-in-from-left duration-300">
                        {/* RESULT SIDEBAR */}
                        <div className="w-12 shrink-0 bg-palette-beige/5 border-r border-palette-tan/10 flex flex-col items-center py-6 justify-between transition-colors group-hover:bg-palette-beige/10">
                            <div className="flex flex-col gap-2 items-center">
                                {/* GLOBAL ACTIONS (Only on the first result card for accessibility) */}
                                {resIdx === 0 && (
                                    <div className="flex flex-col gap-2 pb-4 mb-4 border-b border-palette-tan/10">
                                        {totalItems > 1 && (
                                            <>
                                                {index > 0 ? (
                                                    <button onClick={() => onMoveUp?.(index)} className="w-8 h-8 flex items-center justify-center rounded-[3px] text-palette-tan/40 hover:text-palette-maroon hover:bg-white hover:shadow-sm transition-all active:scale-90" title="Blok Yukarı">
                                                        <span className="material-symbols-rounded rotate-180" style={{ fontSize: '20px' }}>expand_more</span>
                                                    </button>
                                                ) : <div className="w-8 h-8" />}
                                                {index < totalItems - 1 ? (
                                                    <button onClick={() => onMoveDown?.(index)} className="w-8 h-8 flex items-center justify-center rounded-[3px] text-palette-tan/40 hover:text-palette-maroon hover:bg-white hover:shadow-sm transition-all active:scale-90" title="Blok Aşağı">
                                                        <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>expand_more</span>
                                                    </button>
                                                ) : <div className="w-8 h-8" />}
                                            </>
                                        )}
                                        {/* Block Delete Removed */}
                                    </div>
                                )}

                                {/* Zap Icon Removed */}
                            </div>

                            <button
                                onClick={() => handleRemoveResult(res.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-[3px] text-palette-tan/30 hover:text-white hover:bg-palette-red hover:shadow-md transition-all active:scale-90"
                                title="Bu Sonucu Sil"
                            >
                                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                            </button>
                        </div>

                        <div className="flex-1 p-6 space-y-6">
                            {/* NEW IN-ITEM HEADER */}
                            <div className="flex items-center gap-3 border-b border-palette-tan/15 pb-3">
                                <div className="p-2 bg-palette-red/10 rounded-[3px] text-palette-red">
                                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>bolt</span>
                                </div>
                                <h3 className="text-base font-black text-palette-maroon">Quiz Sonucu</h3>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 shrink-0 rounded-[3px] bg-palette-maroon text-white flex items-center justify-center text-base font-black shadow-md shadow-palette-maroon/10">
                                    {resIdx + 1}
                                </div>
                                <input
                                    type="text"
                                    value={res.title}
                                    onChange={(e) => handleUpdateResult(res.id, 'title', e.target.value)}
                                    className="w-full h-9 bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 text-base font-bold text-palette-maroon outline-none focus:border-palette-red transition-all placeholder:text-palette-tan/20"
                                    placeholder="Sonuç Başlığı (Örn: Sen bir dahisin!)"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                <div className="md:col-span-4 space-y-2">
                                    <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">{t('admin.post.image_panel')}</label>
                                    <div className="rounded-[3px] bg-palette-beige/5 border-2 border-dashed border-palette-tan/20 flex flex-col items-center justify-center overflow-hidden transition-all relative group/img w-full min-h-[220px]">
                                        {res.image ? (
                                            <div className="relative w-full h-full flex items-center justify-center bg-palette-beige/5 min-h-[220px]">
                                                <img src={res.image} className="max-w-full max-h-[220px] object-contain block" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => onOpenImageEditor?.(item.id, `results.${resIdx}.image`)}
                                                        className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-emerald-600 transition-all flex items-center justify-center"
                                                        title={t('common.edit')}
                                                    >
                                                        <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>edit_square</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateResult(res.id, 'image', '')}
                                                        className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-palette-red transition-all flex items-center justify-center"
                                                        title={t('common.delete')}
                                                    >
                                                        <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <div
                                                    onClick={() => onOpenFileManager?.(item.id, `results.${resIdx}.image`)}
                                                    className="flex flex-col items-center cursor-pointer group/pick mb-4"
                                                >
                                                    <span className="material-symbols-rounded text-palette-tan/20 group-hover/pick:text-palette-maroon transition-all mb-2" style={{ fontSize: '48px' }}>add</span>
                                                    <span className="text-[14px] font-bold text-palette-tan/50 px-4 text-center">{t('admin.post.pick_image')}</span>
                                                </div>
                                                <button
                                                    onClick={() => onOpenUrlMode?.(item.id, `results.${resIdx}.image`)}
                                                    className="mt-2 text-[10px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                                >
                                                    <span className="material-symbols-rounded" style={{ fontSize: '11px' }}>public</span> {t('admin.post.url_or_upload')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="md:col-span-8 h-full flex flex-col">
                                    <div className="space-y-2 group/editor flex-1 flex flex-col">
                                        <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">Sonuç Açıklaması</label>
                                        <div className="quill-modern-wrapper compact-quill border border-palette-tan/20 rounded-[3px] overflow-hidden focus-within:border-palette-red/40 transition-all shadow-sm bg-white flex-1 min-h-[220px]">
                                            <Quill
                                                theme="snow"
                                                value={res.description}
                                                onChange={(val: string) => handleUpdateResult(res.id, 'description', val)}
                                                modules={QUILL_MODULES}
                                                formats={QUILL_FORMATS}
                                                placeholder="Neden bu sonucu aldığını açıkla..."
                                                className="modern-quill-editor h-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center pt-2 pb-6">
                <button
                    onClick={handleAddResult}
                    className="px-8 py-2.5 border-2 border-dashed border-palette-red/30 rounded-[3px] text-palette-red/60 text-[11px] font-black uppercase tracking-widest hover:bg-palette-red/5 hover:border-palette-red transition-all shadow-sm active:scale-95"
                >
                    + Yeni Sonuç Ekle
                </button>
            </div>

            {/* SORTING & VISIBILITY CONTROLS */}
            <div className="flex justify-center mb-6">
                <div className="inline-flex bg-white p-1 rounded-[3px] gap-1 border border-palette-tan/10 shadow-sm">
                    {[
                        { id: 'asc', label: 'Sayısal Artan', icon: 'keyboard_double_arrow_up' },
                        { id: 'desc', label: 'Sayısal Azalan', icon: 'tag' },
                        { id: 'hidden', label: 'Numaraları Gizle', icon: 'visibility_off' }
                    ].map(sort => (
                        <button
                            key={sort.id}
                            onClick={() => updateData({ questionSorting: sort.id })}
                            className={`flex items-center gap-2 px-6 py-2 rounded-[3px] text-[11px] font-black uppercase tracking-wider transition-all ${data.questionSorting === sort.id
                                ? 'bg-[#1a1f2e] text-white shadow-md'
                                : 'text-palette-tan/60 hover:text-palette-maroon hover:bg-palette-beige/5'}`}
                        >
                            <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>{sort.icon}</span>
                            {sort.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. QUESTIONS SECTION - EACH AS INDEPENDENT CARD */}
            <div className="space-y-6">
                {data.questions.map((q, qIdx) => {
                    const displayIdx = data.questionSorting === 'desc' ? data.questions.length - qIdx : qIdx + 1;
                    return (
                        <div key={q.id} className="group bg-white rounded-[3px] border border-palette-tan/20 shadow-md flex overflow-hidden animate-in slide-in-from-left duration-300">
                            {/* SIDEBAR FOR INDIVIDUAL QUESTION ACTIONS */}
                            <div className="w-12 shrink-0 bg-palette-beige/5 border-r border-palette-tan/10 flex flex-col items-center py-6 justify-between transition-colors group-hover:bg-palette-beige/10">
                                <div /> {/* Spacer */}
                                <button
                                    onClick={() => handleRemoveQuestion(q.id)}
                                    className="w-8 h-8 flex items-center justify-center rounded-[3px] text-palette-tan/30 hover:text-white hover:bg-palette-red hover:shadow-md transition-all active:scale-90"
                                >
                                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                                </button>
                            </div>

                            <div className="flex-1 p-6 space-y-6">
                                {/* NEW IN-ITEM HEADER */}
                                <div className="flex items-center gap-3 border-b border-palette-tan/15 pb-3">
                                    <div className="p-2 bg-palette-red/10 rounded-[3px] text-palette-red">
                                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>help</span>
                                    </div>
                                    <h3 className="text-base font-black text-palette-maroon">Sorular</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        {data.questionSorting !== 'hidden' && (
                                            <div className="w-9 h-9 shrink-0 rounded-[3px] bg-palette-maroon text-white flex items-center justify-center text-base font-black shadow-md shadow-palette-maroon/10">
                                                {displayIdx}
                                            </div>
                                        )}
                                        <input
                                            type="text"
                                            value={q.title}
                                            onChange={(e) => handleUpdateQuestion(q.id, 'title', e.target.value)}
                                            className="w-full h-9 bg-palette-beige/5 border border-palette-tan/20 rounded-[3px] px-4 text-base font-bold text-palette-maroon outline-none focus:border-palette-red transition-all placeholder:text-palette-tan/20"
                                            placeholder="Sorular"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                        <div className="md:col-span-4 space-y-2">
                                            <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">Soru Görseli</label>
                                            <div className="rounded-[3px] bg-palette-beige/5 border-2 border-dashed border-palette-tan/20 flex flex-col items-center justify-center overflow-hidden transition-all relative group w-full min-h-[220px]">
                                                {q.image ? (
                                                    <div className="relative w-full h-full flex items-center justify-center bg-palette-beige/5 min-h-[220px]">
                                                        <img src={q.image} className="max-w-full max-h-[220px] object-contain block" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => onOpenImageEditor?.(item.id, `questions.${qIdx}.image`)}
                                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-emerald-600 transition-all flex items-center justify-center"
                                                                title={t('common.edit')}
                                                            >
                                                                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>edit_square</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateQuestion(q.id, 'image', '')}
                                                                className="p-3 bg-white/10 backdrop-blur-md rounded-[3px] text-white hover:bg-palette-red transition-all flex items-center justify-center"
                                                                title={t('common.delete')}
                                                            >
                                                                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-12">
                                                        <div
                                                            onClick={() => onOpenFileManager?.(item.id, `questions.${qIdx}.image`)}
                                                            className="flex flex-col items-center cursor-pointer group/pick mb-4"
                                                        >
                                                            <span className="material-symbols-rounded text-palette-tan/20 group-hover/pick:text-palette-maroon transition-all mb-2" style={{ fontSize: '48px' }}>add</span>
                                                            <span className="text-[14px] font-bold text-palette-tan/50 px-4 text-center">{t('admin.post.pick_image')}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => onOpenUrlMode?.(item.id, `questions.${qIdx}.image`)}
                                                            className="mt-2 text-[10px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                                        >
                                                            <span className="material-symbols-rounded" style={{ fontSize: '11px' }}>public</span> {t('admin.post.url_or_upload')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="md:col-span-8 h-full flex flex-col">
                                            <div className="space-y-2 group/editor flex-1 flex flex-col">
                                                <label className="text-[13px] font-black text-palette-tan ml-1 uppercase tracking-wider">Soru Açıklaması</label>
                                                <div className="quill-modern-wrapper compact-quill border border-palette-tan/20 rounded-[3px] overflow-hidden focus-within:border-palette-red/40 transition-all shadow-sm bg-white flex-1 min-h-[220px]">
                                                    <Quill
                                                        theme="snow"
                                                        value={q.description}
                                                        onChange={(val: string) => handleUpdateQuestion(q.id, 'description', val)}
                                                        modules={QUILL_MODULES}
                                                        formats={QUILL_FORMATS}
                                                        placeholder="Soru içeriğini yaz"
                                                        className="modern-quill-editor h-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* LAYOUT SELECTOR */}
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-black text-palette-tan/60 uppercase tracking-widest leading-none">Cevap Formatı</span>
                                    <div className="flex bg-palette-tan/5 p-1 gap-1 rounded-[3px] border border-palette-tan/10 shadow-inner overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateQuestion(q.id, 'layout', 'grid2')}
                                            className={`w-9 h-9 flex items-center justify-center transition-all ${q.layout === 'grid2' ? 'bg-white text-palette-maroon shadow-sm border border-palette-tan/20 rounded-[3px]' : 'text-palette-tan/40 hover:text-palette-maroon/60'}`}
                                            title="2'li Resim Izgarası"
                                        >
                                            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>grid_view</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateQuestion(q.id, 'layout', 'grid3')}
                                            className={`w-9 h-9 flex items-center justify-center transition-all ${q.layout === 'grid3' ? 'bg-white text-palette-maroon shadow-sm border border-palette-tan/20 rounded-[3px]' : 'text-palette-tan/40 hover:text-palette-maroon/60'}`}
                                            title="3'lü Resim Izgarası"
                                        >
                                            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>view_module</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateQuestion(q.id, 'layout', 'list')}
                                            className={`w-9 h-9 flex items-center justify-center transition-all ${q.layout === 'list' ? 'bg-white text-palette-maroon shadow-sm border border-palette-tan/20 rounded-[3px]' : 'text-palette-tan/40 hover:text-palette-maroon/60'}`}
                                            title="Liste Görünümü"
                                        >
                                            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>list</span>
                                        </button>
                                    </div>
                                </div>

                                <div className={`grid gap-6 ${q.layout === 'list' ? 'grid-cols-1' : q.layout === 'grid2' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                    {q.answers.map((ans, ansIdx) => (
                                        <div key={ans.id} className={`group/ans bg-white border border-palette-tan/15 rounded-[3px] transition-all hover:border-palette-maroon/30 shadow-sm relative flex ${q.layout === 'list' ? 'flex-row items-center h-14 px-4 gap-4' : 'flex-col'}`}>
                                            <button onClick={() => handleRemoveAnswer(q.id, ans.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-palette-red text-white rounded-full flex items-center justify-center opacity-0 group-hover/ans:opacity-100 transition-all z-20 shadow-lg hover:rotate-90">
                                                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>close</span>
                                            </button>

                                            {q.layout !== 'list' ? (
                                                <>
                                                    <div className="aspect-video w-full bg-palette-beige/5 border-b border-palette-tan/10 relative overflow-hidden group/img">
                                                        {ans.image ? (
                                                            <div className="w-full h-full p-2">
                                                                <img src={ans.image} className="w-full h-full object-contain rounded-[2px]" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center gap-2">
                                                                    <button
                                                                        onClick={() => onOpenImageEditor?.(item.id, `questions.${qIdx}.answers.${ansIdx}.image`)}
                                                                        className="p-2 bg-white/20 backdrop-blur-md rounded-[3px] text-white hover:bg-emerald-600 transition-all flex items-center justify-center"
                                                                    >
                                                                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>edit_square</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateAnswer(q.id, ans.id, 'image', '')}
                                                                        className="p-2 bg-white/20 backdrop-blur-md rounded-[3px] text-white hover:bg-palette-red transition-all flex items-center justify-center"
                                                                    >
                                                                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center py-4 px-4 text-center">
                                                                <div
                                                                    onClick={() => onOpenFileManager?.(item.id, `questions.${qIdx}.answers.${ansIdx}.image`)}
                                                                    className="flex flex-col items-center cursor-pointer group/pick mb-3"
                                                                >
                                                                    <span className="material-symbols-rounded text-palette-tan/20 group-hover/pick:text-palette-maroon transition-all mb-1" style={{ fontSize: '32px' }}>add</span>
                                                                    <span className="text-[11px] font-bold text-palette-tan/50 leading-tight">Görsel Seç / Yükle</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => onOpenUrlMode?.(item.id, `questions.${qIdx}.answers.${ansIdx}.image`)}
                                                                    className="mt-1 text-[9px] font-black text-palette-tan/60 hover:text-palette-maroon border border-palette-tan/20 px-3 py-1.5 rounded-[3px] bg-white shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 uppercase tracking-wider"
                                                                >
                                                                    <span className="material-symbols-rounded" style={{ fontSize: '11px' }}>public</span> URL VEYA YÜKLE
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-3 bg-white space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-black text-palette-tan/30 shrink-0">#{ansIdx + 1}</span>
                                                            <input
                                                                type="text"
                                                                value={ans.text}
                                                                onChange={(e) => handleUpdateAnswer(q.id, ans.id, 'text', e.target.value)}
                                                                className="w-full bg-transparent border-none text-[13px] font-bold text-palette-maroon outline-none placeholder:text-palette-tan/20 p-0"
                                                                placeholder="Cevap metni..."
                                                            />
                                                        </div>

                                                        {data.quizType === 'personality' && (
                                                            <select
                                                                value={ans.resultId}
                                                                onChange={(e) => handleUpdateAnswer(q.id, ans.id, 'resultId', e.target.value)}
                                                                className="w-full bg-palette-beige/5 border border-palette-tan/15 rounded-[3px] h-8 px-2 text-[11px] font-black text-palette-tan/60 outline-none appearance-none"
                                                            >
                                                                <option value="">Sonuç Seç</option>
                                                                {data.results.map(r => (
                                                                    <option key={r.id} value={r.id}>{r.title || `Result ${data.results.indexOf(r) + 1}`}</option>
                                                                ))}
                                                            </select>
                                                        )}

                                                        {data.quizType === 'trivia' && (
                                                            <div className="flex items-center gap-2 pt-2 border-t border-palette-tan/5">
                                                                <button
                                                                    onClick={() => handleUpdateAnswer(q.id, ans.id, 'isCorrect', !ans.isCorrect)}
                                                                    className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${ans.isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-palette-tan/30'}`}
                                                                >
                                                                    {ans.isCorrect && <span className="material-symbols-rounded" style={{ fontSize: '10px' }}>check</span>}
                                                                </button>
                                                                <span className="text-[10px] font-black text-palette-tan/60 uppercase">Doğru Cevap</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-[10px] font-black text-palette-tan/30 shrink-0 w-6">#{ansIdx + 1}</span>
                                                    <input
                                                        type="text"
                                                        value={ans.text}
                                                        onChange={(e) => handleUpdateAnswer(q.id, ans.id, 'text', e.target.value)}
                                                        className="flex-1 bg-transparent border-none text-[14px] font-bold text-palette-maroon outline-none placeholder:text-palette-tan/20 h-full p-0"
                                                        placeholder="Cevap metni buraya gelecek..."
                                                    />

                                                    {data.quizType === 'personality' && (
                                                        <select
                                                            value={ans.resultId}
                                                            onChange={(e) => handleUpdateAnswer(q.id, ans.id, 'resultId', e.target.value)}
                                                            className="w-32 bg-palette-beige/5 border border-palette-tan/15 rounded-[3px] h-8 px-2 text-[11px] font-black text-palette-tan/60 outline-none appearance-none"
                                                        >
                                                            <option value="">Sonuç Seç</option>
                                                            {data.results.map(r => (
                                                                <option key={r.id} value={r.id}>{r.title || `Result ${data.results.indexOf(r) + 1}`}</option>
                                                            ))}
                                                        </select>
                                                    )}

                                                    {data.quizType === 'trivia' && (
                                                        <button
                                                            onClick={() => handleUpdateAnswer(q.id, ans.id, 'isCorrect', !ans.isCorrect)}
                                                            className={`shrink-0 w-8 h-8 rounded-full border transition-all flex items-center justify-center ${ans.isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-palette-tan/30 text-palette-tan/30'}`}
                                                            title="Doğru Cevap"
                                                        >
                                                            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>check</span>
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-6 pt-4 border-t border-palette-tan/10">
                                    <label className="flex items-center gap-3 cursor-pointer group/toggle">
                                        <button
                                            onClick={() => updateData({ allowMultiple: !data.allowMultiple })}
                                            className={`w-10 h-5 rounded-full relative p-1 transition-colors ${data.allowMultiple ? 'bg-palette-maroon' : 'bg-palette-tan/20'}`}
                                        >
                                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${data.allowMultiple ? 'translate-x-5' : ''}`} />
                                        </button>
                                        <span className="text-[11px] font-black text-palette-tan/60 uppercase">Çoklu Seçim İzin Ver</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group/toggle">
                                        <button
                                            onClick={() => updateData({ showResults: !data.showResults })}
                                            className={`w-10 h-5 rounded-full relative p-1 transition-colors ${data.showResults ? 'bg-emerald-500' : 'bg-palette-tan/20'}`}
                                        >
                                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${data.showResults ? 'translate-x-5' : ''}`} />
                                        </button>
                                        <span className="text-[11px] font-black text-palette-tan/60 uppercase">Sonuçları Göster</span>
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] font-black text-palette-tan/60 uppercase">Bitiş Tarihi:</span>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={data.endDate || ''}
                                                onChange={(e) => updateData({ endDate: e.target.value })}
                                                className="bg-white border border-palette-tan/20 rounded-[3px] h-9 px-3 text-[12px] font-black text-palette-maroon outline-none focus:border-palette-red transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <button
                                        onClick={() => handleAddAnswer(q.id)}
                                        className="px-6 py-2 border-2 border-dashed border-palette-red/30 rounded-[3px] text-palette-red/60 text-[11px] font-black uppercase tracking-widest hover:bg-palette-red/5 hover:border-palette-red transition-all"
                                    >
                                        + Cevap Ekle
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center pt-2 pb-6">
                <button
                    onClick={handleAddQuestion}
                    className="px-8 py-2.5 border-2 border-dashed border-palette-red/30 rounded-[3px] text-palette-red/60 text-[11px] font-black uppercase tracking-widest hover:bg-palette-red/5 hover:border-palette-red transition-all shadow-sm active:scale-95"
                >
                    + Yeni Soru Ekle
                </button>
            </div>
        </div>
    );
};

export default PostQuizItem;
