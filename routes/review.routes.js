const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");


const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const {
  getReviews,
  getUserReview,
  addReview,
  PutReview,
} = require("../services/review.service");


router.get(
  "/:productID/reviews",
  asyncHandler(async (req, res) => {
    const productId = req.params.productID;

    const reviews = await getReviews({ productId });
    if (!reviews) {
      return res.json({ reviews });
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

    if (text.length < 1) {
      return res.status(400).json({ error: "Отзыв не может быть пустым." });
    }

    const reviews = await addReview({ productId, userId, text, rating });

    if (reviews === null) {
      return res.status(400).json({ error: "Отзыв уже оставлен." });
    }

    res.status(201).json(reviews);
  })
);


router.put(
  "/:productId/reviews",
  auth,
  asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const userId = req.user.userId;
    const { text, rating } = req.body;

    if (!rating) {
      return res.status(400).json({ error: "Необходимо обязательно поставить оценку." });
    }

    if (text.length < 1) {
      return res.status(400).json({ error: "Отзыв не может быть пустым." });
    }

    let updateData = { text, rating };

    const newReview = await PutReview(productId, userId, updateData);

    if (newReview === null) {
      return res.status(404).json({ error: "отзыв не найден." });
    }

    res.json({ newReview });
  })
);


module.exports = router;