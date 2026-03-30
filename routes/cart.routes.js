const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");


const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const {
  getItems,
  addProduct,
  deleteProduct,
} = require("../services/cart.service");


router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(404).json({ error: "пользователь не найден" });
    }

    const items = await getItems({ userId });

    if (!items) {
      return res.json({ items: [] });
    }

    res.json({ items });
  })
);


router.post(
  "/items",
  auth,
  asyncHandler(async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "productId обязателен" });
    }

    const userId = req.user.userId;

    if (!userId) {
      return res.status(404).json({ error: "пользователь не найден" });
    }

    const item = await addProduct({ productId, userId })
    res.json(item);
  })
)


router.delete(
  "/items/:productId",
  auth,
  asyncHandler(async (req, res) => {
    const productId = req.params.productId;

    if (!productId) {
      return res.status(404).json({ error: "Товар не найден" });
    }

    const userId = req.user.userId;

    if (!userId) {
      return res.status(404).json({ error: "пользователь не найден" });
    }

    const item = await deleteProduct({ productId, userId })

    res.json(item);
  })
)

module.exports = router;