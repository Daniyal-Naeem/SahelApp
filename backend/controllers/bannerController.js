const bannerModel = require('../models/bannerModel')
const pinnedProductModel = require('../models/pinnedProductModel')
const dealModel = require('../models/dealModel')
const appAdModel = require('../models/appAdModel')
const productsModel = require('../models/productsModel')

/**
 * Banner & Homepage Content Controller
 * Phase 7: Banner and homepage content management
 */

/**
 * GET /api/banners
 * Get all active banners (public)
 */
const getAllBanners = async (req, res) => {
    try {
        const now = new Date()
        const banners = await bannerModel.find({
            isActive: true,
            $or: [
                { startDate: { $exists: false } },
                { startDate: { $lte: now } }
            ],
            $or: [
                { endDate: { $exists: false } },
                { endDate: { $gte: now } }
            ]
        })
            .sort({ order: 1, createdAt: -1 })
            .select('-clickCount -viewCount')

        return res.status(200).json(banners)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/banners/:id
 * Get single banner
 */
const getBannerById = async (req, res) => {
    try {
        const banner = await bannerModel.findById(req.params.id)
        if (!banner) {
            return res.status(404).json({ error: 'Banner not found' })
        }
        return res.status(200).json(banner)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/banners
 * Create banner (admin only)
 */
const createBanner = async (req, res) => {
    try {
        const bannerData = {
            ...req.body,
            createdBy: req.user.userId
        }
        const banner = await bannerModel.create(bannerData)
        return res.status(201).json(banner)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * PUT /api/banners/:id
 * Update banner (admin only)
 */
const updateBanner = async (req, res) => {
    try {
        const banner = await bannerModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        if (!banner) {
            return res.status(404).json({ error: 'Banner not found' })
        }
        return res.status(200).json(banner)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * DELETE /api/banners/:id
 * Delete banner (admin only)
 */
const deleteBanner = async (req, res) => {
    try {
        const banner = await bannerModel.findByIdAndDelete(req.params.id)
        if (!banner) {
            return res.status(404).json({ error: 'Banner not found' })
        }
        return res.status(200).json({ message: 'Banner deleted successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/banners/:id/click
 * Track banner click (public)
 */
const trackBannerClick = async (req, res) => {
    try {
        await bannerModel.findByIdAndUpdate(
            req.params.id,
            { $inc: { clickCount: 1 } }
        )
        return res.status(200).json({ message: 'Click tracked' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/pinned-products
 * Get pinned products (public)
 */
const getPinnedProducts = async (req, res) => {
    try {
        const { section = 'homepage' } = req.query
        const now = new Date()
        
        const pinned = await pinnedProductModel.find({
            section,
            isActive: true,
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: { $gte: now } }
            ]
        })
            .populate('product', 'title image price priceBeforeDeal priceOff')
            .sort({ order: 1, createdAt: -1 })

        const products = pinned.map(p => p.product).filter(p => p !== null)
        return res.status(200).json(products)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/pinned-products
 * Pin product (admin only)
 */
const pinProduct = async (req, res) => {
    try {
        const { productId, section, order, expiresAt } = req.body

        // Check if product exists
        const product = await productsModel.findById(productId)
        if (!product) {
            return res.status(404).json({ error: 'Product not found' })
        }

        // Check if already pinned
        const existing = await pinnedProductModel.findOne({ product: productId })
        if (existing) {
            // Update existing
            existing.section = section || existing.section
            existing.order = order !== undefined ? order : existing.order
            existing.isActive = true
            if (expiresAt) existing.expiresAt = expiresAt
            await existing.save()
            return res.status(200).json(existing)
        }

        const pinned = await pinnedProductModel.create({
            product: productId,
            section: section || 'homepage',
            order: order || 0,
            expiresAt,
            pinnedBy: req.user.userId
        })

        return res.status(201).json(pinned)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * DELETE /api/pinned-products/:id
 * Unpin product (admin only)
 */
const unpinProduct = async (req, res) => {
    try {
        const pinned = await pinnedProductModel.findByIdAndDelete(req.params.id)
        if (!pinned) {
            return res.status(404).json({ error: 'Pinned product not found' })
        }
        return res.status(200).json({ message: 'Product unpinned successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/deals
 * Get active deals (public)
 */
const getDeals = async (req, res) => {
    try {
        const { type } = req.query
        const now = new Date()
        
        const query = {
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }
        if (type) query.type = type

        const deals = await dealModel.find(query)
            .populate('categories', 'name')
            .populate('products', 'title image price')
            .sort({ createdAt: -1 })

        return res.status(200).json(deals)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/deals
 * Create deal (admin only)
 */
const createDeal = async (req, res) => {
    try {
        const dealData = {
            ...req.body,
            createdBy: req.user.userId
        }
        const deal = await dealModel.create(dealData)
        return res.status(201).json(deal)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * PUT /api/deals/:id
 * Update deal (admin only)
 */
const updateDeal = async (req, res) => {
    try {
        const deal = await dealModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        if (!deal) {
            return res.status(404).json({ error: 'Deal not found' })
        }
        return res.status(200).json(deal)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * DELETE /api/deals/:id
 * Delete deal (admin only)
 */
const deleteDeal = async (req, res) => {
    try {
        const deal = await dealModel.findByIdAndDelete(req.params.id)
        if (!deal) {
            return res.status(404).json({ error: 'Deal not found' })
        }
        return res.status(200).json({ message: 'Deal deleted successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * GET /api/app-ads
 * Get active app ads (public)
 */
const getAppAds = async (req, res) => {
    try {
        const { position } = req.query
        const now = new Date()
        
        const query = {
            isActive: true,
            $or: [
                { startDate: { $exists: false } },
                { startDate: { $lte: now } }
            ],
            $or: [
                { endDate: { $exists: false } },
                { endDate: { $gte: now } }
            ]
        }
        if (position) query.position = position

        const ads = await appAdModel.find(query)
            .sort({ order: 1, createdAt: -1 })
            .select('-clickCount -viewCount')

        return res.status(200).json(ads)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/app-ads
 * Create app ad (admin only)
 */
const createAppAd = async (req, res) => {
    try {
        const adData = {
            ...req.body,
            createdBy: req.user.userId
        }
        const ad = await appAdModel.create(adData)
        return res.status(201).json(ad)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * PUT /api/app-ads/:id
 * Update app ad (admin only)
 */
const updateAppAd = async (req, res) => {
    try {
        const ad = await appAdModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        if (!ad) {
            return res.status(404).json({ error: 'App ad not found' })
        }
        return res.status(200).json(ad)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * DELETE /api/app-ads/:id
 * Delete app ad (admin only)
 */
const deleteAppAd = async (req, res) => {
    try {
        const ad = await appAdModel.findByIdAndDelete(req.params.id)
        if (!ad) {
            return res.status(404).json({ error: 'App ad not found' })
        }
        return res.status(200).json({ message: 'App ad deleted successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/app-ads/:id/click
 * Track app ad click (public)
 */
const trackAppAdClick = async (req, res) => {
    try {
        const { id } = req.params
        const ad = await appAdModel.findByIdAndUpdate(
            id,
            { $inc: { clickCount: 1 } },
            { new: true }
        )
        if (!ad) {
            return res.status(404).json({ error: 'App ad not found' })
        }
        return res.status(200).json({ message: 'Click tracked' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * POST /api/app-ads/:id/view
 * Track app ad view (public)
 */
const trackAppAdView = async (req, res) => {
    try {
        const { id } = req.params
        const ad = await appAdModel.findByIdAndUpdate(
            id,
            { $inc: { viewCount: 1 } },
            { new: true }
        )
        if (!ad) {
            return res.status(404).json({ error: 'App ad not found' })
        }
        return res.status(200).json({ message: 'View tracked' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
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
}















