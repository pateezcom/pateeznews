
// Saniye -> DK:SN formatlayıcı (Profesyonel Görünüm)
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// UUID doğrulayıcı
export const isUUID = (str: string): boolean => {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const TURKISH_CHAR_MAP: Record<string, string> = {
  '\u00c7': 'c',
  '\u00e7': 'c',
  '\u011e': 'g',
  '\u011f': 'g',
  '\u0130': 'i',
  '\u0131': 'i',
  '\u00d6': 'o',
  '\u00f6': 'o',
  '\u015e': 's',
  '\u015f': 's',
  '\u00dc': 'u',
  '\u00fc': 'u'
};

export const slugify = (input: string): string => {
  if (!input) return '';
  const mapped = input
    .split('')
    .map((ch) => TURKISH_CHAR_MAP[ch] || ch)
    .join('');

  return mapped
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
