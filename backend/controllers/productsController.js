const mongoose = require('mongoose')
const productsModel = require('../models/productsModel')


/**
     getAllProducts,
    getSingleProduct,
    createNewProduct,
    updateProduct,
    deleteProduct
 */

const getAllProducts = async (req, res) => {
    try {
        const products = await productsModel.find({}).sort({ createdAt: -1 })
        if (products.length === 0) {
            return res.status(404).json({ message: " No Products Found " })
        }
        return res.status(200).json(products)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
const getSingleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: "No Such ID" })
        }
        const Product = productsModel.findById(id)
        if (!Product) {
            res.status(400).json("Not Valid Product")
        }
        return res.status(200).json(Product)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const createNewProduct = async (req, res) => {
    try {
        const { image, title, description, price, priceBeforeDeal, priceOff, stars, numberOfReview, ukSide,
            tags, status } = req.body;
        const { icon, name } = status;

        const newProduct = await productsModel.create({
            image, title, description, price, priceBeforeDeal, priceOff, stars, numberOfReview, ukSide,
            tags, status: { icon, name }
        })
        return res.status(200).json(newProduct)

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

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No such ID" })
        }
        const updateProduct = await productsModel.findByIdAndUpdate(id , { ...req.body }, { new: true })

        if (!updateProduct) {
            return res.status(400).json({ error: "Couldn't Update the product, make sure you filled the required fields" })
        }

        return res.status(200).json(updateProduct)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "No Such ID" })
        }
        const deleteProductByItsID = await productsModel.findByIdAndUpdate(id)

        return res.status(200).json(deleteProductByItsID)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}    
 


module.exports = {
    getAllProducts,
    getSingleProduct,
    createNewProduct,
    updateProduct,
    deleteProduct
}