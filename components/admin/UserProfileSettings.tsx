
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
  const [statusModal, setStatusModal] = useState<{ show: boolean, type: 'error' | 'success', message: string }>({ show: false, type: 'success', message: '' });

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          username: profile.username,
          slug: profile.slug,
          about_me: profile.about_me,
          social_links: profile.social_links
        })
        .eq('id', profile.id);

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', err.message) });
    } finally {
      setSaving(false);
    }
  };

  const updateSocial = (key: string, value: string) => {
    setProfile({
      ...profile,
      social_links: { ...profile.social_links, [key]: value }
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[400px] gap-4">
      <span className="material-symbols-rounded animate-spin text-palette-red" style={{ fontSize: '32px' }}>progress_activity</span>
      <span className="text-[13px] font-black tracking-widest text-palette-tan/40">{t('admin.post.loading_profile')}</span>
    </div>
  );

  const inputClasses = "w-full h-11 pl-11 pr-4 bg-palette-beige/30 border border-palette-tan/20 rounded-[3px] text-base font-bold text-palette-maroon outline-none hover:border-palette-tan/40 focus:bg-white focus:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all placeholder:text-palette-tan/30";
  const iconClasses = "absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/40 group-focus-within:text-palette-tan transition-colors";

  return (
    <div className="animate-in fade-in duration-500 mx-auto pb-10 admin-font">

      {/* COMPACT HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 px-2">
        <div className="flex items-center gap-5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-3 bg-white border border-palette-tan/15 rounded-[3px] text-palette-tan hover:bg-palette-tan hover:text-white transition-all shadow-sm active:scale-90 flex items-center justify-center"
            >
              <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>arrow_back</span>
            </button>
          )}
          <div className="relative group">
            <div className="w-16 h-16 rounded-[3px] overflow-hidden border-2 border-white shadow-xl bg-palette-beige relative z-10">
              <img src={profile.avatar_url || `https://picsum.photos/seed/${profile.id}/200`} className="w-full h-full object-cover" />
            </div>
            <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-palette-red text-white rounded-[3px] flex items-center justify-center shadow-lg z-20 border-2 border-white hover:scale-110 transition-all">
              <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>photo_camera</span>
            </button>
          </div>
          <div>
            <h2 className="text-[26px] font-black text-palette-maroon tracking-tighter leading-none mb-1">{profile.full_name || t('profile.page_title')}</h2>
            <p className="text-[12px] font-bold text-palette-tan/40 tracking-wider">{t('profile.page_desc')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {success && <div className="flex items-center gap-1.5 text-emerald-600 text-[12px] font-black tracking-widest animate-in zoom-in"><span className="material-symbols-rounded" style={{ fontSize: '14px' }}>check_circle</span> {t('profile.success')}</div>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-6 bg-palette-tan text-white rounded-[3px] font-black text-[13px] tracking-widest hover:bg-palette-maroon transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '14px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>save</span>}
            <span>{t('profile.save_btn')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: MAIN FIELDS */}
        <div className="lg:col-span-2 space-y-6">

          {/* BASIC INFO */}
          <div className="bg-white p-6 rounded-[3px] border border-palette-tan/15 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-palette-tan/15 pb-4">
              <span className="material-symbols-rounded text-palette-red" style={{ fontSize: '16px' }}>person</span>
              <h3 className="text-[13px] font-black text-palette-tan/60 tracking-wider">{t('profile.section.basic')}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[12px] font-black text-palette-tan/50 ml-1">{t('profile.full_name')}</label>
                <div className="relative group">
                  <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/40 group-focus-within:text-palette-tan transition-colors" style={{ fontSize: '16px' }}>person</span>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-black text-palette-tan/50 ml-1">{t('profile.username')}</label>
                <div className="relative group">
                  <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/40 group-focus-within:text-palette-tan transition-colors" style={{ fontSize: '16px' }}>alternate_email</span>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={e => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(' ', '_') })}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-black text-palette-tan/50 ml-1">{t('profile.email')}</label>
                <div className="relative group opacity-60">
                  <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/40 group-focus-within:text-palette-tan transition-colors" style={{ fontSize: '16px' }}>mail</span>
                  <input
                    type="email"
                    readOnly
                    value={profile.username + '@buzzhaber.com'}
                    className="w-full h-11 pl-11 pr-4 bg-palette-beige/40 border border-palette-tan/15 rounded-[3px] text-base font-bold text-palette-tan/40 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-black text-palette-tan/50 ml-1">{t('profile.slug')}</label>
                <div className="relative group">
                  <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/40 group-focus-within:text-palette-tan transition-colors" style={{ fontSize: '16px' }}>link</span>
                  <input
                    type="text"
                    value={profile.slug || ''}
                    onChange={e => setProfile({ ...profile, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SOCIAL LINKS */}
          <div className="bg-white p-6 rounded-[3px] border border-palette-tan/15 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-palette-tan/15 pb-4">
              <span className="material-symbols-rounded text-palette-red" style={{ fontSize: '16px' }}>smartphone</span>
              <h3 className="text-[13px] font-black text-palette-tan/60 tracking-widest">{t('profile.section.social')}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {[
                { id: 'facebook', icon: 'facebook', label: t('social.facebook') },
                { id: 'twitter', icon: 'public', label: t('social.twitter') },
                { id: 'instagram', icon: 'photo_camera', label: t('social.instagram') },
                { id: 'tiktok', icon: 'smartphone', label: t('social.tiktok') },
                { id: 'whatsapp', icon: 'chat', label: t('social.whatsapp') },
                { id: 'youtube', icon: 'video_library', label: t('social.youtube') },
                { id: 'discord', icon: 'sports_esports', label: t('social.discord') },
                { id: 'telegram', icon: 'send', label: t('social.telegram') },
                { id: 'pinterest', icon: 'image', label: t('social.pinterest') },
                { id: 'linkedin', icon: 'business', label: t('social.linkedin') },
                { id: 'twitch', icon: 'tv', label: t('social.twitch') },
                { id: 'vk', icon: 'person', label: t('social.vk') },
                { id: 'website', icon: 'public', label: t('social.website') },
              ].map((social) => (
                <div key={social.id} className="space-y-1 group">
                  <div className="relative">
                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/40 group-focus-within:text-palette-tan transition-colors" style={{ fontSize: '16px' }}>{social.icon}</span>
                    <input
                      type="text"
                      value={profile.social_links?.[social.id] || ''}
                      onChange={e => updateSocial(social.id, e.target.value)}
                      placeholder={social.label}
                      className={inputClasses}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ABOUT & STATS */}
        <div className="space-y-6">

          {/* STATS */}
          <div className="bg-palette-tan p-6 rounded-[3px] text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-palette-red rounded-[3px] blur-[40px] opacity-10 translate-x-8 -translate-y-8" />
            <h3 className="text-[12px] font-black text-white/30 tracking-widest mb-6">{t('profile.section.stats')}</h3>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-[3px] flex items-center justify-center text-palette-red border border-white/20">
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>payments</span>
                </div>
                <div>
                  <p className="text-[12px] font-black text-white/30 tracking-widest">{t('profile.balance')}</p>
                  <h4 className="text-[22px] font-black">{profile.balance?.toLocaleString() || '0.00'} ₺</h4>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-[3px] flex items-center justify-center text-blue-400 border border-white/20">
                  <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>visibility</span>
                </div>
                <div>
                  <p className="text-[12px] font-black text-white/30 tracking-widest">{t('profile.views')}</p>
                  <h4 className="text-[22px] font-black">{profile.pageviews?.toLocaleString() || '0'}</h4>
                </div>
              </div>
            </div>
          </div>

          {/* ABOUT ME */}
          <div className="bg-white p-6 rounded-[3px] border border-palette-tan/15 shadow-sm group">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-rounded text-palette-red" style={{ fontSize: '16px' }}>work</span>
              <h3 className="text-[13px] font-black text-palette-tan/60 tracking-wider">{t('profile.section.about')}</h3>
            </div>
            <textarea
              rows={8}
              value={profile.about_me || ''}
              onChange={e => setProfile({ ...profile, about_me: e.target.value })}
              placeholder={t('profile.about_placeholder')}
              className="w-full p-4 bg-palette-beige/30 border border-palette-tan/20 rounded-[3px] text-base font-medium text-palette-maroon outline-none hover:border-palette-tan/40 focus:bg-white focus:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all resize-none leading-relaxed"
            />
          </div>

        </div>

      </div>

      {/* STATUS MODAL (Success/Error) */}
      {statusModal.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/20 backdrop-blur-[2px] animate-in fade-in" onClick={() => setStatusModal({ ...statusModal, show: false })} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-xs overflow-hidden animate-in slide-in-from-bottom-4 border border-palette-tan/15 p-8 text-center">
            <div className={`w-16 h-16 rounded-[3px] flex items-center justify-center mx-auto mb-6 ${statusModal.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {statusModal.type === 'error' ? <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>close</span> : <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>check_circle</span>}
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

export default UserProfileSettings;
