const express = require('express')

const {
    getAllProducts,
    getSingleProduct,
    createNewProduct,
    updateProduct,
    deleteProduct,
    searchProducts
} = require('../controllers/productsController')

const { authenticate, authorize, optionalAuthenticate } = require('../middleware/authMiddleware')

const router = express.Router()

// Search products (must be before /:id route)
router.get('/search', searchProducts)

// optionalAuthenticate so ?vendor=me can resolve the caller
router.get('/', optionalAuthenticate, getAllProducts)
router.get('/:id', getSingleProduct)
router.post('/', authenticate, authorize('admin', 'vendor'), createNewProduct)
router.put('/:id', authenticate, authorize('admin', 'vendor'), updateProduct)
router.delete('/:id', authenticate, authorize('admin'), deleteProduct)

module.exports = router;