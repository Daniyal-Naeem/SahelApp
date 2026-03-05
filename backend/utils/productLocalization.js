/**
 * Product localization utility - resolves title/description based on Accept-Language header.
 * When locale is 'ar' and product has titleTranslations.ar, use it. Otherwise fallback to base.
 */

/**
 * Get locale from Accept-Language header (e.g. "ar", "en-US" -> "en")
 */
const getLocaleFromRequest = (req) => {
    const acceptLanguage = req.headers['accept-language'];
    if (!acceptLanguage) return 'en';
    // Accept-Language can be "ar", "en-US,en;q=0.9", "ar,en;q=0.8"
    const first = acceptLanguage.split(',')[0]?.trim().toLowerCase();
    if (first?.startsWith('ar')) return 'ar';
    return 'en';
};

/**
 * Localize a single product - returns plain object with resolved title/description
 */
const localizeProduct = (product, locale) => {
    if (!product) return product;
    const doc = typeof product.toObject === 'function' ? product.toObject() : { ...product };
    
    if (locale === 'ar') {
        if (doc.titleTranslations?.ar && doc.titleTranslations.ar.trim()) {
            doc.title = doc.titleTranslations.ar;
        }
        if (doc.descriptionTranslations?.ar && doc.descriptionTranslations.ar.trim()) {
            doc.description = doc.descriptionTranslations.ar;
        }
    }
    return doc;
};

/**
 * Localize array of products
 */
const localizeProducts = (products, locale) => {
    if (!products || !Array.isArray(products)) return products;
    return products.map(p => localizeProduct(p, locale));
};

module.exports = {
    getLocaleFromRequest,
    localizeProduct,
    localizeProducts
};
