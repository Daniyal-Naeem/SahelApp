/**
 * Product translation utilities for multi-language support.
 * Resolves product title and description based on current locale.
 * Falls back to base title/description when translations are not available.
 */

import type {LocaleKey} from '../constants/locales';

export type ProductWithTranslations = {
  title?: string;
  description?: string;
  titleTranslations?: {en?: string; ar?: string};
  descriptionTranslations?: {en?: string; ar?: string};
  [key: string]: any;
};

/**
 * Get the localized title for a product based on the current locale.
 */
export const getLocalizedTitle = (
  product: ProductWithTranslations,
  locale: LocaleKey,
): string => {
  const translations = product?.titleTranslations;
  if (translations && typeof translations === 'object') {
    const translated = translations[locale];
    if (translated && typeof translated === 'string' && translated.trim()) {
      return translated;
    }
  }
  return product?.title || product?.name || '';
};

/**
 * Get the localized description for a product based on the current locale.
 */
export const getLocalizedDescription = (
  product: ProductWithTranslations,
  locale: LocaleKey,
): string => {
  const translations = product?.descriptionTranslations;
  if (translations && typeof translations === 'object') {
    const translated = translations[locale];
    if (translated && typeof translated === 'string' && translated.trim()) {
      return translated;
    }
  }
  return product?.description || '';
};

/**
 * Returns a product object with localized title and description.
 * Use this when passing product data to display components.
 * Original product is not mutated - returns a new object with resolved fields.
 */
export const getLocalizedProduct = <T extends ProductWithTranslations>(
  product: T,
  locale: LocaleKey,
): T => {
  if (!product) return product;

  const localizedTitle = getLocalizedTitle(product, locale);
  const localizedDescription = getLocalizedDescription(product, locale);

  return {
    ...product,
    title: localizedTitle || product.title || '',
    description: localizedDescription || product.description || '',
  };
};

/**
 * Localize an array of products.
 */
export const getLocalizedProducts = <T extends ProductWithTranslations>(
  products: T[],
  locale: LocaleKey,
): T[] => {
  if (!products || !Array.isArray(products)) return products;
  return products.map(p => getLocalizedProduct(p, locale));
};
