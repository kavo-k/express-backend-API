const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");


const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const {
  getItems,
  addProduct,
  removeCartItem,
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
    const item = await addProduct({ productId, userId });

    if (!item) {
      return res.status(404).json({ error: "товар не найден" });
    }

    res.json(item);
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
    const item = await decreaseCartItem({ productId, userId })

    if (!item) {
      return res.status(404).json({ error: "товар не найден" });
    }

    res.json(item);
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
    const item = await removeCartItem({ productId, userId })

    if (!item) {
      return res.status(404).json({ error: "товар не найден" });
    }

    res.json(item);
  })
)

module.exports = router;