const Reviews = require("../models/Review");
const Product = require("../models/Product");


const {
    getProductById,
} = require("../services/product.service");
const Review = require("../models/Review");



const getReviews = async ({ productId }) => {
    const product = getProductById(productId);
    return { reviews };
};


const addReview = async ({ productId, userId, text, rating }) => {
    const review = await Review.findOne({ product: productId, user: userId})
    if (!review) {
        return Review.create({ product: productId, user: userId, text, rating });
    } else {
        return null;
    }
}

module.exports = {
    getReviews,
    addReview
};