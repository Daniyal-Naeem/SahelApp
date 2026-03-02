import { en } from './en';
import { ar } from './ar';

export const locales = {
  en,
  ar,
};

export type LocaleKey = keyof typeof locales;
export type TranslationKey = keyof typeof en;

export { en, ar };