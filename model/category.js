const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    CategoryName: {
        type: String,
        required: true,
        unique: true,
    },
    CategoryDescription: {
        type: String,
    },
    isListed: {
        type: Boolean,
        default: true,
    },
});

const Category = mongoose.model("category", categorySchema);

module.exports = Category;
