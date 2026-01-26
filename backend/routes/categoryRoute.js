const express = require('express')
const {
    getAllCategories,
    getSingleCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController')
const { authenticate, authorize } = require('../middleware/authMiddleware')

const router = express.Router()

// Get all categories (public)
router.get('/', getAllCategories)

// Get single category (public)
router.get('/:id', getSingleCategory)

// Create category (admin/vendor only)
router.post('/', authenticate, authorize('admin', 'vendor'), createCategory)

// Update category (admin/vendor only)
router.put('/:id', authenticate, authorize('admin', 'vendor'), updateCategory)

// Delete category (admin only)
router.delete('/:id', authenticate, authorize('admin'), deleteCategory)

module.exports = router


