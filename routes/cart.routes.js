const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");


const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const {
  getItems,
  addProduct,
  removeCartItem,
  removeCartAllItems,
  decreaseCartItem,
} = require("../services/cart.service");


router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const {cart, totalItems, totalPrice} = await getItems({ userId });

    if (!cart) {
      return res.json({ cart: [] });
    }

    res.json({ cart, totalItems, totalPrice });
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
    const items = await addProduct({ productId, userId });

    if (!items) {
      return res.status(404).json({ error: "товар не найден" });
    }

    res.json(items);
  })
)


router.patch(
  "/items/:productId/decrease",
  auth,
  asyncHandler(async (req, res) => {
    const productId = req.params.productId;

    if (!productId) {
      return res.status(400).json({ error: "Товар не найден" });
    }

    const userId = req.user.userId;
    const items = await decreaseCartItem({ productId, userId })

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
    const items = await removeCartItem({ productId, userId })

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
    const items = await removeCartAllItems({ userId })

    if (!items) {
      return res.status(404).json({ error: "Корзина не найдена." });
    }

    res.json(items);
  })
)

module.exports = router;