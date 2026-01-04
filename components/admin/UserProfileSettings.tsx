
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
        .single();

      if (error) throw error;
      if (!data.social_links) data.social_links = {};
      setProfile(data);
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
    if (!passwords.old) errors.old = 'Alan zorunludur';
    if (!passwords.new) errors.new = 'Alan zorunludur';
    if (!passwords.confirm) errors.confirm = 'Alan zorunludur';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setFormErrors({ confirm: 'Şifreler uyuşmuyor.' });
      return;
    }
    setFormErrors({});
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      setSuccess(true);
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (err: any) {
      setStatusModal({ show: true, type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseStatusModal = () => {
    setStatusModal({ show: false, type: 'success', message: '' });
  };

  const updateSocial = (key: string, value: string) => {
    setProfile({
      ...profile,
      social_links: { ...profile.social_links, [key]: value }
    });
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      // For a real delete, we'd need an Edge Function to delete the auth user.
      // Here we set status to 'Engelli' as a safe alternative for the client side.
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'Engelli' })
        .eq('id', profile.id);

      if (error) throw error;
      setStatusModal({ show: true, type: 'success', message: 'Hesap başarıyla devre dışı bırakıldı.' });
      if (onBack) onBack();
    } catch (err: any) {
      setStatusModal({ show: true, type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
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
    <div className="animate-in fade-in duration-500 mx-auto pb-20 admin-font max-w-7xl">

      {/* HEADER SECTION */}
      <div className="bg-white rounded-[4px] border border-palette-tan/15 shadow-sm overflow-hidden mb-6">
        <div className="relative h-48 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 opacity-80">
          <button className="absolute top-4 right-4 bg-palette-red text-white px-4 py-2 rounded-[4px] text-[13px] font-black flex items-center gap-2 shadow-lg hover:bg-palette-maroon transition-all">
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>photo_camera</span>
            Kapak Değiştir
          </button>
        </div>

        <div className="px-8 pb-6 pt-0 relative">
          <div className="flex items-end gap-6 -mt-12 mb-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-[12px] overflow-hidden border-4 border-white shadow-xl bg-palette-beige relative">
                <img src={profile.avatar_url || `https://picsum.photos/seed/${profile.id}/200`} className="w-full h-full object-cover" />
              </div>
              <button className="absolute -bottom-1 -right-1 w-9 h-9 bg-palette-red text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-all">
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>photo_camera</span>
              </button>
            </div>
            <div className="pb-1">
              <h2 className="text-[26px] font-black text-palette-maroon leading-none mb-1.5">{profile.full_name || 'İsimsiz'}</h2>
              <div className="flex items-center gap-4 text-palette-tan/60 font-bold text-[12px]">
                <span className="flex items-center gap-1.5"><span className="material-symbols-rounded text-palette-tan/30" style={{ fontSize: '16px' }}>person</span> @{profile.username}</span>
                <span className="flex items-center gap-1.5"><span className="material-symbols-rounded text-palette-tan/30" style={{ fontSize: '16px' }}>calendar_today</span> June 2025</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-palette-tan/5 pt-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-[4px] text-[12px] font-black tracking-tight transition-all ${activeTab === 'details' ? 'bg-palette-red text-white shadow-md' : 'bg-palette-beige/20 text-palette-maroon hover:bg-palette-beige/40'}`}
            >
              Hesap Detayları
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-[4px] text-[12px] font-black tracking-tight transition-all ${activeTab === 'security' ? 'bg-palette-red text-white shadow-md' : 'bg-palette-beige/20 text-palette-maroon hover:bg-palette-beige/40'}`}
            >
              Security
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'details' ? (
        <div className="space-y-6">
          {/* HESAP DETAYLARI SECTION */}
          <div className="bg-white p-8 rounded-[4px] border border-palette-tan/15 shadow-sm space-y-8">
            <h3 className="text-[14px] font-black text-palette-maroon uppercase tracking-tight">Hesap Detayları</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[12px] font-black text-palette-tan uppercase tracking-tight opacity-70">Adı Soyadı <span className="text-palette-red">*</span></label>
                <input
                  type="text"
                  value={profile.full_name || ''}
                  onChange={e => {
                    setProfile({ ...profile, full_name: e.target.value });
                    if (formErrors.full_name) setFormErrors({ ...formErrors, full_name: '' });
                  }}
                  className={`${inputClasses} ${formErrors.full_name ? 'border-palette-red text-palette-red' : ''}`}
                />
                {formErrors.full_name && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.full_name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-black text-palette-tan uppercase tracking-tight opacity-70">Kullanıcı Adı <span className="text-palette-red">*</span></label>
                <input
                  type="text"
                  value={profile.username || ''}
                  onChange={e => {
                    setProfile({ ...profile, username: e.target.value.toLowerCase().replace(' ', '_') });
                    if (formErrors.username) setFormErrors({ ...formErrors, username: '' });
                  }}
                  className={`${inputClasses} ${formErrors.username ? 'border-palette-red text-palette-red' : ''}`}
                />
                {formErrors.username && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.username}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-black text-palette-tan uppercase tracking-tight opacity-70">Kısa Ad</label>
                <input type="text" value={profile.slug || ''} placeholder="slug_auto_generated" onChange={e => setProfile({ ...profile, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} className={inputClasses} />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-black text-palette-tan uppercase tracking-tight opacity-70">E-posta</label>
                <input type="email" value={profile.email || 'aaa@aaa.com'} readOnly className={`${inputClasses} bg-palette-beige/20 cursor-not-allowed`} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[12px] font-black text-palette-tan uppercase tracking-tight opacity-70">Telefon</label>
                <div className="relative group/input">
                  <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/30 group-focus-within/input:text-palette-maroon transition-colors" style={{ fontSize: '20px' }}>call</span>
                  <input type="text" value={profile.phone || ''} placeholder="+90XXXXXXXXXX" onChange={e => setProfile({ ...profile, phone: e.target.value })} className={iconInputClasses} />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[12px] font-black text-palette-tan uppercase tracking-tight opacity-70">Hakkımda</label>
                <textarea
                  rows={4}
                  value={profile.about_me || ''}
                  onChange={e => setProfile({ ...profile, about_me: e.target.value })}
                  className="w-full p-4 bg-white border border-palette-tan/20 rounded-[3px] text-base font-bold text-palette-maroon outline-none hover:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* SOSYAL HESAPLAR SECTION */}
          <div className="bg-white p-8 rounded-[4px] border border-palette-tan/15 shadow-sm space-y-8">
            <h3 className="text-[14px] font-black text-palette-maroon uppercase tracking-tight">Sosyal Hesaplar</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'facebook', icon: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/username' },
                { id: 'twitter', icon: 'public', label: 'Twitter', placeholder: 'https://twitter.com/username' },
                { id: 'instagram', icon: 'photo_camera', label: 'Instagram', placeholder: 'https://instagram.com/username' },
                { id: 'tiktok', icon: 'content_copy', label: 'TikTok', placeholder: 'https://tiktok.com/@username' },
                { id: 'youtube', icon: 'smart_display', label: 'YouTube', placeholder: 'https://youtube.com/c/channel' },
                { id: 'whatsapp', icon: 'chat', label: 'WhatsApp', placeholder: 'https://wa.me/905XXXXXXXXX' },
                { id: 'telegram', icon: 'send', label: 'Telegram', placeholder: 'https://t.me/username' },
                { id: 'discord', icon: 'sports_esports', label: 'Discord', placeholder: 'https://discord.gg/XXXXX' },
                { id: 'pinterest', icon: 'image', label: 'Pinterest', placeholder: 'https://pinterest.com/username' },
                { id: 'linkedin', icon: 'business', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
                { id: 'twitch', icon: 'tv', label: 'Twitch', placeholder: 'https://twitch.tv/username' },
                { id: 'vk', icon: 'person', label: 'VK', placeholder: 'https://vk.com/username' },
                { id: 'website', icon: 'language', label: 'Kişisel Web Sitesi URL\'si', placeholder: 'https://website.com' },
              ].map((social) => (
                <div key={social.id} className="space-y-2 group">
                  <label className="text-[12px] font-black text-palette-tan uppercase tracking-tight opacity-70">{social.label}</label>
                  <div className="relative group/input">
                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/30 group-focus-within/input:text-palette-maroon transition-colors" style={{ fontSize: '18px' }}>{social.icon}</span>
                    <input
                      type="text"
                      value={profile.social_links?.[social.id] || ''}
                      onChange={e => updateSocial(social.id, e.target.value)}
                      placeholder={social.placeholder}
                      className={iconInputClasses}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={handleSaveDetails}
                disabled={saving}
                className="px-4 py-2 bg-palette-red text-white rounded-[4px] font-black text-[13px] tracking-tight hover:bg-palette-maroon shadow-md active:scale-95 flex items-center gap-2 transition-all"
              >
                {saving ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>save</span>}
                Değişiklikleri Kaydet
              </button>
            </div>
          </div>

          {/* HESABI SIL SECTION */}
          <div className="bg-white p-8 rounded-[4px] border border-palette-tan/15 shadow-sm space-y-8">
            <h3 className="text-[14px] font-black text-palette-maroon uppercase tracking-tight">Hesabı Sil</h3>

            <div className="bg-orange-50 border border-orange-100 p-6 rounded-[4px]">
              <h4 className="text-[13px] font-black text-orange-600 mb-2 uppercase tracking-tight">Hesap Silmeyi Onayla</h4>
              <p className="text-[13px] font-bold text-orange-600/70">Hesabınızı sildiğinizde geri dönüş yoktur. Lütfen emin olun.</p>
            </div>

            <div className="flex items-center gap-3 pl-1">
              <input
                type="checkbox"
                checked={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.checked)}
                className="w-4 h-4 rounded-[3px] border-palette-tan/20 text-palette-red focus:ring-palette-red cursor-pointer"
              />
              <span className="text-[13px] font-bold text-palette-maroon">Hesap silmemi onaylıyorum</span>
            </div>

            <button
              onClick={handleDeleteAccount}
              disabled={!deleteConfirm || saving}
              className="px-4 py-2 bg-palette-red text-white rounded-[4px] font-black text-[13px] tracking-tight hover:bg-palette-maroon shadow-md active:scale-95 disabled:opacity-30 transition-all uppercase flex items-center gap-2"
            >
              {saving && <span className="material-symbols-rounded animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>}
              Hesabı Devre Dışı Bırak / Sil
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-[4px] border border-palette-tan/15 shadow-sm space-y-10 animate-in fade-in duration-300">
          <h3 className="text-[15px] font-black text-palette-maroon uppercase tracking-tight">Şifre Değiştir</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 col-span-2">
              <label className="text-[13px] font-black text-palette-maroon uppercase tracking-tight">Eski Şifre <span className="text-palette-red">*</span></label>
              <div className="relative">
                <input
                  type={showPassword.old ? "text" : "password"}
                  placeholder=".........."
                  value={passwords.old}
                  onChange={e => {
                    setPasswords({ ...passwords, old: e.target.value });
                    if (formErrors.old) setFormErrors({ ...formErrors, old: '' });
                  }}
                  className={`${inputClasses} ${formErrors.old ? 'border-palette-red text-palette-red' : ''}`}
                />
                <button onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })} className="absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/40 hover:text-palette-maroon transition-colors">
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>{showPassword.old ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {formErrors.old && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.old}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-black text-palette-maroon uppercase tracking-tight">Yeni Şifre <span className="text-palette-red">*</span></label>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  placeholder=".........."
                  value={passwords.new}
                  onChange={e => {
                    setPasswords({ ...passwords, new: e.target.value });
                    if (formErrors.new) setFormErrors({ ...formErrors, new: '' });
                  }}
                  className={`${inputClasses} ${formErrors.new ? 'border-palette-red text-palette-red' : ''}`}
                />
                <button onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })} className="absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/40 hover:text-palette-maroon transition-colors">
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>{showPassword.new ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {formErrors.new && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.new}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-black text-palette-maroon uppercase tracking-tight">Şifreyi Onayla <span className="text-palette-red">*</span></label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  placeholder=".........."
                  value={passwords.confirm}
                  onChange={e => {
                    setPasswords({ ...passwords, confirm: e.target.value });
                    if (formErrors.confirm) setFormErrors({ ...formErrors, confirm: '' });
                  }}
                  className={`${inputClasses} ${formErrors.confirm ? 'border-palette-red text-palette-red' : ''}`}
                />
                <button onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })} className="absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/40 hover:text-palette-maroon transition-colors">
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>{showPassword.confirm ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {formErrors.confirm && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.confirm}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[13px] font-black text-palette-tan/60 uppercase tracking-tight">Şifre Gereksinimleri</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-3 text-[14px] font-bold text-palette-tan/60">
                <div className="w-1.5 h-1.5 rounded-full bg-palette-tan/40"></div>
                Şifre en az 6 karakter olmalıdır
              </li>
              <li className="flex items-center gap-3 text-[14px] font-bold text-palette-tan/60">
                <div className="w-1.5 h-1.5 rounded-full bg-palette-tan/40"></div>
                En az bir küçük harf
              </li>
              <li className="flex items-center gap-3 text-[14px] font-bold text-palette-tan/60">
                <div className="w-1.5 h-1.5 rounded-full bg-palette-tan/40"></div>
                En az bir özel karakter veya rakam
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={handleUpdatePassword}
              disabled={saving}
              className="px-4 py-2 bg-palette-red text-white rounded-[4px] font-black text-[13px] tracking-tight hover:bg-palette-maroon shadow-md active:scale-95 flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>save</span>
              Değişiklikleri Kaydet
            </button>
          </div>
        </div>
      )}

      {/* STATUS MODAL */}
      {statusModal.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/20 backdrop-blur-[2px] animate-in fade-in" onClick={handleCloseStatusModal} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-xs overflow-hidden animate-in slide-in-from-bottom-4 border border-palette-tan/15 p-8 text-center">
            <div className={`w-16 h-16 rounded-[3px] flex items-center justify-center mx-auto mb-6 ${statusModal.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {statusModal.type === 'error' ? <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>close</span> : <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>check_circle</span>}
            </div>
            <p className="text-base font-black text-palette-maroon mb-8 leading-relaxed">{statusModal.message}</p>
            <button
              onClick={handleCloseStatusModal}
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

export default UserProfileSettings;
