import { useState, useCallback } from 'react';
import { tr, type TranslationKey } from '../i18n/tr';
import { en } from '../i18n/en';

type Lang = 'tr' | 'en';

const LANG_KEY = 'kulturota_lang';

export function useI18n() {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang;
    if (saved === 'tr' || saved === 'en') return saved;
    return navigator.language.startsWith('tr') ? 'tr' : 'en';
  });

  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = lang === 'tr' ? tr : en;
      return dict[key] ?? key;
    },
    [lang]
  );

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'tr' ? 'en' : 'tr';
      localStorage.setItem(LANG_KEY, next);
      return next;
    });
  }, []);

  return { lang, t, toggleLang };
}
