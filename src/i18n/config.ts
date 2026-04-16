export const locales = [
  'en', 'fr', 'es', 'de', 'pt', 'it', 'nl', 'ja', 'ko', 'zh', 'ar', 'hi', 'ru', 'tr', 'pl',
  'bg', 'cs', 'da', 'el', 'fi', 'hr', 'hu', 'id', 'ms', 'no', 'ro', 'sv', 'th', 'uk', 'vi',
  'af', 'az', 'be', 'bn', 'ca', 'et', 'fa', 'he', 'hy', 'ka', 'lt', 'lv', 'mk', 'mn', 'ne',
  'sk', 'sl', 'sq', 'sr', 'sw'
] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];
