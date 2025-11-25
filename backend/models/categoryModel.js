const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String
    },
    icon: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // For category hierarchy (parent category)
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: 'categoryModel',
        default: null
    },
    // Display order
    displayOrder: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

module.exports = mongoose.model("categoryModel", categorySchema)

