
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, Check, Globe, LayoutGrid, Link as LinkIcon, Save, Sparkles, User, X, Mail, Phone, MapPin, Briefcase, Calendar, Shield, Lock, Trash2, Smartphone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { storageService } from '../services/storageService';

interface UserEditProfileProps {
  userId?: string;
  name: string;
  onBack: () => void;
}

type TabType = 'update_profile' | 'social_accounts' | 'preferences' | 'change_password' | 'delete_account';

const UserEditProfile: React.FC<UserEditProfileProps> = ({ userId, name, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('update_profile');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<any>({
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');
  const [uploadingImage, setUploadingImage] = useState<'avatar' | 'cover' | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        if (data) {
          setFormData({
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
            social_links: data.social_links || {},
            reward_system: data.reward_system || false,
            meta_title: data.meta_title || '',
            meta_keywords: data.meta_keywords || '',
            meta_description: data.meta_description || '',
            canonical_url: data.canonical_url || '',
            avatar_url: data.avatar_url || '',
            cover_url: data.social_links?.cover_url || '',
            show_email: data.show_email !== undefined ? data.show_email : true,
            rss_feeds: data.rss_feeds !== undefined ? data.rss_feeds : true
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploadingImage(type);
    try {
      const customName = `${formData.username || name || userId}-${type}`;
      const result = await storageService.uploadFile(file, undefined, 'profile', undefined, customName);
      if (result) {
        const t = Date.now();
        const finalUrl = `${result.src}${result.src.includes('?') ? '&' : '?'}t=${t}`;

        if (type === 'avatar') {
          setFormData({ ...formData, avatar_url: finalUrl });
        } else {
          setFormData({
            ...formData,
            cover_url: finalUrl,
            social_links: { ...formData.social_links, cover_url: finalUrl }
          });
        }
      }
    } catch (err) {
      console.error(`Error uploading ${type}:`, err);
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
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
          social_links: { ...formData.social_links, cover_url: formData.cover_url },
          reward_system: formData.reward_system,
          meta_title: formData.meta_title,
          meta_keywords: formData.meta_keywords,
          meta_description: formData.meta_description,
          canonical_url: formData.canonical_url,
          avatar_url: formData.avatar_url,
          show_email: formData.show_email,
          rss_feeds: formData.rss_feeds,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'update_profile', label: 'Update Profile', icon: <User size={18} /> },
    { id: 'social_accounts', label: 'Social Accounts', icon: <Globe size={18} /> },
    { id: 'preferences', label: 'Preferences', icon: <Shield size={18} /> },
    { id: 'change_password', label: 'Change Password', icon: <Lock size={18} /> },
    { id: 'delete_account', label: 'Delete Account', icon: <Trash2 size={18} /> }
  ];

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-[5px] h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="animate-in bg-white rounded-[5px] border border-gray-200 shadow-sm overflow-hidden mb-10">

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

      {/* HEADER: Cover */}
      <div
        className="relative h-48 md:h-60 overflow-hidden bg-gray-100 group"
      >
        {formData.cover_url ? (
          <img src={formData.cover_url} className="w-full h-full object-cover" alt="Cover" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Sparkles className="text-gray-300" size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingImage === 'cover'}
            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30 hover:bg-white/40 transition-all transform hover:scale-110 shadow-lg"
          >
            {uploadingImage === 'cover' ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Camera size={24} />
            )}
          </button>
        </div>

        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
          <button
            onClick={onBack}
            className="p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[5px] text-white hover:bg-white/30 transition-all shadow-lg active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>

      {/* PROFILE INFO AREA */}
      <div className="px-6 md:px-10 relative border-b border-gray-100 pb-10">
        <div className="absolute -top-12 left-6 md:left-10 w-28 h-28 rounded-[5px] border-4 border-white overflow-hidden shadow-xl bg-gray-100 z-10 group/avatar">
          {formData.avatar_url ? (
            <img src={formData.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <User className="text-gray-300" size={32} />
            </div>
          )}
          <div
            onClick={() => avatarInputRef.current?.click()}
            className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer transition-opacity"
          >
            {uploadingImage === 'avatar' ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Camera size={20} className="text-white drop-shadow-md" />
            )}
          </div>
        </div>

        <div className="pt-20">
          <div className="md:ml-32">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">{formData.full_name || 'Kullanıcı Adı'}</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 tracking-tight">@{formData.username}</span>
              <span className="w-1 h-1 bg-gray-200 rounded-full" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{formData.expertise || 'Profil Ayarları'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row min-h-[500px]">
        {/* Left Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50/50 border-r border-gray-100 p-4">
          <div className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-[8px] text-[13px] font-bold transition-all ${activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <span className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Form */}
        <div className="flex-1 p-6 md:p-10">
          <div className="max-w-2xl animate-in fade-in duration-500">

            {activeTab === 'update_profile' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-black text-gray-900 mb-1">Update Profile</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Kişisel Bilgiler ve Kimlik</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Ad Soyad</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-[5px] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Kullanıcı Adı</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 font-black">@</span>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-[5px] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">E-posta</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-[5px] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Telefon</label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-[5px] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Uzmanlık / Kategori</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={formData.expertise}
                        onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-[5px] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Kuruluş / Doğum Tarihi</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={formData.foundation_date}
                        onChange={(e) => setFormData({ ...formData, foundation_date: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-[5px] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Adres</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-gray-400" size={16} />
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={2}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-[5px] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Web Sitesi</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-[5px] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Hakkımda / Biyografi</label>
                    <textarea
                      value={formData.about_me}
                      onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
                      rows={4}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[5px] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'social_accounts' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-black text-gray-900 mb-1">Social Accounts</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Sosyal Medya Bağlantıları</p>
                </div>

                <div className="space-y-4">
                  {[
                    'Facebook', 'Twitter', 'Instagram', 'Tiktok', 'WhatsApp',
                    'YouTube', 'Discord', 'Telegram', 'Pinterest', 'Linkedin',
                    'Twitch', 'VK', 'NSosyal', 'Personal Website URL'
                  ].map((platform) => (
                    <div key={platform} className="space-y-1.5">
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{platform}</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
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
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-[5px] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-12">
                <div>
                  <h2 className="text-lg font-black text-gray-900 mb-1">Preferences</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Hesap Tercihleri</p>
                </div>

                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[13px] font-black text-gray-900 tracking-tight">Show Email on Profile Page</label>
                    <div className="flex items-center gap-12">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            name="show_email"
                            checked={formData.show_email === true}
                            onChange={() => setFormData({ ...formData, show_email: true })}
                            className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-blue-600 transition-all"
                          />
                          <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full opacity-0 peer-checked:opacity-100 transition-all" />
                        </div>
                        <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            name="show_email"
                            checked={formData.show_email === false}
                            onChange={() => setFormData({ ...formData, show_email: false })}
                            className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-blue-600 transition-all"
                          />
                          <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full opacity-0 peer-checked:opacity-100 transition-all" />
                        </div>
                        <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">No</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[13px] font-black text-gray-900 tracking-tight">RSS Feeds</label>
                    <div className="flex items-center gap-12">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            name="rss_feeds"
                            checked={formData.rss_feeds === true}
                            onChange={() => setFormData({ ...formData, rss_feeds: true })}
                            className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-blue-600 transition-all"
                          />
                          <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full opacity-0 peer-checked:opacity-100 transition-all" />
                        </div>
                        <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            name="rss_feeds"
                            checked={formData.rss_feeds === false}
                            onChange={() => setFormData({ ...formData, rss_feeds: false })}
                            className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-blue-600 transition-all"
                          />
                          <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full opacity-0 peer-checked:opacity-100 transition-all" />
                        </div>
                        <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'change_password' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-black text-gray-900 mb-1">Change Password</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Güvenlik ve Parola</p>
                </div>

                <div className="space-y-4 max-w-sm">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Mevcut Parola</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-[5px] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Yeni Parola</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-[5px] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Yeni Parola (Tekrar)</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-[5px] text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <button className="w-full py-3 bg-gray-900 text-white rounded-[5px] text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md active:scale-95">
                    Parolayı Güncelle
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'delete_account' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-black text-palette-red mb-1">Delete Account</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Tehlikeli Bölge</p>
                </div>

                <div className="p-6 bg-red-50 rounded-[5px] border border-red-100 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-palette-red rounded-[5px] text-white">
                      <Trash2 size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-red-900 mb-1">Hesabınızı silmek istediğinize emin misiniz?</h4>
                      <p className="text-[12px] text-red-700 font-medium leading-relaxed">
                        Bu işlem geri alınamaz. Tüm verileriniz, takipçileriniz ve içerikleriniz kalıcı olarak silinecektir.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-red-900 uppercase tracking-widest">Onaylamak için şifrenizi girin</label>
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-white border border-red-200 rounded-[5px] text-sm font-bold focus:border-red-500 outline-none transition-all" />
                    </div>
                    <button className="flex items-center justify-center gap-2 py-4 bg-palette-red text-white rounded-[5px] text-[11px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl active:scale-95">
                      <Trash2 size={16} />
                      Hesabımı Kalıcı Olarak Sil
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SAVE BUTTON AT THE BOTTOM */}
            <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-[5px] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${saveStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-palette-red text-white hover:bg-red-700'
                  }`}
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : saveStatus === 'success' ? (
                  <Check size={18} />
                ) : (
                  <Save size={18} />
                )}
                <span>{saving ? 'Kaydediliyor...' : saveStatus === 'success' ? 'Başarıyla Kaydedildi' : 'Değişiklikleri Kaydet'}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default UserEditProfile;
