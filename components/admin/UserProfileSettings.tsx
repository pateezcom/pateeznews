
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';

interface UserProfileSettingsProps {
  userId?: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ userId, onSuccess, onBack }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'security'>('details');
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });
  const [statusModal, setStatusModal] = useState<{ show: boolean, type: 'error' | 'success', message: string }>({ show: false, type: 'success', message: '' });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [passwords, setPasswords] = useState({
    old: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      let targetId = userId;

      if (!targetId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        targetId = user.id;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        if (!data.social_links) data.social_links = {};
        setProfile(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDetails = async () => {
    const errors: Record<string, string> = {};
    if (!profile.full_name) errors.full_name = 'Alan zorunludur';
    if (!profile.username) errors.username = 'Alan zorunludur';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setSaving(true);
    try {
      // Uniqueness check for username
      const { data: conflict } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', profile.username)
        .neq('id', profile.id)
        .maybeSingle();

      if (conflict) {
        setFormErrors({ username: 'Kullanıcı adı zaten kullanımda' });
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          username: profile.username,
          slug: profile.slug,
          about_me: profile.about_me,
          social_links: profile.social_links,
          phone: profile.phone
        })
        .eq('id', profile.id);

      if (error) throw error;
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', err.message) });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    const errors: Record<string, string> = {};
    if (!passwords.old) errors.old = 'Eski şifre zorunludur';
    if (!passwords.new) errors.new = 'Yeni şifre zorunludur';
    if (passwords.new !== passwords.confirm) errors.confirm = 'Şifreler uyuşmuyor';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', err.message) });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setStatusModal({ show: true, type: 'error', message: 'Lütfen onay kutusunu işaretleyin.' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', profile.id);
      if (error) throw error;

      // If it's the current user, sign out
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === profile.id) {
        await supabase.auth.signOut();
        window.location.reload();
      } else if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', err.message) });
    } finally {
      setSaving(false);
      setDeleteConfirmModal(false);
    }
  };

  const handleCloseStatusModal = () => {
    setStatusModal({ show: false, type: 'success', message: '' });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[400px] gap-4">
      <span className="material-symbols-rounded animate-spin text-palette-red" style={{ fontSize: '32px' }}>progress_activity</span>
      <span className="text-[13px] font-black tracking-widest text-palette-tan/40">{t('admin.post.loading_profile')}</span>
    </div>
  );

  const inputClasses = "w-full h-10 px-4 bg-white border border-palette-tan/20 rounded-[3px] text-base font-bold text-palette-maroon outline-none hover:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all placeholder:text-palette-tan/30";
  const iconInputClasses = "w-full h-10 pl-12 pr-4 bg-white border border-palette-tan/20 rounded-[3px] text-base font-bold text-palette-maroon outline-none hover:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all placeholder:text-palette-tan/30";

  return (
    <div className="animate-in fade-in duration-500 mx-auto pb-20 admin-font max-w-5xl">
      {/* ON BACK */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 mb-6 group">
          <div className="w-8 h-8 rounded-full bg-palette-beige/20 flex items-center justify-center group-hover:bg-palette-red group-hover:text-white transition-all">
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>arrow_back</span>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-palette-tan/40 group-hover:text-palette-maroon transition-all">Geri Dön</span>
        </button>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-palette-maroon uppercase tracking-tight mb-2">{t('admin.settings.title')}</h2>
          <p className="text-[13px] font-bold text-palette-tan/40">{t('admin.settings.desc')}</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-8 border-b border-palette-tan/10 mb-8">
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'details' ? 'text-palette-maroon' : 'text-palette-tan/40 hover:text-palette-tan'}`}
        >
          {t('admin.settings.tabs.details')}
          {activeTab === 'details' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-palette-red rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'security' ? 'text-palette-maroon' : 'text-palette-tan/40 hover:text-palette-tan'}`}
        >
          {t('admin.settings.tabs.security')}
          {activeTab === 'security' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-palette-red rounded-t-full" />}
        </button>
      </div>

      {activeTab === 'details' ? (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[4px] border border-palette-tan/15 shadow-sm space-y-8">
            <h3 className="text-[14px] font-black text-palette-maroon uppercase tracking-tight border-b border-palette-tan/5 pb-4">{t('admin.settings.details.title')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">{t('admin.settings.details.name')} <span className="text-palette-red">*</span></label>
                <input
                  type="text"
                  value={profile?.full_name || ''}
                  onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                  className={`${inputClasses} ${formErrors.full_name ? 'border-palette-red text-palette-red' : ''}`}
                />
                {formErrors.full_name && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.full_name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">{t('admin.settings.details.username')} <span className="text-palette-red">*</span></label>
                <input
                  type="text"
                  value={profile?.username || ''}
                  onChange={e => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(' ', '_') })}
                  className={`${inputClasses} ${formErrors.username ? 'border-palette-red text-palette-red' : ''}`}
                />
                {formErrors.username && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.username}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">{t('admin.settings.details.phone')}</label>
                <input
                  type="text"
                  value={profile?.phone || ''}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className={inputClasses}
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">{t('admin.settings.details.about')}</label>
                <textarea
                  rows={4}
                  value={profile?.about_me || ''}
                  onChange={e => setProfile({ ...profile, about_me: e.target.value })}
                  className="w-full p-4 bg-white border border-palette-tan/20 rounded-[3px] text-base font-bold text-palette-maroon outline-none hover:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all resize-none"
                />
              </div>
            </div>

            <div className="pt-8 border-t border-palette-tan/5">
              <button
                onClick={handleSaveDetails}
                disabled={saving}
                className="px-6 py-2.5 bg-palette-red text-white rounded-[4px] font-black text-[13px] tracking-widest hover:bg-palette-maroon shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all uppercase"
              >
                {saving ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '18px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>save</span>}
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[4px] border border-palette-tan/15 shadow-sm space-y-8">
            <h3 className="text-[14px] font-black text-palette-maroon uppercase tracking-tight border-b border-palette-tan/5 pb-4">{t('admin.settings.security.title')}</h3>

            <div className="max-w-md space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">{t('admin.settings.security.old_pass')}</label>
                <div className="relative">
                  <input
                    type={showPassword.old ? 'text' : 'password'}
                    value={passwords.old}
                    onChange={e => setPasswords({ ...passwords, old: e.target.value })}
                    className={inputClasses}
                  />
                  <button onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })} className="absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/30">
                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{showPassword.old ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {formErrors.old && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.old}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">{t('admin.settings.security.new_pass')}</label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwords.new}
                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                    className={inputClasses}
                  />
                  <button onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })} className="absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/30">
                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{showPassword.new ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {formErrors.new && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.new}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">{t('admin.settings.security.confirm_pass')}</label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwords.confirm}
                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                    className={inputClasses}
                  />
                  <button onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })} className="absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/30">
                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{showPassword.confirm ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {formErrors.confirm && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.confirm}</p>}
              </div>
            </div>

            <div className="pt-8 border-t border-palette-tan/5">
              <button
                onClick={handleUpdatePassword}
                disabled={saving}
                className="px-6 py-2.5 bg-palette-maroon text-white rounded-[4px] font-black text-[13px] tracking-widest hover:bg-gray-900 shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all uppercase"
              >
                {saving ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>lock_reset</span>}
                {t('admin.settings.security.update_btn')}
              </button>
            </div>
          </div>

          <div className="bg-red-50 p-8 rounded-[4px] border border-red-100 space-y-6">
            <div>
              <h3 className="text-[14px] font-black text-red-700 uppercase tracking-tight mb-2">{t('admin.settings.danger.title')}</h3>
              <p className="text-[12px] font-bold text-red-600/70">{t('admin.settings.danger.desc')}</p>
            </div>

            <button
              onClick={() => setDeleteConfirmModal(true)}
              className="px-6 py-2.5 bg-white text-red-600 border border-red-200 rounded-[4px] font-black text-[11px] tracking-widest hover:bg-red-600 hover:text-white transition-all uppercase"
            >
              {t('admin.settings.danger.delete_btn')}
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-sm animate-in fade-in" onClick={() => setDeleteConfirmModal(false)} />
          <div className="relative bg-white rounded-[4px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 border border-palette-tan/15">
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-rounded" style={{ fontSize: '32px' }}>warning</span>
              </div>
              <h3 className="text-xl font-black text-palette-maroon uppercase tracking-tight mb-4">Hesabı Silmek Üzeresiniz</h3>
              <p className="text-[13px] font-bold text-palette-tan/60 leading-relaxed mb-8">
                Bu işlem geri alınamaz. Hesabınızla ilişkili tüm veriler kalıcı olarak silinecektir. Devam etmek istediğinizden emin misiniz?
              </p>

              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-[4px] border border-gray-100 mb-8 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.checked)}
                  className="w-5 h-5 rounded-[4px] border-palette-tan/30 text-red-600 focus:ring-red-600 transition-all"
                />
                <span className="text-[12px] font-black text-palette-maroon/60 group-hover:text-palette-maroon transition-colors uppercase">Anlıyorum, silme işlemini onayla</span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDeleteConfirmModal(false)}
                  className="flex-1 py-3 text-[11px] font-black text-palette-tan/40 uppercase tracking-widest hover:text-palette-maroon transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={saving || !deleteConfirm}
                  className="flex-1 py-3 bg-red-600 text-white rounded-[4px] font-black text-[11px] uppercase tracking-widest hover:bg-red-700 shadow-lg transition-all disabled:opacity-30 active:scale-95"
                >
                  {saving ? 'Siliniyor...' : 'Hesabı Kalıcı Olarak Sil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATUS MODAL */}
      {statusModal.show && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/20 backdrop-blur-[2px] animate-in fade-in" onClick={handleCloseStatusModal} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-xs overflow-hidden animate-in slide-in-from-bottom-4 border border-palette-tan/15 p-8 text-center">
            <div className={`w-14 h-14 rounded-[3px] flex items-center justify-center mx-auto mb-6 ${statusModal.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {statusModal.type === 'error' ? <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>close</span> : <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>check_circle</span>}
            </div>
            <p className="text-base font-black text-palette-maroon mb-8 leading-relaxed uppercase">{statusModal.message}</p>
            <button
              onClick={handleCloseStatusModal}
              className="w-full py-2.5 bg-palette-tan text-white rounded-[3px] font-black text-[13px] tracking-widest hover:bg-palette-maroon transition-all shadow-lg active:scale-95 uppercase"
            >
              TAMAM
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileSettings;
