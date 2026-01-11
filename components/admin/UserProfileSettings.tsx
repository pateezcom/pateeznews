
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { storageService } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';

interface UserProfileSettingsProps {
  userId?: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

type TabType = 'update_profile' | 'social_accounts' | 'preferences' | 'change_password' | 'delete_account';

const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ userId, onSuccess, onBack }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');
  const [activeTab, setActiveTab] = useState<TabType>('update_profile');
  const [uploadingImage, setUploadingImage] = useState<'avatar' | 'cover' | null>(null);
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });
  const [statusModal, setStatusModal] = useState<{ show: boolean, type: 'error' | 'success', message: string }>({ show: false, type: 'success', message: '' });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const prefColumnsRef = useRef<{ show_email: boolean; rss_feeds: boolean }>({ show_email: false, rss_feeds: false });

  const [passwords, setPasswords] = useState({
    old: '',
    new: '',
    confirm: ''
  });

  const [formData, setFormData] = useState<any>({
    id: '',
    full_name: '',
    username: '',
    email: '',
    phone: '',
    about_me: '',
    expertise: '',
    foundation_date: '',
    address: '',
    website: '',
    slug: '',
    social_links: {},
    reward_system: false,
    meta_title: '',
    meta_keywords: '',
    meta_description: '',
    canonical_url: '',
    avatar_url: '',
    cover_url: '',
    show_email: true,
    rss_feeds: true
  });

  const normalizeProfileMediaUrl = (input: any): string => {
    if (!input) return '';
    const url = String(input).trim();
    if (!url) return '';
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('data:') ||
      url.startsWith('/')
    ) {
      return url;
    }
    if (url.startsWith('api/storage/file/')) return `/${url}`;
    if (url.startsWith('profile/')) return `/api/storage/file/${url}`;
    return `/api/storage/file/profile/${url}`;
  };

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
        prefColumnsRef.current = {
          show_email: Object.prototype.hasOwnProperty.call(data, 'show_email'),
          rss_feeds: Object.prototype.hasOwnProperty.call(data, 'rss_feeds')
        };
        const socialLinks = typeof data.social_links === 'string' ? JSON.parse(data.social_links) : (data.social_links || {});
        setFormData({
          id: data.id,
          full_name: data.full_name || '',
          username: data.username || '',
          email: data.email || '',
          phone: data.phone || '',
          about_me: data.about_me || '',
          expertise: data.expertise || '',
          foundation_date: data.foundation_date || '',
          address: data.address || '',
          website: data.website || '',
          slug: data.slug || '',
          social_links: socialLinks,
          reward_system: data.reward_system || false,
          meta_title: data.meta_title || '',
          meta_keywords: data.meta_keywords || '',
          meta_description: data.meta_description || '',
          canonical_url: data.canonical_url || '',
          avatar_url: normalizeProfileMediaUrl(data.avatar_url),
          cover_url: normalizeProfileMediaUrl(socialLinks.cover_url),
          show_email: data.show_email !== undefined ? data.show_email : true,
          rss_feeds: data.rss_feeds !== undefined ? data.rss_feeds : true
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    const targetId = formData.id || userId;
    if (!file || !targetId) return;

    setUploadingImage(type);
    try {
      const customName = `${targetId}-${type}`;
      const result = await storageService.uploadFile(file, undefined, 'profile', undefined, customName);
      if (result) {
        const finalUrl = result.src;

        if (type === 'avatar') {
          setFormData((prev: any) => ({ ...prev, avatar_url: finalUrl }));
        } else {
          setFormData((prev: any) => {
            const prevSocialLinks =
              typeof prev.social_links === 'string'
                ? (() => {
                  try {
                    return JSON.parse(prev.social_links);
                  } catch {
                    return {};
                  }
                })()
                : (prev.social_links || {});

            return {
              ...prev,
              cover_url: finalUrl,
              social_links: { ...prevSocialLinks, cover_url: finalUrl }
            };
          });
        }
      }
    } catch (err) {
      console.error(`Error uploading ${type}:`, err);
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSaveDetails = async () => {
    const errors: Record<string, string> = {};
    if (!formData.full_name) errors.full_name = 'Alan zorunludur';
    if (!formData.username) errors.username = 'Alan zorunludur';

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
        .eq('username', formData.username)
        .neq('id', formData.id)
        .maybeSingle();

      if (conflict) {
        setFormErrors({ username: 'Kullanıcı adı zaten kullanımda' });
        setSaving(false);
        return;
      }

      const baseSocialLinks =
        ((typeof formData.social_links === 'string' ? JSON.parse(formData.social_links) : formData.social_links) || {});

      const updatePayload: Record<string, any> = {
        full_name: formData.full_name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        about_me: formData.about_me,
        expertise: formData.expertise,
        foundation_date: formData.foundation_date,
        address: formData.address,
        website: formData.website,
        slug: formData.slug,
        social_links: { ...baseSocialLinks, cover_url: normalizeProfileMediaUrl(formData.cover_url) },
        reward_system: formData.reward_system,
        meta_title: formData.meta_title,
        meta_keywords: formData.meta_keywords,
        meta_description: formData.meta_description,
        canonical_url: formData.canonical_url,
        avatar_url: normalizeProfileMediaUrl(formData.avatar_url),
        updated_at: new Date().toISOString()
      };

      if (prefColumnsRef.current.show_email) updatePayload.show_email = formData.show_email;
      if (prefColumnsRef.current.rss_feeds) updatePayload.rss_feeds = formData.rss_feeds;

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', formData.id);

      if (error) throw error;

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
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
      setSaveStatus('success');
      setPasswords({ old: '', new: '', confirm: '' });
      setTimeout(() => setSaveStatus('idle'), 3000);
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
      const { error } = await supabase.from('profiles').delete().eq('id', formData.id);
      if (error) throw error;

      // If it's the current user, sign out
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === formData.id) {
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

  const tabs = [
    { id: 'update_profile', label: 'Profil Bilgileri' },
    { id: 'social_accounts', label: 'Sosyal Hesaplar' },
    { id: 'preferences', label: 'Tercihler' },
    { id: 'change_password', label: 'Şifre Değiştir' },
    { id: 'delete_account', label: 'Hesabı Sil' }
  ];

  const inputClasses = "w-full h-11 px-4 bg-white border border-palette-tan/15 rounded-[5px] text-[14px] font-bold text-palette-maroon outline-none focus:border-palette-red focus:ring-4 focus:ring-palette-red/5 transition-all placeholder:text-palette-tan/20 disabled:opacity-50";
  const labelClasses = "text-[12px] font-black text-palette-tan/60 uppercase tracking-widest block";

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <span className="material-symbols-rounded animate-spin text-palette-red" style={{ fontSize: '42px' }}>progress_activity</span>
      <p className="text-[13px] font-black text-palette-tan/40 uppercase tracking-widest">Veriler Yükleniyor...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 pb-20 space-y-8">

      {/* Hidden Inputs */}
      <input
        type="file"
        ref={avatarInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleImageUpload(e, 'avatar')}
      />
      <input
        type="file"
        ref={coverInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleImageUpload(e, 'cover')}
      />

      {/* ON BACK */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-[5px] bg-palette-beige/20 flex items-center justify-center group-hover:bg-palette-red group-hover:text-white transition-all">
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>arrow_back</span>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-palette-tan/40 group-hover:text-palette-maroon transition-all">Geri Dön</span>
        </button>
      )}

      {/* TABS */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-5 py-2.5 rounded-[5px] text-[13px] font-black uppercase tracking-tight transition-all shadow-sm ${activeTab === tab.id
              ? 'bg-palette-red text-white shadow-palette-red/20'
              : 'bg-white text-palette-maroon hover:bg-palette-beige border border-palette-tan/5'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="bg-white rounded-[5px] border border-palette-tan/15 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">

        {/* COVER & AVATAR SECTION */}
        <div className="relative h-48 md:h-56 overflow-hidden bg-palette-beige/30 group">
          {formData.cover_url ? (
            <img src={formData.cover_url} className="w-full h-full object-cover" alt="Cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-palette-beige/50 to-palette-tan/10 flex items-center justify-center">
              <span className="material-symbols-rounded text-palette-tan/20" style={{ fontSize: '48px' }}>landscape</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-palette-maroon/40 via-transparent to-transparent" />

          <div className="absolute inset-0 flex items-center justify-center z-10">
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingImage === 'cover'}
              className="p-3.5 bg-white/20 backdrop-blur-md rounded-[5px] text-white border border-white/30 hover:bg-white/40 transition-all transform hover:scale-105 shadow-lg"
            >
              {uploadingImage === 'cover' ? (
                <span className="material-symbols-rounded animate-spin" style={{ fontSize: '24px' }}>progress_activity</span>
              ) : (
                <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>photo_camera</span>
              )}
            </button>
          </div>
        </div>

        {/* AVATAR & USER INFO */}
        <div className="px-8 relative pb-6 border-b border-palette-tan/10">
          <div className="absolute -top-14 left-8 w-28 h-28 rounded-[5px] border-4 border-white overflow-hidden shadow-xl bg-palette-beige/30 z-10 group/avatar">
            {formData.avatar_url ? (
              <img src={formData.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-palette-beige/50">
                <span className="material-symbols-rounded text-palette-tan/30" style={{ fontSize: '32px' }}>person</span>
              </div>
            )}
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 bg-palette-maroon/40 flex items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity"
            >
              {uploadingImage === 'avatar' ? (
                <span className="material-symbols-rounded animate-spin text-white" style={{ fontSize: '20px' }}>progress_activity</span>
              ) : (
                <span className="material-symbols-rounded text-white drop-shadow-md" style={{ fontSize: '20px' }}>photo_camera</span>
              )}
            </div>
          </div>

          <div className="pt-20">
            <div className="ml-0 md:ml-36">
              <h1 className="text-2xl font-black text-palette-maroon tracking-tight leading-none mb-1">{formData.full_name || 'Kullanıcı Adı'}</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-palette-red tracking-tight">@{formData.username}</span>
                <span className="w-1 h-1 bg-palette-tan/30 rounded-full" />
                <span className="text-[10px] font-black text-palette-tan/40 uppercase tracking-widest">{formData.expertise || 'Profil Ayarları'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION TITLE & FORM */}
        <div className="p-8 space-y-10">

          <div className="space-y-8">
            <h3 className="text-lg font-black text-palette-maroon uppercase tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-6 bg-palette-red rounded-full"></div>
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>

            <div className="space-y-6">

              {activeTab === 'update_profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="flex flex-col gap-2">
                    <label className={labelClasses}>Ad Soyad <span className="text-palette-red">*</span></label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className={`${inputClasses} ${formErrors.full_name ? 'border-palette-red' : ''}`}
                    />
                    {formErrors.full_name && <p className="text-[10px] font-bold text-palette-red">{formErrors.full_name}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={labelClasses}>Kullanıcı Adı <span className="text-palette-red">*</span></label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(' ', '_') })}
                      className={`${inputClasses} ${formErrors.username ? 'border-palette-red' : ''}`}
                    />
                    {formErrors.username && <p className="text-[10px] font-bold text-palette-red">{formErrors.username}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={labelClasses}>E-posta</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClasses}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={labelClasses}>Telefon</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputClasses}
                      placeholder="+90 5XX XXX XX XX"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={labelClasses}>Uzmanlık / Kategori</label>
                    <input
                      type="text"
                      value={formData.expertise}
                      onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                      className={inputClasses}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={labelClasses}>Kuruluş / Doğum Tarihi</label>
                    <input
                      type="text"
                      value={formData.foundation_date}
                      onChange={(e) => setFormData({ ...formData, foundation_date: e.target.value })}
                      className={inputClasses}
                    />
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className={labelClasses}>Adres</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                      className="w-full p-4 bg-white border border-palette-tan/15 rounded-[5px] text-[14px] font-bold text-palette-maroon outline-none focus:border-palette-red transition-all resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className={labelClasses}>Web Sitesi</label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className={inputClasses}
                    />
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className={labelClasses}>Hakkımda / Biyografi</label>
                    <textarea
                      value={formData.about_me}
                      onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
                      rows={4}
                      className="w-full p-4 bg-white border border-palette-tan/15 rounded-[5px] text-[14px] font-bold text-palette-maroon outline-none focus:border-palette-red transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'social_accounts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {[
                    'Facebook', 'Twitter', 'Instagram', 'Tiktok', 'WhatsApp',
                    'YouTube', 'Discord', 'Telegram', 'Pinterest', 'Linkedin',
                    'Twitch', 'VK', 'NSosyal', 'Personal Website URL'
                  ].map((platform) => (
                    <div key={platform} className="flex flex-col gap-2">
                      <label className={labelClasses}>{platform}</label>
                      <input
                        type="text"
                        placeholder={`${platform} URL/Username`}
                        value={formData.social_links[platform.toLowerCase().replace(/ /g, '_')] || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: {
                            ...formData.social_links,
                            [platform.toLowerCase().replace(/ /g, '_')]: e.target.value
                          }
                        })}
                        className={inputClasses}
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="grid grid-cols-1 gap-10">
                  <div className="flex flex-col gap-4">
                    <label className={labelClasses}>Profil Sayfasında E-posta Göster</label>
                    <div className="flex items-center gap-12">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            name="show_email"
                            checked={formData.show_email === true}
                            onChange={() => setFormData({ ...formData, show_email: true })}
                            className="peer appearance-none w-5 h-5 border-2 border-palette-tan/30 rounded-full checked:border-palette-red transition-all"
                          />
                          <div className="absolute w-2.5 h-2.5 bg-palette-red rounded-full opacity-0 peer-checked:opacity-100 transition-all" />
                        </div>
                        <span className="text-sm font-bold text-palette-tan/60 group-hover:text-palette-maroon transition-colors">Evet</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            name="show_email"
                            checked={formData.show_email === false}
                            onChange={() => setFormData({ ...formData, show_email: false })}
                            className="peer appearance-none w-5 h-5 border-2 border-palette-tan/30 rounded-full checked:border-palette-red transition-all"
                          />
                          <div className="absolute w-2.5 h-2.5 bg-palette-red rounded-full opacity-0 peer-checked:opacity-100 transition-all" />
                        </div>
                        <span className="text-sm font-bold text-palette-tan/60 group-hover:text-palette-maroon transition-colors">Hayır</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <label className={labelClasses}>RSS Feeds</label>
                    <div className="flex items-center gap-12">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            name="rss_feeds"
                            checked={formData.rss_feeds === true}
                            onChange={() => setFormData({ ...formData, rss_feeds: true })}
                            className="peer appearance-none w-5 h-5 border-2 border-palette-tan/30 rounded-full checked:border-palette-red transition-all"
                          />
                          <div className="absolute w-2.5 h-2.5 bg-palette-red rounded-full opacity-0 peer-checked:opacity-100 transition-all" />
                        </div>
                        <span className="text-sm font-bold text-palette-tan/60 group-hover:text-palette-maroon transition-colors">Evet</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            name="rss_feeds"
                            checked={formData.rss_feeds === false}
                            onChange={() => setFormData({ ...formData, rss_feeds: false })}
                            className="peer appearance-none w-5 h-5 border-2 border-palette-tan/30 rounded-full checked:border-palette-red transition-all"
                          />
                          <div className="absolute w-2.5 h-2.5 bg-palette-red rounded-full opacity-0 peer-checked:opacity-100 transition-all" />
                        </div>
                        <span className="text-sm font-bold text-palette-tan/60 group-hover:text-palette-maroon transition-colors">Hayır</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'change_password' && (
                <div className="grid grid-cols-1 gap-6 max-w-md">
                  <div className="flex flex-col gap-2">
                    <label className={labelClasses}>Eski Şifre</label>
                    <div className="relative">
                      <input
                        type={showPassword.old ? 'text' : 'password'}
                        value={passwords.old}
                        onChange={e => setPasswords({ ...passwords, old: e.target.value })}
                        className={inputClasses}
                        placeholder="••••••••"
                      />
                      <button onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })} className="absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/30">
                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{showPassword.old ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    {formErrors.old && <p className="text-[10px] font-bold text-palette-red">{formErrors.old}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={labelClasses}>Yeni Şifre</label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? 'text' : 'password'}
                        value={passwords.new}
                        onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                        className={inputClasses}
                        placeholder="••••••••"
                      />
                      <button onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })} className="absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/30">
                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{showPassword.new ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    {formErrors.new && <p className="text-[10px] font-bold text-palette-red">{formErrors.new}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={labelClasses}>Yeni Şifre (Tekrar)</label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={passwords.confirm}
                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                        className={inputClasses}
                        placeholder="••••••••"
                      />
                      <button onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })} className="absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/30">
                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>{showPassword.confirm ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    {formErrors.confirm && <p className="text-[10px] font-bold text-palette-red">{formErrors.confirm}</p>}
                  </div>

                  <button
                    onClick={handleUpdatePassword}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 h-10 bg-palette-maroon text-white rounded-[5px] text-[13px] font-black tracking-widest hover:bg-gray-900 transition-all shadow-lg active:scale-95 uppercase"
                  >
                    {saving ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '18px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>lock_reset</span>}
                    Parolayı Güncelle
                  </button>
                </div>
              )}

              {activeTab === 'delete_account' && (
                <div className="p-6 bg-red-50 rounded-[5px] border border-red-100 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-palette-red rounded-[5px] text-white">
                      <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>delete</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-red-900 mb-1">Hesabınızı silmek istediğinize emin misiniz?</h4>
                      <p className="text-[12px] text-red-700 font-medium leading-relaxed">
                        Bu işlem geri alınamaz. Tüm verileriniz, takipçileriniz ve içerikleriniz kalıcı olarak silinecektir.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteConfirmModal(true)}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-palette-red text-white rounded-[5px] text-[11px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl active:scale-95"
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>delete</span>
                    Hesabımı Kalıcı Olarak Sil
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* SAVE BUTTON (only visible for update profile, social accounts, and preferences) */}
          {(activeTab === 'update_profile' || activeTab === 'social_accounts' || activeTab === 'preferences') && (
            <div className="pt-8 border-t border-palette-tan/5 flex justify-end">
              <button
                onClick={handleSaveDetails}
                disabled={loading || saving}
                className={`flex items-center gap-2 px-6 h-10 rounded-[5px] text-[13px] font-black tracking-widest transition-all shadow-lg shadow-palette-red/10 active:scale-95 uppercase disabled:opacity-50 ${saveStatus === 'success' ? 'bg-green-600 text-white' : 'bg-palette-red text-white hover:bg-palette-maroon'
                  }`}
              >
                {saving ? (
                  <span className="material-symbols-rounded animate-spin" style={{ fontSize: '20px' }}>progress_activity</span>
                ) : saveStatus === 'success' ? (
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>check_circle</span>
                ) : (
                  <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>save</span>
                )}
                {saving ? 'Kaydediliyor...' : saveStatus === 'success' ? 'Kaydedildi' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-sm animate-in fade-in" onClick={() => setDeleteConfirmModal(false)} />
          <div className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 border border-palette-tan/15">
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-[5px] bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-rounded" style={{ fontSize: '32px' }}>warning</span>
              </div>
              <h3 className="text-xl font-black text-palette-maroon uppercase tracking-tight mb-4">Hesabı Silmek Üzeresiniz</h3>
              <p className="text-[13px] font-bold text-palette-tan/60 leading-relaxed mb-8">
                Bu işlem geri alınamaz. Hesabınızla ilişkili tüm veriler kalıcı olarak silinecektir. Devam etmek istediğinizden emin misiniz?
              </p>

              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-[5px] border border-gray-100 mb-8 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.checked)}
                  className="w-5 h-5 rounded-[5px] border-palette-tan/30 text-red-600 focus:ring-red-600 transition-all"
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
                  className="flex-1 py-3 bg-red-600 text-white rounded-[5px] font-black text-[11px] uppercase tracking-widest hover:bg-red-700 shadow-lg transition-all disabled:opacity-30 active:scale-95"
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
          <div className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-xs overflow-hidden animate-in slide-in-from-bottom-4 border border-palette-tan/15 p-8 text-center">
            <div className={`w-14 h-14 rounded-[5px] flex items-center justify-center mx-auto mb-6 ${statusModal.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {statusModal.type === 'error' ? <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>close</span> : <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>check_circle</span>}
            </div>
            <p className="text-base font-black text-palette-maroon mb-8 leading-relaxed uppercase">{statusModal.message}</p>
            <button
              onClick={handleCloseStatusModal}
              className="w-full py-2.5 bg-palette-tan text-white rounded-[5px] font-black text-[13px] tracking-widest hover:bg-palette-maroon transition-all shadow-lg active:scale-95 uppercase"
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
