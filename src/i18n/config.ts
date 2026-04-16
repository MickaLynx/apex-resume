export const locales = ['en', 'fr', 'es', 'de', 'pt', 'it', 'nl', 'ja', 'ko', 'zh', 'ar', 'hi', 'ru', 'tr', 'pl'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];
