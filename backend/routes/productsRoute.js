const express = require('express')

const {
    getAllProducts,
    getSingleProduct,
    createNewProduct,
    updateProduct,
    deleteProduct,
    searchProducts
} = require('../controllers/productsController')

const router = express.Router()

// Search products (must be before /:id route)
router.get('/search', searchProducts)

router.get('/', getAllProducts)
router.get('/:id', getSingleProduct)
router.post('/', createNewProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

module.exports = router;