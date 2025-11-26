const mongoose = require('mongoose')
const categoryModel = require('../models/categoryModel')

/**
 * getAllCategories,
 * getSingleCategory,
 * createCategory,
 * updateCategory,
 * deleteCategory
 */

// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find({ isActive: true })
            .sort({ displayOrder: 1, createdAt: -1 })
            .populate('parentCategory', 'name')
        
        if (categories.length === 0) {
            return res.status(404).json({ message: "No Categories Found" })
        }
        
        return res.status(200).json(categories)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Get single category by ID
const getSingleCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No Such ID" })
        }
        
        const category = await categoryModel.findById(id)
            .populate('parentCategory', 'name')
        
        if (!category) {
            return res.status(404).json({ error: "Category not found" })
        }
        
        return res.status(200).json(category)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Create new category
const createCategory = async (req, res) => {
    try {
        const { name, description, image, icon, parentCategory, displayOrder } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: "Category name is required" })
        }
        
        // Check if category already exists
        const existingCategory = await categoryModel.findOne({ name: name.trim() })
        if (existingCategory) {
            return res.status(400).json({ error: "Category with this name already exists" })
        }
        
        const newCategory = await categoryModel.create({
            name: name.trim(),
            description: description || "",
            image: image || "",
            icon: icon || "",
            parentCategory: parentCategory || null,
            displayOrder: displayOrder || 0
        })
        
        return res.status(201).json(newCategory)
    } catch (error) {
        let errorMessage = "";
        if (error.errors) {
            errorMessage = Object.values(error.errors).map(error => error.message).join(", ")
        } else {
            errorMessage = error.message;
        }
        res.status(500).json({ error: errorMessage })
    }
}

// Update category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, image, icon, parentCategory, displayOrder } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No such ID" })
        }

        // Check if category exists
        const existingCategory = await categoryModel.findById(id)
        if (!existingCategory) {
            return res.status(404).json({ error: "Category not found" })
        }

        // If name is being changed, check for duplicates
        if (name && name.trim() !== existingCategory.name) {
            const duplicateCategory = await categoryModel.findOne({ 
                name: name.trim(),
                _id: { $ne: id } // Exclude current category
            })
            if (duplicateCategory) {
                return res.status(400).json({ error: "Category with this name already exists" })
            }
        }
        
        // Prepare update data
        const updateData = {}
        if (name !== undefined) updateData.name = name.trim()
        if (description !== undefined) updateData.description = description || ""
        if (image !== undefined) updateData.image = image || ""
        if (icon !== undefined) updateData.icon = icon || ""
        if (parentCategory !== undefined) updateData.parentCategory = parentCategory || null
        if (displayOrder !== undefined) updateData.displayOrder = displayOrder || 0
        
        const updatedCategory = await categoryModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        
        return res.status(200).json(updatedCategory)
    } catch (error) {
        let errorMessage = "";
        if (error.errors) {
            errorMessage = Object.values(error.errors).map(err => err.message).join(", ")
        } else if (error.code === 11000) {
            // MongoDB duplicate key error
            errorMessage = "Category with this name already exists"
        } else {
            errorMessage = error.message;
        }
        res.status(500).json({ error: errorMessage })
    }
}

// Delete category (soft delete by setting isActive to false)
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No Such ID" })
        }
        
        const deletedCategory = await categoryModel.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        )
        
        if (!deletedCategory) {
            return res.status(404).json({ error: "Category not found" })
        }
        
        return res.status(200).json({ 
            message: "Category deleted successfully",
            category: deletedCategory
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    getAllCategories,
    getSingleCategory,
    createCategory,
    updateCategory,
    deleteCategory
}


