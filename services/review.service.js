const Review = require("../models/Review");


const getReviews = async ({ productId }) => {
    return Review.find({ product: productId }).populate("user", "userName name age avatarUrl");
};

const getUserReview = async (userId, productId) => {
    return Review.findOne({ product: productId, user: userId });
}

const getReviewById = async (reviewId) => {
    return Review.findOne({ _id: reviewId});
}

const addReview = async ({ productId, userId, text, rating }) => {
    const review = await Review.findOne({ product: productId, user: userId });
    if (!review) {
        return Review.create({ product: productId, user: userId, text, rating });
    } else {
        return null;
    }
}

const PutReview = async (review, data) => {
    if (!review) return null;
    return Review.findByIdAndUpdate(review._id, data, { returnDocument: "after" });
}

const deleteReview = async (review) => {
    if (!review) return null;
    return Review.findByIdAndDelete(review._id, { returnDocument: "after" });
}

module.exports = {
    getReviews,
    getUserReview,
    getReviewById,
    addReview,
    PutReview,
    deleteReview,
};
