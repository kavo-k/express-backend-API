const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");


const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const {
  getReviews,
  addReview,
} = require("../services/review.service");


router.get(
  "/:productID/reviews",
  asyncHandler(async (req, res) => {
    const productId = req.params.productID;

    const { reviews } = await getItems({ productId });

    if (!reviews) {
      return res.json({ reviews: { items: [] } });
    }

    res.json({ reviews });
  })
);


router.post(
  "/:productId/reviews",
  auth,
  asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const userId = req.user.userId;
    const { text, rating } = req.body;

    if (!rating) {
      return res.status(400).json({ error: "Необходимо обязательно поставить оценку." });
    }
    
    const reviews = await addReview({ productId, userId, text, rating });

    if (reviews === null) {
      return res.status(400).json({ error: "Отзыв уже оставлен." });
    }

    res.status(201).json(reviews);
  })
);


module.exports = router;