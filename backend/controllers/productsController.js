const mongoose = require('mongoose')
const productsModel = require('../models/productsModel')


/**
     getAllProducts,
    getSingleProduct,
    createNewProduct,
    updateProduct,
    deleteProduct,
    searchProducts
 */

// get all products
const getAllProducts = async (req, res) => {
    try {
        const query = {}
        const { vendor } = req.query

        // ?vendor=me requires auth; vendors see only their own catalogue.
        if (vendor === 'me') {
            if (!req.user || !req.user.userId) {
                return res.status(401).json({ error: 'Authentication required' })
            }
            query.vendor = req.user.userId
        } else if (vendor && mongoose.Types.ObjectId.isValid(vendor)) {
            query.vendor = vendor
        }

        const products = await productsModel.find(query)
            .populate('category', 'name description icon')
            .populate('vendor', 'name email businessName')
            .sort({ createdAt: -1 })

        return res.status(200).json(products)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
// get single product with its ID
const getSingleProduct = async (req, res) => {
    try {
        // get its id
        const { id } = req.params;
        // validate the id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No Such ID" })
        }
        // get the post by its id with populated fields
        const Product = await productsModel.findById(id)
            .populate('category', 'name description icon')
            .populate('vendor', 'name email businessName')
        // check if valid product
        if (!Product) {
            return res.status(404).json({ error: "Not Valid Product" })
        }
        // if it's ok return it
        return res.status(200).json(Product)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// create a new product
const createNewProduct = async (req, res) => {
    try {
        const { image, title, description, price, priceBeforeDeal, priceOff, stars, numberOfReview, ukSide,
            tags, status, category } = req.body;

        if (!status || !status.icon || !status.name) {
            return res.status(400).json({ error: 'status.icon and status.name are required' })
        }

        const { icon, name } = status;

        // Vendors always own what they create; admins may assign a vendor id.
        let vendorId = null
        if (req.user.role === 'vendor') {
            vendorId = req.user.userId
        } else if (req.body.vendor && mongoose.Types.ObjectId.isValid(req.body.vendor)) {
            vendorId = req.body.vendor
        }

        const newProduct = await productsModel.create({
            image: image || [],
            title,
            description,
            price,
            priceBeforeDeal: priceBeforeDeal ?? price,
            priceOff: priceOff ?? 0,
            stars: stars || 0,
            numberOfReview: numberOfReview || 0,
            ukSide,
            tags: tags || [],
            status: { icon, name },
            ...(category && { category }),
            ...(vendorId && { vendor: vendorId }),
        })

        const populated = await productsModel.findById(newProduct._id)
            .populate('category', 'name description icon')
            .populate('vendor', 'name email businessName')

        return res.status(200).json(populated)
    } catch (error) {
        let errorMessage = "";
        if (error.errors) {
            errorMessage = Object.values(error.errors).map(error => error.message).join(",")
        } else {
            errorMessage = error.message;
        }
        res.status(500).json({ error: errorMessage })
    }
}

// update product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No such ID" })
        }

        const existing = await productsModel.findById(id)
        if (!existing) {
            return res.status(404).json({ error: "Product not found" })
        }

        // Vendors may only edit their own products.
        if (req.user.role === 'vendor') {
            if (!existing.vendor || String(existing.vendor) !== String(req.user.userId)) {
                return res.status(403).json({ error: 'You can only edit your own products' })
            }
            // Prevent reassigning ownership.
            delete req.body.vendor
        }

        const updated = await productsModel.findByIdAndUpdate(id, { ...req.body }, { new: true })
            .populate('category', 'name description icon')
            .populate('vendor', 'name email businessName')

        return res.status(200).json(updated)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
// delete product

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // validate the id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No Such ID" })
        }
        const deleteProductByItsID = await productsModel.findByIdAndDelete(id)

        if (!deleteProductByItsID) {
            return res.status(404).json({ error: "Product not found" })
        }

        // successful
        return res.status(200).json({ message: "Product deleted successfully", deletedProduct: deleteProductByItsID })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Search products
const searchProducts = async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;

        // Build search query
        let query = {};

        // Text search on title, description, and tags
        if (q && q.trim()) {
            const searchRegex = new RegExp(q.trim(), 'i'); // Case-insensitive
            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { tags: { $in: [searchRegex] } }
            ];
        }

        // Category filter
        if (category) {
            if (mongoose.Types.ObjectId.isValid(category)) {
                query.category = category;
            }
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) {
                query.price.$gte = parseFloat(minPrice);
            }
            if (maxPrice) {
                query.price.$lte = parseFloat(maxPrice);
            }
        }

        // Build sort options
        let sortOptions = { createdAt: -1 }; // Default: newest first
        if (sort) {
            switch (sort) {
                case 'price_asc':
                    sortOptions = { price: 1 };
                    break;
                case 'price_desc':
                    sortOptions = { price: -1 };
                    break;
                case 'rating':
                    sortOptions = { stars: -1, numberOfReview: -1 };
                    break;
                case 'popular':
                    sortOptions = { numberOfReview: -1, stars: -1 };
                    break;
                case 'newest':
                    sortOptions = { createdAt: -1 };
                    break;
                case 'oldest':
                    sortOptions = { createdAt: 1 };
                    break;
                default:
                    sortOptions = { createdAt: -1 };
            }
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute search
        const products = await productsModel.find(query)
            .populate('category', 'name description icon')
            .populate('vendor', 'name email businessName')
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);

        // Get total count for pagination
        const total = await productsModel.countDocuments(query);
        const totalPages = Math.ceil(total / limitNum);

        // Return results
        return res.status(200).json({
            products,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalProducts: total,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            },
            filters: {
                query: q || '',
                category: category || '',
                minPrice: minPrice || '',
                maxPrice: maxPrice || '',
                sort: sort || 'newest'
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    getAllProducts,
    getSingleProduct,
    createNewProduct,
    updateProduct,
    deleteProduct,
    searchProducts
}