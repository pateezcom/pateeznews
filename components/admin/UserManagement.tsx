
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Users2,
  Search,
  Plus,
  CheckCircle2,
  X,
  Save,
  Loader2,
  ShieldCheck,
  Fingerprint,
  Mail,
  Lock,
  User as UserIcon,
  ChevronDown,
  AlertTriangle,
  MoreVertical,
  Edit3,
  UserCog,
  Trash2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  role: string;
}

interface Role {
  id: string;
  name: string;
  label: string;
}

interface UserManagementProps {
  onEditUser: (userId: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onEditUser }) => {
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<{ show: boolean, type: 'error' | 'success', message: string }>({ show: false, type: 'success', message: '' });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    username: '',
    role: 'member'
  });

  useEffect(() => {
    fetchData();
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*');

      if (rolesError) throw rolesError;

      setProfiles(profilesData || []);
      setRoles(rolesData || []);
    } catch (err: any) {
      console.error("Veri çekme hatası:", err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
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

      if (authData.user && newUser.role !== 'member') {
        await supabase
          .from('profiles')
          .update({ role: newUser.role })
          .eq('id', authData.user.id);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowAddModal(false);
        setNewUser({ email: '', password: '', full_name: '', username: '', role: 'member' });
        fetchData();
      }, 1500);
    } catch (err: any) {
      setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', err.message) });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: selectedUser.role })
        .eq('id', selectedUser.id);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowRoleModal(false);
        fetchData();
      }, 1500);
    } catch (err: any) {
      setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', err.message) });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = (user: Profile) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userToDelete.id);
      if (error) throw error;
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchData();
    } catch (err: any) {
      setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', err.message) });
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = profiles.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleLabel = (roleName: string) => {
    return roles.find(r => r.name === roleName)?.label || roleName;
  };

  const inputClasses = "w-full h-11 pl-11 pr-4 bg-palette-beige/30 border border-palette-tan/20 rounded-[3px] text-base font-bold text-palette-maroon outline-none hover:border-palette-tan/40 focus:bg-white focus:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all placeholder:text-palette-tan/30";
  const iconClasses = "absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/40 group-focus-within:text-palette-tan transition-colors";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-6">
        <div className="w-10 h-10 border-4 border-palette-tan/20 border-t-palette-red rounded-[3px] animate-spin"></div>
        <p className="text-[13px] font-black text-palette-tan/40 tracking-widest">{t('users.status.syncing')}</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 admin-font pb-20 text-palette-tan mx-auto">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 px-2">
        <div>
          <h2 className="text-[32px] font-black text-palette-maroon tracking-tighter leading-none mb-2">{t('users.page_title')}</h2>
          <p className="text-[13px] font-bold text-palette-tan/50 tracking-wider">{t('users.page_desc')}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2 bg-palette-beige/40 border border-palette-tan/20 rounded-[3px] shadow-sm w-full max-w-md focus-within:ring-4 focus-within:ring-palette-tan/5 focus-within:border-palette-tan focus-within:bg-white transition-all group">
            <Search size={16} className="text-palette-tan/30 group-focus-within:text-palette-tan transition-colors" />
            <input
              type="text"
              placeholder={t('users.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-[14px] font-bold w-full text-palette-maroon placeholder:text-palette-tan/30"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="h-10 px-10 bg-palette-red text-white rounded-[3px] font-black text-[13px] tracking-widest hover:bg-primary-600 transition-all shadow-lg active:scale-95 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={16} strokeWidth={3} />
            <span>{t('users.add_new')}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-palette-red/5 border border-palette-red/30 rounded-[3px] flex items-center gap-4 text-palette-red">
          <AlertTriangle size={20} />
          <div className="text-sm font-bold tracking-wider">Hata: {errorMsg}</div>
        </div>
      )}

      <div className="bg-white rounded-[3px] border border-palette-tan/15 shadow-sm overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-palette-beige/20 border-b border-palette-tan/15">
              <th className="px-8 py-5 text-[13px] font-black text-palette-tan/40 tracking-widest">{t('users.table.info')}</th>
              <th className="px-8 py-5 text-[13px] font-black text-palette-tan/40 tracking-widest">{t('users.table.role')}</th>
              <th className="px-8 py-5 text-[13px] font-black text-palette-tan/40 tracking-widest text-right">{t('users.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-palette-tan/15">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-palette-beige/5 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[3px] bg-palette-beige border border-palette-tan/15 overflow-hidden flex-shrink-0">
                      <img src={user.avatar_url || `https://picsum.photos/seed/${user.id}/100`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-palette-maroon leading-none mb-1">{user.full_name || 'İsimsiz'}</h4>
                      <p className="text-[12px] text-palette-tan/50 font-bold tracking-widest">@{user.username || 'username'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[12px] font-black tracking-widest border ${user.role === 'admin' ? 'bg-palette-red/5 text-palette-red border-palette-red/25' :
                    user.role === 'moderator' ? 'bg-palette-maroon/5 text-palette-maroon border-palette-maroon/20' :
                      'bg-palette-tan/5 text-palette-tan border-palette-tan/20'
                    }`}>
                    <ShieldCheck size={12} />
                    {getRoleLabel(user.role)}
                  </div>
                </td>
                <td className="px-8 py-5 text-right relative overflow-visible">
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === user.id ? null : user.id); }}
                    className={`p-2 rounded-[3px] transition-all active:scale-90 shadow-sm ${openDropdownId === user.id ? 'bg-palette-maroon text-white' : 'bg-palette-beige/50 text-palette-tan/40 hover:bg-palette-tan hover:text-white'}`}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {openDropdownId === user.id && (
                    <div ref={dropdownRef} className="absolute right-8 top-14 w-52 bg-white rounded-[3px] shadow-2xl border border-palette-tan/15 z-[100] animate-in fade-in slide-in-from-top-2 overflow-hidden py-1.5">
                      <button
                        onClick={() => { onEditUser(user.id); setOpenDropdownId(null); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-palette-tan hover:bg-palette-beige/50 hover:text-palette-maroon transition-colors text-left"
                      >
                        <Edit3 size={14} className="text-palette-tan/30" />
                        {t('users.actions.edit')}
                      </button>
                      <button
                        onClick={() => { setSelectedUser(user); setShowRoleModal(true); setOpenDropdownId(null); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-palette-tan hover:bg-palette-beige/50 hover:text-palette-maroon transition-colors text-left"
                      >
                        <UserCog size={14} className="text-palette-tan/30" />
                        {t('users.actions.role')}
                      </button>
                      <div className="h-px bg-palette-tan/10 mx-4 my-1"></div>
                      <button
                        onClick={() => { handleDeleteUser(user); setOpenDropdownId(null); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-palette-red hover:bg-palette-red/5 transition-colors text-left"
                      >
                        <Trash2 size={14} />
                        {t('users.actions.delete')}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="p-20 text-center text-palette-tan/30">
            <Users2 size={40} className="mx-auto mb-4 opacity-20" />
            <p className="text-[13px] font-black tracking-widest">Hiç kullanıcı bulunamadı</p>
            <p className="text-[11px] mt-2 font-medium">Lütfen SQL komutlarını çalıştırdığınızdan emin olun.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/90 backdrop-blur-md animate-in fade-in" onClick={() => !saving && setShowAddModal(false)} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 flex flex-col">
            <div className="px-8 py-6 border-b border-palette-tan/15 flex items-center justify-between bg-palette-beige/10">
              <h3 className="text-[20px] font-black text-palette-maroon tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 bg-palette-red rounded-[3px] flex items-center justify-center text-white shadow-lg shadow-palette-red/20">
                  <Plus size={18} strokeWidth={3} />
                </div>
                {t('users.form.title')}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-palette-tan/40 hover:text-palette-red transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleAddUser} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-black text-palette-tan/50 ml-1">Ad Soyad</label>
                  <div className="relative group">
                    <UserIcon className={iconClasses} size={14} />
                    <input type="text" required value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} className={inputClasses} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-black text-palette-tan/50 ml-1">Kullanıcı Adı</label>
                  <div className="relative group">
                    <span className={`${iconClasses} font-black text-sm`}>@</span>
                    <input type="text" required value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value.toLowerCase().replace(' ', '_') })} className={inputClasses} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-black text-palette-tan/50 ml-1">E-Posta Adresi</label>
                <div className="relative group">
                  <Mail className={iconClasses} size={14} />
                  <input type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className={inputClasses} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-black text-palette-tan/50 ml-1">Geçici Şifre</label>
                <div className="relative group">
                  <Lock className={iconClasses} size={14} />
                  <input type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className={inputClasses} minLength={6} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-black text-palette-tan/50 ml-1">Sistem Rolü</label>
                <div className="relative group">
                  <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className={`${inputClasses} appearance-none px-4 pl-4`}>
                    {roles.map(r => <option key={r.id} value={r.name}>{r.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/30" size={16} />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={saving} className="w-full h-12 bg-palette-tan text-white rounded-[3px] font-black text-[13px] tracking-widest hover:bg-palette-maroon shadow-xl active:scale-95 flex items-center justify-center gap-3 transition-all">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>{t('users.form.add_btn')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/90 backdrop-blur-md animate-in fade-in" onClick={() => !saving && setShowRoleModal(false)} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 flex flex-col">

            <div className="px-8 py-6 border-b border-palette-tan/15 flex items-center justify-between bg-palette-beige/10">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-palette-maroon rounded-[3px] flex items-center justify-center text-white shadow-lg">
                  <Fingerprint size={18} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-palette-maroon leading-none">Yetki Güncelle</h3>
                </div>
              </div>
              <button onClick={() => setShowRoleModal(false)} className="p-1 text-palette-tan/40 hover:text-palette-red transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-palette-beige/30 rounded-[3px] border border-palette-tan/20">
                <div className="w-12 h-12 rounded-[3px] overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                  <img src={selectedUser.avatar_url || `https://picsum.photos/seed/${selectedUser.id}/100`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-base font-black text-palette-maroon leading-tight">{selectedUser.full_name || 'İsimsiz'}</h4>
                  <p className="text-[12px] font-bold text-palette-tan/60 tracking-widest">@{selectedUser.username}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-palette-tan/50 ml-1">Rol Seçimi</label>
                <div className="grid grid-cols-1 gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedUser({ ...selectedUser, role: role.name })}
                      className={`flex items-center justify-between px-5 py-4 rounded-[3px] border transition-all ${selectedUser.role === role.name
                        ? 'bg-palette-maroon border-palette-maroon text-white shadow-lg'
                        : 'bg-palette-beige/30 border-palette-tan/15 text-palette-tan hover:border-palette-maroon/20 hover:bg-palette-beige/50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={18} className={selectedUser.role === role.name ? 'text-white' : 'text-palette-tan/30'} />
                        <span className="text-[13px] font-black tracking-widest">{role.label}</span>
                      </div>
                      {selectedUser.role === role.name && <CheckCircle2 size={18} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-palette-tan/15 bg-palette-beige/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {success && <div className="flex items-center gap-1 text-emerald-600 text-[12px] font-black tracking-wider animate-in fade-in zoom-in"><CheckCircle2 size={12} /> Kaydedildi</div>}
              </div>
              <button
                onClick={handleUpdateRole}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-palette-maroon text-white rounded-[3px] font-black text-[13px] tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-40"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Kullanıcıyı Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-sm animate-in fade-in" onClick={() => !saving && setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-[3px] shadow-[0_20px_70px_rgba(0,0,0,0.2)] w-full max-w-sm overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 p-8 text-center">
            <div className="w-20 h-20 bg-red-50 text-palette-red rounded-[3px] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Trash2 size={32} />
            </div>
            <h3 className="text-[22px] font-black text-palette-maroon tracking-tight mb-3">{t('users.delete_title')}</h3>
            <p className="text-sm font-bold text-palette-tan/60 leading-relaxed mb-8">
              <span className="text-palette-maroon">"{userToDelete?.full_name}"</span> {t('users.delete_confirm').replace('{name}', '')} <br />
              <span className="text-palette-red/70">{t('users.delete_warning')}</span>
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                disabled={saving}
                className="w-full h-12 bg-palette-red text-white rounded-[3px] font-black text-[14px] tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-palette-red/20 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {t('common.delete_kalici')}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={saving}
                className="w-full h-12 bg-palette-beige/30 text-palette-tan rounded-[3px] font-black text-[14px] tracking-widest hover:bg-palette-beige/50 transition-all"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS MODAL (Success/Error) */}
      {statusModal.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/20 backdrop-blur-[2px] animate-in fade-in" onClick={() => setStatusModal({ ...statusModal, show: false })} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-xs overflow-hidden animate-in slide-in-from-bottom-4 border border-palette-tan/15 p-8 text-center">
            <div className={`w-16 h-16 rounded-[3px] flex items-center justify-center mx-auto mb-6 ${statusModal.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {statusModal.type === 'error' ? <X size={28} strokeWidth={3} /> : <CheckCircle2 size={28} strokeWidth={3} />}
            </div>
            <p className="text-base font-black text-palette-maroon mb-8 leading-relaxed">{statusModal.message}</p>
            <button
              onClick={() => setStatusModal({ ...statusModal, show: false })}
              className="w-full py-4 bg-palette-tan text-white rounded-[3px] font-black text-[14px] tracking-widest hover:bg-palette-maroon transition-all shadow-lg active:scale-95"
            >
              {t('common.ok')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
