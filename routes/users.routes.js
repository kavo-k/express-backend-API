const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../services/user.service");



router.get(
    "/",
    asyncHandler(async(req,res) => {

        const limit = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;
        const sort = req.query.sort === "asc" ? 1 : -1;
        const search = req.query.search || "";
        
        const { users, total } = await getUsers({ search, page, limit, sort });
      
        res.json({ page, limit, total, users,});
        console.log("page:", page, "limit:", limit, "total:", total, "search:", users.length);
    })
);



router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const user = await getUserById(req.params.id);

      if(!user) {
        res.status(404).json({error: "Пользователь не найден"});
        return;
      }

      res.json(user);
    })
);

router.get(
    "/:id/products",
    asyncHandler(async (req, res) => {
      const owner = req.params.id;

      const products = await Product.find({ owner }).sort({ createdAt: -1 });


      res.json(products);
    })
);



router.post(
  "/",
  asyncHandler(async(req,res) => {
  console.log("headers:", req.headers["content-type"]);
  console.log("body:", req.body);
  console.log("age:", req.body.age, "type:", typeof req.body.age);

  
    const { name, age } = req.body;

    if(!name) {
      res.status(400).json({error: "name обязателен"});
      return;
    }

    if(age !== undefined && typeof age !== "number") {
      res.status(400).json({error: "age должен быть числом"});
      return;
    }

    const user = await createUser({ name, age });
    res.status(201).json(user);
  })
)



router.put(
  "/:id",
  asyncHandler(async (req,res) => {
   const { name, age } = req.body;

   const updated = await updateUser(req.params.id, { name, age });

   if (!updated) {
    res.status(404).json({error: "Пользователь не найден"});
    return;
   }

   res.json(updated);

  })
);



router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await deleteUser(req.params.id);

    if(!deleted) {
      res.status(404).json({error: "Пользователь не найден, или уже удалён"});
      return;
    }
    res.json(deleted);
  })
);

module.exports = router;
