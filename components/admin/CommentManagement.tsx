
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface CommentRecord {
    id: string;
    content: string;
    post_id: string;
    user_id: string;
    status: string;
    created_at: string;
    updated_at: string;
    likes_count: number;
    replies_count: number;
    is_pinned?: boolean;
    post_title?: string;
    user_name?: string;
    user_avatar?: string;
}

// 2025 Senkronizasyon Mimari: Memoized Row for zero-lag rendering
const CommentRow = React.memo(({
    comment,
    index,
    t,
    onApprove,
    onReject,
    onDelete,
    onTogglePinned,
    onReply,
    openDropdownId,
    setOpenDropdownId,
    dropdownRef,
    isLast,
    isSelected,
    onSelectRow
}: {
    comment: CommentRecord;
    index: number;
    t: any;
    onApprove: (comment: CommentRecord) => void;
    onReject: (comment: CommentRecord) => void;
    onDelete: (comment: CommentRecord) => void;
    onTogglePinned: (comment: CommentRecord) => void;
    onReply: (comment: CommentRecord) => void;
    openDropdownId: string | null;
    setOpenDropdownId: (id: string | null) => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
    isLast: boolean;
    isSelected: boolean;
    onSelectRow: (id: string) => void;
}) => {
    return (
        <tr className={`hover:bg-palette-beige/5 transition-all group h-[92px] ${openDropdownId === comment.id ? 'relative z-[100]' : 'relative z-1'}`}>
            <td className="px-4 py-0 align-middle">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelectRow(comment.id)}
                    className="w-4 h-4 rounded-[5px] border-palette-tan/30 text-palette-maroon focus:ring-palette-maroon cursor-pointer"
                />
            </td>
            <td className="px-2 py-0 align-middle text-[13px] font-bold text-palette-tan/60">{comment.id.slice(0, 8)}</td>
            <td className="px-2 py-0 align-middle">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-[50px] h-[50px] flex-shrink-0 bg-palette-beige rounded-[5px] overflow-hidden border border-palette-tan/10 shadow-sm relative group-hover:shadow-md transition-all">
                        {comment.user_avatar ? (
                            <img src={comment.user_avatar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-palette-tan/20">
                                <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>person</span>
                            </div>
                        )}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            {comment.is_pinned && (
                                <span className="material-symbols-rounded text-amber-500 fill-current flex-shrink-0" style={{ fontSize: '18px' }}>push_pin</span>
                            )}
                            <p className="font-bold text-palette-maroon text-[14px] leading-tight group-hover:text-palette-red transition-colors whitespace-normal break-words line-clamp-2">
                                {comment.content}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-palette-tan/60">
                                {comment.user_name || 'Anonim Kullanıcı'}
                            </span>
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-3 py-0 align-middle text-center overflow-hidden">
                <p className="text-[12px] font-bold text-palette-tan/70 truncate max-w-[200px]">
                    {comment.post_title || '-'}
                </p>
            </td>
            <td className="px-3 py-0 align-middle text-center">
                <span className={`text-[10px] font-black px-2 py-1 rounded-[5px] uppercase tracking-widest inline-block ${comment.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : comment.status === 'rejected'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-palette-tan/10 text-palette-tan border border-palette-tan/10'
                    }`}>
                    {comment.status === 'approved' ? 'Onaylandı' : comment.status === 'rejected' ? 'Reddedildi' : 'Beklemede'}
                </span>
            </td>
            <td className="px-3 py-0 align-middle text-center">
                <div className="flex flex-col items-center">
                    <span className="text-[14px] font-black text-palette-maroon">{comment.likes_count || 0}</span>
                </div>
            </td>
            <td className="px-3 py-0 align-middle text-center">
                <div className="flex flex-col items-center">
                    <span className="text-[14px] font-black text-palette-maroon">{comment.replies_count || 0}</span>
                </div>
            </td>
            <td className="px-4 py-0 align-middle text-right">
                <div className="text-[11px] font-bold text-palette-tan flex flex-col items-end">
                    <span>{new Date(comment.created_at).toLocaleDateString('tr-TR')}</span>
                    <span className="text-[9px] text-palette-tan/40 opacity-70 mt-0.5 uppercase tracking-tighter">{new Date(comment.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </td>
            <td className="px-4 py-0 align-middle text-right">
                <div className="relative inline-block text-left" ref={openDropdownId === comment.id ? (dropdownRef as any) : null}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === comment.id ? null : comment.id);
                        }}
                        className="w-10 h-10 rounded-[5px] flex items-center justify-center text-palette-tan/40 hover:bg-palette-beige hover:text-palette-maroon transition-all active:scale-90"
                    >
                        <span className="material-symbols-rounded">more_vert</span>
                    </button>

                    {openDropdownId === comment.id && (
                        <div className={`absolute right-0 ${isLast && index > 0 ? 'bottom-full mb-2' : 'top-full mt-2'} w-48 bg-white border border-palette-tan/20 rounded-[5px] shadow-2xl z-[100] py-2 animate-in fade-in zoom-in-95 duration-200`}>
                            <button
                                onClick={() => {
                                    onApprove(comment);
                                    setOpenDropdownId(null);
                                }}
                                className="w-full px-5 py-3 text-left text-[13px] font-bold text-palette-maroon hover:bg-palette-beige/30 transition-all flex items-center gap-3 group/item"
                            >
                                <span className="material-symbols-rounded text-emerald-500 group-hover/item:text-emerald-600 transition-colors" style={{ fontSize: '18px' }}>check_circle</span>
                                Onayla
                            </button>
                            <button
                                onClick={() => {
                                    onReject(comment);
                                    setOpenDropdownId(null);
                                }}
                                className="w-full px-5 py-3 text-left text-[13px] font-bold text-palette-maroon hover:bg-palette-beige/30 transition-all flex items-center gap-3 group/item"
                            >
                                <span className="material-symbols-rounded text-orange-500 group-hover/item:text-orange-600 transition-colors" style={{ fontSize: '18px' }}>cancel</span>
                                Reddet
                            </button>
                            <button
                                onClick={() => {
                                    onTogglePinned(comment);
                                    setOpenDropdownId(null);
                                }}
                                className="w-full px-5 py-3 text-left text-[13px] font-bold text-palette-maroon hover:bg-palette-beige/30 transition-all flex items-center gap-3 group/item"
                            >
                                <span className="material-symbols-rounded text-palette-tan group-hover/item:text-palette-maroon transition-colors" style={{ fontSize: '18px' }}>
                                    {comment.is_pinned ? 'keep_off' : 'push_pin'}
                                </span>
                                {comment.is_pinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
                            </button>
                            <button
                                onClick={() => {
                                    onReply(comment);
                                    setOpenDropdownId(null);
                                }}
                                className="w-full px-5 py-3 text-left text-[13px] font-bold text-palette-maroon hover:bg-palette-beige/30 transition-all flex items-center gap-3 group/item"
                            >
                                <span className="material-symbols-rounded text-cyan-500 group-hover/item:text-cyan-600 transition-colors" style={{ fontSize: '18px' }}>reply</span>
                                Yanıtla
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(comment);
                                    setOpenDropdownId(null);
                                }}
                                className="w-full px-5 py-3 text-left text-[13px] font-bold text-red-600 hover:bg-red-50 transition-all flex items-center gap-3 group/item"
                            >
                                <span className="material-symbols-rounded text-red-400 group-hover/item:text-red-600 transition-colors" style={{ fontSize: '18px' }}>delete</span>
                                Sil
                            </button>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
});

const CommentManagement: React.FC = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [comments, setComments] = useState<CommentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [filters, setFilters] = useState({
        status: 'Tümü',
        post: 'Tümü',
        user: 'Tümü'
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<CommentRecord | null>(null);
    const [commentToReply, setCommentToReply] = useState<CommentRecord | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [statsData, setStatsData] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        total_change: '+0%',
        approved_change: '+0%',
        pending_change: '+0%',
        rejected_change: '+0%'
    });
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Optimized Debounce (300ms - Gecikmesiz Arama Hissi)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchComments();
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

    const fetchComments = async () => {
        try {
            setLoading(true);

            let query = supabase
                .from('admin_comment_details')
                .select('*', { count: 'exact' });

            // Arama Filtresi
            if (debouncedSearchTerm) {
                query = query.or(`content.ilike.%${debouncedSearchTerm}%,post_title.ilike.%${debouncedSearchTerm}%,user_name.ilike.%${debouncedSearchTerm}%`);
            }

            // Durum Filtresi
            if (filters.status !== 'Tümü') {
                query = query.eq('status', filters.status);
            }

            // Sayfalama
            const from = (currentPage - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);

            // Sıralama (Sabitlenmişler en üstte, sonra en yeni)
            query = query.order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false });

            const { data, error, count } = await query;

            if (error) throw error;

            setComments(data || []);
            setTotalCount(count || 0);

            // İstatistikleri çek
            const { data: stats, error: statsError } = await supabase.rpc('get_admin_comment_stats');
            if (!statsError && stats) {
                setStatsData(stats);
            }

        } catch (err: any) {
            console.error("Comment fetch error:", err);
            showToast('Veriler yüklenirken hata oluştu', 'error');
            setComments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (comment: CommentRecord) => {
        try {
            const { error } = await supabase
                .from('comments')
                .update({ status: 'approved' })
                .eq('id', comment.id);

            if (error) throw error;

            setComments(comments.map(c => c.id === comment.id ? { ...c, status: 'approved' } : c));
            showToast('Yorum onaylandı', 'success');

            // Stats'ı güncelle
            const { data: stats } = await supabase.rpc('get_admin_comment_stats');
            if (stats) setStatsData(stats);
        } catch (err: any) {
            showToast('Hata: ' + err.message, 'error');
        }
    };

    const handleReject = async (comment: CommentRecord) => {
        try {
            const { error } = await supabase
                .from('comments')
                .update({ status: 'rejected' })
                .eq('id', comment.id);

            if (error) throw error;

            setComments(comments.map(c => c.id === comment.id ? { ...c, status: 'rejected' } : c));
            showToast('Yorum reddedildi', 'success');

            // Stats'ı güncelle
            const { data: stats } = await supabase.rpc('get_admin_comment_stats');
            if (stats) setStatsData(stats);
        } catch (err: any) {
            showToast('Hata: ' + err.message, 'error');
        }
    };

    const handleTogglePinned = async (comment: CommentRecord) => {
        const newPinned = !comment.is_pinned;
        try {
            const { error } = await supabase
                .from('comments')
                .update({ is_pinned: newPinned })
                .eq('id', comment.id);

            if (error) throw error;

            const updatedComments = comments.map(c => c.id === comment.id ? { ...c, is_pinned: newPinned } : c);
            const sortedComments = [...updatedComments].sort((a, b) => {
                if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            setComments(sortedComments);
            showToast(newPinned ? 'Yorum sabitlendi' : 'Sabitleme kaldırıldı', 'success');
        } catch (err: any) {
            showToast('Hata: ' + err.message, 'error');
        }
    };

    const handleDelete = async () => {
        if (!commentToDelete) return;

        try {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentToDelete.id);

            if (error) throw error;

            setComments(comments.filter(c => c.id !== commentToDelete.id));
            setCommentToDelete(null);
            showToast('Yorum başarıyla silindi', 'success');

            // Stats'ı güncelle
            const { data: stats } = await supabase.rpc('get_admin_comment_stats');
            if (stats) setStatsData(stats);
        } catch (err: any) {
            showToast('Hata: ' + err.message, 'error');
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        try {
            const { error } = await supabase
                .from('comments')
                .delete()
                .in('id', selectedIds);

            if (error) throw error;

            setComments(comments.filter(c => !selectedIds.includes(c.id)));
            setSelectedIds([]);
            showToast(`${selectedIds.length} yorum başarıyla silindi`, 'success');

            // Stats'ı güncelle
            const { data: stats } = await supabase.rpc('get_admin_comment_stats');
            if (stats) setStatsData(stats);
        } catch (err: any) {
            showToast('Hata: ' + err.message, 'error');
        } finally {
            setShowBulkDeleteModal(false);
        }
    };

    const handleReply = (comment: CommentRecord) => {
        setCommentToReply(comment);
        setReplyContent('');
        setShowReplyModal(true);
    };

    const handleSendReply = async () => {
        if (!commentToReply || !replyContent.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Oturum bulunamadı");

            const { error } = await supabase
                .from('comments')
                .insert([{
                    post_id: commentToReply.post_id,
                    user_id: user.id,
                    parent_id: commentToReply.id,
                    content: replyContent,
                    status: 'approved'
                }]);

            if (error) throw error;

            showToast('Yanıt başarıyla gönderildi', 'success');
            setShowReplyModal(false);
            setCommentToReply(null);
            setReplyContent('');
            fetchComments();
        } catch (err: any) {
            showToast('Hata: ' + err.message, 'error');
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(comments.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    useEffect(() => {
        setSelectedIds([]);
    }, [comments]);

    const stats = useMemo(() => {
        return [
            { label: 'Toplam Yorumlar', value: statsData.total, change: statsData.total_change, desc: 'Tüm Zamanlar', icon: 'comment', color: 'bg-red-50 text-red-600', iconBg: 'bg-red-100' },
            { label: 'Onaylanan', value: statsData.approved, change: statsData.approved_change, desc: 'Haftalık Analiz', icon: 'check_circle', color: 'bg-green-50 text-green-600', iconBg: 'bg-green-100' },
            { label: 'Bekleyen', value: statsData.pending, change: statsData.pending_change, desc: 'Onay Bekliyor', icon: 'schedule', color: 'bg-orange-50 text-orange-600', iconBg: 'bg-orange-100' },
            { label: 'Reddedilen', value: statsData.rejected, change: statsData.rejected_change, desc: 'Haftalık Analiz', icon: 'cancel', color: 'bg-red-50 text-red-600', iconBg: 'bg-red-100' },
        ];
    }, [statsData]);

    return (
        <>
            <div className="space-y-6 animate-in fade-in duration-700 pb-20">
                {/* STATS CARDS */}
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
                    {/* HEADER / FILTERS */}
                    <div className="p-8 border-b border-palette-tan/10 space-y-8">
                        <h2 className="text-xl font-black text-palette-maroon uppercase tracking-tight">Yorum Yönetimi</h2>

                        {/* FILTER GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                { label: 'Durum', key: 'status' },
                                { label: 'Haber', key: 'post' },
                                { label: 'Kullanıcı', key: 'user' },
                            ].map((filter) => (
                                <div key={filter.key} className="space-y-1.5">
                                    <label className="text-[11px] font-black text-palette-tan/40 uppercase tracking-widest block">{filter.label}</label>
                                    <div className="relative group/select">
                                        <select
                                            className="w-full h-10 px-3 bg-palette-beige/20 border border-palette-tan/15 rounded-[5px] text-[13px] font-bold text-palette-maroon appearance-none outline-none focus:bg-white focus:border-palette-maroon transition-all cursor-pointer"
                                            value={(filters as any)[filter.key]}
                                            onChange={(e) => setFilters({ ...filters, [filter.key]: e.target.value })}
                                        >
                                            <option value="Tümü">Tümü</option>
                                            {filter.key === 'status' && (
                                                <>
                                                    <option value="approved">Onaylandı</option>
                                                    <option value="pending">Beklemede</option>
                                                    <option value="rejected">Reddedildi</option>
                                                </>
                                            )}
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
                                            className="h-10 px-4 pr-10 bg-palette-beige/20 border border-palette-tan/15 rounded-[5px] text-[13px] font-black text-palette-maroon appearance-none outline-none focus:bg-white focus:border-palette-maroon transition-all cursor-pointer min-w-[70px]"
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
                                            className="flex items-center justify-center gap-1 px-3 py-1 bg-red-50 text-palette-red border border-palette-red/10 rounded-[5px] text-[10px] font-black tracking-tight hover:bg-palette-red hover:text-white transition-all animate-in fade-in slide-in-from-top-1 whitespace-nowrap shadow-sm"
                                        >
                                            <span className="material-symbols-rounded" style={{ fontSize: '13px' }}>delete_sweep</span>
                                            Seçilenleri Sil ({selectedIds.length})
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative flex-1 md:flex-none">
                                    <input
                                        type="text"
                                        placeholder="Yorum Ara..."
                                        className="w-full md:w-[280px] h-10 pl-4 pr-10 bg-white border border-palette-tan/15 rounded-[5px] text-[13px] font-bold text-palette-maroon outline-none focus:border-palette-maroon focus:ring-4 focus:ring-palette-maroon/5 transition-all shadow-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-palette-tan/40" style={{ fontSize: '18px' }}>search</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TABLE SECTION */}
                    <div className="flex-1 relative z-10">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr className="bg-palette-beige/10 border-b border-palette-tan/10 h-[60px]">
                                    <th className="w-[50px] px-4 py-0 align-middle">
                                        <input
                                            type="checkbox"
                                            checked={comments.length > 0 && selectedIds.length === comments.length}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded-[5px] border-palette-tan/30 text-palette-maroon focus:ring-palette-maroon cursor-pointer"
                                        />
                                    </th>
                                    <th className="w-[80px] px-2 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest">ID</th>
                                    <th className="px-2 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest">Yorum</th>
                                    <th className="w-[200px] px-3 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">Haber</th>
                                    <th className="w-[120px] px-3 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">Durum</th>
                                    <th className="w-[80px] px-3 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">Beğeni</th>
                                    <th className="w-[80px] px-3 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">Yanıt</th>
                                    <th className="w-[110px] px-4 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest text-right">Tarih</th>
                                    <th className="w-[80px] px-4 py-0 align-middle text-[12px] font-black text-palette-tan uppercase tracking-widest text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-palette-tan/5 transition-opacity duration-200" style={{ opacity: loading ? 0.7 : 1 }}>
                                {loading && comments.length === 0 ? (
                                    Array(pageSize).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse h-[92px]">
                                            <td className="px-4 py-0 align-middle"><div className="w-4 h-4 bg-palette-beige rounded-[5px]" /></td>
                                            <td className="px-2 py-0 align-middle"><div className="h-4 bg-palette-beige rounded-[5px] w-12" /></td>
                                            <td className="px-2 py-0 align-middle">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-[50px] h-[50px] bg-palette-beige rounded-[5px] flex-shrink-0" />
                                                    <div className="space-y-2 flex-1">
                                                        <div className="h-4 bg-palette-beige rounded-[5px] w-3/4" />
                                                        <div className="h-3 bg-palette-beige rounded-[5px] w-1/4 opacity-50" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-0 align-middle"><div className="h-4 bg-palette-beige rounded-[5px] w-32 mx-auto" /></td>
                                            <td className="px-3 py-0 align-middle"><div className="h-6 bg-palette-beige rounded-[5px] w-20 mx-auto" /></td>
                                            <td className="px-3 py-0 align-middle"><div className="h-8 bg-palette-beige rounded-[5px] w-12 mx-auto" /></td>
                                            <td className="px-3 py-0 align-middle"><div className="h-8 bg-palette-beige rounded-[5px] w-12 mx-auto" /></td>
                                            <td className="px-4 py-0 align-middle"><div className="h-8 bg-palette-beige rounded-[5px] w-24 ml-auto" /></td>
                                            <td className="px-4 py-0 align-middle"><div className="w-10 h-10 bg-palette-beige rounded-[5px] ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : comments.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-8 py-32 text-center text-palette-tan/40 font-bold uppercase tracking-widest text-sm h-[400px]">
                                            Yorum Bulunamadı
                                        </td>
                                    </tr>
                                ) : (
                                    comments.map((comment, index) => (
                                        <CommentRow
                                            key={comment.id}
                                            comment={comment}
                                            index={index}
                                            t={t}
                                            onApprove={handleApprove}
                                            onReject={handleReject}
                                            onDelete={(c) => { setCommentToDelete(c); setShowDeleteModal(true); }}
                                            onTogglePinned={handleTogglePinned}
                                            onReply={handleReply}
                                            openDropdownId={openDropdownId}
                                            setOpenDropdownId={setOpenDropdownId}
                                            dropdownRef={dropdownRef}
                                            isLast={index >= comments.length - 2}
                                            isSelected={selectedIds.includes(comment.id)}
                                            onSelectRow={handleSelectRow}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 border-t border-palette-tan/10 bg-palette-beige/5 flex items-center justify-between font-black text-[11px] tracking-widest text-palette-tan/40 uppercase relative z-0">
                        <span>
                            Gösterilen {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} / {totalCount} sonuç
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || loading}
                                className="w-8 h-8 flex items-center justify-center rounded-[5px] border border-palette-tan/15 text-palette-tan hover:bg-white hover:text-palette-maroon transition-all disabled:opacity-30"
                            >
                                <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>chevron_left</span>
                            </button>

                            {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }).map((_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-[5px] transition-all ${currentPage === pageNum ? 'bg-palette-red text-white shadow-lg shadow-palette-red/20' : 'border border-palette-tan/15 text-palette-tan hover:bg-white hover:text-palette-maroon'}`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}

                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage >= Math.ceil(totalCount / pageSize) || loading}
                                className="w-8 h-8 flex items-center justify-center rounded-[5px] border border-palette-tan/15 text-palette-tan hover:bg-white hover:text-palette-maroon transition-all disabled:opacity-30"
                            >
                                <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-md animate-in fade-in" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 p-8 text-center">
                        <div className="w-14 h-14 bg-red-50 text-palette-red rounded-[5px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>delete</span>
                        </div>
                        <h3 className="text-xl font-black text-palette-maroon tracking-tight mb-3 uppercase">Yorumu Sil</h3>
                        <p className="text-[13px] font-bold text-palette-tan/60 leading-relaxed mb-8">
                            Bu yorumu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 h-10 bg-palette-beige/30 text-palette-tan rounded-[5px] font-black text-[11px] tracking-widest hover:bg-palette-beige/50 transition-all uppercase"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 h-10 bg-palette-red text-white rounded-[5px] font-black text-[13px] tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-palette-red/20 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span>
                                <span className="mt-0.5">SİL</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BULK DELETE MODAL */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-md animate-in fade-in" onClick={() => setShowBulkDeleteModal(false)} />
                    <div className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 p-8 text-center">
                        <div className="w-14 h-14 bg-red-50 text-palette-red rounded-[5px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>delete_sweep</span>
                        </div>
                        <h3 className="text-xl font-black text-palette-maroon tracking-tight mb-3 uppercase">Toplu Silme</h3>
                        <p className="text-[13px] font-bold text-palette-tan/60 leading-relaxed mb-8">
                            {selectedIds.length} yorumu silmek istediğinize emin misiniz?
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowBulkDeleteModal(false)}
                                className="flex-1 h-10 bg-palette-beige/30 text-palette-tan rounded-[5px] font-black text-[11px] tracking-widest hover:bg-palette-beige/50 transition-all uppercase"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="flex-1 h-10 bg-palette-red text-white rounded-[5px] font-black text-[13px] tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-palette-red/20 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete_sweep</span>
                                <span className="mt-0.5">TOPLU SİL</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* REPLY MODAL */}
            {showReplyModal && commentToReply && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-md animate-in fade-in" onClick={() => setShowReplyModal(false)} />
                    <div className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-[5px] flex items-center justify-center shadow-inner">
                                <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>reply</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-palette-maroon tracking-tight uppercase">Yoruma Yanıt</h3>
                                <p className="text-[11px] font-bold text-palette-tan/60">{commentToReply.user_name}</p>
                            </div>
                        </div>

                        <div className="bg-palette-beige/20 p-4 rounded-[5px] mb-6">
                            <p className="text-[13px] font-bold text-palette-tan/80 italic">"{commentToReply.content}"</p>
                        </div>

                        <div className="space-y-2 mb-6">
                            <label className="text-[12px] font-black text-palette-tan/60 uppercase tracking-widest block">Yanıtınız</label>
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                rows={4}
                                placeholder="Yanıtınızı yazın..."
                                className="w-full p-4 bg-white border border-palette-tan/15 rounded-[5px] text-[14px] font-bold text-palette-maroon outline-none focus:border-palette-red focus:ring-4 focus:ring-palette-red/5 transition-all resize-none"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowReplyModal(false)}
                                className="flex-1 h-10 bg-palette-beige/30 text-palette-tan rounded-[5px] font-black text-[11px] tracking-widest hover:bg-palette-beige/50 transition-all uppercase"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSendReply}
                                disabled={!replyContent.trim()}
                                className="flex-1 h-10 bg-cyan-600 text-white rounded-[5px] font-black text-[13px] tracking-widest hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>send</span>
                                <span className="mt-0.5">GÖNDER</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CommentManagement;
