const express = require('express')

const {
    getAllProducts,
    getSingleProduct,
    createNewProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productsController')

const router = express.Router()

router.get('/', getAllProducts)
router.get('/:id', getSingleProduct)
router.post('/', createNewProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

module.exports = router;