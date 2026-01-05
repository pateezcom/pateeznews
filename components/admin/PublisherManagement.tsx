
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';

interface Publisher {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    expertise?: string;
    foundation_date?: string;
    description?: string;
    meta_title?: string;
    meta_keywords?: string;
    meta_description?: string;
    canonical_url?: string;
    status?: string;
    reward_system?: boolean;
    created_at?: string;
    assigned_users?: any[];
    assigned_categories?: any[];
    post_count?: number;
    password?: string;
    confirmPassword?: string;
}

interface PublisherManagementProps {
    onEditPublisher: (publisherId: string) => void;
    onEditUser?: (userId: string) => void;
}

const PublisherManagement: React.FC<PublisherManagementProps> = ({ onEditPublisher, onEditUser }) => {
    const { t } = useLanguage();
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 2025 Debounce Mimari
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [publisherToDelete, setPublisherToDelete] = useState<Publisher | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [statusModal, setStatusModal] = useState<{ show: boolean, type: 'error' | 'success', message: string }>({ show: false, type: 'success', message: '' });

    const dropdownRef = useRef<HTMLDivElement>(null);
    const [saving, setSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const initialFormData: Publisher = {
        id: '',
        username: '',
        full_name: '',
        avatar_url: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        expertise: '',
        foundation_date: '',
        description: '',
        meta_title: '',
        meta_keywords: '',
        meta_description: '',
        canonical_url: '',
        status: 'Aktif',
        reward_system: true,
        password: '',
        confirmPassword: ''
    };

    const [formData, setFormData] = useState<Publisher>(initialFormData);

    const handleCloseAddModal = () => {
        setShowAddModal(false);
        setFormData(initialFormData);
        setFormErrors({});
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setFormData(initialFormData);
        setFormErrors({});
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setPublisherToDelete(null);
    };

    const handleCloseStatusModal = () => {
        setStatusModal({ show: false, type: 'success', message: '' });
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdownId && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setErrorMsg(null);

            const from = (currentPage - 1) * pageSize;
            const to = from + pageSize - 1;

            // 1. IŞIK HIZI: Sadece bu sayfadaki yayıncıları çekiyoruz
            let query = supabase
                .from('profiles')
                .select('*', { count: 'exact' })
                .eq('role', 'publisher');

            if (debouncedSearchTerm) {
                const s = `%${debouncedSearchTerm}%`;
                query = query.or(`full_name.ilike.${s},username.ilike.${s},email.ilike.${s}`);
            }

            const { data: pubData, count, error: pubError } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (pubError) throw pubError;
            setTotalCount(count || 0);

            if (!pubData || pubData.length === 0) {
                setPublishers([]);
                return;
            }

            const pubIds = pubData.map(p => p.id);

            // 2. TARGETED FETCH: Sadece bu sayfadaki yayıncıların ilişkilerini çekiyoruz
            const [usersRes, categoriesRes, postsRes] = await Promise.all([
                supabase.from('publisher_users')
                    .select('publisher_id, profiles!publisher_users_user_id_fkey(id, full_name, username)')
                    .in('publisher_id', pubIds),
                supabase.from('publisher_categories')
                    .select('publisher_id, navigation_items(id, label)')
                    .in('publisher_id', pubIds),
                // Post sayısı için tüm tablo yerine id üzerinden hızlı bir sayım alıyoruz
                supabase.from('posts').select('publisher_id').in('publisher_id', pubIds)
            ]);

            const allUsers = usersRes.data || [];
            const allCategories = categoriesRes.data || [];
            const allPosts = postsRes.data || [];

            const userMap: Record<string, any[]> = {};
            allUsers.forEach((u: any) => {
                if (!userMap[u.publisher_id]) userMap[u.publisher_id] = [];
                if (u.profiles) userMap[u.publisher_id].push(u.profiles);
            });

            const categoryMap: Record<string, any[]> = {};
            allCategories.forEach((c: any) => {
                if (!categoryMap[c.publisher_id]) categoryMap[c.publisher_id] = [];
                if (c.navigation_items) categoryMap[c.publisher_id].push({ id: c.navigation_items.id, name: c.navigation_items.label });
            });

            const postCountMap: Record<string, number> = {};
            allPosts.forEach((p: any) => {
                if (p.publisher_id) {
                    postCountMap[p.publisher_id] = (postCountMap[p.publisher_id] || 0) + 1;
                }
            });

            const enrichedData = pubData.map(pub => ({
                ...pub,
                assigned_users: userMap[pub.id] || [],
                assigned_categories: categoryMap[pub.id] || [],
                post_count: postCountMap[pub.id] || 0
            }));

            setPublishers(enrichedData);
        } catch (err: any) {
            console.error("Veri çekme hatası:", err);
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, pageSize, debouncedSearchTerm]);

    // REAL-TIME SYNC: Listen to changes in posts and publisher_users for instant updates
    useEffect(() => {
        const postsChannel = supabase
            .channel('publisher-management-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
                fetchData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'publisher_users' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(postsChannel);
        };
    }, []);

    const stats = useMemo(() => {
        const totalPosts = publishers.reduce((acc, pub) => acc + (pub.post_count || 0), 0);
        const activePubs = publishers.filter(p => p.status === 'Aktif').length;
        const passivePubs = publishers.filter(p => p.status !== 'Aktif').length;

        return [
            { label: t('publishers.stats.session'), value: totalCount, change: '+0%', desc: 'Toplam Yayıncılar', icon: 'business', color: 'bg-red-50 text-red-600', iconBg: 'bg-red-50' },
            { label: t('publishers.stats.total_posts'), value: totalPosts, change: '+0%', desc: 'Geçen hafta analitiği', icon: 'description', color: 'bg-red-50 text-red-600', iconBg: 'bg-red-50' },
            { label: t('publishers.stats.active'), value: activePubs, change: '+0%', desc: 'Geçen hafta analitiği', icon: 'check_circle', color: 'bg-emerald-50 text-emerald-600', iconBg: 'bg-emerald-50' },
            { label: t('publishers.stats.passive'), value: passivePubs, change: '+0%', desc: 'Geçen hafta analitiği', icon: 'schedule', color: 'bg-orange-50 text-orange-600', iconBg: 'bg-orange-50' },
        ];
    }, [publishers, t, totalCount]);

    const filteredPublishers = publishers;

    const handleEditClick = (pub: Publisher) => {
        setFormData(pub);
        setShowEditModal(true);
        setOpenDropdownId(null);
    };

    const confirmDelete = async () => {
        if (!publisherToDelete) return;

        // Optimistic Delete
        const previousPublishers = [...publishers];
        setPublishers(prev => prev.filter(p => p.id !== publisherToDelete.id));
        handleCloseDeleteModal();

        try {
            const { error } = await supabase.from('profiles').delete().eq('id', publisherToDelete.id);
            if (error) {
                setPublishers(previousPublishers);
                throw error;
            }
        } catch (err: any) {
            setStatusModal({ show: true, type: 'error', message: err.message });
        }
    };

    const inputClasses = "w-full h-10 px-4 bg-palette-beige/30 border border-palette-tan/10 rounded-[5px] text-sm font-bold text-palette-maroon outline-none focus:bg-white focus:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all placeholder:text-palette-tan/30";

    return (
        <>
            <div className="space-y-6 animate-in fade-in duration-700 pb-20">

                {/* STATS CARDS matches Image 0 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-[5px] border border-palette-tan/15 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-[13px] font-bold text-palette-tan/60">{stat.label}</p>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <h3 className="text-[28px] font-black text-palette-maroon tracking-tight">{stat.value}</h3>
                                        <span className={`text-[11px] font-black ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-palette-red'}`}>({stat.change})</span>
                                    </div>
                                </div>
                                <div className={`w-10 h-10 ${stat.iconBg} rounded-[5px] flex items-center justify-center ${stat.color.split(' ')[1]}`}>
                                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>{stat.icon}</span>
                                </div>
                            </div>
                            <p className="text-[11px] font-bold text-palette-tan/40 uppercase tracking-widest">{stat.desc}</p>
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-palette-maroon/5 group-hover:bg-palette-maroon/20 transition-all"></div>
                        </div>
                    ))}
                </div>

                {/* MAIN CONTENT BOX */}
                <div className="bg-white rounded-[5px] border border-palette-tan/20 shadow-sm min-h-[600px] flex flex-col">

                    <div className="p-8 border-b border-palette-tan/10 space-y-8">
                        <h2 className="text-xl font-black text-palette-maroon uppercase tracking-tight">{t('publishers.page_title')}</h2>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className="relative group/size">
                                    <select
                                        className="h-10 px-4 pr-10 bg-palette-beige/20 border border-palette-tan/15 rounded-[5px] text-[13px] font-black text-palette-maroon appearance-none outline-none focus:bg-white focus:border-palette-maroon transition-all cursor-pointer min-w-[70px]"
                                        value={pageSize}
                                        onChange={(e) => setPageSize(Number(e.target.value))}
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                    <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-palette-tan/30 pointer-events-none" style={{ fontSize: '18px' }}>expand_more</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative flex-1 md:flex-none">
                                    <input
                                        type="text"
                                        placeholder={t('publishers.search_placeholder')}
                                        className="w-full md:w-[220px] h-10 pl-4 pr-10 bg-white border border-palette-tan/15 rounded-[5px] text-[13px] font-bold text-palette-maroon outline-none focus:border-palette-maroon focus:ring-4 focus:ring-palette-maroon/5 transition-all shadow-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-palette-tan/40" style={{ fontSize: '18px' }}>search</span>
                                </div>

                                <button
                                    onClick={() => {
                                        setFormData({
                                            id: '',
                                            username: '',
                                            full_name: '',
                                            avatar_url: '',
                                            email: '',
                                            phone: '',
                                            website: '',
                                            address: '',
                                            expertise: '',
                                            foundation_date: '',
                                            description: '',
                                            meta_title: '',
                                            meta_keywords: '',
                                            meta_description: '',
                                            canonical_url: '',
                                            status: 'Aktif',
                                            reward_system: true,
                                            password: '',
                                            confirmPassword: ''
                                        });
                                        setShowAddModal(true);
                                    }}
                                    className="flex items-center gap-2 h-10 px-4 bg-palette-red text-white rounded-[5px] text-[13px] font-black tracking-widest hover:bg-palette-maroon transition-all shadow-lg shadow-palette-red/20 active:scale-95"
                                >
                                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>add</span>
                                    Yayıncı Ekle
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TABLE matches Image 0 */}
                    <div className="flex-1 relative z-10 overflow-x-auto md:overflow-visible scrollbar-thin scrollbar-thumb-palette-tan/10">
                        <table className="w-full text-left border-collapse table-fixed md:table-auto">
                            <thead>
                                <tr className="bg-palette-beige/10 border-b border-palette-tan/10">
                                    <th className="w-12 px-8 py-5">
                                        <input type="checkbox" className="w-4 h-4 rounded-[5px] border-palette-tan/30 text-palette-maroon focus:ring-palette-maroon cursor-pointer" />
                                    </th>
                                    <th className="w-24 px-4 py-5 text-[11px] font-black text-palette-tan uppercase tracking-widest">{t('publishers.table.id')}</th>
                                    <th className="px-4 py-5 text-[11px] font-black text-palette-tan uppercase tracking-widest">{t('publishers.table.info')}</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-palette-tan uppercase tracking-widest text-center">{t('publishers.table.users')}</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-palette-tan uppercase tracking-widest text-center">{t('publishers.table.categories')}</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-palette-tan uppercase tracking-widest text-center">{t('publishers.table.reward')}</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-palette-tan uppercase tracking-widest text-center">{t('publishers.table.posts')}</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-palette-tan uppercase tracking-widest text-center">{t('publishers.table.status')}</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-palette-tan uppercase tracking-widest text-right">{t('publishers.table.created')}</th>
                                    <th className="w-20 px-8 py-5 text-[11px] font-black text-palette-tan uppercase tracking-widest text-right">{t('publishers.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-palette-tan/5 min-h-[400px]">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={10} className="px-8 py-10 opacity-50"><div className="h-4 bg-palette-beige rounded-[5px] w-full"></div></td>
                                        </tr>
                                    ))
                                ) : filteredPublishers.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-8 py-32 text-center text-palette-tan/40 font-bold uppercase tracking-widest text-sm">
                                            {t('publishers.empty_state')}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPublishers.map((pub, idx) => (
                                        <tr key={pub.id} className={`hover:bg-palette-beige/5 transition-all group ${openDropdownId === pub.id ? 'relative z-[100]' : 'relative z-1'}`}>
                                            <td className="px-8 py-6">
                                                <input type="checkbox" className="w-4 h-4 rounded-[5px] border-palette-tan/30 text-palette-maroon focus:ring-palette-maroon cursor-pointer" />
                                            </td>
                                            <td className="px-4 py-6 text-[13px] font-bold text-palette-tan/60">{idx + 2}</td>
                                            <td className="px-4 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 flex-shrink-0 bg-palette-beige rounded-[5px] overflow-hidden border border-palette-tan/10 shadow-sm relative transition-all">
                                                        <img src={pub.avatar_url || `https://picsum.photos/seed/${pub.id}/100`} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-palette-maroon text-[14px] leading-tight group-hover:text-palette-red transition-colors">{pub.full_name || t('publishers.unnamed')}</span>
                                                        <span className="text-[11px] font-bold text-palette-tan/60">@{pub.username || 'username'}</span>
                                                        <span className="text-[10px] font-bold text-palette-tan/40">{pub.email || 'pub@example.com'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="flex flex-wrap items-center justify-center gap-2">
                                                    {pub.assigned_users?.map(u => (
                                                        <div key={u.id} className="group/user flex items-center gap-2 bg-white border border-palette-tan/15 pl-1.5 pr-2 py-1 rounded-[5px] shadow-sm hover:border-palette-red/30 hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-1">
                                                            <div className="w-6 h-6 rounded-[5px] bg-palette-beige/50 border border-palette-tan/20 overflow-hidden flex items-center justify-center">
                                                                <span className="material-symbols-rounded text-[16px] text-palette-tan">person</span>
                                                            </div>
                                                            <div className="flex flex-col items-start leading-none gap-0.5">
                                                                <span className="text-[11px] font-black text-palette-maroon tracking-tight">{u.full_name}</span>
                                                                <span className="text-[10px] font-bold text-palette-tan/50 tracking-tighter">@{u.username}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => onEditUser && onEditUser(u.username)}
                                                                className="ml-1 w-6 h-6 rounded-[5px] flex items-center justify-center text-palette-tan/30 hover:text-palette-red hover:bg-red-50 transition-all active:scale-90"
                                                                title="Kullanıcıyı Düzenle"
                                                            >
                                                                <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>edit</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="flex flex-wrap items-center justify-center gap-1.5">
                                                    {pub.assigned_categories?.map(c => (
                                                        <div key={c.id} className="flex items-center gap-1.5 bg-cyan-50 text-cyan-600 px-2.5 py-1 rounded-[5px] text-[10px] font-black uppercase tracking-widest border border-cyan-100">
                                                            <span>{c.name}</span>
                                                            <button className="text-palette-red hover:scale-110 transition-transform"><span className="material-symbols-rounded" style={{ fontSize: '14px' }}>edit</span></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center text-palette-tan/40">
                                                <div className="flex items-center justify-center">
                                                    <span className="material-symbols-rounded text-emerald-500" style={{ fontSize: '20px' }}>cached</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="flex items-center justify-center gap-1.5 text-palette-tan/60 font-black text-[12px]">
                                                    <span className="material-symbols-rounded text-[16px] opacity-40">description</span>
                                                    <span>{pub.post_count || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-[5px] text-[10px] font-black uppercase tracking-widest">{pub.status}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="text-[11px] font-bold text-palette-tan flex flex-col uppercase">
                                                    <span>{pub.created_at ? new Date(pub.created_at).toLocaleDateString('tr-TR') : 'Yükleniyor...'}</span>
                                                    <span className="text-[9px] text-palette-tan/40 mt-0.5">
                                                        {pub.created_at ? new Date(pub.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => handleEditClick(pub)} className="w-8 h-8 rounded-[5px] flex items-center justify-center text-palette-red hover:bg-red-50 transition-all"><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>edit</span></button>
                                                    <button onClick={() => { setPublisherToDelete(pub); setShowDeleteModal(true); }} className="w-8 h-8 rounded-[5px] flex items-center justify-center text-palette-red hover:bg-red-50 transition-all"><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span></button>
                                                    <div className="relative inline-block text-left" ref={openDropdownId === pub.id ? dropdownRef : null}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === pub.id ? null : pub.id); }}
                                                            className="w-8 h-8 rounded-[5px] flex items-center justify-center text-palette-tan/40 hover:bg-palette-beige hover:text-palette-maroon transition-all active:scale-90"
                                                        >
                                                            <span className="material-symbols-rounded">more_vert</span>
                                                        </button>
                                                        {openDropdownId === pub.id && (
                                                            <div className={`absolute right-0 ${idx >= filteredPublishers.length - 2 && idx > 0 ? 'bottom-full mb-2' : 'top-full mt-1'} w-64 bg-white border border-palette-tan/20 rounded-[5px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[200] py-2 animate-in fade-in zoom-in-95 duration-200`}>
                                                                <button onClick={() => { onEditPublisher(pub.id); setOpenDropdownId(null); }} className="w-full px-5 py-3 text-left text-[13px] font-bold text-palette-maroon hover:bg-palette-beige/30 transition-all flex items-center gap-3">
                                                                    <span className="material-symbols-rounded text-cyan-500" style={{ fontSize: '18px' }}>description</span>
                                                                    {t('publishers.actions.manage_posts')}
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        setOpenDropdownId(null);
                                                                        // Optimistic update
                                                                        const newReward = !pub.reward_system;
                                                                        setPublishers(prev => prev.map(p => p.id === pub.id ? { ...p, reward_system: newReward } : p));

                                                                        try {
                                                                            const { error } = await supabase.from('profiles').update({ reward_system: newReward }).eq('id', pub.id);
                                                                            if (error) {
                                                                                // Revert
                                                                                setPublishers(prev => prev.map(p => p.id === pub.id ? { ...p, reward_system: pub.reward_system } : p));
                                                                                throw error;
                                                                            }
                                                                        } catch (err: any) {
                                                                            setStatusModal({ show: true, type: 'error', message: err.message });
                                                                        }
                                                                    }}
                                                                    className="w-full px-5 py-3 text-left text-[13px] font-bold text-palette-maroon hover:bg-palette-beige/30 transition-all flex items-center gap-3"
                                                                >
                                                                    <span className="material-symbols-rounded text-orange-400" style={{ fontSize: '18px' }}>visibility_off</span>
                                                                    {pub.reward_system ? 'Ödülü Devre Dışı Bırak' : 'Ödülü Aktifleştir'}
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        setOpenDropdownId(null);
                                                                        // Optimistic update
                                                                        const newStatus = pub.status === 'Aktif' ? 'Engelli' : 'Aktif';
                                                                        setPublishers(prev => prev.map(p => p.id === pub.id ? { ...p, status: newStatus } : p));

                                                                        try {
                                                                            const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', pub.id);
                                                                            if (error) {
                                                                                // Revert
                                                                                setPublishers(prev => prev.map(p => p.id === pub.id ? { ...p, status: pub.status } : p));
                                                                                throw error;
                                                                            }
                                                                        } catch (err: any) {
                                                                            setStatusModal({ show: true, type: 'error', message: err.message });
                                                                        }
                                                                    }}
                                                                    className="w-full px-5 py-3 text-left text-[13px] font-bold text-palette-maroon hover:bg-palette-beige/30 transition-all flex items-center gap-3"
                                                                >
                                                                    <span className="material-symbols-rounded text-orange-400" style={{ fontSize: '18px' }}>person_off</span>
                                                                    {pub.status === 'Aktif' ? 'Yayıcıyı Durdur' : 'Yayıncıyı Başlat'}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 border-t border-palette-tan/10 bg-palette-beige/5 flex items-center justify-between font-black text-[11px] tracking-widest text-palette-tan/40 uppercase">
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
                                className="w-8 h-8 flex items-center justify-center rounded-[5px] border border-palette-tan/10 hover:bg-white hover:text-palette-maroon transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>chevron_left</span>
                            </button>

                            {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }).map((_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-[5px] transition-all ${currentPage === pageNum ? 'bg-palette-red text-white shadow-lg' : 'border border-palette-tan/10 text-palette-tan hover:bg-white hover:text-palette-maroon'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage >= Math.ceil(totalCount / pageSize) || loading}
                                className="w-8 h-8 flex items-center justify-center rounded-[5px] border border-palette-tan/10 hover:bg-white hover:text-palette-maroon transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div >

            {/* MODALS RENDERED OUTSIDE FOR PERFECT BLUR */}
            {
                (showAddModal || showEditModal) && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-hidden">
                        <div className="absolute inset-0 bg-palette-maroon/90 backdrop-blur-md animate-in fade-in" onClick={() => !saving && (showAddModal ? handleCloseAddModal() : handleCloseEditModal())} />

                        <div className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 flex flex-col">

                            <div className="px-8 py-6 border-b border-palette-tan/15 flex items-center justify-between bg-palette-beige/10">
                                <h3 className="text-lg font-black text-palette-maroon tracking-tight flex items-center gap-2">
                                    <div className="p-1.5 bg-palette-red rounded-[5px] text-white shadow-md flex items-center justify-center">
                                        {showEditModal ? <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>edit_square</span> : <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>add</span>}
                                    </div>
                                    {showEditModal ? 'Yayıncıyı Düzenle' : 'Yayıncı Ekle'}
                                </h3>
                                <button
                                    onClick={() => showAddModal ? handleCloseAddModal() : handleCloseEditModal()}
                                    className="p-1.5 text-palette-tan/40 hover:text-palette-red transition-colors flex items-center justify-center"
                                >
                                    <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>close</span>
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-palette-tan/10 space-y-5">

                                {/* FIELDS matches Image 2 & 3 */}
                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">{t('publishers.form.name')} <span className="text-palette-red">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={e => {
                                                setFormData({ ...formData, full_name: e.target.value });
                                                if (formErrors.full_name) setFormErrors({ ...formErrors, full_name: '' });
                                            }}
                                            placeholder="Yayıncı Adı"
                                            className={`${inputClasses} ${formErrors.full_name ? 'border-palette-red text-palette-red' : ''}`}
                                        />
                                        {formErrors.full_name && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.full_name}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">{t('publishers.form.username')} <span className="text-palette-red">*</span></label>
                                            <input
                                                type="text"
                                                value={formData.username}
                                                onChange={e => {
                                                    setFormData({ ...formData, username: e.target.value.toLowerCase().replace(' ', '_') });
                                                    if (formErrors.username) setFormErrors({ ...formErrors, username: '' });
                                                }}
                                                placeholder="Kullanıcı Adı"
                                                className={`${inputClasses} ${formErrors.username ? 'border-palette-red text-palette-red' : ''}`}
                                            />
                                            {formErrors.username && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.username}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">{t('publishers.form.email')} <span className="text-palette-red">*</span></label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={e => {
                                                    setFormData({ ...formData, email: e.target.value });
                                                    if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                                                }}
                                                placeholder="yayinci@ornek.com"
                                                className={`${inputClasses} ${formErrors.email ? 'border-palette-red text-palette-red' : ''}`}
                                            />
                                            {formErrors.email && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.email}</p>}
                                        </div>
                                    </div>

                                    {showAddModal && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">Şifre <span className="text-palette-red">*</span></label>
                                                <input
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={e => {
                                                        setFormData({ ...formData, password: e.target.value });
                                                        if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                                                    }}
                                                    placeholder="••••••••"
                                                    className={`${inputClasses} ${formErrors.password ? 'border-palette-red text-palette-red' : ''}`}
                                                />
                                                {formErrors.password && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.password}</p>}
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">Şifre Onayla <span className="text-palette-red">*</span></label>
                                                <input
                                                    type="password"
                                                    value={formData.confirmPassword}
                                                    onChange={e => {
                                                        setFormData({ ...formData, confirmPassword: e.target.value });
                                                        if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: '' });
                                                    }}
                                                    placeholder="••••••••"
                                                    className={`${inputClasses} ${formErrors.confirmPassword ? 'border-palette-red text-palette-red' : ''}`}
                                                />
                                                {formErrors.confirmPassword && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.confirmPassword}</p>}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">{t('publishers.form.phone')}</label>
                                            <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+90 555 000 00 00" className={inputClasses} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">{t('publishers.form.website')}</label>
                                            <input type="text" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="https://ornek.com" className={inputClasses} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">{t('publishers.form.address')}</label>
                                            <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Yayıncı Adresi" className={inputClasses} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">{t('publishers.form.expertise')}</label>
                                            <input type="text" value={formData.expertise} onChange={e => setFormData({ ...formData, expertise: e.target.value })} placeholder="Teknoloji, Haber, Spor..." className={inputClasses} />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 w-1/2">
                                        <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">{t('publishers.form.foundation')}</label>
                                        <div className="relative group">
                                            <input type="text" value={formData.foundation_date} onChange={e => setFormData({ ...formData, foundation_date: e.target.value })} placeholder="gg.aa.yyyy" className={inputClasses} />
                                            <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/40" style={{ fontSize: '18px' }}>calendar_month</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">{t('publishers.form.description')}</label>
                                        <textarea rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Yayıncı açıklaması..." className="w-full p-4 bg-palette-beige/30 border border-palette-tan/10 rounded-[5px] text-sm font-bold text-palette-maroon outline-none focus:bg-white focus:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all resize-none" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">{t('publishers.form.meta_title')}</label>
                                            <input type="text" value={formData.meta_title} onChange={e => setFormData({ ...formData, meta_title: e.target.value })} placeholder="Meta Başlık" className={inputClasses} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">{t('publishers.form.meta_keywords')}</label>
                                            <input type="text" value={formData.meta_keywords} onChange={e => setFormData({ ...formData, meta_keywords: e.target.value })} placeholder="anahtar kelime1, anahtar kelime2" className={inputClasses} />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">{t('publishers.form.meta_desc')}</label>
                                        <textarea rows={2} value={formData.meta_description} onChange={e => setFormData({ ...formData, meta_description: e.target.value })} placeholder="Meta Açıklama" className="w-full p-4 bg-palette-beige/30 border border-palette-tan/10 rounded-[5px] text-sm font-bold text-palette-maroon outline-none focus:bg-white focus:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all resize-none" />
                                    </div>

                                    <div className="space-y-1.5 w-1/2">
                                        <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">{t('publishers.form.canonical')}</label>
                                        <input type="text" value={formData.canonical_url} onChange={e => setFormData({ ...formData, canonical_url: e.target.value })} placeholder="Kanonik URL" className={inputClasses} />
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-6 border-t border-palette-beige bg-palette-beige/10 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => showAddModal ? handleCloseAddModal() : handleCloseEditModal()}
                                    className="px-5 py-2.5 font-black text-[11px] text-palette-tan/40 hover:text-palette-maroon tracking-widest uppercase transition-colors"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={async () => {
                                        const errors: Record<string, string> = {};
                                        if (!formData.full_name) errors.full_name = 'Alan zorunludur';
                                        if (!formData.username) errors.username = 'Alan zorunludur';
                                        if (!formData.email) errors.email = 'Alan zorunludur';

                                        if (showAddModal) {
                                            if (!formData.password) errors.password = 'Alan zorunludur';
                                            if (!formData.confirmPassword) errors.confirmPassword = 'Alan zorunludur';

                                            if (!errors.password && !errors.confirmPassword && formData.password !== formData.confirmPassword) {
                                                errors.confirmPassword = 'Şifreler uyuşmuyor.';
                                            }
                                        }

                                        if (Object.keys(errors).length > 0) {
                                            setFormErrors(errors);
                                            return;
                                        }

                                        setFormErrors({});
                                        setSaving(true);
                                        try {
                                            // Uniqueness check
                                            const query = supabase
                                                .from('profiles')
                                                .select('username, email')
                                                .or(`username.eq.${formData.username},email.eq.${formData.email}`);

                                            if (showEditModal && formData.id) {
                                                query.neq('id', formData.id);
                                            }

                                            const { data: conflicts } = await query;

                                            if (conflicts && conflicts.length > 0) {
                                                const errors: Record<string, string> = {};
                                                conflicts.forEach(c => {
                                                    if (c.username?.toLowerCase() === formData.username?.toLowerCase()) errors.username = 'Kullanıcı adı zaten kullanımda';
                                                    if (c.email?.toLowerCase() === formData.email?.toLowerCase()) errors.email = 'E-posta zaten kullanımda';
                                                });
                                                if (Object.keys(errors).length > 0) {
                                                    setFormErrors(errors);
                                                    setSaving(false);
                                                    return;
                                                }
                                            }

                                            const payload = {
                                                full_name: formData.full_name,
                                                username: formData.username,
                                                email: formData.email,
                                                phone: formData.phone,
                                                website: formData.website,
                                                address: formData.address,
                                                expertise: formData.expertise,
                                                foundation_date: formData.foundation_date,
                                                about_me: formData.description,
                                                meta_title: formData.meta_title,
                                                meta_keywords: formData.meta_keywords,
                                                meta_description: formData.meta_description,
                                                canonical_url: formData.canonical_url,
                                                role: 'publisher', // Ensure it is publisher if adding new
                                            };

                                            if (showEditModal && formData.id) {
                                                const { error } = await supabase.from('profiles').update(payload).eq('id', formData.id);
                                                if (error) throw error;
                                            } else {
                                                if (!formData.password || formData.password !== formData.confirmPassword) {
                                                    setStatusModal({ show: true, type: 'error', message: 'Şifreler uyuşmuyor veya boş.' });
                                                    setSaving(false);
                                                    return;
                                                }

                                                const { data: authData, error: authError } = await supabase.auth.signUp({
                                                    email: formData.email!,
                                                    password: formData.password!,
                                                    options: {
                                                        data: {
                                                            full_name: formData.full_name,
                                                            username: formData.username
                                                        }
                                                    }
                                                });

                                                if (authError) throw authError;

                                                if (authData.user) {
                                                    const { error: profileError } = await supabase
                                                        .from('profiles')
                                                        .update(payload)
                                                        .eq('id', authData.user.id);

                                                    if (profileError) throw profileError;
                                                }
                                            }

                                            // Local update for edit
                                            if (showEditModal && formData.id) {
                                                setPublishers(prev => prev.map(p => p.id === formData.id ? {
                                                    ...p,
                                                    ...formData,
                                                    // Preserve relations
                                                    assigned_users: p.assigned_users,
                                                    assigned_categories: p.assigned_categories,
                                                    post_count: p.post_count
                                                } : p));
                                            } else {
                                                // For Add, we still fetch to be safe about triggers/IDs
                                                fetchData();
                                            }

                                            handleCloseAddModal();
                                            handleCloseEditModal();
                                        } catch (err: any) {
                                            setStatusModal({ show: true, type: 'error', message: err.message });
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                    disabled={saving}
                                    className="flex items-center justify-center gap-2 px-6 py-2 bg-palette-tan text-white rounded-[5px] font-black text-[13px] tracking-widest hover:bg-palette-maroon shadow-xl active:scale-95 disabled:opacity-40 transition-all uppercase"
                                >
                                    {saving ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>save</span>}
                                    <span>{showEditModal ? 'Kaydet' : 'Ekle'}</span>
                                </button>
                            </div>

                        </div>
                    </div>
                )
            }

            {/* DELETE MODAL matches Image 4 standard */}
            {
                showDeleteModal && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-md animate-in fade-in" onClick={() => !saving && handleCloseDeleteModal()} />
                        <div className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 p-8 text-center">
                            <div className="w-14 h-14 bg-red-50 text-palette-red rounded-[5px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>delete</span>
                            </div>
                            <h3 className="text-xl font-black text-palette-maroon tracking-tight mb-3 uppercase">{t('publishers.delete_title')}</h3>
                            <p className="text-[13px] font-bold text-palette-tan/60 leading-relaxed mb-8">
                                <span className="text-palette-maroon">"{publisherToDelete?.full_name}"</span> {t('publishers.delete_confirm')}
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleCloseDeleteModal}
                                    className="flex-1 h-10 bg-palette-beige/30 text-palette-tan rounded-[5px] font-black text-[11px] tracking-widest hover:bg-palette-beige/50 transition-all uppercase"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={saving}
                                    className="flex-1 h-10 bg-palette-red text-white rounded-[5px] font-black text-[13px] tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-palette-red/20 flex items-center justify-center gap-2"
                                >
                                    {saving ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>}
                                    <span className="mt-0.5">{t('common.delete_kalici')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* SUCCESS/ERROR MODAL matches Image 4 standard */}
            {
                statusModal.show && (
                    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-palette-maroon/20 backdrop-blur-[2px] animate-in fade-in" onClick={handleCloseStatusModal} />
                        <div className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-xs overflow-hidden animate-in slide-in-from-bottom-4 border border-palette-tan/15 p-8 text-center">
                            <div className={`w-14 h-14 rounded-[5px] flex items-center justify-center mx-auto mb-6 ${statusModal.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                {statusModal.type === 'error' ? <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>close</span> : <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>check_circle</span>}
                            </div>
                            <p className="text-[14px] font-black text-palette-maroon mb-8 leading-relaxed uppercase">{statusModal.message}</p>
                            <button
                                onClick={handleCloseStatusModal}
                                className="w-full py-2.5 bg-palette-tan text-white rounded-[5px] font-black text-[13px] tracking-widest hover:bg-palette-maroon transition-all shadow-lg active:scale-95 uppercase"
                            >
                                TAMAM
                            </button>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default PublisherManagement;
