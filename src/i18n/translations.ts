import type { Locale } from './config';
import en from './locales/en.json';
import ar from './locales/ar.json';

export type TranslationKey = keyof typeof en;

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  en,
  ar,
};
