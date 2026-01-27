const express = require("express");
const router = express.Router();

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../services/product.service");



router.get(
    "/",
    asyncHandler(async(req,res) => {
        const limit = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;
        const sort = req.query.sort === "asc" ? 1 : -1;
        const search = req.query.search || "";

        const { products, total } = await getProducts({ search, page, limit, sort });

        res.json({ page, limit, total, products});
    })
);



router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const product = await getProductById(req.params.id);

      if(!product) {
        res.status(404).json({error: "Продукт не найден"});
        return;
      }

      res.json(product);
    })
);



router.post(
  "/",
  asyncHandler(async(req,res) => {
  console.log("headers:", req.headers["content-type"]);
  console.log("body:", req.body);
  console.log("type:", req.body.type, "type:", typeof req.body.type);
  console.log("Date:", req.body.date, "type:", typeof req.body.date);
  console.log("Price:", req.body.price, "type:", typeof req.body.price);

  
    const { name, type, valid, price } = req.body;

    if(!name || !type || !price) {
      res.status(400).json({error: "name type, и price обязателны"});
      return;
    }

    if(price !== undefined && typeof price !== "number") {
      res.status(400).json({error: "Price должен быть числом"});
      return;
    }

    if(valid !== undefined && typeof valid !== "date") {
      res.status(400).json({error: "valid должна быть датой"});
      return;
    }

    const product = await createProduct({ name, type, valid, price });
    res.status(201).json(product);
  })
)



router.put(
  "/:id",
  asyncHandler(async (req,res) => {
   const { name, type, price } = req.body;
   let { valid } = req.body;

   if (valid) {
     const d = new Date(valid);
     d.setHours(0, 0, 0, 0);
     valid = d;
   }

   const updated = await updateProduct(req.params.id, { name, type, valid, price });

   if (!updated) {
    return res.status(404).json({error: "Продукт не найден"});
   }


   res.json(updated);

  })
);



router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await deleteProduct(req.params.id);

    if(!updated) {
      res.status(404).json({error: "Продукт не найден, или уже удалён"});
      return;
    }
    res.json(deleted);
  })
);

module.exports = router;
