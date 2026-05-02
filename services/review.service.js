const Review = require("../models/Review");


const getReviews = async ({ productId }) => {
    return Review.find({ product: productId }).populate("user", "userName name age");
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