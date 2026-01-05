
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

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
    is_pinned?: boolean;
    profiles: {
        full_name: string;
    } | null;
}

// 2025 Senkronizasyon Mimari: Memoized Row for zero-lag rendering
const PostRow = React.memo(({
    post,
    index,
    t,
    onEditPost,
    onToggleStatus,
    onTogglePinned,
    onDelete,
    openDropdownId,
    setOpenDropdownId,
    dropdownRef,
    getCategoryDisplay,
    isLast,
    isSelected,
    onSelectRow
}: {
    post: PostRecord;
    index: number;
    t: any;
    onEditPost?: (id: string) => void;
    onToggleStatus: (post: PostRecord) => void;
    onTogglePinned: (post: PostRecord) => void;
    onDelete: (post: PostRecord) => void;
    openDropdownId: string | null;
    setOpenDropdownId: (id: string | null) => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
    getCategoryDisplay: (label: string) => React.ReactNode;
    isLast: boolean;
    isSelected: boolean;
    onSelectRow: (id: string) => void;
}) => {
    return (
        <tr className={`hover:bg-palette-beige/5 transition-all group h-[92px] ${openDropdownId === post.id ? 'relative z-[100]' : 'relative z-1'}`}>
            <td className="px-4 py-0 align-middle">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelectRow(post.id)}
                    className="w-4 h-4 rounded-[2px] border-palette-tan/30 text-palette-maroon focus:ring-palette-maroon cursor-pointer"
                />
            </td>
            <td className="px-2 py-0 align-middle text-[13px] font-bold text-palette-tan/60">{post.id.slice(0, 5).toUpperCase()}</td>
            <td className="px-2 py-0 align-middle">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-[60px] h-[60px] flex-shrink-0 bg-palette-beige rounded-[3px] overflow-hidden border border-palette-tan/10 shadow-sm relative group-hover:shadow-md transition-all">
                        {post.thumbnail_url ? (
                            <img src={post.thumbnail_url} className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-700" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-palette-tan/20">
                                <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>image</span>
                            </div>
                        )}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            {post.is_pinned && (
                                <span className="material-symbols-rounded text-amber-500 fill-current flex-shrink-0" style={{ fontSize: '18px' }}>push_pin</span>
                            )}
                            <p className="font-bold text-palette-maroon text-[14px] leading-tight group-hover:text-palette-red transition-colors whitespace-normal break-words line-clamp-2">
                                {post.title}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {(() => {
                                const translation = t(`admin.post.tab.${post.type}`);
                                const displayType = translation && translation !== `admin.post.tab.${post.type}`
                                    ? translation
                                    : (post.type.charAt(0).toUpperCase() + post.type.slice(1).toLowerCase());
                                return (
                                    <span className="text-[10px] font-black text-white bg-palette-maroon/80 px-1.5 py-0.5 rounded-[2px] tracking-tighter">
                                        {displayType}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-3 py-0 align-middle text-center overflow-hidden">
                {getCategoryDisplay(post.category)}
            </td>
            <td className="px-3 py-0 align-middle text-center">
                <span className={`text-[10px] font-black px-2 py-1 rounded-[2px] uppercase tracking-widest inline-block ${post.status === 'published'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-palette-tan/10 text-palette-tan border border-palette-tan/10'
                    }`}>
                    {post.status === 'published' ? 'Yayında' : 'Taslak'}
                </span>
            </td>
            <td className="px-3 py-0 align-middle text-center">
                <span className="text-[11px] font-black text-white bg-palette-tan/40 px-2 py-1 rounded-[2px] uppercase tracking-widest">{post.language_code || 'tr'}</span>
            </td>
            <td className="px-3 py-0 align-middle text-center">
                <span className="text-[12px] font-bold text-palette-maroon/70">{post.profiles?.full_name || '-'}</span>
            </td>
            <td className="px-3 py-0 align-middle text-center">
                <div className="flex flex-col items-center">
                    <span className="text-[14px] font-black text-palette-maroon">{post.likes_count || 0}</span>
                </div>
            </td>
            <td className="px-3 py-0 align-middle text-center">
                <div className="flex flex-col items-center">
                    <span className="text-[14px] font-black text-palette-maroon">{post.comments_count || 0}</span>
                </div>
            </td>
            <td className="px-4 py-0 align-middle text-right">
                <div className="text-[11px] font-bold text-palette-tan flex flex-col items-end">
                    <span>{new Date(post.created_at).toLocaleDateString(t('admin.date_format'))}</span>
                    <span className="text-[9px] text-palette-tan/40 opacity-70 mt-0.5 uppercase tracking-tighter">{new Date(post.created_at).toLocaleTimeString(t('admin.date_format'), { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </td>
            <td className="px-4 py-0 align-middle text-right">
                <div className="relative inline-block text-left" ref={openDropdownId === post.id ? (dropdownRef as any) : null}>
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
                        <div className={`absolute right-0 ${isLast && index > 0 ? 'bottom-full mb-2' : 'top-full mt-2'} w-48 bg-white border border-palette-tan/20 rounded-[3px] shadow-2xl z-[100] py-2 animate-in fade-in zoom-in-95 duration-200`}>
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
                                    onToggleStatus(post);
                                    setOpenDropdownId(null);
                                }}
                                className="w-full px-5 py-3 text-left text-[13px] font-bold text-palette-maroon hover:bg-palette-beige/30 transition-all flex items-center gap-3 group/item"
                            >
                                <span className="material-symbols-rounded text-palette-tan group-hover/item:text-palette-maroon transition-colors" style={{ fontSize: '18px' }}>
                                    {post.status === 'published' ? 'unpublished' : 'check_circle'}
                                </span>
                                {post.status === 'published' ? t('admin.post.unpublish') || 'Yayından Kaldır' : t('admin.post.publish_btn')}
                            </button>
                            <button
                                onClick={() => {
                                    onTogglePinned(post);
                                    setOpenDropdownId(null);
                                }}
                                className="w-full px-5 py-3 text-left text-[13px] font-bold text-palette-maroon hover:bg-palette-beige/30 transition-all flex items-center gap-3 group/item"
                            >
                                <span className="material-symbols-rounded text-palette-tan group-hover/item:text-palette-maroon transition-colors" style={{ fontSize: '18px' }}>
                                    {post.is_pinned ? 'keep_off' : 'push_pin'}
                                </span>
                                {post.is_pinned ? t('admin.post.unpin') : t('admin.post.pin_to_top')}
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(post);
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
    );
});

interface PostListProps {
    onEditPost?: (postId: string) => void;
    onAddPost?: () => void;
}

const PostList: React.FC<PostListProps> = ({ onEditPost, onAddPost }) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [posts, setPosts] = useState<PostRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
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
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState<PostRecord | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [navItems, setNavItems] = useState<any[]>([]);
    const [languages, setLanguages] = useState<any[]>([]);
    const [publishers, setPublishers] = useState<any[]>([]);
    const [usedFilters, setUsedFilters] = useState({
        categories: [] as string[],
        types: [] as string[],
        publisherIds: [] as string[]
    });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Paralel Veri Çekme (Jet Hızında Açılış)
    useEffect(() => {
        const fetchMetadata = async () => {
            await Promise.all([
                supabase.from('navigation_items').select('*').then(({ data }) => data && setNavItems(data)),
                supabase.from('languages').select('*').then(({ data }) => data && setLanguages(data)),
                supabase.from('profiles').select('id, full_name').not('full_name', 'is', null).then(({ data }) => data && setPublishers(data)),
                supabase.from('posts').select('category, type, publisher_id').then(({ data }) => {
                    if (data) {
                        setUsedFilters({
                            categories: Array.from(new Set(data.map(p => p.category).filter(Boolean))),
                            types: Array.from(new Set(data.map(p => p.type).filter(Boolean))),
                            publisherIds: Array.from(new Set(data.map(p => p.publisher_id).filter(Boolean)))
                        });
                    }
                })
            ]);
        };
        fetchMetadata();
    }, []);

    // Optimized Debounce (300ms - Gecikmesiz Arama Hissi)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

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
    }, [currentPage, pageSize, debouncedSearchTerm, filters]);

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
                .select('id,title,category,type,status,slug,created_at,thumbnail_url,likes_count,shares_count,comments_count,language_code,is_pinned,profiles:publisher_id(full_name)', { count: 'exact' });

            if (debouncedSearchTerm) {
                // 2025 Işık Hızı: ilike yerine or() içinde çoklu LIKE araması ve Türkçe karakter normalizasyonu
                // unaccent modülü yüklü olmasa bile güvenli fallback için .ilike kullanmaya devam ediyoruz
                const search = `%${debouncedSearchTerm}%`;
                query = query.or(`title.ilike.${search},slug.ilike.${search},category.ilike.${search},type.ilike.${search},status.ilike.${search},seo_title.ilike.${search},seo_description.ilike.${search},keywords.ilike.${search},summary.ilike.${search}`);
            }

            if (filters.status !== 'Tümü') {
                query = query.eq('status', filters.status === 'Yayında' ? 'published' : 'draft');
            }
            if (filters.category !== 'Tümü') {
                query = query.eq('category', filters.category);
            }
            if (filters.language !== 'Tümü') {
                const lang = languages.find(l => l.name === filters.language);
                if (lang) query = query.eq('language_code', lang.code);
            }
            if (filters.type !== 'Tümü') {
                query = query.eq('type', filters.type);
            }
            if (filters.publisher !== 'Tümü') {
                query = query.eq('publisher_id', filters.publisher);
            }

            const { data, error, count } = await query
                .order('is_pinned', { ascending: false })
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

    const getCategoryDisplay = (label: string) => {
        if (!label || label === 'Tümü') return label;
        const item = navItems.find(i => i.label === label);
        if (!item || !item.parent_id) return <span className="text-[12px] font-bold text-palette-tan/70 uppercase tracking-widest">{label}</span>;

        const parent = navItems.find(i => i.id === item.parent_id);
        if (!parent) return <span className="text-[12px] font-bold text-palette-tan/70 uppercase tracking-widest">{label}</span>;

        return (
            <div className="flex flex-col items-center">
                <span className="text-[9px] font-black text-palette-tan/30 uppercase tracking-tighter leading-none mb-0.5">{parent.label}</span>
                <div className="flex items-center gap-1">
                    <span className="material-symbols-rounded text-palette-tan/20" style={{ fontSize: '12px' }}>subdirectory_arrow_right</span>
                    <span className="text-[12px] font-bold text-palette-tan/70 uppercase tracking-widest">{label}</span>
                </div>
            </div>
        );
    };

    const handleToggleStatus = async (post: PostRecord) => {
        const newStatus = post.status === 'published' ? 'draft' : 'published';
        const previousPosts = [...posts];

        // Optimistic UI Update
        setPosts(posts.map(p => p.id === post.id ? { ...p, status: newStatus } : p));

        try {
            const { error } = await supabase
                .from('posts')
                .update({
                    status: newStatus,
                    published_at: newStatus === 'published' ? new Date().toISOString() : null
                })
                .eq('id', post.id);

            if (error) throw error;
            showToast(newStatus === 'published' ? t('admin.post.publish_now') : t('admin.post.unpublish_now'), 'success');
        } catch (err: any) {
            setPosts(previousPosts);
            showToast(t('admin.error.fetch_failed') + ": " + err.message, 'error');
        }
    };

    const handleTogglePinned = async (post: PostRecord) => {
        const newPinned = !post.is_pinned;
        const previousPosts = [...posts];

        // Optimistic UI Update
        setPosts(posts.map(p => p.id === post.id ? { ...p, is_pinned: newPinned } : p));

        try {
            const { error } = await supabase
                .from('posts')
                .update({ is_pinned: newPinned })
                .eq('id', post.id);

            if (error) throw error;
            showToast(newPinned ? t('admin.post.pinned_success') : t('admin.post.unpinned_success'), 'success');
        } catch (err: any) {
            setPosts(previousPosts);
            showToast(t('admin.error.fetch_failed') + ": " + err.message, 'error');
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
            showToast(t('admin.post.delete_success'), 'success');
        } catch (err: any) {
            // Rollback on error
            setPosts(previousPosts);
            showToast(err.message, 'error');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        const previousPosts = [...posts];
        setPosts(posts.filter(p => !selectedIds.includes(p.id)));
        setShowBulkDeleteModal(false);

        try {
            const { error } = await supabase.from('posts').delete().in('id', selectedIds);
            if (error) throw error;
            setSelectedIds([]);
            showToast(`${selectedIds.length} ${t('admin.post.delete_success')}`, 'success');
        } catch (err: any) {
            setPosts(previousPosts);
            showToast(err.message, 'error');
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(posts.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    useEffect(() => {
        setSelectedIds([]);
    }, [posts]);

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
        <>
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
                <div className="bg-white rounded-[3px] border border-palette-tan/20 shadow-sm min-h-[600px] flex flex-col">
                    {/* HEADER / FILTERS */}
                    <div className="p-8 border-b border-palette-tan/10 space-y-8">
                        <h2 className="text-xl font-black text-palette-maroon uppercase tracking-tight">{t('posts.page_title')}</h2>

                        {/* FILTER GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { label: t('posts.filters.language'), key: 'language' },
                                { label: t('posts.filters.category'), key: 'category' },
                                { label: t('posts.filters.type'), key: 'type' },
                                { label: t('posts.filters.status'), key: 'status' },
                                { label: t('posts.filters.publisher'), key: 'publisher' },
                            ].map((filter) => (
                                <div key={filter.key} className="space-y-1.5">
                                    <label className="text-[11px] font-black text-palette-tan/40 uppercase tracking-widest block">{filter.label}</label>
                                    <div className="relative group/select">
                                        <select
                                            className="w-full h-10 px-3 bg-palette-beige/20 border border-palette-tan/15 rounded-[3px] text-[13px] font-bold text-palette-maroon appearance-none outline-none focus:bg-white focus:border-palette-maroon transition-all cursor-pointer"
                                            value={(filters as any)[filter.key]}
                                            onChange={(e) => setFilters({ ...filters, [filter.key]: e.target.value })}
                                        >
                                            <option value="Tümü">Tümü</option>
                                            {filter.key === 'language' && languages.map(lang => (
                                                <option key={lang.code} value={lang.name}>{lang.name}</option>
                                            ))}
                                            {filter.key === 'category' && navItems
                                                .filter(item => usedFilters.categories.includes(item.label))
                                                .map(item => {
                                                    const parent = item.parent_id ? navItems.find(p => p.id === item.parent_id) : null;
                                                    return (
                                                        <option key={item.id} value={item.label}>
                                                            {parent ? `${parent.label} > ` : ''}{item.label}
                                                        </option>
                                                    );
                                                })
                                            }
                                            {filter.key === 'type' && usedFilters.types.map(tType => {
                                                const translation = t(`admin.post.tab.${tType}`);
                                                // Fallback: capitalized first letter if translation is missing or is the key itself
                                                const displayLabel = translation && translation !== `admin.post.tab.${tType}`
                                                    ? translation
                                                    : tType.charAt(0).toUpperCase() + tType.slice(1).toLowerCase();

                                                return <option key={tType} value={tType}>{displayLabel}</option>
                                            })}
                                            {filter.key === 'status' && (
                                                <>
                                                    <option value="Yayında">Yayında</option>
                                                    <option value="Taslak">Taslak</option>
                                                </>
                                            )}
                                            {filter.key === 'publisher' && publishers
                                                .filter(pub => usedFilters.publisherIds.includes(pub.id))
                                                .map(pub => (
                                                    <option key={pub.id} value={pub.id}>{pub.full_name}</option>
                                                ))
                                            }
                                        </select>
                                        <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-palette-tan/30 pointer-events-none group-hover/select:text-palette-maroon transition-colors" style={{ fontSize: '18px' }}>expand_more</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* TOP ACTIONS */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-palette-tan/5">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="flex flex-col items-start gap-2">
                                    <div className="relative group/size">
                                        <select
                                            className="h-10 px-4 pr-10 bg-palette-beige/20 border border-palette-tan/15 rounded-[3px] text-[13px] font-black text-palette-maroon appearance-none outline-none focus:bg-white focus:border-palette-maroon transition-all cursor-pointer min-w-[70px]"
                                            value={pageSize}
                                            onChange={(e) => setPageSize(Number(e.target.value))}
                                        >
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                        <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-palette-tan/30 pointer-events-none" style={{ fontSize: '18px' }}>expand_more</span>
                                    </div>
                                    {selectedIds.length > 0 && (
                                        <button
                                            onClick={() => setShowBulkDeleteModal(true)}
                                            className="flex items-center justify-center gap-1 px-3 py-1 bg-red-50 text-palette-red border border-palette-red/10 rounded-[2px] text-[10px] font-black tracking-tight hover:bg-palette-red hover:text-white transition-all animate-in fade-in slide-in-from-top-1 whitespace-nowrap shadow-sm"
                                        >
                                            <span className="material-symbols-rounded" style={{ fontSize: '13px' }}>delete_sweep</span>
                                            {t('common.delete_selected')} ({selectedIds.length})
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative flex-1 md:flex-none">
                                    <input
                                        type="text"
                                        placeholder={t('posts.search_placeholder')}
                                        className="w-full md:w-[280px] h-10 pl-4 pr-10 bg-white border border-palette-tan/15 rounded-[3px] text-[13px] font-bold text-palette-maroon outline-none focus:border-palette-maroon focus:ring-4 focus:ring-palette-maroon/5 transition-all shadow-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-palette-tan/40" style={{ fontSize: '18px' }}>search</span>
                                </div>


                                <button
                                    onClick={onAddPost}
                                    className="flex items-center gap-2 h-10 px-4 bg-palette-red text-white rounded-[3px] text-[13px] font-black tracking-widest hover:bg-palette-maroon transition-all shadow-lg shadow-palette-red/20 active:scale-95"
                                >
                                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>add</span>
                                    {t('posts.actions.add_post')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TABLE SECTION (STABILIZED) */}
                    <div className="flex-1 relative z-10">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr className="bg-palette-beige/10 border-b border-palette-tan/10 h-[60px]">
                                    <th className="w-[50px] px-4 py-0 align-middle">
                                        <input
                                            type="checkbox"
                                            checked={posts.length > 0 && selectedIds.length === posts.length}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded-[2px] border-palette-tan/30 text-palette-maroon focus:ring-palette-maroon cursor-pointer"
                                        />
                                    </th>
                                    <th className="w-[60px] px-2 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest">{t('posts.table.id')}</th>
                                    <th className="px-2 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest">{t('posts.table.post')}</th>
                                    <th className="w-[130px] px-3 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">{t('posts.table.category')}</th>
                                    <th className="w-[100px] px-3 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">{t('posts.filters.status')}</th>
                                    <th className="w-[50px] px-3 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">{t('posts.table.language')}</th>
                                    <th className="w-[110px] px-3 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">{t('posts.table.author')}</th>
                                    <th className="w-[70px] px-3 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">{t('posts.table.views')}</th>
                                    <th className="w-[70px] px-3 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">{t('posts.table.comments')}</th>
                                    <th className="w-[110px] px-4 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest text-right">{t('posts.table.date')}</th>
                                    <th className="w-[80px] px-4 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest text-right">{t('posts.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-palette-tan/5 transition-opacity duration-200" style={{ opacity: loading ? 0.7 : 1 }}>
                                {loading && posts.length === 0 ? (
                                    Array(pageSize).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse h-[92px]">
                                            <td className="px-4 py-0 align-middle"><div className="w-4 h-4 bg-palette-beige rounded-[2px]" /></td>
                                            <td className="px-2 py-0 align-middle"><div className="h-4 bg-palette-beige rounded-[3px] w-8" /></td>
                                            <td className="px-2 py-0 align-middle">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-[60px] h-[60px] bg-palette-beige rounded-[3px] flex-shrink-0" />
                                                    <div className="space-y-2 flex-1">
                                                        <div className="h-4 bg-palette-beige rounded-[3px] w-3/4" />
                                                        <div className="h-3 bg-palette-beige rounded-[3px] w-1/4 opacity-50" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-0 align-middle"><div className="h-4 bg-palette-beige rounded-[3px] w-16 mx-auto" /></td>
                                            <td className="px-3 py-0 align-middle"><div className="h-6 bg-palette-beige rounded-[3px] w-20 mx-auto" /></td>
                                            <td className="px-3 py-0 align-middle"><div className="h-6 bg-palette-beige rounded-[3px] w-8 mx-auto opacity-50" /></td>
                                            <td className="px-3 py-0 align-middle"><div className="h-4 bg-palette-beige rounded-[3px] w-20 mx-auto" /></td>
                                            <td className="px-3 py-0 align-middle"><div className="h-8 bg-palette-beige rounded-[3px] w-12 mx-auto" /></td>
                                            <td className="px-3 py-0 align-middle"><div className="h-8 bg-palette-beige rounded-[3px] w-12 mx-auto" /></td>
                                            <td className="px-4 py-0 align-middle"><div className="h-8 bg-palette-beige rounded-[3px] w-24 ml-auto" /></td>
                                            <td className="px-4 py-0 align-middle"><div className="w-10 h-10 bg-palette-beige rounded-full ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : posts.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="px-8 py-32 text-center text-palette-tan/40 font-bold uppercase tracking-widest text-sm h-[400px]">
                                            {t('feed.empty')}
                                        </td>
                                    </tr>
                                ) : (
                                    posts.map((post, index) => (
                                        <PostRow
                                            key={post.id}
                                            post={post}
                                            index={index}
                                            t={t}
                                            onEditPost={onEditPost}
                                            onToggleStatus={handleToggleStatus}
                                            onTogglePinned={handleTogglePinned}
                                            onDelete={(p) => { setPostToDelete(p); setShowDeleteModal(true); }}
                                            openDropdownId={openDropdownId}
                                            setOpenDropdownId={setOpenDropdownId}
                                            dropdownRef={dropdownRef}
                                            getCategoryDisplay={getCategoryDisplay}
                                            isLast={index >= posts.length - 2}
                                            isSelected={selectedIds.includes(post.id)}
                                            onSelectRow={handleSelectRow}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 border-t border-palette-tan/10 bg-palette-beige/5 flex items-center justify-between font-black text-[11px] tracking-widest text-palette-tan/40 uppercase relative z-0">
                        <span>
                            {t('common.results_found')
                                .replace('{from}', String((currentPage - 1) * pageSize + 1))
                                .replace('{to}', String(Math.min(currentPage * pageSize, totalCount)))
                                .replace('{total}', String(totalCount))}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || loading}
                                className="w-8 h-8 flex items-center justify-center rounded-[3px] border border-palette-tan/15 text-palette-tan hover:bg-white hover:text-palette-maroon transition-all disabled:opacity-30"
                            >
                                <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>chevron_left</span>
                            </button>

                            {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }).map((_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-[3px] transition-all ${currentPage === pageNum ? 'bg-palette-red text-white shadow-lg shadow-palette-red/20' : 'border border-palette-tan/15 text-palette-tan hover:bg-white hover:text-palette-maroon'}`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}

                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage >= Math.ceil(totalCount / pageSize) || loading}
                                className="w-8 h-8 flex items-center justify-center rounded-[3px] border border-palette-tan/15 text-palette-tan hover:bg-white hover:text-palette-maroon transition-all disabled:opacity-30"
                            >
                                <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* DELETE MODAL OUTSIDE ANIMATED DIV FOR PERFECT SCREEN COVERAGE */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-md animate-in fade-in" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 p-8 text-center">
                        <div className="w-14 h-14 bg-red-50 text-palette-red rounded-[3px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>delete</span>
                        </div>
                        <h3 className="text-xl font-black text-palette-maroon tracking-tight mb-3 uppercase">{t('common.confirm_title')}</h3>
                        <p className="text-[13px] font-bold text-palette-tan/60 leading-relaxed mb-8">
                            <span className="text-palette-maroon">"{postToDelete?.title}"</span> isimli haberi silmek istediğinize emin misiniz?
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 h-10 bg-palette-beige/30 text-palette-tan rounded-[3px] font-black text-[11px] tracking-widest hover:bg-palette-beige/50 transition-all uppercase"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 h-10 bg-palette-red text-white rounded-[3px] font-black text-[13px] tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-palette-red/20 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                                <span className="mt-0.5">{t('common.delete_kalici')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BULK DELETE MODAL */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-md animate-in fade-in" onClick={() => setShowBulkDeleteModal(false)} />
                    <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 p-8 text-center">
                        <div className="w-20 h-20 bg-red-50 text-palette-red rounded-[3px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <span className="material-symbols-rounded" style={{ fontSize: '32px' }}>delete_sweep</span>
                        </div>
                        <h3 className="text-xl font-black text-palette-maroon tracking-tight mb-3 uppercase">{t('common.confirm_title')}</h3>
                        <p className="text-[13px] font-bold text-palette-tan/60 leading-relaxed mb-8">
                            Seçili <span className="text-palette-maroon font-black">{selectedIds.length}</span> haberi toplu olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowBulkDeleteModal(false)}
                                className="flex-1 h-10 bg-palette-beige/30 text-palette-tan rounded-[3px] font-black text-[13px] tracking-widest hover:bg-palette-beige/50 transition-all uppercase"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="flex-1 h-10 bg-palette-red text-white rounded-[3px] font-black text-[13px] tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-palette-red/20 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                                <span className="mt-0.5">{t('common.delete_kalici')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PostList;
