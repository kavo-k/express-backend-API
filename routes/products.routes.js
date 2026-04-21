const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const cloudinary = require("../config/cloudinary");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

const {
  getProducts,
  getProductById,
  getOwnerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../services/product.service");


router.get(
  "/",
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const sort = req.query.sort === "asc" ? 1 : -1;
    const search = req.query.search || "";
    const type = req.query.type || "";

    let { products, total } = await getProducts({ search, page, limit, sort, type });

    products = products.map((p) => {
      const productObject = p.toObject();

      let imageOptimizedUrl = null;

      if (p.imagePublicId) {
        imageOptimizedUrl = cloudinary.url(p.imagePublicId, {
          transformation: [
            { quality: "auto", fetch_format: "auto" },
            { width: 1200, height: 1200, crop: "fill", gravity: "auto" },
          ],
        });
      }

      if (p.images && p.images.length >= 1) {
        if (p.images[0].imagePublicId) {
          imageOptimizedUrl = cloudinary.url(p.images[0].imagePublicId,
            {
              transformation: [
                { quality: "auto", fetch_format: "auto" },
                { width: 1200, height: 1200, crop: "fill", gravity: "auto" },
              ],
            });
        }
      }

      return {
        ...productObject,
        imageOptimizedUrl,
      };
    });

    res.json({ page, limit, total, products });
  })
);


router.get(
  "/my",
  auth,
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const sort = req.query.sort === "asc" ? 1 : -1;
    const search = req.query.search || "";
    const userId = req.user.userId;


    let { products, total } = await getOwnerProducts({ search, page, limit, sort, userId });

    products = products.map((p) => {
      const productObject = p.toObject();

      let imageOptimizedUrl = null;

      if (p.imagePublicId) {
        imageOptimizedUrl = cloudinary.url(p.imagePublicId, {
          transformation: [
            { quality: "auto", fetch_format: "auto" },
            { width: 1200, height: 1200, crop: "fill", gravity: "auto" },
          ],
        });
      }

      if (p.images && p.images.length >= 1) {
        if (p.images[0].imagePublicId) {
          imageOptimizedUrl = cloudinary.url(p.images[0].imagePublicId,
            {
              transformation: [
                { quality: "auto", fetch_format: "auto" },
                { width: 1200, height: 1200, crop: "fill", gravity: "auto" },
              ],
            });
        }
      }

      return {
        ...productObject,
        imageOptimizedUrl,
      };
    });

    res.json({ page, limit, total, products });

  })
)



router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    let product = await getProductById(req.params.id);

    if (!product) {
      res.status(404).json({ error: "Продукт не найден" });
      return;
    }

    const productObject = product.toObject();

    console.log("after: ", productObject);

    let imageOptimizedUrl = null;

    if (product.imagePublicId) {
      imageOptimizedUrl = cloudinary.url(product.imagePublicId, {
        transformation: [
          { quality: "auto", fetch_format: "auto" },
          { width: 1200, height: 1200, crop: "fill", gravity: "auto" },
        ],
      });
    }

    if (product.images) {
      if (product.images.length >= 1) {
        imageOptimizedUrl = cloudinary.url(product.images[0].imagePublicId,
          {
            transformation: [
              { quality: "auto", fetch_format: "auto" },
              { width: 1200, height: 1200, crop: "fill", gravity: "auto" },
            ],
          });
      }
    }

    const result = {
      ...productObject,
      imageOptimizedUrl,
    };

    res.json(result);
  })
);



router.post(
  "/",
  auth,
  upload.array("images"),
  asyncHandler(async (req, res) => {
    const files = req.files;
    const images = [];

    if (files.length <= 0) return res.status(400).json({ error: "image обязателен" });

    for (const file of files) {
      const result = await uploadToCloudinary(file.buffer);

      const imageUrl = result.secure_url;
      const imagePublicId = result.public_id;

      images.push({ imageUrl, imagePublicId });
    }

    const { name, type, description } = req.body;
    const owner = req.user.userId;
    let { valid, price } = req.body;

    if (!name || !type || price === undefined || !price.trim()) {
      res.status(400).json({ error: "name, type, price обязательны" });
      return;
    }

    price = Number(price);

    if (Number.isNaN(price)) {
      return res.status(400).json({ error: "Price должен быть числом" });
    }

    if (owner !== undefined && !mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "owner должен иметь Id пользователя" });
    }

    if (valid !== undefined && isNaN(Date.parse(valid))) {
      res.status(400).json({ error: "valid должна быть датой" });
      return;
    }

    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({ error: "description должен быть строкой" });
    }

    if (description !== undefined && description.length > 1000) {
      return res.status(400).json({ error: "description слишком длинный (max 1000)" });
    }


    const product = await createProduct({ name, type, valid, price, owner, description, images });
    res.status(201).json(product);
  }));



router.put(
  "/:id",
  auth,
  upload.array("images"),
  asyncHandler(async (req, res) => {
    const { name, type, description } = req.body;
    let { valid, price } = req.body;

    if (!name || !type || price === undefined || !price.trim()) {
      res.status(400).json({ error: "name, type, price обязательны" });
      return;
    }

    price = Number(price);

    if (Number.isNaN(price)) {
      return res.status(400).json({ error: "Price должен быть числом" });
    }


    if (valid !== undefined && isNaN(Date.parse(valid))) {
      res.status(400).json({ error: "valid должна быть датой" });
      return;
    }

    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Продукт не найден" });
    }

    if (product.owner._id.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "я не знаю как вы сюда попали, но вы не можете редактировать этот продукт :)" });
    }

    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({ error: "description должен быть строкой" });
    }

    if (description !== undefined && description.length > 1000) {
      return res.status(400).json({ error: "description слишком длинный (max 1000)" });
    }


    console.log("Product to update:", product);

    if (valid) {
      const d = new Date(valid);
      d.setHours(0, 0, 0, 0);
      valid = d;
    }

    let updateData = { name, type, valid, price, description, };
    const files = req.files;

    if (files) {
      let images = [];
      for (const file of files) {
        const result = await uploadToCloudinary(file.buffer);

        const imageUrl = result.secure_url;
        const imagePublicId = result.public_id;

        images.push({ imageUrl, imagePublicId });
      }
      updateData.images = images;
    }

    const updated = await updateProduct(req.params.id, updateData);


    if (!updated) {
      return res.status(404).json({ error: "Продукт не найден" });
    }


    res.json(updated);

  })
);



router.delete(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {

    const product = await getProductById(req.params.id);

    console.log("Product to delete:", product);

    if (!product) {
      res.status(404).json({ error: "Продукт не найден" });
      return;
    }

    if (product.owner._id.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "я не знаю как вы сюда попали, но вы не можете удалить этот продукт :)" });
    }

    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
      console.log(product.imagePublicId);
    }

    const deleted = await deleteProduct(req.params.id);

    if (!deleted) {
      res.status(404).json({ error: "Продукт не найден, или уже удалён" });
      return;
    }

    res.json(deleted);
  })
);


module.exports = router;
