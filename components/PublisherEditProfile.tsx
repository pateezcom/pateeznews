
import React, { useState } from 'react';
import { ArrowLeft, Camera, Check, Globe, LayoutGrid, Link as LinkIcon, Save, Sparkles, User, X } from 'lucide-react';

interface PublisherEditProfileProps {
  name: string;
  onBack: () => void;
}

const PublisherEditProfile: React.FC<PublisherEditProfileProps> = ({ name, onBack }) => {
  const [formData, setFormData] = useState({
    name: name,
    handle: `@${name.toLowerCase().replace(' ', '')}`,
    category: 'Teknoloji',
    bio: `${name} medya grubu olarak, en güncel haberleri profesyonel bir bakış açısıyla derliyoruz.`,
    website: 'pateez.com/tech-hub',
    avatar: `https://picsum.photos/seed/${name}/400`,
    cover: `https://picsum.photos/seed/${name}cover/1600/600`
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  const handleSave = () => {
    setSaving(true);
    // Simüle edilen gecikme
    setTimeout(() => {
      setSaving(false);
      setSaveStatus('success');
      setTimeout(() => onBack(), 800);
    }, 1500);
  };

  return (
    <div className="animate-in bg-white rounded-[5px] border border-gray-200 shadow-xl overflow-hidden mb-10">

      {/* Top Action Bar */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 bg-gray-50 text-gray-400 rounded-[5px] hover:text-gray-900 transition-all border border-transparent hover:border-gray-100 active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-none">Profili Düzenle</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Yayıncı Kimliği</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-[5px] font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${saveStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-[5px] animate-spin" />
          ) : saveStatus === 'success' ? (
            <Check size={16} strokeWidth={3} />
          ) : (
            <Save size={16} />
          )}
          <span>{saving ? 'Kaydediliyor...' : saveStatus === 'success' ? 'Kaydedildi' : 'Değişiklikleri Kaydet'}</span>
        </button>
      </div>

      <div className="p-8 md:p-12">
        <div className="max-w-4xl mx-auto space-y-12">

          {/* Visual Assets Section */}
          <section>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Sparkles size={14} className="text-blue-500" /> Görsel Varlıklar
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Cover Photo */}
              <div className="md:col-span-2 group">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Kapak Görseli</label>
                <div className="relative h-48 rounded-[5px] overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 group-hover:border-blue-400 transition-all">
                  <img src={formData.cover} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <button className="p-3 bg-white rounded-[5px] shadow-xl text-gray-900 hover:scale-110 transition-transform">
                      <Camera size={24} />
                    </button>
                    <span className="mt-3 text-[10px] font-black text-gray-900 uppercase tracking-widest bg-white/80 backdrop-blur-sm px-3 py-1 rounded-[5px]">Değiştir</span>
                  </div>
                </div>
              </div>

              {/* Avatar Photo */}
              <div className="group">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Profil Logosu</label>
                <div className="relative aspect-square rounded-[5px] overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 group-hover:border-blue-400 transition-all">
                  <img src={formData.avatar} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <button className="p-3 bg-white rounded-[5px] shadow-xl text-gray-900 hover:scale-110 transition-transform">
                      <Camera size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Basic Info Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <User size={14} className="text-blue-500" /> Genel Bilgiler
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Yayıncı Adı</label>
                  <div className="relative">
                    <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[5px] text-sm font-bold focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Kullanıcı Adı</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 font-black text-lg">@</span>
                    <input
                      type="text"
                      value={formData.handle.replace('@', '')}
                      onChange={(e) => setFormData({ ...formData, handle: `@${e.target.value}` })}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[5px] text-sm font-bold focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">Bu isim benzersiz olmalı ve profil linkinde görünecek.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Globe size={14} className="text-blue-500" /> İletişim & Sosyal
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Web Sitesi</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[5px] text-sm font-bold focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Biyografi</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[5px] text-sm font-bold focus:bg-white focus:border-blue-500 focus:outline-none transition-all resize-none"
                  />
                  <div className="flex justify-end">
                    <span className="text-[10px] font-bold text-gray-400">{formData.bio.length} / 160</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Warning Area */}
      <div className="m-8 p-6 bg-amber-50 rounded-[5px] border border-amber-100 flex items-start gap-4">
        <div className="p-2 bg-amber-500 rounded-[5px] text-white">
          <Sparkles size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-amber-900 mb-1">Hesap Doğrulama Hatırlatması</h4>
          <p className="text-[12px] text-amber-700 font-medium leading-relaxed">
            Kullanıcı adınızı değiştirdiğinizde "Doğrulanmış Yayıncı" rozetiniz geçici olarak askıya alınabilir ve manuel inceleme gerektirebilir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublisherEditProfile;
