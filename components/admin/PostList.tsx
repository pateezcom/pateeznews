
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';

interface PostRecord {
    id: string;
    title: string;
    category: string;
    type: string;
    status: string;
    slug: string;
    created_at: string;
    thumbnail_url: string;
    likes_count: number;
    shares_count: number;
    comments_count: number;
    language_code: string;
    profiles: {
        full_name: string;
    } | null;
}

interface PostListProps {
    onEditPost?: (postId: string) => void;
}

const PostList: React.FC<PostListProps> = ({ onEditPost }) => {
    const { t } = useLanguage();
    const [posts, setPosts] = useState<PostRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [filters, setFilters] = useState({
        language: 'Tümü',
        category: 'Tümü',
        type: 'Tümü',
        status: 'Tümü',
        publisher: 'Tümü'
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState<PostRecord | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // REAL-TIME SYNC (2025 Standard)
    useEffect(() => {
        const channel = supabase
            .channel('posts-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
                fetchPosts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentPage, pageSize, searchTerm, filters]);

    useEffect(() => {
        fetchPosts();
    }, [currentPage, pageSize, searchTerm, filters]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdownId && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const from = (currentPage - 1) * pageSize;
            const to = from + pageSize - 1;

            let query = supabase
                .from('posts')
                .select('id,title,category,type,status,slug,created_at,thumbnail_url,likes_count,shares_count,comments_count,language_code,profiles:publisher_id(full_name)', { count: 'exact' });

            // Server-side filtering (High performance)
            if (searchTerm) {
                query = query.ilike('title', `%${searchTerm}%`);
            }
            if (filters.status !== 'Tümü') {
                query = query.eq('status', filters.status.toLowerCase() === 'yayında' ? 'published' : 'draft');
            }
            if (filters.category !== 'Tümü') {
                query = query.eq('category', filters.category);
            }
            if (filters.language !== 'Tümü') {
                query = query.eq('language_code', filters.language === 'Turkish' ? 'tr' : filters.language.toLowerCase());
            }

            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            setPosts(data as any || []);
            setTotalCount(count || 0);
        } catch (err: any) {
            console.error("Post fetch error:", err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!postToDelete) return;

        // Optimistic UI Update (Speed)
        const previousPosts = [...posts];
        setPosts(posts.filter(p => p.id !== postToDelete.id));
        setShowDeleteModal(false);

        try {
            const { error } = await supabase.from('posts').delete().eq('id', postToDelete.id);
            if (error) throw error;
            setPostToDelete(null);
        } catch (err: any) {
            // Rollback on error
            setPosts(previousPosts);
            alert(err.message);
        }
    };

    const filteredPosts = posts; // Search and filters are now server-side

    const stats = useMemo(() => {
        const totalViews = posts.reduce((acc, p) => acc + (p.likes_count || 0), 0);
        return [
            { label: t('posts.stats.total'), value: posts.length, change: '+0%', desc: t('posts.stats.all_time'), icon: 'article', color: 'bg-red-50 text-red-600', iconBg: 'bg-red-100' },
            { label: t('posts.stats.published'), value: posts.length, change: '+0%', desc: t('posts.stats.weekly_analysis'), icon: 'check_circle', color: 'bg-green-50 text-green-600', iconBg: 'bg-green-100' },
            { label: t('admin.stats.views'), value: totalViews, change: '+0%', desc: t('posts.stats.weekly_analysis'), icon: 'visibility', color: 'bg-orange-50 text-orange-600', iconBg: 'bg-orange-100' },
            { label: t('posts.stats.scheduled'), value: 0, change: '+0%', desc: t('posts.stats.weekly_analysis'), icon: 'schedule', color: 'bg-cyan-50 text-cyan-600', iconBg: 'bg-cyan-100' },
        ];
    }, [posts, t]);

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">
            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[3px] border border-palette-tan/15 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-[13px] font-bold text-palette-tan/60">{stat.label}</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h3 className="text-[28px] font-black text-palette-maroon tracking-tight">{stat.value}</h3>
                                    <span className={`text-[11px] font-black ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-palette-red'}`}>({stat.change})</span>
                                </div>
                            </div>
                            <div className={`w-10 h-10 ${stat.iconBg} rounded-[3px] flex items-center justify-center ${stat.color.split(' ')[1]}`}>
                                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>{stat.icon}</span>
                            </div>
                        </div>
                        <p className="text-[11px] font-bold text-palette-tan/40 uppercase tracking-widest">{stat.desc}</p>
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-palette-maroon/5 group-hover:bg-palette-maroon/20 transition-all"></div>
                    </div>
                ))}
            </div>

            {/* MAIN CONTENT BOX */}
            <div className="bg-white rounded-[3px] border border-palette-tan/20 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                {/* HEADER / FILTERS */}
                <div className="p-8 border-b border-palette-tan/10 space-y-8">
                    <h2 className="text-xl font-black text-palette-maroon uppercase tracking-tight">{t('posts.page_title')}</h2>

                    {/* FILTER GRID */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {[
                            { label: t('posts.filters.language'), key: 'language' },
                            { label: t('posts.filters.category'), key: 'category' },
                            { label: t('posts.filters.type'), key: 'type' },
                            { label: t('posts.filters.status'), key: 'status' },
                            { label: t('posts.filters.options'), key: 'options' },
                            { label: t('posts.filters.publisher'), key: 'publisher' },
                            { label: t('posts.filters.items'), key: 'items' },
                        ].map((filter) => (
                            <div key={filter.key} className="space-y-1.5">
                                <label className="text-[11px] font-black text-palette-tan/40 uppercase tracking-widest block">{filter.label}</label>
                                <div className="relative group/select">
                                    <select
                                        className="w-full h-11 px-4 bg-palette-beige/20 border border-palette-tan/15 rounded-[3px] text-[13px] font-bold text-palette-maroon appearance-none outline-none focus:bg-white focus:border-palette-maroon transition-all cursor-pointer"
                                        value={(filters as any)[filter.key]}
                                        onChange={(e) => setFilters({ ...filters, [filter.key]: e.target.value })}
                                    >
                                        <option value="Tümü">{filter.key === 'language' ? 'Turkish' : 'Tümü'}</option>
                                    </select>
                                    <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-palette-tan/30 pointer-events-none group-hover/select:text-palette-maroon transition-colors" style={{ fontSize: '18px' }}>expand_more</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* TOP ACTIONS */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-palette-tan/5">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative group/size">
                                <select
                                    className="h-11 px-6 pr-10 bg-palette-beige/20 border border-palette-tan/15 rounded-[3px] text-[13px] font-black text-palette-maroon appearance-none outline-none focus:bg-white focus:border-palette-maroon transition-all cursor-pointer min-w-[80px]"
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                >
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-palette-tan/30 pointer-events-none" style={{ fontSize: '18px' }}>expand_more</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:flex-none">
                                <input
                                    type="text"
                                    placeholder={t('posts.search_placeholder')}
                                    className="w-full md:w-[320px] h-11 pl-4 pr-10 bg-white border border-palette-tan/15 rounded-[3px] text-[13px] font-bold text-palette-maroon outline-none focus:border-palette-maroon focus:ring-4 focus:ring-palette-maroon/5 transition-all shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-palette-tan/40" style={{ fontSize: '18px' }}>search</span>
                            </div>

                            <button className="flex items-center gap-2 h-11 px-5 bg-palette-beige/40 text-palette-maroon border border-palette-tan/15 rounded-[3px] text-[13px] font-black tracking-widest hover:bg-palette-tan hover:text-white transition-all active:scale-95 group">
                                <span className="material-symbols-rounded text-palette-tan/60 group-hover:text-white transition-colors" style={{ fontSize: '18px' }}>upload</span>
                                {t('posts.actions.export')}
                                <span className="material-symbols-rounded text-palette-tan/30 group-hover:text-white/40" style={{ fontSize: '16px' }}>expand_more</span>
                            </button>

                            <button className="flex items-center gap-2 h-11 px-6 bg-palette-red text-white rounded-[3px] text-[13px] font-black tracking-widest hover:bg-palette-maroon transition-all shadow-lg shadow-palette-red/20 active:scale-95">
                                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>add</span>
                                {t('posts.actions.add_post')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-palette-beige/10 border-b border-palette-tan/10">
                                <th className="w-12 px-8 py-5">
                                    <input type="checkbox" className="w-4 h-4 rounded-[2px] border-palette-tan/30 text-palette-maroon focus:ring-palette-maroon cursor-pointer" />
                                </th>
                                <th className="w-20 px-4 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest">{t('posts.table.id')}</th>
                                <th className="px-4 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest">{t('posts.table.post')}</th>
                                <th className="px-6 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">{t('posts.table.category')}</th>
                                <th className="px-6 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">{t('posts.filters.status')}</th>
                                <th className="px-6 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">{t('posts.table.language')}</th>
                                <th className="px-6 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">{t('posts.table.author')}</th>
                                <th className="px-6 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">{t('posts.table.views')}</th>
                                <th className="px-6 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">{t('posts.table.comments')}</th>
                                <th className="px-8 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest text-right">{t('posts.table.date')}</th>
                                <th className="w-20 px-8 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest text-right">{t('posts.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-palette-tan/5">
                            {loading ? (
                                Array(pageSize).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6"><div className="w-4 h-4 bg-palette-beige rounded-[2px]" /></td>
                                        <td className="px-4 py-6"><div className="h-4 bg-palette-beige rounded-[3px] w-8" /></td>
                                        <td className="px-4 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-[60px] h-[60px] bg-palette-beige rounded-[3px]" />
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-4 bg-palette-beige rounded-[3px] w-3/4" />
                                                    <div className="h-3 bg-palette-beige rounded-[3px] w-1/4 opacity-50" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6"><div className="h-4 bg-palette-beige rounded-[3px] w-16 mx-auto" /></td>
                                        <td className="px-6 py-6"><div className="h-6 bg-palette-beige rounded-[3px] w-20 mx-auto" /></td>
                                        <td className="px-6 py-6"><div className="h-6 bg-palette-beige rounded-[3px] w-8 mx-auto opacity-50" /></td>
                                        <td className="px-6 py-6"><div className="h-4 bg-palette-beige rounded-[3px] w-20 mx-auto" /></td>
                                        <td className="px-6 py-6"><div className="h-8 bg-palette-beige rounded-[3px] w-12 mx-auto" /></td>
                                        <td className="px-6 py-6"><div className="h-8 bg-palette-beige rounded-[3px] w-12 mx-auto" /></td>
                                        <td className="px-8 py-6"><div className="h-8 bg-palette-beige rounded-[3px] w-24 ml-auto" /></td>
                                        <td className="px-8 py-6"><div className="w-10 h-10 bg-palette-beige rounded-full ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-8 py-32 text-center text-palette-tan/40 font-bold uppercase tracking-widest text-sm">
                                        {t('feed.empty')}
                                    </td>
                                </tr>
                            ) : (
                                filteredPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-palette-beige/5 transition-all group">
                                        <td className="px-8 py-6">
                                            <input type="checkbox" className="w-4 h-4 rounded-[2px] border-palette-tan/30 text-palette-maroon focus:ring-palette-maroon cursor-pointer" />
                                        </td>
                                        <td className="px-4 py-6 text-[13px] font-bold text-palette-tan/60">{post.id.slice(0, 5).toUpperCase()}</td>
                                        <td className="px-4 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-[60px] h-[60px] flex-shrink-0 bg-palette-beige rounded-[3px] overflow-hidden border border-palette-tan/10 shadow-sm relative group-hover:shadow-md transition-all">
                                                    {post.thumbnail_url ? (
                                                        <img src={post.thumbnail_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-palette-tan/20">
                                                            <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>image</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-bold text-palette-maroon text-[14px] leading-snug group-hover:text-palette-red transition-colors line-clamp-1">{post.title}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-white bg-palette-maroon/80 px-1.5 py-0.5 rounded-[2px] uppercase tracking-tighter">{post.type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="text-[12px] font-bold text-palette-tan/70 uppercase tracking-widest">{post.category}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-[2px] uppercase tracking-widest ${post.status === 'published'
                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                : 'bg-palette-tan/10 text-palette-tan border border-palette-tan/10'
                                                }`}>
                                                {post.status === 'published' ? 'Yayında' : 'Taslak'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="text-[11px] font-black text-white bg-palette-tan/40 px-2 py-1 rounded-[2px] uppercase tracking-widest">{post.language_code || 'tr'}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="text-[12px] font-bold text-palette-maroon/70">{post.profiles?.full_name || '-'}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[14px] font-black text-palette-maroon">{post.likes_count || 0}</span>
                                                <span className="text-[9px] font-black text-palette-tan/40 uppercase tracking-tighter">{t('admin.stats.views')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[14px] font-black text-palette-maroon">{post.comments_count || 0}</span>
                                                <span className="text-[9px] font-black text-palette-tan/40 uppercase tracking-tighter">{t('card.comments')}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="text-[11px] font-bold text-palette-tan flex flex-col">
                                                <span>{new Date(post.created_at).toLocaleDateString(t('admin.date_format'))}</span>
                                                <span className="text-[9px] text-palette-tan/40 opacity-70 mt-0.5 uppercase tracking-tighter">{new Date(post.created_at).toLocaleTimeString(t('admin.date_format'), { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="relative inline-block text-left" ref={openDropdownId === post.id ? dropdownRef : null}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenDropdownId(openDropdownId === post.id ? null : post.id);
                                                    }}
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-palette-tan/40 hover:bg-palette-beige hover:text-palette-maroon transition-all active:scale-90"
                                                >
                                                    <span className="material-symbols-rounded">more_vert</span>
                                                </button>

                                                {openDropdownId === post.id && (
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-palette-tan/20 rounded-[3px] shadow-2xl z-[100] py-2 animate-in fade-in zoom-in-95 duration-200">
                                                        <button
                                                            onClick={() => {
                                                                if (onEditPost) onEditPost(post.id);
                                                                setOpenDropdownId(null);
                                                            }}
                                                            className="w-full px-5 py-3 text-left text-[13px] font-bold text-palette-maroon hover:bg-palette-beige/30 transition-all flex items-center gap-3 group/item"
                                                        >
                                                            <span className="material-symbols-rounded text-palette-tan group-hover/item:text-palette-maroon transition-colors" style={{ fontSize: '18px' }}>edit</span>
                                                            {t('common.edit')}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setPostToDelete(post);
                                                                setShowDeleteModal(true);
                                                                setOpenDropdownId(null);
                                                            }}
                                                            className="w-full px-5 py-3 text-left text-[13px] font-bold text-red-600 hover:bg-red-50 transition-all flex items-center gap-3 group/item"
                                                        >
                                                            <span className="material-symbols-rounded text-red-400 group-hover/item:text-red-600 transition-colors" style={{ fontSize: '18px' }}>delete</span>
                                                            {t('common.delete')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION FOOTER */}
                <div className="p-8 border-t border-palette-tan/10 bg-palette-beige/5 flex items-center justify-between">
                    <p className="text-[12px] font-bold text-palette-tan/40 uppercase tracking-widest">
                        {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} / {totalCount} {t('common.results_found') || 'Sonuç gösteriliyor'}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || loading}
                            className="w-10 h-10 flex items-center justify-center rounded-[3px] border border-palette-tan/15 text-palette-tan hover:bg-white hover:text-palette-maroon transition-all disabled:opacity-30"
                        >
                            <span className="material-symbols-rounded">chevron_left</span>
                        </button>

                        {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }).map((_, i) => {
                            const pageNum = i + 1; // Simplistic pagination logic for now
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-[3px] font-bold text-sm transition-all ${currentPage === pageNum ? 'bg-palette-maroon text-white shadow-lg shadow-palette-maroon/20' : 'border border-palette-tan/15 text-palette-tan hover:bg-white hover:text-palette-maroon'}`}
                                >
                                    {pageNum}
                                </button>
                            )
                        })}

                        <button
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={currentPage >= Math.ceil(totalCount / pageSize) || loading}
                            className="w-10 h-10 flex items-center justify-center rounded-[3px] border border-palette-tan/15 text-palette-tan hover:bg-white hover:text-palette-maroon transition-all disabled:opacity-30"
                        >
                            <span className="material-symbols-rounded">chevron_right</span>
                        </button>
                    </div>
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
