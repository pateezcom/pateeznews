
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { loadLocaleData } from '../../lib/locales';

interface Language {
  code: string;
  name: string;
  direction: string;
  status: string;
  flag_code: string;
  is_default: boolean;
}

const PROTECTED_LANGS = ['tr', 'en', 'ar'];

const LanguageSettings: React.FC = () => {
  const { t } = useLanguage();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingLang, setEditingLang] = useState<Language | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    direction: 'ltr',
    status: 'active'
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [langToDelete, setLangToDelete] = useState<Language | null>(null);
  const [statusModal, setStatusModal] = useState<{ show: boolean, type: 'error' | 'success', message: string }>({ show: false, type: 'success', message: '' });

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('code', { ascending: true });

      if (error) console.warn('Veritabanı erişim uyarısı:', error.message);

      if (data && data.length > 0) {
        setLanguages(data);
      } else {
        const savedLang = localStorage.getItem('buzz_lang');
        const defaultLangs = [
          { code: 'tr', name: 'Türkçe', direction: 'ltr', status: 'active', flag_code: 'tr', is_default: savedLang === 'tr' },
          { code: 'en', name: 'English', direction: 'ltr', status: 'active', flag_code: 'us', is_default: savedLang === 'en' }
        ];
        setLanguages(defaultLangs as any);
      }
    } catch (err) {
      console.error('Diller yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleDeleteClick = (lang: Language, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpenDropdownId(null);

    if (PROTECTED_LANGS.includes(lang.code)) {
      setStatusModal({ show: true, type: 'error', message: t('lang.protected_alert') });
      return;
    }

    if (lang.is_default) {
      setStatusModal({ show: true, type: 'error', message: t('lang.default_alert') });
      return;
    }

    setLangToDelete(lang);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!langToDelete) return;
    setProcessing(langToDelete.code);
    try {
      const { error } = await supabase.from('languages').delete().eq('code', langToDelete.code);
      if (error) throw error;

      const newLanguages = languages.filter(l => l.code !== langToDelete.code);
      setLanguages(newLanguages);
      localStorage.removeItem(`buzz_locale_${langToDelete.code}`);

      if (localStorage.getItem('buzz_lang') === langToDelete.code) {
        localStorage.setItem('buzz_lang', 'tr');
        window.location.reload();
      }
    } catch (err: any) {
      console.error("Silme hatası:", err);
      setStatusModal({ show: true, type: 'error', message: t('admin.generic_error').replace('{error}', err.message) });
    } finally {
      setProcessing(null);
      setShowDeleteModal(false);
      setLangToDelete(null);
    }
  };

  const openAddModal = () => {
    setEditingLang(null);
    setFormData({ code: '', name: '', direction: 'ltr', status: 'active' });
    setShowModal(true);
  };

  const openEditModal = (lang: Language, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpenDropdownId(null);
    setEditingLang(lang);
    setFormData({
      code: lang.code,
      name: lang.name,
      direction: lang.direction,
      status: lang.status
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name) return;
    const payload = {
      code: formData.code.toLowerCase(),
      name: formData.name,
      direction: formData.direction,
      status: formData.status,
      flag_code: formData.code.toLowerCase(),
      is_default: editingLang ? editingLang.is_default : false
    };
    try {
      await supabase.from('languages').upsert(payload, { onConflict: 'code' });
      fetchLanguages();
      setShowModal(false);
    } catch (e) {
      console.error("Kaydetme hatası:", e);
    }
  };

  const handleMakeDefault = async (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setProcessing(code);
      await supabase.from('languages').update({ is_default: true }).eq('code', code);
      localStorage.setItem('buzz_lang', code);
      window.location.reload();
    } catch (err) {
      window.location.reload();
    } finally {
      setProcessing(null);
    }
  };

  const handleDownload = async (lang: Language) => {
    try {
      const translations = await loadLocaleData(lang.code);
      const exportData = { meta: lang, translations: translations };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${lang.code}_language_pack.json`;
      link.click();
    } catch (e) { console.error(e); }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const dbPayload = {
          code: json.meta.code, name: json.meta.name, direction: json.meta.direction || 'ltr',
          status: json.meta.status || 'active', flag_code: json.meta.flag_code || json.meta.code, is_default: false
        };
        await supabase.from('languages').upsert(dbPayload, { onConflict: 'code' });
        localStorage.setItem(`buzz_locale_${dbPayload.code}`, JSON.stringify(json.translations));
        window.location.reload();
      } catch (err) { setStatusModal({ show: true, type: 'error', message: t('lang.import_error') }); } finally { setImporting(false); }
    };
    reader.readAsText(file);
  };

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredLanguages.length / itemsPerPage);
  const paginatedLanguages = filteredLanguages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const inputClasses = "w-full h-10 px-4 bg-palette-beige/30 border border-palette-tan/20 rounded-[3px] text-base font-bold text-palette-maroon outline-none hover:border-palette-tan/40 focus:bg-white focus:border-palette-tan focus:ring-4 focus:ring-palette-tan/5 transition-all placeholder:text-palette-tan/30";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 admin-font text-palette-tan pb-10">
      <div className="bg-white rounded-[3px] border border-palette-tan/20 shadow-sm overflow-visible relative z-0">

        <div className="px-6 py-5 border-b border-palette-tan/20 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div>
            <h2 className="text-[20px] font-[900] text-palette-maroon flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[3px] bg-palette-tan flex items-center justify-center text-white shadow-md shadow-palette-tan/20">
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>language</span>
              </div>
              {t('lang.page_title')}
            </h2>
            <p className="text-[14px] text-palette-tan/60 font-bold mt-1 ml-[42px]">{t('lang.page_desc')}</p>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="relative group w-full md:w-auto">
              <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-palette-tan/40 group-focus-within:text-palette-tan transition-colors" style={{ fontSize: '18px' }}>search</span>
              <input
                type="text"
                placeholder={t('lang.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 pr-4 bg-palette-beige/40 border border-palette-tan/20 rounded-[3px] text-[14px] font-bold text-palette-tan placeholder:text-palette-tan/40 focus:outline-none focus:border-palette-tan focus:bg-white focus:ring-4 focus:ring-palette-tan/5 transition-all w-full md:w-48 shadow-sm"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={openAddModal}
                className="flex-1 md:flex-none h-9 px-4 bg-palette-red text-white rounded-[3px] text-[13px] font-black tracking-widest hover:bg-primary-600 hover:shadow-lg hover:shadow-palette-red/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>add</span>
                {t('lang.add_new')}
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex-1 md:flex-none h-9 px-4 bg-palette-tan text-white rounded-[3px] text-[13px] font-black tracking-widest hover:bg-palette-maroon hover:shadow-lg hover:shadow-palette-tan/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>upload</span>
                {t('lang.import.title')}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-visible min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-palette-tan/15 border-t-palette-red rounded-[3px] animate-spin"></div>
            </div>
          ) : (
            <>
              <table className="w-full text-left text-base border-collapse">
                <thead className="bg-palette-beige/40 text-palette-tan font-black text-[13px] border-b border-palette-tan/15">
                  <tr>
                    <th className="px-8 py-4 w-20">{t('lang.table.code')}</th>
                    <th className="px-8 py-4">{t('lang.table.details')}</th>
                    <th className="px-8 py-4">{t('lang.table.status_default')}</th>
                    <th className="px-8 py-4">{t('lang.table.translations')}</th>
                    <th className="px-8 py-4 text-right">{t('lang.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-palette-tan/20">
                  {paginatedLanguages.length > 0 ? (
                    paginatedLanguages.map((lang) => {
                      const isProtected = PROTECTED_LANGS.includes(lang.code);
                      return (
                        <tr key={lang.code} className={`hover:bg-palette-beige/20 transition-colors group ${lang.is_default ? 'bg-palette-tan/5' : ''}`}>
                          <td className="px-8 py-4">
                            <span className="bg-white text-palette-maroon border border-palette-tan/20 px-2 py-1 rounded text-[13px] font-black shadow-sm">{lang.code}</span>
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-palette-maroon text-[15px] flex items-center gap-2">
                                {lang.name}
                              </span>
                              <span className="text-[12px] text-palette-tan/50 font-bold mt-1 flex items-center gap-1">
                                <div className={`w-1 h-1 rounded-[3px] ${lang.direction === 'ltr' ? 'bg-palette-tan' : 'bg-palette-red'}`}></div>
                                {lang.direction === 'ltr' ? t('lang.dir.ltr') : t('lang.dir.rtl')}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded text-[12px] font-black border flex items-center gap-1.5 ${lang.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-300'}`}>
                                <span className={`w-1.5 h-1.5 rounded-[3px] ${lang.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                {lang.status === 'active' ? t('lang.status.active') : t('lang.status.passive')}
                              </span>
                              <div className="h-4 w-px bg-palette-tan/10"></div>
                              {lang.is_default ? (
                                <div className="flex items-center gap-1 px-2 py-1 rounded bg-palette-tan text-white text-[12px] font-black shadow-sm h-6">
                                  <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>star</span>
                                  <span>{t('lang.default')}</span>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => handleMakeDefault(lang.code, e)}
                                  disabled={processing === lang.code}
                                  className="group flex items-center gap-1.5 px-2 py-1 rounded border border-palette-tan/15 text-palette-tan/60 hover:border-palette-red hover:bg-palette-red hover:text-white transition-all text-[12px] font-black h-6 active:scale-95"
                                >
                                  {processing === lang.code ? (
                                    <span className="material-symbols-rounded animate-spin" style={{ fontSize: '10px' }}>progress_activity</span>
                                  ) : (
                                    <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>star</span>
                                  )}
                                  <span>{t('lang.make_default')}</span>
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-2">
                              <button className="flex items-center justify-center gap-1.5 h-7 px-3 rounded-[3px] bg-palette-tan text-white text-[12px] font-black hover:bg-palette-maroon transition-all shadow-sm active:scale-95">
                                <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>translate</span>
                                {t('lang.btn.translations')}
                              </button>
                              <button
                                onClick={() => handleDownload(lang)}
                                className="flex items-center justify-center gap-1.5 h-7 px-3 rounded-[3px] bg-palette-beige/50 border border-palette-tan/15 text-palette-tan text-[12px] font-black hover:border-palette-tan hover:bg-white transition-all active:scale-95"
                              >
                                <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>download</span>
                                {t('lang.btn.download')}
                              </button>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <div className="relative inline-block text-left">
                              <button
                                onClick={(e) => toggleDropdown(lang.code, e)}
                                className={`h-7 w-7 rounded-[3px] flex items-center justify-center transition-all border ${openDropdownId === lang.code ? 'bg-palette-maroon text-white border-palette-maroon shadow-sm' : 'bg-white text-palette-tan/40 border-palette-tan/15 hover:border-palette-tan hover:text-palette-tan'}`}
                              >
                                {openDropdownId === lang.code ? <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>close</span> : <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>expand_more</span>}
                              </button>
                              {openDropdownId === lang.code && (
                                <div ref={dropdownRef} className="absolute right-0 mt-2 w-40 bg-white rounded-[3px] shadow-xl border border-palette-tan/15 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                                  <div className="p-1">
                                    <button
                                      onClick={(e) => openEditModal(lang, e)}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-bold text-palette-tan hover:bg-palette-beige hover:text-palette-maroon transition-colors text-left rounded group"
                                    >
                                      <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>edit</span>
                                      <span>{t('lang.edit')}</span>
                                    </button>
                                    <button
                                      onClick={(e) => handleDeleteClick(lang, e)}
                                      className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] font-bold text-left rounded mt-0.5 group transition-colors ${(isProtected || lang.is_default)
                                        ? 'text-palette-tan/30 bg-palette-beige/20 cursor-not-allowed'
                                        : 'text-palette-red hover:bg-palette-red/5'
                                        }`}
                                    >
                                      <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>delete</span>
                                      <span>{t('lang.delete')}</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-10 text-center text-palette-tan/40 text-[14px] font-bold">{t('stories.empty_state')}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="px-8 py-4 border-t border-palette-tan/15 flex flex-col sm:flex-row items-center justify-between gap-4 bg-palette-beige/20">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="appearance-none bg-white border border-palette-tan/15 text-palette-tan text-[13px] font-black h-8 pl-3 pr-8 rounded-[3px] outline-none focus:border-palette-tan transition-all cursor-pointer shadow-sm"
                    >
                      <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                    </select>
                    <span className="material-symbols-rounded absolute right-2.5 top-1/2 -translate-y-1/2 text-palette-tan/40 pointer-events-none group-hover:text-palette-tan transition-colors" style={{ fontSize: '16px' }}>expand_more</span>
                  </div>
                  <span className="text-[13px] font-black text-palette-tan/50">
                    {t('lang.showing').replace('{count}', paginatedLanguages.length.toString()).replace('{total}', filteredLanguages.length.toString())}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-[3px] border border-palette-tan/15 bg-white hover:bg-palette-beige disabled:opacity-50 transition-all shadow-sm">
                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-[3px] text-[13px] font-black transition-all border ${currentPage === p ? 'bg-palette-tan text-white border-palette-tan shadow-lg' : 'bg-white text-palette-tan/50 border-palette-tan/15 hover:border-palette-tan'}`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-[3px] border border-palette-tan/15 bg-white hover:bg-palette-beige disabled:opacity-50 transition-all shadow-sm">
                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>chevron_right</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/80 backdrop-blur-sm animate-in fade-in" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 border border-palette-tan/15">
            <div className="px-6 py-5 border-b border-palette-tan/15 bg-palette-beige/30 flex items-center justify-between">
              <h3 className="text-[20px] font-[900] text-palette-maroon tracking-tight flex items-center gap-2">
                <div className="p-1.5 bg-palette-red rounded-[3px] text-white shadow-md shadow-palette-red/30">
                  <span className="material-symbols-rounded" style={{ fontSize: '18px', fontWeight: 'bold' }}>{editingLang ? 'edit' : 'add'}</span>
                </div>
                {editingLang ? t('lang.edit') : t('lang.add_new')}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-palette-tan/50 hover:text-palette-red rounded-[3px] transition-all flex items-center justify-center"><span className="material-symbols-rounded" style={{ fontSize: '20px' }}>close</span></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1.5 group">
                <label className="text-[13px] font-black text-palette-tan/50 ml-1">{t('lang.form.name')}</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClasses} placeholder="Türkçe" />
              </div>
              <div className="space-y-1.5 group">
                <label className="text-[13px] font-black text-palette-tan/50 ml-1">{t('lang.form.code')}</label>
                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} disabled={!!editingLang} className={`${inputClasses} ${editingLang ? 'bg-palette-beige/50 text-palette-tan/50 cursor-not-allowed border-none shadow-none' : ''}`} placeholder="tr" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 group">
                  <label className="text-[13px] font-black text-palette-tan/50 ml-1">{t('lang.form.direction')}</label>
                  <select value={formData.direction} onChange={(e) => setFormData({ ...formData, direction: e.target.value })} className={`${inputClasses} px-4`}><option value="ltr">LTR</option><option value="rtl">RTL</option></select>
                </div>
                <div className="space-y-1.5 group">
                  <label className="text-[13px] font-black text-palette-tan/50 ml-1">{t('lang.form.status')}</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={`${inputClasses} px-4`}><option value="active">{t('lang.status.active')}</option><option value="passive">{t('lang.status.passive')}</option></select>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 border-t border-palette-tan/15 bg-palette-beige/30 flex items-center justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-[3px] font-bold text-[13px] text-palette-tan/50 hover:text-palette-maroon transition-colors tracking-wider">{t('common.cancel')}</button>
              <button onClick={handleSave} disabled={!!processing} className="flex items-center gap-2 px-8 py-3 bg-palette-tan text-white rounded-[3px] font-black text-[13px] tracking-widest hover:bg-palette-maroon shadow-xl shadow-palette-tan/20 active:translate-y-0.5 transition-all">
                {processing ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '14px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>save</span>}
                <span>{editingLang ? t('common.ok') : t('lang.form.add_btn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/80 backdrop-blur-sm animate-in fade-in" onClick={() => setShowImportModal(false)} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 border border-palette-tan/15">
            <div className="px-6 py-5 border-b border-palette-tan/15 bg-palette-beige/30 flex items-center justify-between">
              <h3 className="text-[20px] font-[900] text-palette-maroon tracking-tight flex items-center gap-2">
                <div className="p-1.5 bg-palette-tan rounded-[3px] text-white shadow-md shadow-palette-tan/20"><span className="material-symbols-rounded" style={{ fontSize: '18px' }}>upload</span></div>
                {t('lang.import.title')}
              </h3>
              <button onClick={() => setShowImportModal(false)} className="p-2 text-palette-tan/50 hover:text-palette-red rounded-[3px] transition-all flex items-center justify-center"><span className="material-symbols-rounded" style={{ fontSize: '20px' }}>close</span></button>
            </div>
            <div className="p-8">
              <label className="flex flex-col items-center justify-center w-full h-40 border border-palette-tan/20 border-dashed rounded-[3px] cursor-pointer bg-palette-beige/20 hover:bg-white hover:border-palette-red transition-all group">
                <div className="flex flex-col items-center justify-center text-center px-4">
                  {importing ? <span className="material-symbols-rounded text-palette-red animate-spin mb-3" style={{ fontSize: '32px' }}>progress_activity</span> : <div className="w-12 h-12 bg-white shadow-md border border-palette-tan/15 rounded-[3px] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-palette-red/30"><span className="material-symbols-rounded text-palette-tan/40 group-hover:text-palette-red transition-colors" style={{ fontSize: '28px' }}>data_object</span></div>}
                  <p className="text-base font-bold text-palette-maroon mb-1">{importing ? t('common.processing') : t('lang.import.drag')}</p>
                  <p className="text-[13px] text-palette-tan/40 font-medium">{t('lang.import.click')}</p>
                </div>
                <input type="file" className="hidden" accept=".json" ref={fileInputRef} onChange={handleFileChange} />
              </label>
            </div>
            <div className="px-6 py-5 border-t border-palette-tan/15 bg-palette-beige/30 flex items-center justify-end gap-3">
              <button onClick={() => setShowImportModal(false)} className="px-5 py-2.5 rounded-[3px] font-bold text-[13px] text-palette-tan/50 hover:text-palette-maroon transition-colors tracking-wider">{t('common.cancel')}</button>
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-8 py-3 bg-palette-tan text-white rounded-[3px] font-black text-[13px] tracking-widest hover:bg-palette-maroon shadow-xl active:scale-95 transition-all">
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>check_circle</span><span>{t('lang.import.btn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/40 backdrop-blur-sm animate-in fade-in" onClick={() => !processing && setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-[3px] shadow-[0_20px_70px_rgba(0,0,0,0.2)] w-full max-w-sm overflow-hidden animate-in zoom-in-95 border border-palette-tan/15 p-8 text-center">
            <div className="w-20 h-20 bg-red-50 text-palette-red rounded-[3px] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <span className="material-symbols-rounded" style={{ fontSize: '32px' }}>delete</span>
            </div>
            <h3 className="text-[22px] font-black text-palette-maroon tracking-tight mb-3">{t('lang.delete_title')}</h3>
            <p className="text-[15px] font-bold text-palette-tan/60 leading-relaxed mb-8">
              <span className="text-palette-maroon">"{langToDelete?.name}"</span> {t('lang.delete_confirm').replace('{name}', '')} <br />
              <span className="text-palette-red/70">{t('lang.delete_warning')}</span>
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                disabled={!!processing}
                className="w-full h-12 bg-palette-red text-white rounded-[3px] font-black text-[13px] tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-palette-red/20 flex items-center justify-center gap-2"
              >
                {processing ? <span className="material-symbols-rounded animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> : <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>delete</span>}
                {t('common.delete_kalici')}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={!!processing}
                className="w-full h-12 bg-palette-beige/30 text-palette-tan rounded-[3px] font-black text-[13px] tracking-widest hover:bg-palette-beige/50 transition-all"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {statusModal.show && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-palette-maroon/20 backdrop-blur-[2px] animate-in fade-in" onClick={() => setStatusModal({ ...statusModal, show: false })} />
          <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-xs overflow-hidden animate-in slide-in-from-bottom-4 border border-palette-tan/15 p-6 text-center">
            <div className={`w-14 h-14 rounded-[3px] flex items-center justify-center mx-auto mb-4 ${statusModal.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {statusModal.type === 'error' ? <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>close</span> : <span className="material-symbols-rounded text-green-600" style={{ fontSize: '28px' }}>check_circle</span>}
            </div>
            <p className="text-base font-bold text-palette-maroon mb-6 leading-relaxed">{statusModal.message}</p>
            <button
              onClick={() => setStatusModal({ ...statusModal, show: false })}
              className="w-full py-3 bg-palette-tan text-white rounded-[3px] font-black text-[13px] tracking-widest hover:bg-palette-maroon transition-all"
            >
              {t('common.ok')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSettings;
