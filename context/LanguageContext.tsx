
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { loadLocaleData } from '../lib/locales';

interface Language {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
  status: string;
  flag_code: string;
  is_default: boolean;
}

interface LanguageContextType {
  currentLang: Language;
  availableLanguages: Language[];
  setLanguage: (code: string) => void;
  t: (key: string) => string;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const DEFAULT_LANG: Language = {
  code: 'tr',
  name: 'Türkçe',
  direction: 'ltr',
  status: 'active',
  flag_code: 'tr',
  is_default: true
};

// 2025 Static Fallback (Sıfır Key Görünümü Garanti)
const STATIC_TR: Record<string, string> = {
  "nav.home": "Ana Sayfa",
  "nav.agenda": "Gündem",
  "nav.pateezvideotv": "Video",
  "nav.special": "Eğlence",
  "nav.search": "Haber ara...",
  "nav.login": "Giriş Yap",
  "sidebar.publishers": "Yayıncılar",
  "sidebar.categories": "Kategoriler",
  "feed.title_prefix": "Sizin İçin",
  "feed.title_suffix": "Seçtiklerimiz",
  "feed.latest": "En Yeni",
  "feed.popular": "Popüler",
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState<Language>(DEFAULT_LANG);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([DEFAULT_LANG]);
  const [translations, setTranslations] = useState<Record<string, string> | null>(STATIC_TR);
  const [loading, setLoading] = useState(true);

  // 1. Dili saniyeler içinde belirle (Sync)
  const getInitialLangCode = useCallback(() => {
    const saved = localStorage.getItem('pateez_lang');
    if (saved) return saved;

    const browserLang = navigator.language.split('-')[0];
    return ['tr', 'en', 'ar'].includes(browserLang) ? browserLang : 'tr';
  }, []);

  // 2. Çevirileri yükle (Paralel)
  const loadTranslations = useCallback(async (lang: Language) => {
    try {
      const data = await loadLocaleData(lang.code);
      if (data && Object.keys(data).length > 0) {
        setTranslations(data);
        document.documentElement.dir = lang.direction;
        document.documentElement.lang = lang.code;
        setCurrentLang(lang);
      }
    } catch (err) {
      console.error('Translation load error:', err);
      setTranslations({}); // Fallback
    }
  }, []);

  useEffect(() => {
    const isMounted = { current: true };
    const init = async () => {
      const initialCode = getInitialLangCode();
      const initialLangObj = { ...DEFAULT_LANG, code: initialCode };

      // 1. Önce çevirileri yükle (Bu kritik)
      await loadTranslations(initialLangObj);
      if (isMounted.current) setLoading(false);

      // 2. Arka planda Supabase'den güncel dil listesini al (Bloke etme)
      try {
        const { data: dbLangs } = await supabase
          .from('languages')
          .select('*')
          .eq('status', 'active');

        if (isMounted.current && dbLangs && dbLangs.length > 0) {
          setAvailableLanguages(dbLangs);
          const found = dbLangs.find(l => l.code === initialCode);
          if (found && found.direction !== initialLangObj.direction) {
            document.documentElement.dir = found.direction;
          }
        }
      } catch (e) {
        console.warn('DB Language list fallback used');
      }
    };

    init();
    return () => { isMounted.current = false; };
  }, [getInitialLangCode, loadTranslations]);

  const setLanguage = async (code: string) => {
    const lang = availableLanguages.find(l => l.code === code) || { ...DEFAULT_LANG, code };
    setLoading(true);
    localStorage.setItem('pateez_lang', code);
    try {
      await loadTranslations(lang as Language);
    } finally {
      setLoading(false);
    }
  };

  const t = useCallback((key: string): string => {
    if (!translations) return STATIC_TR[key] || key;
    return translations[key] || STATIC_TR[key] || key;
  }, [translations]);

  const contextValue = useMemo(() => ({
    currentLang,
    availableLanguages,
    setLanguage,
    t,
    loading
  }), [currentLang, availableLanguages, setLanguage, t, loading]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
