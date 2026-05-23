const Review = require("../models/Review");


const getReviews = async ({ productId }) => {
    return Review.find({ product: productId }).populate("user", "userName name age avatarUrl");
};

const getUserReview = async (userId, productId) => {
    return Review.findOne({ product: productId, user: userId });
}

const addReview = async ({ productId, userId, text, rating }) => {
    const review = await Review.findOne({ product: productId, user: userId });
    if (!review) {
        return Review.create({ product: productId, user: userId, text, rating });
    } else {
        return null;
    }
}

const PutReview = async (productId, userId, data) => {
    const review = await Review.findOne({ product: productId, user: userId });
    if (!review) return null;
    return Review.findByIdAndUpdate(review._id, data, { returnDocument: "after" });
}

const deleteReview = async (productId, userId) => {
    const review = await Review.findOne({ product: productId, user: userId });
    if (!review) return null;
    return Review.findByIdAndDelete(review._id, { returnDocument: "after" });
}

module.exports = {
    getReviews,
    getUserReview,
    addReview,
    PutReview,
    deleteReview,
};
