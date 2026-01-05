
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';

interface PublisherProfileSettingsProps {
    publisherId?: string;
    onSuccess?: () => void;
    onBack?: () => void;
}

const PublisherProfileSettings: React.FC<PublisherProfileSettingsProps> = ({ publisherId, onSuccess, onBack }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [statusModal, setStatusModal] = useState<{ show: boolean, type: 'error' | 'success', message: string }>({ show: false, type: 'success', message: '' });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchProfile();
    }, [publisherId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            let targetId = publisherId;

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

            // Ensure schema compatibility
            const normalizedData = {
                ...data,
                social_links: data.social_links || {},
                phone: data.phone || '',
                website: data.website || '',
                expertise: data.expertise || '',
                foundation_date: data.foundation_date || '',
                address: data.address || '',
                description: data.about_me || '', // Using about_me for description
                meta_title: data.meta_title || '',
                meta_keywords: data.meta_keywords || '',
                meta_description: data.meta_description || '',
                canonical_url: data.canonical_url || ''
            };

            setProfile(normalizedData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const errors: Record<string, string> = {};
        if (!profile.full_name) errors.full_name = 'Alan zorunludur';
        if (!profile.username) errors.username = 'Alan zorunludur';
        if (!profile.email) errors.email = 'Alan zorunludur';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        setSaving(true);
        try {
            // Uniqueness check
            const { data: conflicts } = await supabase
                .from('profiles')
                .select('username, email')
                .or(`username.eq.${profile.username},email.eq.${profile.email}`)
                .neq('id', profile.id);

            if (conflicts && conflicts.length > 0) {
                const errors: Record<string, string> = {};
                conflicts.forEach(c => {
                    if (c.username?.toLowerCase() === profile.username?.toLowerCase()) errors.username = 'Kullanıcı adı zaten kullanımda';
                    if (c.email?.toLowerCase() === profile.email?.toLowerCase()) errors.email = 'E-posta zaten kullanımda';
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
                    full_name: profile.full_name,
                    username: profile.username,
                    phone: profile.phone,
                    website: profile.website,
                    expertise: profile.expertise,
                    foundation_date: profile.foundation_date,
                    address: profile.address,
                    about_me: profile.description, // Mapping back
                    social_links: profile.social_links,
                    meta_title: profile.meta_title,
                    meta_keywords: profile.meta_keywords,
                    meta_description: profile.meta_description,
                    canonical_url: profile.canonical_url
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

    const handleCloseStatusModal = () => {
        setStatusModal({ show: false, type: 'success', message: '' });
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

    const inputClasses = "w-full h-10 px-4 bg-white border border-palette-tan/20 rounded-[3px] text-base font-bold text-palette-maroon outline-none hover:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all placeholder:text-palette-tan/30";
    const iconInputClasses = "w-full h-10 pl-12 pr-4 bg-white border border-palette-tan/20 rounded-[3px] text-base font-bold text-palette-maroon outline-none hover:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all placeholder:text-palette-tan/30";

    return (
        <div className="animate-in fade-in duration-500 mx-auto pb-20 admin-font max-w-7xl">

            {/* HEADER matches Image 1 standard */}
            <div className="bg-white rounded-[4px] border border-palette-tan/15 shadow-sm overflow-hidden mb-8">
                <div className="relative h-48 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 opacity-80">
                    <button className="absolute top-4 right-4 bg-palette-red text-white px-4 py-2 rounded-[4px] text-[13px] font-black flex items-center justify-center gap-2 shadow-lg hover:bg-palette-maroon transition-all">
                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>photo_camera</span>
                        Kapak Değiştir
                    </button>
                </div>

                <div className="px-8 pb-6 pt-0 relative">
                    <div className="flex items-end gap-6 -mt-10 mb-2">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-[8px] overflow-hidden border-4 border-white shadow-xl bg-palette-beige relative">
                                <img src={profile.avatar_url || `https://picsum.photos/seed/${profile.id}/200`} className="w-full h-full object-cover" />
                                <div className="absolute top-0 left-0 p-1.5">
                                    <div className="bg-white/90 p-1 rounded-[2px] shadow-sm">
                                        <span className="material-symbols-rounded text-palette-red" style={{ fontSize: '14px' }}>delete</span>
                                    </div>
                                </div>
                            </div>
                            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-palette-red text-white rounded-[3px] flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-all">
                                <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>business_center</span>
                            </button>
                        </div>
                        <div className="pb-2">
                            <h2 className="text-[26px] font-black text-palette-maroon leading-none mb-2 uppercase tracking-tight">{profile.full_name || t('publishers.unnamed')}</h2>
                            <div className="flex items-center gap-4 text-palette-tan/60 font-bold text-[12px]">
                                <span className="flex items-center gap-1.5"><span className="material-symbols-rounded text-palette-tan/30" style={{ fontSize: '16px' }}>person</span> @{profile.username}</span>
                                <span className="flex items-center gap-1.5"><span className="material-symbols-rounded text-palette-tan/30" style={{ fontSize: '16px' }}>calendar_today</span> July 2025</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* 1. YAYINCI AYRINTILARI matches Image 1 */}
                <div className="bg-white p-8 rounded-[4px] border border-palette-tan/15 shadow-sm space-y-8">
                    <h3 className="text-[14px] font-black text-palette-maroon uppercase tracking-tight border-b border-palette-tan/5 pb-4">Yayıncı Ayrıntıları</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">Yayıncı İsmi <span className="text-palette-red">*</span></label>
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
                            <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">Kullanıcı Adı <span className="text-palette-red">*</span></label>
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
                            <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">E-posta <span className="text-palette-red">*</span></label>
                            <input
                                type="email"
                                value={profile.email || ''}
                                onChange={e => {
                                    setProfile({ ...profile, email: e.target.value });
                                    if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                                }}
                                className={`${inputClasses} ${formErrors.email ? 'border-palette-red text-palette-red' : ''}`}
                            />
                            {formErrors.email && <p className="text-[10px] font-bold text-palette-red ml-1">{formErrors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">Telefon</label>
                            <div className="relative group/input">
                                <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/30 group-focus-within/input:text-palette-maroon transition-colors" style={{ fontSize: '18px' }}>call</span>
                                <input type="text" value={profile.phone || ''} placeholder="+90XXXXXXXXXX" onChange={e => setProfile({ ...profile, phone: e.target.value })} className={iconInputClasses} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">Web Sitesi</label>
                            <div className="relative group/input">
                                <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-palette-tan/30 group-focus-within/input:text-palette-maroon transition-colors" style={{ fontSize: '18px' }}>public</span>
                                <input type="text" value={profile.website || ''} placeholder="https://website.com" onChange={e => setProfile({ ...profile, website: e.target.value })} className={iconInputClasses} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">Uzmanlık</label>
                            <input type="text" value={profile.expertise || ''} placeholder="Uzmanlık" onChange={e => setProfile({ ...profile, expertise: e.target.value })} className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">Kuruluş Tarihi</label>
                            <div className="relative group/input">
                                <input type="text" value={profile.foundation_date || ''} placeholder="gg.aa.yyyy" onChange={e => setProfile({ ...profile, foundation_date: e.target.value })} className={inputClasses} />
                                <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/30" style={{ fontSize: '18px' }}>calendar_month</span>
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">Adres</label>
                            <textarea rows={2} value={profile.address || ''} onChange={e => setProfile({ ...profile, address: e.target.value })} placeholder="Adres" className="w-full p-4 bg-white border border-palette-tan/20 rounded-[3px] text-base font-bold text-palette-maroon outline-none hover:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all resize-none" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">Açıklama</label>
                            <textarea rows={4} value={profile.description || ''} onChange={e => setProfile({ ...profile, description: e.target.value })} placeholder="Açıklama" className="w-full p-4 bg-white border border-palette-tan/20 rounded-[3px] text-base font-bold text-palette-maroon outline-none hover:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all resize-none" />
                        </div>
                    </div>
                </div>

                {/* 2. SOSYAL HESAPLAR matches Image 1 */}
                <div className="bg-white p-8 rounded-[4px] border border-palette-tan/15 shadow-sm space-y-8">
                    <h3 className="text-[14px] font-black text-palette-maroon uppercase tracking-tight border-b border-palette-tan/5 pb-4">Sosyal Hesaplar</h3>
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
                        ].map((social) => (
                            <div key={social.id} className="space-y-2 group">
                                <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">{social.label}</label>
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
                </div>

                {/* 3. SEO AYARLARI matches Image 1 */}
                <div className="bg-white p-8 rounded-[4px] border border-palette-tan/15 shadow-sm space-y-8 text-left">
                    <h3 className="text-[14px] font-black text-palette-maroon uppercase tracking-tight border-b border-palette-tan/5 pb-4">SEO Ayarları</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">Meta Başlık</label>
                            <input type="text" value={profile.meta_title || ''} onChange={e => setProfile({ ...profile, meta_title: e.target.value })} placeholder="Meta Başlık" className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">Kanonik URL</label>
                            <input type="text" value={profile.canonical_url || ''} onChange={e => setProfile({ ...profile, canonical_url: e.target.value })} placeholder="https://example.com/publisher" className={inputClasses} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">Meta Anahtar Kelimeler</label>
                            <input type="text" value={profile.meta_keywords || ''} onChange={e => setProfile({ ...profile, meta_keywords: e.target.value })} placeholder="anahtar kelime1, anahtar kelime2, anahtar kelime3" className={inputClasses} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[11px] font-black text-palette-tan uppercase tracking-widest opacity-60 ml-1">Meta Açıklama</label>
                            <textarea rows={3} value={profile.meta_description || ''} onChange={e => setProfile({ ...profile, meta_description: e.target.value })} placeholder="Meta Açıklama" className="w-full p-4 bg-white border border-palette-tan/20 rounded-[3px] text-base font-bold text-palette-maroon outline-none hover:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all resize-none" />
                        </div>
                    </div>

                    <div className="pt-8 border-t border-palette-tan/5">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-palette-red text-white rounded-[4px] font-black text-[13px] tracking-widest hover:bg-palette-maroon shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all uppercase"
                        >
                            {saving ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>save</span>}
                            Değişiklikleri Kaydet
                        </button>
                    </div>
                </div>
            </div>

            {/* STATUS MODAL */}
            {statusModal.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
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

export default PublisherProfileSettings;
