export const locales = ['en', 'ar'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeLabels: Record<Locale, string> = {
  en: 'EN',
  ar: 'AR',
};

export function isRtlLocale(locale: Locale): boolean {
  return locale === 'ar';
}
