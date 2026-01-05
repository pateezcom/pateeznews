
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  role: string;
  email?: string;
  created_at?: string;
  status?: string;
  publisher?: string;
  reward_system?: boolean;
  assigned_publishers?: { id: string, full_name: string }[];
}

interface Role {
  id: string;
  name: string;
  label: string;
}

interface UserManagementProps {
  onEditUser: (searchTerm: string) => void;
  initialSearchTerm?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ onEditUser, initialSearchTerm }) => {
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([
    { id: 'default-1', name: 'admin', label: 'Süper Yönetici' },
    { id: 'default-2', name: 'editor', label: 'Editör' },
    { id: 'default-3', name: 'moderator', label: 'Moderatör' },
    { id: 'default-4', name: 'member', label: 'Standart Üye' }
  ]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublisherModal, setShowPublisherModal] = useState(false);
  const [showUserPublisherModal, setShowUserPublisherModal] = useState(false);
  const [targetUserForPublishers, setTargetUserForPublishers] = useState<Profile | null>(null);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<{ show: boolean, type: 'error' | 'success', message: string }>({ show: false, type: 'success', message: '' });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const multiSelectRef = useRef<HTMLDivElement>(null);
  const userMultiSelectRef = useRef<HTMLDivElement>(null);
  const individualPubSelectRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [filters, setFilters] = useState({
    role: 'Tümü',
    publisher: 'Tümü',
    reward_system: 'Tümü',
    status: 'Tümü'
  });

  const [publishersList, setPublishersList] = useState<Profile[]>([]);
  const [selectedUsersForPublisher, setSelectedUsersForPublisher] = useState<string[]>([]);
  const [selectedPublishersForUser, setSelectedPublishersForUser] = useState<string[]>([]);
  const [activeMultiSelect, setActiveMultiSelect] = useState<'users' | 'publishers' | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [pubSearchTerm, setPubSearchTerm] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    username: '',
    role: 'member',
    reward_system: false
  });

  const [editUserData, setEditUserData] = useState({
    id: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    username: '',
    role: 'member',
    status: 'Aktif',
    reward_system: false
  });

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewUser({
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      username: '',
      role: 'member',
      reward_system: false
    });
    setFormErrors({});
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditUserData({
      id: '',
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      username: '',
      role: 'member',
      status: 'Aktif',
      reward_system: false
    });
    setFormErrors({});
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleClosePublisherModal = () => {
    setShowPublisherModal(false);
    setSelectedUsersForPublisher([]);
    setSelectedPublishersForUser([]);
    setUserSearchTerm('');
    setPubSearchTerm('');
    setActiveMultiSelect(null);
  };

  const handleCloseUserPublisherModal = () => {
    setShowUserPublisherModal(false);
    setTargetUserForPublishers(null);
    setSelectedPublishersForUser([]);
    setPubSearchTerm('');
    setActiveMultiSelect(null);
  };

  const handleCloseStatusModal = () => {
    setStatusModal({ show: false, type: 'success', message: '' });
  };

  useEffect(() => {
    fetchData();
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
      // Close custom multi-selects on outside click
      const isOutsideMultiSelect = multiSelectRef.current && !multiSelectRef.current.contains(event.target as Node);
      const isOutsideUserMultiSelect = userMultiSelectRef.current && !userMultiSelectRef.current.contains(event.target as Node);
      const isOutsideIndividualPubSelect = individualPubSelectRef.current && !individualPubSelectRef.current.contains(event.target as Node);

      if (activeMultiSelect && isOutsideMultiSelect && isOutsideUserMultiSelect && isOutsideIndividualPubSelect) {
        setActiveMultiSelect(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // 2025 Debounce Mimari
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Rollere ve yayıncı listesine sadece ilk açılışta veya ihtiyaç duyulduğunda bakalım
      if (roles.length <= 4 || publishersList.length === 0) {
        const [rRes, pRes] = await Promise.all([
          supabase.from('roles').select('*').neq('name', 'publisher'),
          supabase.from('profiles').select('*').eq('role', 'publisher')
        ]);
        if (rRes.data) setRoles(rRes.data);
        if (pRes.data) setPublishersList(pRes.data as unknown as Profile[]);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user && !currentUserRole) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setCurrentUserRole(profile?.role || '');
      }

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      // IŞIK HIZI: Sadece bu sayfadaki kişileri ve onların yayıncılarını çekiyoruz
      let query = supabase.from('profiles')
        .select('*, publisher_users!publisher_users_user_id_fkey(publisher:profiles!publisher_users_publisher_id_fkey(id, full_name))', { count: 'exact' })
        .neq('role', 'publisher');

      if (debouncedSearchTerm) {
        const s = `%${debouncedSearchTerm}%`;
        query = query.or(`full_name.ilike.${s},username.ilike.${s},email.ilike.${s}`);
      }

      if (filters.role !== 'Tümü') query = query.eq('role', filters.role);
      if (filters.status !== 'Tümü') query = query.eq('status', filters.status);
      if (filters.reward_system !== 'Tümü') query = query.eq('reward_system', filters.reward_system === 'Aktif');

      const { data: rawProfiles, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setTotalCount(count || 0);

      const enrichedProfiles = (rawProfiles || []).map((p: any) => ({
        ...p,
        assigned_publishers: p.publisher_users?.map((pu: any) => ({
          id: pu.publisher.id,
          full_name: pu.publisher.full_name
        })) || []
      }));

      setProfiles(enrichedProfiles);

    } catch (err: any) {
      setErrorMsg(err.code === 'PGRST116' ? null : (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, debouncedSearchTerm, filters]);

  const stats = useMemo(() => {
    const activeProfilesCount = profiles.filter(p => p.status === 'Aktif').length;
    const waitingProfilesCount = profiles.filter(p => p.status !== 'Aktif').length;
    return [
      { label: 'Oturum', value: totalCount, change: '+0%', desc: 'Toplam Kullanıcılar', icon: 'groups', color: 'bg-red-50 text-red-600', iconBg: 'bg-red-50' },
      { label: 'Ödül Sistemi', value: profiles.filter(p => p.reward_system).length, change: '+0%', desc: 'Aktif Sistemler', icon: 'shield_person', color: 'bg-red-50 text-red-600', iconBg: 'bg-red-50' },
      { label: 'Aktif Kullanıcılar', value: activeProfilesCount, change: '+0%', desc: 'Sistemde Aktif', icon: 'person_outline', color: 'bg-emerald-50 text-emerald-600', iconBg: 'bg-emerald-50' },
      { label: 'Bekleyen Kullanıcılar', value: waitingProfilesCount, change: '+0%', desc: 'Onay Bekleyen', icon: 'person_add', color: 'bg-orange-50 text-orange-600', iconBg: 'bg-orange-50' },
    ];
  }, [profiles, totalCount]);

  const filteredUsers = useMemo(() => profiles, [profiles]);

  const getRoleLabel = (roleName: string) => {
    return roles.find(r => r.name === roleName)?.label || roleName;
  };

  const handleAddUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const errors: Record<string, string> = {};
    if (!newUser.full_name) errors.full_name = 'Alan zorunludur';
    if (!newUser.username) errors.username = 'Alan zorunludur';
    if (!newUser.email) errors.email = 'Alan zorunludur';
    if (!newUser.password) errors.password = 'Alan zorunludur';
    if (!newUser.confirmPassword) errors.confirmPassword = 'Alan zorunludur';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      setFormErrors({ confirmPassword: 'Şifreler uyuşmuyor.' });
      return;
    }
    setFormErrors({});
    setSaving(true);
    try {
      // Uniqueness check
      const { data: conflicts, error: checkError } = await supabase
        .from('profiles')
        .select('username, email')
        .or(`username.eq.${newUser.username},email.eq.${newUser.email}`);

      if (conflicts && conflicts.length > 0) {
        const errors: Record<string, string> = {};
        conflicts.forEach(c => {
          if (c.username?.toLowerCase() === newUser.username.toLowerCase()) errors.username = 'Kullanıcı adı zaten kullanımda';
          if (c.email?.toLowerCase() === newUser.email.toLowerCase()) errors.email = 'E-posta zaten kullanımda';
        });
        if (Object.keys(errors).length > 0) {
          setFormErrors(errors);
          setSaving(false);
          return;
        }
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.full_name,
            username: newUser.username
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        await supabase
          .from('profiles')
          .update({
            role: newUser.role,
            reward_system: newUser.reward_system
          })
          .eq('id', authData.user.id);
      }

      setSuccess(true);
      handleCloseAddModal();
      fetchData();
    } catch (err: any) {
      setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', err.message) });
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (user: Profile) => {
    setEditUserData({
      id: user.id,
      email: user.email || '',
      password: '',
      confirmPassword: '',
      full_name: user.full_name || '',
      username: user.username || '',
      role: user.role || 'member',
      status: user.status || 'Aktif',
      reward_system: user.reward_system || false
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const errors: Record<string, string> = {};
    if (!editUserData.full_name) errors.full_name = 'Alan zorunludur';
    if (!editUserData.username) errors.username = 'Alan zorunludur';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editUserData.password && editUserData.password !== editUserData.confirmPassword) {
      setFormErrors({ confirmPassword: 'Şifreler uyuşmuyor.' });
      return;
    }
    setFormErrors({});
    setSaving(true);
    try {
      // Uniqueness check
      const { data: conflicts, error: checkError } = await supabase
        .from('profiles')
        .select('username, email')
        .or(`username.eq.${editUserData.username},email.eq.${editUserData.email}`)
        .neq('id', editUserData.id);

      if (conflicts && conflicts.length > 0) {
        const errors: Record<string, string> = {};
        conflicts.forEach(c => {
          if (c.username?.toLowerCase() === editUserData.username.toLowerCase()) errors.username = 'Kullanıcı adı zaten kullanımda';
          if (c.email?.toLowerCase() === editUserData.email.toLowerCase()) errors.email = 'E-posta zaten kullanımda';
        });
        if (Object.keys(errors).length > 0) {
          setFormErrors(errors);
          setSaving(false);
          return;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editUserData.full_name,
          username: editUserData.username,
          role: editUserData.role,
          status: editUserData.status,
          reward_system: editUserData.reward_system
        })
        .eq('id', editUserData.id);

      if (error) throw error;

      setSuccess(true);

      // Update local state locally to avoid fetch
      setProfiles(prev => prev.map(p => p.id === editUserData.id ? {
        ...p,
        full_name: editUserData.full_name,
        username: editUserData.username,
        role: editUserData.role,
        status: editUserData.status,
        reward_system: editUserData.reward_system
      } : p));

      handleCloseEditModal();
    } catch (err: any) {
      setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', err.message) });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    // Optimistic Delete
    const previousProfiles = [...profiles];
    setProfiles(prev => prev.filter(p => p.id !== userToDelete.id));
    handleCloseDeleteModal();

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userToDelete.id);
      if (error) {
        // Revert
        setProfiles(previousProfiles);
        throw error;
      }
      // No need to fetch data, we already removed it
    } catch (err: any) {
      setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', err.message) });
      // Restore on error if not handled by above revert
      setProfiles(previousProfiles);
    }
  };

  const inputClasses = "w-full h-10 px-4 bg-palette-beige/30 border border-palette-tan/10 rounded-[5px] text-sm font-bold text-palette-maroon outline-none focus:bg-white focus:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all placeholder:text-palette-tan/30";

  return (
    <>
      {/* WRAP CONTENT IN ANIMATED DIV BUT KEEP MODALS OUTSIDE TO FIX THE BLUR GAPS */}
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

          <div className="p-8 border-b border-palette-tan/10 space-y-8">
            <h2 className="text-xl font-black text-palette-maroon uppercase tracking-tight">{t('users.page_title')}</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Rol', key: 'role' },
                { label: 'Yayıncı', key: 'publisher' },
                { label: 'Ödül Sistemi', key: 'reward_system' },
                { label: 'Durum', key: 'status' }
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
                      {roles.length === 0 && <option disabled>Yükleniyor...</option>}
                      {filter.key === 'role' && roles.map(r => <option key={r.id} value={r.name}>{r.label}</option>)}
                      {filter.key === 'publisher' && publishersList.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                      {filter.key === 'reward_system' && (
                        <>
                          <option value="Aktif">Aktif</option>
                          <option value="Pasif">Pasif</option>
                        </>
                      )}
                      {filter.key === 'status' && (
                        <>
                          <option value="Aktif">Aktif</option>
                          <option value="Beklemede">Beklemede</option>
                          <option value="Engelli">Engelli</option>
                        </>
                      )}
                    </select>
                    <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-palette-tan/30 pointer-events-none group-hover/select:text-palette-maroon transition-colors" style={{ fontSize: '18px' }}>expand_more</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-palette-tan/5">
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

                {currentUserRole === 'admin' && (
                  <button
                    type="button"
                    onClick={() => setShowPublisherModal(true)}
                    className="flex items-center gap-2 px-3 h-10 text-[13px] font-black text-cyan-600 hover:bg-cyan-50/50 rounded-[5px] transition-all active:scale-95 group/pub"
                  >
                    <span className="material-symbols-rounded text-cyan-500 group-hover/pub:scale-110 transition-transform" style={{ fontSize: '20px' }}>person_add</span>
                    <span>Yayıncıları Ekle</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <input
                    type="text"
                    placeholder="Kullanıcı Ara ..."
                    className="w-full md:w-[220px] h-10 pl-4 pr-10 bg-white border border-palette-tan/15 rounded-[5px] text-[13px] font-bold text-palette-maroon outline-none focus:border-palette-maroon focus:ring-4 focus:ring-palette-maroon/5 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-palette-tan/40" style={{ fontSize: '18px' }}>search</span>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 h-10 px-4 bg-palette-red text-white rounded-[5px] text-[13px] font-black tracking-widest hover:bg-palette-maroon transition-all shadow-lg shadow-palette-red/20 active:scale-95"
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>add</span>
                  Kullanıcı Ekle
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 relative z-10 overflow-x-auto md:overflow-visible scrollbar-thin scrollbar-thumb-palette-tan/10">
            <table className="w-full text-left border-collapse table-fixed md:table-auto">
              <thead>
                <tr className="bg-palette-beige/10 border-b border-palette-tan/10">
                  <th className="w-12 px-8 py-5">
                    <input type="checkbox" className="w-4 h-4 rounded-[5px] border-palette-tan/30 text-palette-maroon focus:ring-palette-maroon cursor-pointer" />
                  </th>
                  <th className="w-20 px-4 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest">Id</th>
                  <th className="px-4 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest">Kullanıcı</th>
                  <th className="px-6 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">Rol</th>
                  <th className="px-6 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">Yayıncılar</th>
                  <th className="px-6 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">Ödül Sistemi</th>
                  <th className="px-6 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest text-center">Durum</th>
                  <th className="px-8 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest text-right">Oluşturma</th>
                  <th className="w-20 px-8 py-5 text-[12px] font-black text-palette-tan uppercase tracking-widest text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-palette-tan/5 min-h-[400px]">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={9} className="px-8 py-10 opacity-50"><div className="h-4 bg-palette-beige rounded-[5px] w-full"></div></td>
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-8 py-32 text-center text-palette-tan/40 font-bold uppercase tracking-widest text-sm">
                      Kullanıcı Bulunamadı
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr key={user.id} className={`hover:bg-palette-beige/5 transition-all group ${openDropdownId === user.id ? 'relative z-[100]' : 'relative z-1'}`}>
                      <td className="px-8 py-6">
                        <input type="checkbox" className="w-4 h-4 rounded-[5px] border-palette-tan/30 text-palette-maroon focus:ring-palette-maroon cursor-pointer" />
                      </td>
                      <td className="px-4 py-6 text-[13px] font-bold text-palette-tan/60">{idx + 25}</td>
                      <td className="px-4 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex-shrink-0 bg-palette-beige rounded-[5px] overflow-hidden border border-palette-tan/10 shadow-sm relative transition-all">
                            <img src={user.avatar_url || `https://picsum.photos/seed/${user.id}/100`} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-palette-maroon text-[14px] leading-tight group-hover:text-palette-red transition-colors">{user.full_name || 'İsimsiz'}</span>
                            <span className="text-[11px] font-bold text-palette-tan/60 break-all truncate max-w-[150px]">@{user.username || 'username'}</span>
                            <span className="text-[10px] font-bold text-palette-tan/40">{user.email || 'user@example.com'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {user.role === 'admin' ? (
                            <span className="material-symbols-rounded text-cyan-500" style={{ fontSize: '18px' }}>workspace_premium</span>
                          ) : (
                            <span className="material-symbols-rounded text-palette-red" style={{ fontSize: '18px' }}>person</span>
                          )}
                          <span className="text-[12px] font-bold text-palette-tan/70 uppercase tracking-widest">{getRoleLabel(user.role)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {user.assigned_publishers && user.assigned_publishers.length > 0 ? (
                            <>
                              {user.assigned_publishers.map(pub => (
                                <span key={pub.id} className="bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-[5px] text-[11px] font-bold">
                                  {pub.full_name}
                                </span>
                              ))}
                              {currentUserRole === 'admin' && (
                                <button
                                  onClick={() => {
                                    setTargetUserForPublishers(user);
                                    setSelectedPublishersForUser(user.assigned_publishers?.map(p => p.id) || []);
                                    setShowUserPublisherModal(true);
                                  }}
                                  className="text-palette-red hover:text-palette-maroon transition-colors"
                                >
                                  <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>edit</span>
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-[11px] font-bold text-palette-tan/40"> - </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="flex items-center justify-center">
                          <span className={`material-symbols-rounded ${user.reward_system ? 'text-emerald-500' : 'text-palette-tan/20'}`} style={{ fontSize: '20px' }}>{user.reward_system ? 'cached' : 'block'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`px-2.5 py-1 rounded-[5px] text-[10px] font-black uppercase tracking-widest ${user.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' :
                          user.status === 'Engelli' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                          {user.status || 'Aktif'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="text-[11px] font-bold text-palette-tan flex flex-col uppercase">
                          <span>{user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : 'Yükleniyor...'}</span>
                          <span className="text-[9px] text-palette-tan/40 mt-0.5">
                            {user.created_at ? new Date(user.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEditClick(user)} className="w-8 h-8 rounded-[5px] flex items-center justify-center text-palette-red hover:bg-red-50 transition-all"><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>edit</span></button>
                          <button onClick={() => { setUserToDelete(user); setShowDeleteModal(true); }} className="w-8 h-8 rounded-[5px] flex items-center justify-center text-palette-red hover:bg-red-50 transition-all"><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete</span></button>
                          <div className="relative inline-block text-left" ref={openDropdownId === user.id ? dropdownRef : null}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === user.id ? null : user.id); }}
                              className="w-8 h-8 rounded-[5px] flex items-center justify-center text-palette-tan/40 hover:bg-palette-beige hover:text-palette-maroon transition-all active:scale-90"
                            >
                              <span className="material-symbols-rounded">more_vert</span>
                            </button>
                            {openDropdownId === user.id && (
                              <div className={`absolute right-0 ${idx >= filteredUsers.length - 2 && idx > 0 ? 'bottom-full mb-2' : 'top-full mt-1'} w-64 bg-white border border-palette-tan/20 rounded-[5px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[200] py-2 animate-in fade-in zoom-in-95 duration-200`}>
                                <button onClick={() => { onEditUser(user.username); setOpenDropdownId(null); }} className="w-full px-5 py-3 text-left text-[13px] font-bold text-palette-maroon hover:bg-palette-beige/30 transition-all flex items-center gap-3">
                                  <span className="material-symbols-rounded text-cyan-500" style={{ fontSize: '18px' }}>search</span>
                                  Bu Kullanıcıyı Filtrele
                                </button>
                                <button
                                  onClick={async () => {
                                    setOpenDropdownId(null);
                                    // Optimistic Update
                                    setProfiles(prev => prev.map(p => p.id === user.id ? { ...p, status: 'Aktif' } : p));

                                    try {
                                      const { error } = await supabase.from('profiles').update({ status: 'Aktif' }).eq('id', user.id);
                                      if (error) {
                                        // Revert on error
                                        setProfiles(prev => prev.map(p => p.id === user.id ? { ...p, status: user.status } : p));
                                        throw error;
                                      }
                                    } catch (err: any) {
                                      setStatusModal({ show: true, type: 'error', message: err.message });
                                    }
                                  }}
                                  className="w-full px-5 py-3 text-left text-[13px] font-bold text-palette-maroon hover:bg-palette-beige/30 transition-all flex items-center gap-3"
                                >
                                  <span className="material-symbols-rounded text-emerald-500" style={{ fontSize: '18px' }}>check_circle</span>
                                  Kullanıcıyı Aktifleştir
                                </button>
                                <button
                                  onClick={async () => {
                                    setOpenDropdownId(null);
                                    // Optimistic Update
                                    setProfiles(prev => prev.map(p => p.id === user.id ? { ...p, status: 'Engelli' } : p));

                                    try {
                                      const { error } = await supabase.from('profiles').update({ status: 'Engelli' }).eq('id', user.id);
                                      if (error) {
                                        // Revert on error
                                        setProfiles(prev => prev.map(p => p.id === user.id ? { ...p, status: user.status } : p));
                                        throw error;
                                      }
                                    } catch (err: any) {
                                      setStatusModal({ show: true, type: 'error', message: err.message });
                                    }
                                  }}
                                  className="w-full px-5 py-3 text-left text-[13px] font-bold text-palette-maroon hover:bg-palette-beige/30 transition-all flex items-center gap-3"
                                >
                                  <span className="material-symbols-rounded text-orange-400" style={{ fontSize: '18px' }}>person_off</span>
                                  Kullanıcıyı Devre Dışı Bırak
                                </button>
                                <button
                                  onClick={async () => {
                                    setOpenDropdownId(null);
                                    // Optimistic Update
                                    const newRewardState = !user.reward_system;
                                    setProfiles(prev => prev.map(p => p.id === user.id ? { ...p, reward_system: newRewardState } : p));

                                    try {
                                      const { error } = await supabase.from('profiles').update({ reward_system: newRewardState }).eq('id', user.id);
                                      if (error) {
                                        // Revert on error
                                        setProfiles(prev => prev.map(p => p.id === user.id ? { ...p, reward_system: user.reward_system } : p));
                                        throw error;
                                      }
                                    } catch (err: any) {
                                      setStatusModal({ show: true, type: 'error', message: err.message });
                                    }
                                  }}
                                  className="w-full px-5 py-3 text-left text-[13px] font-bold text-palette-maroon hover:bg-palette-beige/30 transition-all flex items-center gap-3"
                                >
                                  <span className="material-symbols-rounded text-orange-400" style={{ fontSize: '18px' }}>visibility_off</span>
                                  Ödül Sistemini {user.reward_system ? 'Kapat' : 'Aç'}
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
      </div>

      {/* MODALS RENDERED AT THE ROOT OF FRAGMENT TO ESCAPE TRANSFORM CONTAINMENT */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop covers EVERYTHING because it's no longer inside the animated div */}
          <div
            className="absolute inset-0 bg-palette-maroon/90 backdrop-blur-md animate-in fade-in"
            onClick={() => !saving && (showAddModal ? handleCloseAddModal() : handleCloseEditModal())}
          />

          <div className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 flex flex-col">

            <div className="px-8 py-6 border-b border-palette-tan/15 flex items-center justify-between bg-palette-beige/10">
              <h3 className="text-lg font-black text-palette-maroon tracking-tight flex items-center gap-2">
                <div className="p-1.5 bg-palette-red rounded-[5px] text-white shadow-md flex items-center justify-center">
                  {showEditModal ? <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>edit_square</span> : <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>add</span>}
                </div>
                {showEditModal ? 'Kullanıcıyı Düzenle' : 'Kullanıcı Ekle'}
              </h3>
              <button
                onClick={() => showAddModal ? handleCloseAddModal() : handleCloseEditModal()}
                className="p-1.5 text-palette-tan/40 hover:text-palette-red transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">Adı Soyadı <span className="text-palette-red">*</span></label>
                <input
                  type="text"
                  value={showAddModal ? newUser.full_name : editUserData.full_name}
                  onChange={e => {
                    if (showAddModal) setNewUser({ ...newUser, full_name: e.target.value });
                    else setEditUserData({ ...editUserData, full_name: e.target.value });
                    if (formErrors.full_name) setFormErrors({ ...formErrors, full_name: '' });
                  }}
                  placeholder="John Doe"
                  className={`${inputClasses} ${formErrors.full_name ? 'border-palette-red text-palette-red' : ''}`}
                />
                {formErrors.full_name && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.full_name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">Kullanıcı Adı <span className="text-palette-red">*</span></label>
                  <input
                    type="text"
                    value={showAddModal ? newUser.username : editUserData.username}
                    onChange={e => {
                      if (showAddModal) setNewUser({ ...newUser, username: e.target.value });
                      else setEditUserData({ ...editUserData, username: e.target.value });
                      if (formErrors.username) setFormErrors({ ...formErrors, username: '' });
                    }}
                    placeholder="johndoe"
                    className={`${inputClasses} ${formErrors.username ? 'border-palette-red text-palette-red' : ''}`}
                  />
                  {formErrors.username && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.username}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">E-posta <span className="text-palette-red">*</span></label>
                  <input
                    type="email"
                    value={showAddModal ? newUser.email : editUserData.email}
                    onChange={e => {
                      if (showAddModal) setNewUser({ ...newUser, email: e.target.value });
                      if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                    }}
                    readOnly={showEditModal}
                    placeholder="example@domain.com"
                    className={`${inputClasses} ${showEditModal ? 'bg-palette-beige/20 cursor-not-allowed' : ''} ${formErrors.email ? 'border-palette-red text-palette-red' : ''}`}
                  />
                  {formErrors.email && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">Rol</label>
                  <div className="relative group/input">
                    <select
                      value={showAddModal ? newUser.role : editUserData.role}
                      onChange={e => showAddModal ? setNewUser({ ...newUser, role: e.target.value }) : setEditUserData({ ...editUserData, role: e.target.value })}
                      className={`${inputClasses} appearance-none cursor-pointer pr-10`}
                    >
                      <option value="" disabled>Rol Seçin</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.name}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/30 pointer-events-none group-hover/input:text-palette-maroon transition-colors" style={{ fontSize: '14px' }}>expand_more</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">Durum</label>
                  <div className="relative group/input">
                    <select
                      value={showAddModal ? 'Aktif' : editUserData.status}
                      onChange={e => setEditUserData({ ...editUserData, status: e.target.value })}
                      className={`${inputClasses} appearance-none cursor-pointer ${showAddModal ? 'pointer-events-none' : ''}`}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Beklemede">Beklemede</option>
                      <option value="Engelli">Engelli</option>
                    </select>
                    {!showAddModal && <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/30 pointer-events-none group-hover/input:text-palette-maroon transition-colors" style={{ fontSize: '14px' }}>expand_more</span>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">{showEditModal ? 'Şifre (Değiştir)' : 'Şifre'} {(!showEditModal || showAddModal) && <span className="text-palette-red">*</span>}</label>
                  <input
                    type="password"
                    value={showAddModal ? newUser.password : editUserData.password}
                    onChange={e => {
                      if (showAddModal) setNewUser({ ...newUser, password: e.target.value });
                      else setEditUserData({ ...editUserData, password: e.target.value });
                      if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                    }}
                    placeholder="........"
                    className={`${inputClasses} ${formErrors.password ? 'border-palette-red text-palette-red' : ''}`}
                  />
                  {formErrors.password && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.password}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest">Onayla {(!showEditModal || showAddModal) && <span className="text-palette-red">*</span>}</label>
                  <input
                    type="password"
                    value={showAddModal ? newUser.confirmPassword : editUserData.confirmPassword}
                    onChange={e => {
                      if (showAddModal) setNewUser({ ...newUser, confirmPassword: e.target.value });
                      else setEditUserData({ ...editUserData, confirmPassword: e.target.value });
                      if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: '' });
                    }}
                    placeholder="........"
                    className={`${inputClasses} ${formErrors.confirmPassword ? 'border-palette-red text-palette-red' : ''}`}
                  />
                  {formErrors.confirmPassword && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.confirmPassword}</p>}
                </div>
              </div>

              <div className="pt-2">
                <label className="relative inline-flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={showAddModal ? newUser.reward_system : editUserData.reward_system}
                    onChange={e => showAddModal ? setNewUser({ ...newUser, reward_system: e.target.checked }) : setEditUserData({ ...editUserData, reward_system: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-palette-beige/50 border border-palette-tan/20 peer-focus:outline-none rounded-[5px] peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-palette-tan/30 after:border after:rounded-[5px] after:h-5 after:w-5 after:transition-all peer-checked:bg-palette-red peer-checked:border-palette-red"></div>
                  <span className="ml-3 text-[11px] font-black text-palette-maroon uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Ödül Sistemini Etkinleştir</span>
                </label>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-palette-beige bg-palette-beige/10 flex items-center justify-end gap-3">
              <button
                onClick={() => showAddModal ? handleCloseAddModal() : handleCloseEditModal()}
                className="px-5 py-2.5 font-black text-[11px] text-palette-tan/40 hover:text-palette-maroon tracking-widest uppercase"
              >
                Vazgeç
              </button>
              <button
                onClick={() => showAddModal ? handleAddUser() : handleUpdateUser()}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-palette-tan text-white rounded-[5px] font-black text-[13px] tracking-widest hover:bg-palette-maroon shadow-xl active:scale-95 disabled:opacity-40 transition-all uppercase"
              >
                {saving ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>save</span>}
                <span>{showEditModal ? 'Kaydet' : 'Ekle'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETE MODAL OUTSIDE ANIMATED DIV */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-md animate-in fade-in" onClick={() => !saving && setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 p-8 text-center">
            <div className="w-14 h-14 bg-red-50 text-palette-red rounded-[5px] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>delete</span>
            </div>
            <h3 className="text-xl font-black text-palette-maroon tracking-tight mb-3 uppercase">{t('users.actions.delete')}?</h3>
            <p className="text-[13px] font-bold text-palette-tan/60 leading-relaxed mb-8">
              <span className="text-palette-maroon">"{userToDelete?.full_name}"</span> isimli kullanıcıyı silmek istediğinize emin misiniz?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
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
      )}

      {/* PUBLISHER MODAL OUTSIDE ANIMATED DIV */}
      {showPublisherModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/90 backdrop-blur-md animate-in fade-in" onClick={handleClosePublisherModal} />
          <div
            className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 flex flex-col"
            onClick={() => setActiveMultiSelect(null)}
          >
            <div className="px-8 py-6 border-b border-palette-tan/15 flex items-center justify-between bg-palette-beige/10">
              <h3 className="text-lg font-black text-palette-maroon tracking-tight flex items-center gap-2">
                <div className="p-1.5 bg-palette-red rounded-[5px] text-white shadow-md flex items-center justify-center">
                  <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>edit_square</span>
                </div>
                Yayıncı Ekle
              </h3>
              <button
                onClick={handleClosePublisherModal}
                className="p-1.5 text-palette-tan/40 hover:text-palette-red transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div className="p-8 space-y-7">
              {/* Kullanıcı Seçimi */}
              <div className="space-y-2 relative" ref={userMultiSelectRef}>
                <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest flex items-center gap-1.5">
                  Kullanıcıları Seçin <span className="text-palette-red">*</span>
                </label>
                <div
                  className={`min-h-[44px] p-2 bg-palette-beige/30 border ${activeMultiSelect === 'users' ? 'border-palette-red ring-4 ring-palette-red/5' : 'border-palette-tan/10'} rounded-[5px] transition-all flex flex-wrap gap-2 items-center cursor-text relative group`}
                  onClick={(e) => { e.stopPropagation(); setActiveMultiSelect('users'); }}
                >
                  {selectedUsersForPublisher.map(id => {
                    const u = profiles.find(p => p.id === id);
                    return (
                      <div key={id} className="flex items-center gap-2 bg-white/80 border border-palette-tan/10 px-2.5 py-1 rounded-[5px] text-[12px] font-bold text-palette-maroon shadow-sm group/tag animate-in zoom-in-95">
                        <span>{u?.full_name} ({u?.email})</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedUsersForPublisher(prev => prev.filter(i => i !== id)); }}
                          className="hover:text-palette-red transition-colors"
                        >
                          <span className="material-symbols-rounded text-[14px]">close</span>
                        </button>
                      </div>
                    );
                  })}
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder={selectedUsersForPublisher.length === 0 ? "Kullanıcı Ara..." : ""}
                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-palette-maroon min-w-[120px] placeholder:text-palette-tan/30 ml-1"
                  />
                  {selectedUsersForPublisher.length > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedUsersForPublisher([]); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-palette-tan/40 hover:text-palette-red transition-colors"
                    >
                      <span className="material-symbols-rounded text-[18px]">close</span>
                    </button>
                  )}
                  {activeMultiSelect === 'users' && (
                    <div className="absolute top-[calc(100%+2px)] left-0 right-0 bg-white border border-palette-tan/20 rounded-[5px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[200] max-h-60 overflow-y-auto py-2 animate-in fade-in slide-in-from-top-1">
                      {profiles.filter(u => !selectedUsersForPublisher.includes(u.id) && (u.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) || u.email?.toLowerCase().includes(userSearchTerm.toLowerCase()))).length === 0 ? (
                        <div className="px-5 py-4 text-center text-palette-tan/40 text-[12px] font-bold uppercase tracking-widest italic">Sonuç bulunamadı</div>
                      ) : (
                        profiles.filter(u => !selectedUsersForPublisher.includes(u.id) && (u.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) || u.email?.toLowerCase().includes(userSearchTerm.toLowerCase()))).map(u => (
                          <button
                            key={u.id}
                            onClick={() => { setSelectedUsersForPublisher(prev => [...prev, u.id]); setUserSearchTerm(''); setActiveMultiSelect(null); }}
                            className="w-full px-5 py-3 text-left text-[13px] font-bold text-palette-maroon hover:bg-palette-beige/30 transition-all flex items-center justify-between group/item"
                          >
                            <div className="flex flex-col">
                              <span className="group-hover/item:text-palette-red transition-colors">{u.full_name}</span>
                              <span className="text-[10px] text-palette-tan/40">@{u.username} • {u.email}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-bold text-palette-tan/40 ml-1">Lütfen en az bir kullanıcı seçin</p>
              </div>

              {/* Yayıncı Seçimi */}
              <div className="space-y-2 relative pt-2" ref={multiSelectRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest flex items-center gap-1.5">
                    Yayıncıları Seçin <span className="text-palette-red">*</span>
                  </label>
                  <button
                    onClick={() => { /* Navigate to publishers */ window.location.href = '/admin/publishers'; }}
                    className="flex items-center gap-1.5 h-8 px-3 border border-palette-red/30 text-palette-red rounded-[5px] text-[10px] font-black uppercase tracking-widest hover:bg-palette-red hover:text-white transition-all active:scale-95"
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>add</span>
                    Yeni Yayıncı Ekle
                  </button>
                </div>
                <div
                  className={`min-h-[44px] p-2 bg-palette-beige/30 border ${activeMultiSelect === 'publishers' ? 'border-palette-red ring-4 ring-palette-red/5' : 'border-palette-tan/10'} rounded-[5px] transition-all flex flex-wrap gap-2 items-center cursor-text relative group`}
                  onClick={(e) => { e.stopPropagation(); setActiveMultiSelect('publishers'); }}
                >
                  {selectedPublishersForUser.map(id => {
                    const p = publishersList.find(i => i.id === id);
                    return (
                      <div key={id} className="flex items-center gap-2 bg-white/80 border border-palette-tan/10 px-2.5 py-1 rounded-[5px] text-[12px] font-bold text-palette-maroon shadow-sm group/tag animate-in zoom-in-95">
                        <span>{p?.full_name} ({p?.email})</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedPublishersForUser(prev => prev.filter(i => i !== id)); }}
                          className="hover:text-palette-red transition-colors"
                        >
                          <span className="material-symbols-rounded text-[14px]">close</span>
                        </button>
                      </div>
                    );
                  })}
                  <input
                    type="text"
                    value={pubSearchTerm}
                    onChange={(e) => setPubSearchTerm(e.target.value)}
                    placeholder={selectedPublishersForUser.length === 0 ? "Yayıncı Ara..." : ""}
                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-palette-maroon min-w-[120px] placeholder:text-palette-tan/30 ml-1"
                  />
                  {selectedPublishersForUser.length > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedPublishersForUser([]); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-palette-tan/40 hover:text-palette-red transition-colors"
                    >
                      <span className="material-symbols-rounded text-[18px]">close</span>
                    </button>
                  )}
                  {activeMultiSelect === 'publishers' && (
                    <div className="absolute top-[calc(100%+2px)] left-0 right-0 bg-white border border-palette-tan/20 rounded-[5px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[200] max-h-60 overflow-y-auto py-2 animate-in fade-in slide-in-from-top-2">
                      {publishersList.filter(p => !selectedPublishersForUser.includes(p.id) && (p.full_name?.toLowerCase().includes(pubSearchTerm.toLowerCase()) || p.email?.toLowerCase().includes(pubSearchTerm.toLowerCase()))).length === 0 ? (
                        <div className="px-5 py-4 text-center text-palette-tan/40 text-[12px] font-bold uppercase tracking-widest italic">Sonuç bulunamadı</div>
                      ) : (
                        publishersList.filter(p => !selectedPublishersForUser.includes(p.id) && (p.full_name?.toLowerCase().includes(pubSearchTerm.toLowerCase()) || p.email?.toLowerCase().includes(pubSearchTerm.toLowerCase()))).map(p => (
                          <button
                            key={p.id}
                            onClick={() => { setSelectedPublishersForUser(prev => [...prev, p.id]); setPubSearchTerm(''); setActiveMultiSelect(null); }}
                            className="w-full px-5 py-3 text-left text-[13px] font-bold text-palette-maroon hover:bg-palette-beige/30 transition-all flex items-center justify-between group/item"
                          >
                            <div className="flex flex-col">
                              <span className="group-hover/item:text-palette-red transition-colors">{p.full_name}</span>
                              <span className="text-[10px] text-palette-tan/40">{p.email}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-palette-beige/20 p-4 rounded-[5px] border border-palette-tan/5 mt-4">
                <p className="text-[10px] font-bold text-palette-tan/40 leading-relaxed uppercase">
                  Not: Bir kullanıcıya birden fazla yayıncı atayarak içerik üretim yetkisini genişletebilirsiniz.
                </p>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-palette-beige bg-palette-beige/10 flex items-center justify-end gap-3">
              <button
                onClick={handleClosePublisherModal}
                className="px-5 py-2.5 font-black text-[11px] text-palette-tan/40 hover:text-palette-maroon tracking-widest uppercase"
              >
                Vazgeç
              </button>
              <button
                onClick={async () => {
                  if (selectedUsersForPublisher.length === 0 || selectedPublishersForUser.length === 0) {
                    setStatusModal({ show: true, type: 'error', message: 'Lütfen kullanıcı ve yayıncı seçin.' });
                    return;
                  }
                  setSaving(true);
                  try {
                    for (const userId of selectedUsersForPublisher) {
                      for (const pubId of selectedPublishersForUser) {
                        await supabase.from('publisher_users').upsert({
                          user_id: userId,
                          publisher_id: pubId
                        });
                      }
                    }
                    setStatusModal({ show: true, type: 'success', message: 'Yayıncı atamaları başarıyla gerçekleştirildi.' });
                    handleClosePublisherModal();
                    fetchData();
                  } catch (err: any) {
                    setStatusModal({ show: true, type: 'error', message: err.message });
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving || selectedUsersForPublisher.length === 0 || selectedPublishersForUser.length === 0}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-palette-tan text-white rounded-[5px] font-black text-[13px] tracking-widest hover:bg-palette-maroon shadow-xl active:scale-95 disabled:opacity-40 transition-all uppercase"
              >
                {saving ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>save</span>}
                <span>Kaydet</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {showUserPublisherModal && targetUserForPublishers && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/90 backdrop-blur-md animate-in fade-in" onClick={handleCloseUserPublisherModal} />
          <div
            className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 flex flex-col"
            onClick={() => setActiveMultiSelect(null)}
          >
            <div className="px-8 py-6 border-b border-palette-tan/15 flex items-center justify-between bg-palette-beige/10">
              <h3 className="text-lg font-black text-palette-maroon tracking-tight flex items-center gap-2">
                <div className="p-1.5 bg-palette-red rounded-[5px] text-white shadow-md flex items-center justify-center">
                  <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>edit_square</span>
                </div>
                Kullanıcı Yayıncılarını Düzenle
              </h3>
              <button
                onClick={handleCloseUserPublisherModal}
                className="p-1.5 text-palette-tan/40 hover:text-palette-red transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div className="p-8 space-y-6">

              <div className="bg-cyan-50/50 border border-cyan-100 p-4 rounded-[5px] flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-8 h-8 rounded-[5px] bg-cyan-100 flex items-center justify-center text-cyan-600">
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>info</span>
                </div>
                <p className="text-[12px] font-bold text-cyan-700">
                  Yayıncıları düzenlenen kullanıcı: <span className="font-black underline">{targetUserForPublishers.full_name} ({targetUserForPublishers.email})</span>
                </p>
              </div>

              <div className="space-y-2 relative" ref={individualPubSelectRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-palette-tan/50 ml-1 uppercase tracking-widest flex items-center gap-1.5">
                    Yayıncıları Seçin <span className="text-palette-red">*</span>
                  </label>
                  <button
                    onClick={() => window.location.href = '/admin/publishers'}
                    className="flex items-center gap-1.5 h-8 px-3 border border-palette-red/30 text-palette-red rounded-[5px] text-[10px] font-black uppercase tracking-widest hover:bg-palette-red hover:text-white transition-all active:scale-95"
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>add</span>
                    Yeni Yayıncı Ekle
                  </button>
                </div>
                <div
                  className={`min-h-[44px] p-2 bg-palette-beige/30 border ${activeMultiSelect === 'publishers' ? 'border-palette-red ring-4 ring-palette-red/5' : 'border-palette-tan/10'} rounded-[5px] transition-all flex flex-wrap gap-2 items-center cursor-text relative group`}
                  onClick={(e) => { e.stopPropagation(); setActiveMultiSelect('publishers'); }}
                >
                  {selectedPublishersForUser.map(id => {
                    const p = publishersList.find(i => i.id === id);
                    return (
                      <div key={id} className="flex items-center gap-2 bg-white/80 border border-palette-tan/10 px-2.5 py-1 rounded-[5px] text-[12px] font-bold text-palette-maroon shadow-sm group/tag animate-in zoom-in-95">
                        <span>{p?.full_name} ({p?.email})</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedPublishersForUser(prev => prev.filter(i => i !== id)); }}
                          className="hover:text-palette-red transition-colors"
                        >
                          <span className="material-symbols-rounded text-[14px]">close</span>
                        </button>
                      </div>
                    );
                  })}
                  <input
                    type="text"
                    value={pubSearchTerm}
                    onChange={(e) => setPubSearchTerm(e.target.value)}
                    placeholder={selectedPublishersForUser.length === 0 ? "Yayıncı Ara..." : ""}
                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-palette-maroon min-w-[120px] placeholder:text-palette-tan/30 ml-1"
                  />
                  {selectedPublishersForUser.length > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedPublishersForUser([]); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-palette-tan/40 hover:text-palette-red transition-colors"
                    >
                      <span className="material-symbols-rounded text-[18px]">close</span>
                    </button>
                  )}
                  {activeMultiSelect === 'publishers' && (
                    <div className="absolute top-[calc(100%+2px)] left-0 right-0 bg-white border border-palette-tan/20 rounded-[5px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[200] max-h-60 overflow-y-auto py-2 animate-in fade-in slide-in-from-top-1">
                      {publishersList.filter(p => !selectedPublishersForUser.includes(p.id) && (p.full_name?.toLowerCase().includes(pubSearchTerm.toLowerCase()) || p.email?.toLowerCase().includes(pubSearchTerm.toLowerCase()))).length === 0 ? (
                        <div className="px-5 py-4 text-center text-palette-tan/40 text-[12px] font-bold uppercase tracking-widest italic">Sonuç bulunamadı</div>
                      ) : (
                        publishersList.filter(p => !selectedPublishersForUser.includes(p.id) && (p.full_name?.toLowerCase().includes(pubSearchTerm.toLowerCase()) || p.email?.toLowerCase().includes(pubSearchTerm.toLowerCase()))).map(p => (
                          <button
                            key={p.id}
                            onClick={() => { setSelectedPublishersForUser(prev => [...prev, p.id]); setPubSearchTerm(''); setActiveMultiSelect(null); }}
                            className="w-full px-5 py-3 text-left text-[13px] font-bold text-palette-maroon hover:bg-palette-beige/30 transition-all flex items-center justify-between group/item"
                          >
                            <div className="flex flex-col">
                              <span className="group-hover/item:text-palette-red transition-colors">{p.full_name}</span>
                              <span className="text-[10px] text-palette-tan/40">{p.email}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-bold text-palette-tan/40 ml-1">Kullanıcı için Yayıncıları Seçin</p>
              </div>

              <div className="bg-palette-beige/20 p-4 rounded-[5px] border border-palette-tan/5 mt-4">
                <p className="text-[10px] font-bold text-palette-tan/40 leading-relaxed uppercase italic">
                  Not: Bir kullanıcıya birden fazla yayıncı atayarak içerik üretim yetkisini genişletebilirsiniz.
                </p>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-palette-beige bg-palette-beige/10 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseUserPublisherModal}
                className="px-5 py-2.5 font-black text-[11px] text-palette-tan/40 hover:text-palette-maroon tracking-widest uppercase"
              >
                Vazgeç
              </button>
              <button
                onClick={async () => {
                  setSaving(true);
                  try {
                    await supabase.from('publisher_users').delete().eq('user_id', targetUserForPublishers.id);
                    if (selectedPublishersForUser.length > 0) {
                      const inserts = selectedPublishersForUser.map(pubId => ({
                        user_id: targetUserForPublishers.id,
                        publisher_id: pubId
                      }));
                      const { error } = await supabase.from('publisher_users').insert(inserts);
                      if (error) throw error;
                    }
                    setStatusModal({ show: true, type: 'success', message: 'Kullanıcı yayıncıları başarıyla güncellendi.' });
                    handleCloseUserPublisherModal();
                    fetchData();
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
                <span>Kaydet</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STATUS MODAL OUTSIDE ANIMATED DIV */}
      {statusModal.show && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/20 backdrop-blur-[2px] animate-in fade-in" onClick={handleCloseStatusModal} />
          <div className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-xs overflow-hidden animate-in slide-in-from-bottom-4 border border-palette-tan/15 p-8 text-center">
            <div className={`w-14 h-14 rounded-[5px] flex items-center justify-center mx-auto mb-6 ${statusModal.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {statusModal.type === 'error' ? <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>close</span> : <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>check_circle</span>}
            </div>
            <p className="text-base font-black text-palette-maroon mb-8 leading-relaxed">{statusModal.message}</p>
            <button
              onClick={handleCloseStatusModal}
              className="w-full py-2.5 bg-palette-tan text-white rounded-[5px] font-black text-[13px] tracking-widest hover:bg-palette-maroon transition-all shadow-lg active:scale-95 uppercase"
            >
              {t('common.ok')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagement;
