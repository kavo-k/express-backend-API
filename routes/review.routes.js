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
  deleteReview,
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
  "/:productId/review",
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
  "/:productId/review",
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


router.delete(
  "/:productId/review",
  auth,
  asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const userId = req.user.userId;

    const deleted = await deleteReview(productId, userId);

    if (deleted === null) {
      return res.status(404).json({ error: "отзыв не найден, или уже удалён" });
    }

    res.status(200).json({ error: "отзыв успешно удалён" });
  })
);


module.exports = router;