"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { defaultLocale, isRtlLocale, localeLabels, locales, type Locale } from './config';
import { translations, type TranslationKey } from './translations';

type I18nContextValue = {
  locale: Locale;
  isRtl: boolean;
  localeLabels: Record<Locale, string>;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const STORAGE_KEY = 'app_locale';

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, token) => String(vars[token] ?? ''));
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && locales.includes(saved as Locale)) {
    return saved as Locale;
  }
  return defaultLocale;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtlLocale(locale) ? 'rtl' : 'ltr';
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    isRtl: isRtlLocale(locale),
    localeLabels,
    setLocale: setLocaleState,
    t: (key, vars) => interpolate(translations[locale][key], vars),
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
