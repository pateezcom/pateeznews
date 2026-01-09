
// Dil dosyalarını dinamik olarak yükler (Code Splitting).
// Hem yerel dosyalardan hem de sonradan eklenen (localStorage) dillerden okuma yapar.

export const loadLocaleData = async (langCode: string) => {
  try {
    // 1. Önce sonradan eklenmiş (Import edilmiş) dilleri kontrol et
    if (typeof window !== 'undefined') {
      const storedTranslation = localStorage.getItem(`pateez_locale_${langCode}`);
      if (storedTranslation) {
        try {
          const parsed = JSON.parse(storedTranslation);
          if (parsed && Object.keys(parsed).length > 0) return parsed;
        } catch (e) {
          console.error("Local storage parse error", e);
        }
      }
    }

    // 2. Statik Dosyalar (Daha Hızlı Import)
    let data;
    switch (langCode) {
      case 'tr':
        const tr = await import('./locales/tr');
        data = tr.default || tr;
        break;
      case 'en':
        const en = await import('./locales/en');
        data = en.default || en;
        break;
      case 'ar':
        const ar = await import('./locales/ar');
        data = ar.default || ar;
        break;
      default:
        const fallback = await import('./locales/tr');
        data = fallback.default || fallback;
    }
    
    return data;
  } catch (error) {
    console.error(`Critical: Language load failed for ${langCode}`, error);
    // Acil durum kurtarma: Hardcoded temel çeviriler
    return { "nav.home": "AKIŞ" };
  }
};
