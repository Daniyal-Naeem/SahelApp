const express = require('express')
const {
    getAllBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    trackBannerClick,
    getPinnedProducts,
    pinProduct,
    unpinProduct,
    getDeals,
    createDeal,
    updateDeal,
    deleteDeal,
    getAppAds,
    createAppAd,
    updateAppAd,
    deleteAppAd,
    trackAppAdClick,
    trackAppAdView
} = require('../controllers/bannerController')
const { authenticate, authorize } = require('../middleware/authMiddleware')

const router = express.Router()

/**
 * Banner & Homepage Content Routes
 * Phase 7: Banner and homepage content management
 */

// Banner routes (public read, admin write)
router.get('/banners', getAllBanners)
router.get('/banners/:id', getBannerById)
router.post('/banners/:id/click', trackBannerClick) // Public tracking
router.post('/banners', authenticate, authorize('admin'), createBanner)
router.put('/banners/:id', authenticate, authorize('admin'), updateBanner)
router.delete('/banners/:id', authenticate, authorize('admin'), deleteBanner)

// Pinned products routes
router.get('/pinned-products', getPinnedProducts)
router.post('/pinned-products', authenticate, authorize('admin'), pinProduct)
router.delete('/pinned-products/:id', authenticate, authorize('admin'), unpinProduct)

// Deals routes
router.get('/deals', getDeals)
router.post('/deals', authenticate, authorize('admin'), createDeal)
router.put('/deals/:id', authenticate, authorize('admin'), updateDeal)
router.delete('/deals/:id', authenticate, authorize('admin'), deleteDeal)

// App ads routes
router.get('/app-ads', getAppAds)
router.post('/app-ads/:id/click', trackAppAdClick) // Public tracking
router.post('/app-ads/:id/view', trackAppAdView) // Public tracking
router.post('/app-ads', authenticate, authorize('admin'), createAppAd)
router.put('/app-ads/:id', authenticate, authorize('admin'), updateAppAd)
router.delete('/app-ads/:id', authenticate, authorize('admin'), deleteAppAd)

module.exports = router















