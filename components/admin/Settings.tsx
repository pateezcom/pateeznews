
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import { storageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';

interface SettingsProps {
    onBack?: () => void;
}

const Settings: React.FC<SettingsProps> = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('genel');
    const [settingsLanguage, setSettingsLanguage] = useState('tr');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        // Genel & Logo
        site_name: '',
        timezone: 'Europe/Istanbul',
        footer_about: '',
        optional_url_button_name: '',
        copyright_text: '',
        logo_url: '',
        footer_logo_url: '',
        dark_logo_url: '',
        email_logo_url: '',
        favicon_url: '',

        // SEO & Meta
        home_title: '',
        meta_description: '',
        meta_keywords: '',
        canonical_url: '',
        og_image_url: '',

        // Kurumsal (EEAT)
        organization_legal_name: '',
        organization_phone: '',
        organization_address: '',
        twitter_username: '',
        fb_app_id: '',

        // Google & Servisler
        google_analytics_id: '',
        google_search_console_code: '',
        bing_verification_code: '',

        // Kodlar & Teknik
        robots_txt: '',
        header_custom_codes: '',
        footer_custom_codes: ''
    });

    const tabs = [
        { id: 'genel', label: 'Genel & Logo' },
        { id: 'seo', label: 'SEO Ayarları' },
        { id: 'eeat', label: 'Kurumsal (EEAT)' },
        { id: 'google', label: 'Google & Servisler' },
        { id: 'ozel_kodlar', label: 'Özel Kodlar' },
        { id: 'teknik', label: 'Robots & Teknik' },
    ];

    useEffect(() => {
        fetchSettings();
    }, [settingsLanguage]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('language_code', settingsLanguage)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setFormData({
                    site_name: data.site_name || '',
                    timezone: data.timezone || 'Europe/Istanbul',
                    footer_about: data.footer_about || '',
                    optional_url_button_name: data.optional_url_button_name || '',
                    copyright_text: data.copyright_text || '',
                    logo_url: data.logo_url || '',
                    footer_logo_url: data.footer_logo_url || '',
                    dark_logo_url: data.dark_logo_url || '',
                    email_logo_url: data.email_logo_url || '',
                    favicon_url: data.favicon_url || '',
                    home_title: data.home_title || '',
                    meta_description: data.meta_description || '',
                    meta_keywords: data.meta_keywords || '',
                    canonical_url: data.canonical_url || '',
                    og_image_url: data.og_image_url || '',
                    organization_legal_name: data.organization_legal_name || '',
                    organization_phone: data.organization_phone || '',
                    organization_address: data.organization_address || '',
                    twitter_username: data.twitter_username || '',
                    fb_app_id: data.fb_app_id || '',
                    google_analytics_id: data.google_analytics_id || '',
                    google_search_console_code: data.google_search_console_code || '',
                    bing_verification_code: data.bing_verification_code || '',
                    robots_txt: data.robots_txt || '',
                    header_custom_codes: data.header_custom_codes || '',
                    footer_custom_codes: data.footer_custom_codes || ''
                });
            } else {
                // Reset form
                setFormData({
                    site_name: '',
                    timezone: 'Europe/Istanbul',
                    footer_about: '',
                    optional_url_button_name: '',
                    copyright_text: '',
                    logo_url: '',
                    footer_logo_url: '',
                    dark_logo_url: '',
                    email_logo_url: '',
                    favicon_url: '',
                    home_title: '',
                    meta_description: '',
                    meta_keywords: '',
                    canonical_url: '',
                    og_image_url: '',
                    organization_legal_name: '',
                    organization_phone: '',
                    organization_address: '',
                    twitter_username: '',
                    fb_app_id: '',
                    google_analytics_id: '',
                    google_search_console_code: '',
                    bing_verification_code: '',
                    robots_txt: '',
                    header_custom_codes: '',
                    footer_custom_codes: ''
                });
            }
        } catch (err: any) {
            console.error('Error fetching settings:', err);
            showToast('Ayarlar yüklenirken bir hata oluştu.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    language_code: settingsLanguage,
                    ...formData,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'language_code' });

            if (error) throw error;
            const { data: savedSettings, error: fetchError } = await supabase
                .from('site_settings')
                .select('*')
                .eq('language_code', settingsLanguage)
                .maybeSingle();
            if (fetchError) throw fetchError;

            if (savedSettings && typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('buzz:site_settings_updated', { detail: savedSettings }));
            }

            showToast('Ayarlar başarıyla kaydedildi.', 'success');
        } catch (err: any) {
            console.error('Error saving settings:', err);
            showToast('Ayarlar kaydedilirken bir hata oluştu: ' + err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (file: File, field: keyof typeof formData) => {
        try {
            const logoFilenames: Record<string, string> = {
                logo_url: 'pateezlogowhite.png',
                footer_logo_url: 'pateezlogofooter.png',
                dark_logo_url: 'pateezlogodark.png',
                email_logo_url: 'pateezlogoepost.png',
                favicon_url: 'pateezlogoicon.png'
            };
            const customFilename = logoFilenames[field];
            const result = await storageService.uploadFile(file, undefined, 'logo', settingsLanguage, customFilename);
            if (result) {
                setFormData(prev => ({ ...prev, [field]: result.src }));
                showToast('Dosya başarıyla yüklendi.', 'success');
            } else {
                showToast('Yükleme başarısız.', 'error');
            }
        } catch (err) {
            console.error('Upload error:', err);
            showToast('Yükleme sırasında bir hata oluştu.', 'error');
        }
    };

    const inputClasses = "w-full h-11 px-4 bg-white border border-palette-tan/15 rounded-[5px] text-[14px] font-bold text-palette-maroon outline-none focus:border-palette-red focus:ring-4 focus:ring-palette-red/5 transition-all placeholder:text-palette-tan/20 disabled:opacity-50";
    const labelClasses = "text-[12px] font-black text-palette-tan/60 uppercase tracking-widest block";
    const selectClasses = "w-full h-11 px-4 bg-white border border-palette-tan/15 rounded-[5px] text-[14px] font-bold text-palette-maroon appearance-none outline-none focus:border-palette-red transition-all cursor-pointer disabled:opacity-50";

    return (
        <div className="animate-in fade-in duration-700 pb-20 space-y-8">

            {/* LANGUAGE SELECTOR */}
            <div className="max-w-xs flex flex-col gap-2">
                <label className={labelClasses}>Ayarlar Dili</label>
                <div className="relative w-full">
                    <select
                        value={settingsLanguage}
                        onChange={(e) => setSettingsLanguage(e.target.value)}
                        className={selectClasses}
                        disabled={loading || saving}
                    >
                        <option value="tr">Turkish</option>
                        <option value="en">English</option>
                        <option value="ar">Arabic</option>
                    </select>
                    <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/30 pointer-events-none" style={{ fontSize: '20px' }}>expand_more</span>
                </div>
            </div>

            {/* TABS */}
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
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

                {/* SECTION TITLE & FORM */}
                <div className="p-8 space-y-10">

                    <div className="space-y-8">
                        <h3 className="text-lg font-black text-palette-maroon uppercase tracking-tight flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-palette-red rounded-full"></div>
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h3>

                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <span className="material-symbols-rounded animate-spin text-palette-red" style={{ fontSize: '42px' }}>progress_activity</span>
                                <p className="text-[13px] font-black text-palette-tan/40 uppercase tracking-widest">Veriler Yükleniyor...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">

                                {activeTab === 'genel' && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                            <div className="flex flex-col gap-2">
                                                <label className={labelClasses}>Site Adı</label>
                                                <input
                                                    type="text"
                                                    value={formData.site_name}
                                                    onChange={e => setFormData(prev => ({ ...prev, site_name: e.target.value }))}
                                                    className={inputClasses}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className={labelClasses}>Zaman Dilimi</label>
                                                <div className="relative w-full">
                                                    <select
                                                        className={selectClasses}
                                                        value={formData.timezone}
                                                        onChange={e => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                                                    >
                                                        <option value="Europe/Istanbul">(GMT+03:00) Europe - Istanbul</option>
                                                        <option value="UTC">UTC</option>
                                                        <option value="Europe/London">(GMT+00:00) Europe - London</option>
                                                        <option value="America/New_York">(GMT-05:00) US - New York</option>
                                                    </select>
                                                    <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-palette-tan/30 pointer-events-none" style={{ fontSize: '20px' }}>expand_more</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label className={labelClasses}>Altbilgi Hakkında Bölümü</label>
                                                <textarea
                                                    rows={4}
                                                    placeholder="Site hakkında kısa bilgi..."
                                                    value={formData.footer_about}
                                                    onChange={e => setFormData(prev => ({ ...prev, footer_about: e.target.value }))}
                                                    className="w-full p-4 bg-white border border-palette-tan/15 rounded-[5px] text-[14px] font-bold text-palette-maroon outline-none focus:border-palette-red transition-all resize-none"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className={labelClasses}>Gönderi İsteğe Bağlı URL Düğmesi Adı</label>
                                                <input
                                                    type="text"
                                                    placeholder="Kaynak, Detay vb."
                                                    value={formData.optional_url_button_name}
                                                    onChange={e => setFormData(prev => ({ ...prev, optional_url_button_name: e.target.value }))}
                                                    className={inputClasses}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className={labelClasses}>Telif Hakkı</label>
                                                <input
                                                    type="text"
                                                    placeholder="© 2025"
                                                    value={formData.copyright_text}
                                                    onChange={e => setFormData(prev => ({ ...prev, copyright_text: e.target.value }))}
                                                    className={inputClasses}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-10 space-y-6">
                                            <h3 className="text-[15px] font-black text-palette-maroon uppercase tracking-tight border-b border-palette-tan/5 pb-4">Logo Ayarları</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                                <LogoCard title="Logo" dimensions="200x50 px" formats=".png, .jpg, .svg, .webp" currentUrl={formData.logo_url} onUpload={(file) => handleLogoUpload(file, 'logo_url')} />
                                                <LogoCard title="Altbilgi Logosu" dimensions="200x50 px" formats=".png, .jpg, .svg, .webp" currentUrl={formData.footer_logo_url} onUpload={(file) => handleLogoUpload(file, 'footer_logo_url')} />
                                                <LogoCard title="Dark Logosu" subTitle="(Dark Mode)" dimensions="200x50 px" formats=".png, .jpg, .svg, .webp" currentUrl={formData.dark_logo_url} onUpload={(file) => handleLogoUpload(file, 'dark_logo_url')} />
                                                <LogoCard title="E-posta Logosu" dimensions="200x50 px" formats=".png, .jpg, .svg, .webp" currentUrl={formData.email_logo_url} onUpload={(file) => handleLogoUpload(file, 'email_logo_url')} />
                                                <LogoCard title="Favicon" subTitle="(16x16px)" dimensions="16x16 px" formats=".png, .ico" currentUrl={formData.favicon_url} onUpload={(file) => handleLogoUpload(file, 'favicon_url')} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'seo' && (
                                    <div className="grid grid-cols-1 gap-6 items-start">
                                        <div className="flex flex-col gap-2">
                                            <label className={labelClasses}>Ana Sayfa Başlığı (SEO Title)</label>
                                            <input
                                                type="text"
                                                value={formData.home_title}
                                                onChange={e => setFormData(prev => ({ ...prev, home_title: e.target.value }))}
                                                className={inputClasses}
                                                placeholder="Örn: Site Başlığı"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className={labelClasses}>Site Açıklaması (Meta Description)</label>
                                            <textarea
                                                rows={3}
                                                value={formData.meta_description}
                                                onChange={e => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                                                className="w-full p-4 bg-white border border-palette-tan/15 rounded-[5px] text-[14px] font-bold text-palette-maroon outline-none focus:border-palette-red transition-all resize-none"
                                                placeholder="Site hakkında SEO odaklı kısa açıklama..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                            <div className="flex flex-col gap-2">
                                                <label className={labelClasses}>Anahtar Kelimeler (Meta Keywords)</label>
                                                <input
                                                    type="text"
                                                    value={formData.meta_keywords}
                                                    onChange={e => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                                                    className={inputClasses}
                                                    placeholder="haber, sondakika, gündem"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className={labelClasses}>Canonical URL</label>
                                                <input
                                                    type="text"
                                                    value={formData.canonical_url}
                                                    onChange={e => setFormData(prev => ({ ...prev, canonical_url: e.target.value }))}
                                                    className={inputClasses}
                                                    placeholder="https://site.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className={labelClasses}>Global Paylaşım Görseli (OG Image)</label>
                                            <div className="flex gap-4 items-center">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={formData.og_image_url}
                                                        onChange={e => setFormData(prev => ({ ...prev, og_image_url: e.target.value }))}
                                                        className={inputClasses}
                                                        placeholder="Logo veya kapak görseli URL'i"
                                                    />
                                                </div>
                                                <LogoCard title="" dimensions="1200x630" formats=".jpg, .png" currentUrl={formData.og_image_url} onUpload={(file) => handleLogoUpload(file, 'og_image_url')} compact />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'eeat' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className={labelClasses}>Resmi Kurum/Şirket Adı</label>
                                            <input
                                                type="text"
                                                value={formData.organization_legal_name}
                                                onChange={e => setFormData(prev => ({ ...prev, organization_legal_name: e.target.value }))}
                                                className={inputClasses}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClasses}>Telefon Numarası</label>
                                            <input
                                                type="text"
                                                value={formData.organization_phone}
                                                onChange={e => setFormData(prev => ({ ...prev, organization_phone: e.target.value }))}
                                                className={inputClasses}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className={labelClasses}>Resmi Adres</label>
                                            <textarea
                                                rows={2}
                                                value={formData.organization_address}
                                                onChange={e => setFormData(prev => ({ ...prev, organization_address: e.target.value }))}
                                                className="w-full p-4 bg-white border border-palette-tan/15 rounded-[5px] text-[14px] font-bold text-palette-maroon outline-none focus:border-palette-red transition-all resize-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClasses}>Twitter (X) Kullanıcı Adı</label>
                                            <input
                                                type="text"
                                                value={formData.twitter_username}
                                                onChange={e => setFormData(prev => ({ ...prev, twitter_username: e.target.value }))}
                                                className={inputClasses}
                                                placeholder="@kullanici_adi"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClasses}>Facebook App ID</label>
                                            <input
                                                type="text"
                                                value={formData.fb_app_id}
                                                onChange={e => setFormData(prev => ({ ...prev, fb_app_id: e.target.value }))}
                                                className={inputClasses}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'google' && (
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className={labelClasses}>Google Analytics (GA4) ID</label>
                                            <input
                                                type="text"
                                                value={formData.google_analytics_id}
                                                onChange={e => setFormData(prev => ({ ...prev, google_analytics_id: e.target.value }))}
                                                className={inputClasses}
                                                placeholder="G-XXXXXXXXXX"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClasses}>Google Search Console Doğrulama Kodu</label>
                                            <input
                                                type="text"
                                                value={formData.google_search_console_code}
                                                onChange={e => setFormData(prev => ({ ...prev, google_search_console_code: e.target.value }))}
                                                className={inputClasses}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClasses}>Bing Webmaster Doğrulama Kodu</label>
                                            <input
                                                type="text"
                                                value={formData.bing_verification_code}
                                                onChange={e => setFormData(prev => ({ ...prev, bing_verification_code: e.target.value }))}
                                                className={inputClasses}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'ozel_kodlar' && (
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className={labelClasses}>Header Özel Kodlar (&lt;head&gt; içine)</label>
                                            <textarea
                                                rows={8}
                                                value={formData.header_custom_codes}
                                                onChange={e => setFormData(prev => ({ ...prev, header_custom_codes: e.target.value }))}
                                                className="w-full p-4 bg-white border border-palette-tan/15 rounded-[5px] text-[13px] font-mono font-bold text-palette-maroon outline-none focus:border-palette-red transition-all"
                                                placeholder="<script>...</script>"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClasses}>Footer Özel Kodlar (&lt;/body&gt; öncesi)</label>
                                            <textarea
                                                rows={8}
                                                value={formData.footer_custom_codes}
                                                onChange={e => setFormData(prev => ({ ...prev, footer_custom_codes: e.target.value }))}
                                                className="w-full p-4 bg-white border border-palette-tan/15 rounded-[5px] text-[13px] font-mono font-bold text-palette-maroon outline-none focus:border-palette-red transition-all"
                                                placeholder="<script>...</script>"
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'teknik' && (
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className={labelClasses}>Robots.txt İçeriği</label>
                                            <textarea
                                                rows={10}
                                                value={formData.robots_txt}
                                                onChange={e => setFormData(prev => ({ ...prev, robots_txt: e.target.value }))}
                                                className="w-full p-4 bg-white border border-palette-tan/15 rounded-[5px] text-[13px] font-mono font-bold text-palette-maroon outline-none focus:border-palette-red transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}

                    </div>

                    {/* SAVE BUTTON */}
                    <div className="pt-8 border-t border-palette-tan/5 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={loading || saving}
                            className="flex items-center gap-2 px-6 h-10 bg-palette-red text-white rounded-[5px] text-[13px] font-black tracking-widest hover:bg-palette-maroon transition-all shadow-lg shadow-palette-red/10 active:scale-95 uppercase disabled:opacity-50"
                        >
                            {saving ? (
                                <span className="material-symbols-rounded animate-spin" style={{ fontSize: '20px' }}>progress_activity</span>
                            ) : (
                                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>save</span>
                            )}
                            Değişiklikleri Kaydet
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
};

interface LogoCardProps {
    title: string;
    subTitle?: string;
    dimensions: string;
    formats: string;
    currentUrl?: string;
    onUpload: (file: File) => void;
    compact?: boolean;
}

const LogoCard: React.FC<LogoCardProps> = ({ title, subTitle, dimensions, formats, currentUrl, onUpload, compact }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    if (compact) {
        return (
            <label className="flex items-center justify-center gap-2 px-6 h-11 bg-palette-red/5 text-palette-red border border-palette-red/20 rounded-[5px] text-[11px] font-black uppercase tracking-widest hover:bg-palette-red hover:text-white transition-all cursor-pointer">
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>upload</span>
                Yükle
                <input type="file" className="hidden" accept={formats} onChange={handleFileChange} />
            </label>
        );
    }

    return (
        <div className="bg-white border border-palette-tan/10 rounded-[5px] p-5 flex flex-col items-center text-center space-y-4 hover:border-palette-red/30 transition-all hover:shadow-md group">
            {title && (
                <div className="w-full flex flex-col items-start gap-0.5 min-h-[32px]">
                    <span className="text-[12px] font-black text-palette-maroon uppercase tracking-tight">{title}</span>
                    {subTitle && <span className="text-[10px] font-bold text-palette-tan/40">{subTitle}</span>}
                </div>
            )}

            <div className="w-full h-24 bg-palette-beige/30 rounded-[5px] border border-dashed border-palette-tan/10 flex items-center justify-center p-4 relative overflow-hidden group-hover:bg-palette-beige/50 transition-all">
                {currentUrl ? (
                    <img src={currentUrl} alt={title} className="max-w-full max-h-full object-contain" />
                ) : (
                    <div className="flex flex-col items-center gap-1 opacity-20">
                        <span className="material-symbols-rounded" style={{ fontSize: '32px' }}>image</span>
                    </div>
                )}
            </div>

            <label className="w-full flex items-center justify-center gap-2 py-2 border border-palette-red/20 text-palette-red rounded-[5px] text-[11px] font-black uppercase tracking-widest hover:bg-palette-red hover:text-white transition-all active:scale-95 cursor-pointer">
                <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>upload</span>
                Logo Değiştir
                <input type="file" className="hidden" accept={formats} onChange={handleFileChange} />
            </label>

            <div className="space-y-1">
                <p className="text-[9px] font-bold text-palette-tan/30 leading-tight">{formats}</p>
                <p className="text-[9px] font-black text-palette-tan/60">{dimensions}</p>
            </div>
        </div>
    );
};

export default Settings;
