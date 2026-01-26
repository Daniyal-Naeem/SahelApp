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
        const products = await productsModel.find({})
            .populate('category', 'name description icon')
            .populate('vendor', 'name email businessName')
            .sort({ createdAt: -1 }) // sort by newest
        //   check if there no products
        if (products.length === 0) {
            return res.status(404).json({ message: " No Products Found " })
        }
        // if there is return it
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
        // get the input fields
        const { image, title, description, price, priceBeforeDeal, priceOff, stars, numberOfReview, ukSide,
            tags, status, category, vendor } = req.body;
        // destructure status to icon, and name
        const { icon, name } = status;

        // create the product
        const newProduct = await productsModel.create({
            image, title, description, price, priceBeforeDeal, priceOff, stars, numberOfReview, ukSide,
            tags, status: { icon, name },
            ...(category && { category }),
            ...(vendor && { vendor })
        })
        // return it
        return res.status(200).json(newProduct)

    } catch (error) {
        // separate each error
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
        // validate the id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No such ID" })
        }
        const updateProduct = await productsModel.findByIdAndUpdate(id , { ...req.body }, { new: true })

        if (!updateProduct) {
            return res.status(400).json({ error: "Couldn't Update the product, make sure you filled the required fields" })
        }

        // alright
        return res.status(200).json(updateProduct)

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