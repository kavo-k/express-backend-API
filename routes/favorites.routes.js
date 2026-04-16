const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");


const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const {
  getItems,
  addProduct,
  removeFavoritesItem,
  removeFavoritesAllItems,
} = require("../services/favorites.service");


router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const { favorites } = await getItems({ userId });

    if (!favorites) {
      return res.json({ favorites: [], });
    }

    res.json({ favorites });
  })
);


router.post(
  "/items",
  auth,
  asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.userId;

    if (!productId) {
      return res.status(400).json({ error: "productId обязателен" });
    }

    const items = await addProduct({ productId, userId });

    if (!items) {
      return res.status(404).json({ error: "товар не найден" });
    }

    res.json(items);
  })
)


router.delete(
  "/items/:productId",
  auth,
  asyncHandler(async (req, res) => {
    const productId = req.params.productId;

    if (!productId) {
      return res.status(400).json({ error: "Товар не найден" });
    }

    const userId = req.user.userId;
    const items = await removeFavoritesItem({ productId, userId })

    if (!items) {
      return res.status(404).json({ error: "товар не найден" });
    }

    res.json(items);
  })
)


router.delete(
  "/items",
  auth,
  asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const items = await removeFavoritesAllItems({ userId })

    if (!items) {
      return res.status(404).json({ error: "Корзина не найдена." });
    }

    res.json(items);
  })
)

module.exports = router;