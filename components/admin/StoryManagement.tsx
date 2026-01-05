
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { StoryItem } from '../../types';
import WebStoryEditor from './WebStoryEditor';

const StoryManagement: React.FC = () => {
    const { t } = useLanguage();
    const [stories, setStories] = useState<StoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [storyToDelete, setStoryToDelete] = useState<StoryItem | null>(null);
    const [storyToEdit, setStoryToEdit] = useState<StoryItem | null>(null);
    const [storyForEditor, setStoryForEditor] = useState<StoryItem | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [statusModal, setStatusModal] = useState<{ show: boolean, type: 'error' | 'success', message: string }>({ show: false, type: 'success', message: '' });

    const dropdownRef = useRef<HTMLDivElement>(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState<Partial<StoryItem>>({
        title: '',
        mediaUrl: '',
        mediaType: 'image',
        sourceName: '',
        expiresAt: '',
        isActive: true
    });

    useEffect(() => {
        fetchStories();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchStories = async () => {
        try {
            setLoading(true);
            setErrorMsg(null);

            const { data, error } = await supabase
                .from('stories')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mappedStories: StoryItem[] = (data || []).map((item: any) => ({
                id: item.id,
                title: item.title,
                mediaUrl: item.media_url,
                mediaType: item.media_type,
                sourceName: item.source_name,
                publisherId: item.publisher_id,
                createdAt: item.created_at,
                expiresAt: item.expires_at,
                isActive: item.is_active,
                viewCount: item.view_count || 0,
                storyData: item.story_data,
                storyMarkup: item.story_markup
            }));

            setStories(mappedStories);
        } catch (err: any) {
            console.error("Story fetch error:", err);
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setStoryToEdit(null);
        setFormData({
            title: '',
            mediaUrl: '',
            mediaType: 'image',
            sourceName: '',
            expiresAt: '',
            isActive: true
        });
        setShowAddModal(true);
    };

    const handleOpenEdit = (story: StoryItem) => {
        setStoryToEdit(story);
        setFormData({
            title: story.title,
            mediaUrl: story.mediaUrl,
            mediaType: story.mediaType,
            sourceName: story.sourceName || '',
            expiresAt: story.expiresAt ? new Date(story.expiresAt).toISOString().slice(0, 16) : '',
            isActive: story.isActive
        });
        setShowAddModal(true);
        setOpenDropdownId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Oturum bulunamadı");

            const payload = {
                title: formData.title,
                media_url: formData.mediaUrl,
                media_type: formData.mediaType,
                source_name: formData.sourceName,
                expires_at: formData.expiresAt || null,
                is_active: formData.isActive,
                publisher_id: user.id
            };

            if (storyToEdit) {
                const { error } = await supabase
                    .from('stories')
                    .update(payload)
                    .eq('id', storyToEdit.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('stories')
                    .insert([payload]);
                if (error) throw error;
            }

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setShowAddModal(false);
                fetchStories();
            }, 1500);
        } catch (err: any) {
            setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', err.message) });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteStory = (story: StoryItem) => {
        setStoryToDelete(story);
        setShowDeleteModal(true);
        setOpenDropdownId(null);
    };

    const confirmDelete = async () => {
        if (!storyToDelete) return;
        setSaving(true);
        try {
            const { error } = await supabase.from('stories').delete().eq('id', storyToDelete.id);
            if (error) throw error;
            setShowDeleteModal(false);
            setStoryToDelete(null);
            fetchStories();
        } catch (err: any) {
            setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', err.message) });
        } finally {
            setSaving(false);
        }
    };

    const filteredStories = stories.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const inputClasses = "w-full h-11 pl-11 pr-4 bg-palette-beige/30 border border-palette-tan/20 rounded-[3px] text-sm font-bold text-palette-maroon outline-none hover:border-palette-tan/40 focus:bg-white focus:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all placeholder:text-palette-tan/30";
    const iconClasses = "absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/40 group-focus-within:text-palette-tan transition-colors";

    if (loading && stories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] gap-6">
                <div className="w-10 h-10 border-4 border-palette-tan/15 border-t-palette-red rounded-[3px] animate-spin"></div>
                <p className="text-[11px] font-black text-palette-tan/40 tracking-widest">{t('users.status.syncing')}</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-700 admin-font pb-20 text-palette-tan mx-auto">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 px-2">
                <div>
                    <h2 className="text-3xl font-black text-palette-maroon tracking-tighter leading-none mb-2">{t('stories.page_title')}</h2>
                    <p className="text-[11px] font-bold text-palette-tan/50 tracking-wider">{t('stories.page_desc')}</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 px-4 py-2 bg-palette-beige/40 border border-palette-tan/20 rounded-[3px] shadow-sm w-full max-w-md focus-within:ring-4 focus-within:ring-palette-tan/5 focus-within:border-palette-tan focus-within:bg-white transition-all group">
                        <span className="material-symbols-rounded text-palette-tan/30 group-focus-within:text-palette-tan transition-colors" style={{ fontSize: '16px' }}>search</span>
                        <input
                            type="text"
                            placeholder={t('stories.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-[12px] font-bold w-full text-palette-maroon placeholder:text-palette-tan/30"
                        />
                    </div>

                    <button
                        onClick={handleOpenAdd}
                        className="h-10 px-10 bg-palette-red text-white rounded-[3px] font-black text-[11px] tracking-widest hover:bg-primary-600 transition-all shadow-lg active:scale-95 flex items-center gap-2 whitespace-nowrap"
                    >
                        <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>add</span>
                        <span>{t('stories.add_new')}</span>
                    </button>
                </div>
            </div>

            {errorMsg && (
                <div className="mb-6 p-4 bg-palette-red/5 border border-palette-red/20 rounded-[3px] flex items-center gap-4 text-palette-red">
                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>warning</span>
                    <div className="text-xs font-bold tracking-wider">{t('common.error')}: {errorMsg}</div>
                </div>
            )}

            <div className="bg-white rounded-[3px] border border-palette-tan/15 shadow-sm overflow-visible">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-palette-beige/20 border-b border-palette-tan/15">
                            <th className="px-8 py-5 text-[11px] font-black text-palette-tan/40 tracking-widest">{t('stories.table.title')}</th>
                            <th className="px-8 py-5 text-[11px] font-black text-palette-tan/40 tracking-widest">{t('stories.table.views')}</th>
                            <th className="px-8 py-5 text-[11px] font-black text-palette-tan/40 tracking-widest">{t('stories.table.expires')}</th>
                            <th className="px-8 py-5 text-[11px] font-black text-palette-tan/40 tracking-widest">{t('stories.table.status')}</th>
                            <th className="px-8 py-5 text-[11px] font-black text-palette-tan/40 tracking-widest text-right">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-palette-tan/15">
                        {filteredStories.map((story) => (
                            <tr key={story.id} className="hover:bg-palette-beige/5 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-16 rounded-[3px] bg-palette-beige border border-palette-tan/15 overflow-hidden flex-shrink-0 relative">
                                            {story.mediaType === 'video' ? (
                                                <video src={story.mediaUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={story.mediaUrl} className="w-full h-full object-cover" />
                                            )}
                                            <div className="absolute top-1 right-1 bg-white/80 p-0.5 rounded-[3px] shadow-sm flex items-center justify-center">
                                                {story.mediaType === 'video' ? <span className="material-symbols-rounded text-palette-maroon" style={{ fontSize: '10px' }}>videocam</span> : <span className="material-symbols-rounded text-palette-maroon" style={{ fontSize: '10px' }}>image</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-palette-maroon leading-none mb-1 max-w-[300px] truncate">{story.title}</h4>
                                            <p className="text-[10px] text-palette-tan/50 font-bold tracking-widest flex items-center gap-1">
                                                <span className="material-symbols-rounded" style={{ fontSize: '10px' }}>schedule</span> {story.createdAt ? new Date(story.createdAt).toLocaleDateString('tr-TR') : '-'}
                                                {story.sourceName && <span> • {story.sourceName}</span>}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2 text-palette-maroon font-black text-sm">
                                        <span className="material-symbols-rounded text-palette-tan/30" style={{ fontSize: '16px' }}>visibility</span>
                                        {story.viewCount?.toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-[11px] font-bold text-palette-tan">
                                        {story.expiresAt ? (
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-rounded text-palette-tan/30" style={{ fontSize: '12px' }}>calendar_today</span>
                                                {new Date(story.expiresAt).toLocaleDateString('tr-TR')}
                                            </div>
                                        ) : (
                                            <span className="text-palette-tan/30">{t('common.not_specified')}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[10px] font-black tracking-widest border ${story.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-[3px] ${story.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                        {story.isActive ? t('admin.status.published') : t('stories.status.passive')}
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right relative overflow-visible">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === story.id ? null : story.id); }}
                                        className={`p-2 rounded-[3px] transition-all active:scale-90 shadow-sm flex items-center justify-center ${openDropdownId === story.id ? 'bg-palette-maroon text-white' : 'bg-palette-beige/50 text-palette-tan/40 hover:bg-palette-tan/80 hover:text-white'}`}
                                    >
                                        <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>more_vert</span>
                                    </button>

                                    {openDropdownId === story.id && (
                                        <div ref={dropdownRef} className="absolute right-8 top-14 w-52 bg-white rounded-[3px] shadow-2xl border border-palette-tan/15 z-[100] animate-in fade-in slide-in-from-top-2 overflow-hidden py-1.5">
                                            <button
                                                onClick={() => handleOpenEdit(story)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-palette-tan hover:bg-palette-beige/50 hover:text-palette-maroon transition-colors text-left"
                                            >
                                                <span className="material-symbols-rounded text-palette-tan/30" style={{ fontSize: '14px' }}>edit_square</span>
                                                {t('common.edit')}
                                            </button>
                                            <button
                                                onClick={() => { window.open(`/admin/hikaye-editor/${story.id}`, '_blank'); setOpenDropdownId(null); }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-palette-maroon hover:bg-palette-beige/50 transition-colors text-left"
                                            >
                                                <span className="material-symbols-rounded text-palette-red" style={{ fontSize: '14px' }}>view_quilt</span>
                                                {t('stories.table.actions.editor')}
                                            </button>
                                            <button
                                                onClick={() => { window.open(story.mediaUrl, '_blank'); setOpenDropdownId(null); }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-palette-tan hover:bg-palette-beige/50 hover:text-palette-maroon transition-colors text-left"
                                            >
                                                <span className="material-symbols-rounded text-palette-tan/30" style={{ fontSize: '14px' }}>open_in_new</span>
                                                {t('stories.actions.view_media')}
                                            </button>
                                            <div className="h-px bg-palette-tan/10 mx-4 my-1"></div>
                                            <button
                                                onClick={() => handleDeleteStory(story)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-palette-red hover:bg-palette-red/5 transition-colors text-left"
                                            >
                                                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>delete</span>
                                                {t('common.delete')}
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredStories.length === 0 && (
                    <div className="p-20 text-center text-palette-tan/30">
                        <span className="material-symbols-rounded mx-auto mb-4 opacity-20" style={{ fontSize: '40px' }}>bolt</span>
                        <p className="text-[11px] font-black tracking-widest">{t('stories.empty_state')}</p>
                    </div>
                )}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-palette-maroon/90 backdrop-blur-md animate-in fade-in" onClick={() => !saving && setShowAddModal(false)} />
                    <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 flex flex-col">
                        <div className="px-8 py-6 border-b border-palette-tan/15 flex items-center justify-between bg-palette-beige/10">
                            <h3 className="text-lg font-black text-palette-maroon tracking-tight flex items-center gap-3">
                                <div className="w-8 h-8 bg-palette-red rounded-[3px] flex items-center justify-center text-white shadow-lg shadow-palette-red/20">
                                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>add</span>
                                </div>
                                {storyToEdit ? t('stories.form.edit_title') : t('stories.form.title')}
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="p-1 text-palette-tan/40 hover:text-palette-red transition-colors flex items-center justify-center"><span className="material-symbols-rounded" style={{ fontSize: '20px' }}>close</span></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-palette-tan/50 ml-1">{t('stories.form.story_title')}</label>
                                <div className="relative group">
                                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/40 group-focus-within:text-palette-tan transition-colors" style={{ fontSize: '14px' }}>bolt</span>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-palette-tan/50 ml-1">{t('stories.form.media_url')}</label>
                                <div className="relative group">
                                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/40 group-focus-within:text-palette-tan transition-colors" style={{ fontSize: '14px' }}>image</span>
                                    <input
                                        type="url"
                                        required
                                        value={formData.mediaUrl}
                                        onChange={e => setFormData({ ...formData, mediaUrl: e.target.value })}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-palette-tan/50 ml-1">{t('stories.form.media_type')}</label>
                                    <div className="relative group">
                                        <select
                                            value={formData.mediaType}
                                            onChange={e => setFormData({ ...formData, mediaType: e.target.value as 'image' | 'video' })}
                                            className={`${inputClasses} appearance-none px-4 pl-4`}
                                        >
                                            <option value="image">{t('admin.post.asset_label')} (Image)</option>
                                            <option value="video">{t('admin.post.video_panel')} (MP4)</option>
                                        </select>
                                        <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/30" style={{ fontSize: '16px' }}>expand_more</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-palette-tan/50 ml-1">{t('stories.form.source_name')}</label>
                                    <div className="relative group">
                                        <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/40 group-focus-within:text-palette-tan transition-colors" style={{ fontSize: '14px' }}>open_in_new</span>
                                        <input
                                            type="text"
                                            value={formData.sourceName}
                                            onChange={e => setFormData({ ...formData, sourceName: e.target.value })}
                                            className={inputClasses}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-palette-tan/50 ml-1">{t('stories.form.expires_at')}</label>
                                <div className="relative group">
                                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/40 group-focus-within:text-palette-tan transition-colors" style={{ fontSize: '14px' }}>calendar_today</span>
                                    <input
                                        type="datetime-local"
                                        value={formData.expiresAt as string}
                                        onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-palette-beige/20 rounded-[3px] border border-palette-tan/15">
                                <div className="flex-1">
                                    <h4 className="text-[12px] font-black text-palette-maroon tracking-widest">{t('stories.form.is_active')}</h4>
                                    <p className="text-[11px] text-palette-tan/60 font-medium">{t('stories.form.is_active')}?</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`w-12 h-6 rounded-[3px] transition-all relative ${formData.isActive ? 'bg-emerald-500' : 'bg-palette-tan/30'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-[3px] transition-all ${formData.isActive ? 'right-1' : 'left-1 shadow-sm'}`} />
                                </button>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full h-12 bg-palette-tan text-white rounded-[3px] font-black text-[11px] tracking-widest hover:bg-palette-maroon shadow-xl active:scale-95 flex items-center justify-center gap-3 transition-all"
                                >
                                    {saving ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>save</span>}
                                    <span>{storyToEdit ? t('stories.form.save_btn') : t('stories.form.add_btn')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-sm animate-in fade-in" onClick={() => !saving && setShowDeleteModal(false)} />
                    <div className="relative bg-white rounded-[3px] shadow-[0_20px_70px_rgba(0,0,0,0.2)] w-full max-w-sm overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 p-8 text-center">
                        <div className="w-20 h-20 bg-red-50 text-palette-red rounded-[3px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <span className="material-symbols-rounded" style={{ fontSize: '32px' }}>delete</span>
                        </div>
                        <h3 className="text-xl font-black text-palette-maroon tracking-tight mb-3">{t('stories.delete_title')}</h3>
                        <p className="text-xs font-bold text-palette-tan/60 leading-relaxed mb-8">
                            <span className="text-palette-maroon">"{storyToDelete?.title}"</span> {t('stories.delete_confirm').replace('{title}', '')} <br />
                            <span className="text-palette-red/70">{t('stories.delete_warning')}</span>
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={saving}
                                className="flex-1 h-12 bg-palette-beige/30 text-palette-tan rounded-[3px] font-black text-[12px] tracking-widest hover:bg-palette-beige/50 transition-all uppercase"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={saving}
                                className="flex-1 h-12 bg-palette-red text-white rounded-[3px] font-black text-[12px] tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-palette-red/20 flex items-center justify-center gap-2"
                            >
                                {saving ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>}
                                <span className="mt-0.5">{t('common.delete_kalici')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {statusModal.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-palette-maroon/20 backdrop-blur-[2px] animate-in fade-in" onClick={() => setStatusModal({ ...statusModal, show: false })} />
                    <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-xs overflow-hidden animate-in slide-in-from-bottom-4 border border-palette-tan/15 p-8 text-center">
                        <div className={`w-16 h-16 rounded-[3px] flex items-center justify-center mx-auto mb-6 ${statusModal.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {statusModal.type === 'error' ? <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>close</span> : <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>check_circle</span>}
                        </div>
                        <p className="text-sm font-black text-palette-maroon mb-8 leading-relaxed">{statusModal.message}</p>
                        <button
                            onClick={() => setStatusModal({ ...statusModal, show: false })}
                            className="w-full py-4 bg-palette-tan text-white rounded-[3px] font-black text-[12px] tracking-widest hover:bg-palette-maroon transition-all shadow-lg active:scale-95"
                        >
                            {t('common.ok')}
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default StoryManagement;
