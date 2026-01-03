
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';

interface PostRecord {
    id: string;
    title: string;
    category: string;
    type: string;
    created_at: string;
    thumbnail_url: string;
}

const PostList: React.FC = () => {
    const { t } = useLanguage();
    const [posts, setPosts] = useState<PostRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState<PostRecord | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchPosts();
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

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setErrorMsg(null);
            const { data, error } = await supabase
                .from('posts')
                .select('id, title, category, type, created_at, thumbnail_url')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (err: any) {
            console.error("Post fetch error:", err);
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!postToDelete) return;
        try {
            const { error } = await supabase.from('posts').delete().eq('id', postToDelete.id);
            if (error) throw error;
            setPosts(posts.filter(p => p.id !== postToDelete.id));
            setShowDeleteModal(false);
            setPostToDelete(null);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[3px] border border-palette-tan/20 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-palette-maroon group-hover:w-2 transition-all"></div>
                <div>
                    <h2 className="text-2xl font-bold text-palette-maroon tracking-tight">{t('posts.page_title')}</h2>
                    <p className="text-palette-tan font-medium mt-1">{t('posts.page_desc')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group/search">
                        <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/40 group-focus-within/search:text-palette-maroon transition-colors" style={{ fontSize: '20px' }}>search</span>
                        <input
                            type="text"
                            placeholder={t('posts.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-palette-beige/30 border border-palette-tan/20 rounded-[3px] text-sm font-bold text-palette-maroon w-full md:w-[350px] outline-none focus:bg-white focus:border-palette-maroon focus:ring-4 focus:ring-palette-maroon/5 transition-all placeholder:text-palette-tan/40 uppercase tracking-widest"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[3px] border border-palette-tan/20 shadow-xl overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-palette-beige/30 border-b border-palette-tan/20">
                                <th className="px-8 py-6 text-[11px] font-black text-palette-tan uppercase tracking-[0.2em]">{t('posts.table.title')}</th>
                                <th className="px-8 py-6 text-[11px] font-black text-palette-tan uppercase tracking-[0.2em]">{t('posts.table.category')}</th>
                                <th className="px-8 py-6 text-[11px] font-black text-palette-tan uppercase tracking-[0.2em]">{t('posts.table.status')}</th>
                                <th className="px-8 py-6 text-[11px] font-black text-palette-tan uppercase tracking-[0.2em]">{t('posts.table.date')}</th>
                                <th className="px-8 py-6 text-[11px] font-black text-palette-tan uppercase tracking-[0.2em] text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-palette-tan/10">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6"><div className="h-6 bg-palette-beige/50 rounded-[3px] w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="w-20 h-20 bg-palette-beige/30 rounded-[3px] flex items-center justify-center mx-auto mb-6 text-palette-tan/40">
                                            <span className="material-symbols-rounded" style={{ fontSize: '32px' }}>inventory_2</span>
                                        </div>
                                        <p className="text-palette-tan font-bold uppercase tracking-widest text-sm">{t('feed.empty')}</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-palette-beige/10 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-12 flex-shrink-0 bg-palette-beige rounded-[3px] overflow-hidden border border-palette-tan/10 shadow-sm relative group-hover:shadow-md transition-all">
                                                    {post.thumbnail_url ? (
                                                        <img src={post.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-palette-tan/30"><span className="material-symbols-rounded" style={{ fontSize: '20px' }}>image</span></div>
                                                    )}
                                                    <div className="absolute top-1 left-1 px-1 bg-palette-maroon/80 rounded-[2px] text-[8px] font-black text-white uppercase tracking-tighter shadow-xl">{post.type}</div>
                                                </div>
                                                <div className="max-w-md">
                                                    <p className="font-bold text-palette-maroon text-sm leading-tight line-clamp-2 group-hover:text-palette-red transition-colors">{post.title}</p>
                                                    <p className="text-[10px] text-palette-tan/40 font-black mt-1 uppercase tracking-widest">{post.id.split('-')[0]}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1.5 rounded-[3px] bg-palette-beige text-palette-maroon text-[10px] font-black uppercase tracking-widest border border-palette-tan/20">
                                                {post.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">{t('admin.status.published')}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-[11px] font-bold text-palette-tan flex flex-col">
                                                <span>{new Date(post.created_at).toLocaleDateString(t('admin.date_format'))}</span>
                                                <span className="text-[9px] text-palette-tan/40 opacity-70 mt-0.5 uppercase">{new Date(post.created_at).toLocaleTimeString(t('admin.date_format'), { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { }} // TODO: Edit logic
                                                    className="w-9 h-9 flex items-center justify-center rounded-[3px] bg-palette-beige/50 text-palette-maroon hover:bg-palette-maroon hover:text-white transition-all shadow-sm active:scale-95"
                                                    title={t('common.edit')}
                                                >
                                                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>edit</span>
                                                </button>
                                                <button
                                                    onClick={() => { setPostToDelete(post); setShowDeleteModal(true); }}
                                                    className="w-9 h-9 flex items-center justify-center rounded-[3px] bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                                                    title={t('common.delete')}
                                                >
                                                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-palette-tan/20">
                        <div className="bg-red-50 px-8 py-10 text-center border-b border-red-100">
                            <div className="w-20 h-20 bg-white rounded-[3px] flex items-center justify-center mx-auto mb-6 text-red-600 shadow-xl shadow-red-600/10">
                                <span className="material-symbols-rounded" style={{ fontSize: '40px' }}>delete_forever</span>
                            </div>
                            <h3 className="text-2xl font-black text-palette-maroon mb-2 uppercase tracking-tighter">{t('common.confirm_title')}</h3>
                            <p className="text-palette-tan font-bold opacity-70 px-4 leading-relaxed">{postToDelete?.title}</p>
                        </div>
                        <div className="p-8 space-y-4">
                            <button
                                onClick={handleDelete}
                                className="w-full py-5 bg-red-600 text-white rounded-[3px] font-black text-xs tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-[0.98] uppercase"
                            >
                                {t('common.delete_kalici')}
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="w-full py-5 bg-palette-beige text-palette-maroon rounded-[3px] font-black text-xs tracking-[0.2em] hover:bg-palette-tan hover:text-white transition-all active:scale-[0.98] uppercase"
                            >
                                {t('common.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostList;
