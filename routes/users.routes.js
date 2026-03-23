const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
} = require("../services/user.service");


router.get(
  "/",
  asyncHandler(async (req, res) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const sort = req.query.sort === "asc" ? 1 : -1;


    const { users, total } = await getUsers({ page, limit, search, sort });

    res.json({ page, limit, total, users, });
    console.log("page:", page, "limit:", limit, "total:", total, "search:", users.length);
  })
);



router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id);

    if (!user) {
      res.status(404).json({ error: "Пользователь не найден" });
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
  "/register",
  asyncHandler(async (req, res) => {

    console.log("headers:", req.headers["content-type"]);
    console.log(req.body);

    const { userName, age, email, password } = req.body;


    if (!email) {
      res.status(400).json({ error: "email обязателен" });
      return;
    } if (typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({ error: "email должен быть строкой и содержать @" });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await createUser({
      userName,
      age,
      email: normalizedEmail,
      password,
    });

    if (!userName) {
      res.status(400).json({ error: "userName обязателен" });
      return;
    }

    if (age !== undefined && typeof age !== "number") {
      res.status(400).json({ error: "age должен быть числом" });
      return;
    }

    if (!password) {
      res.status(400).json({ error: "password обязателен" });
      return;
    } if (typeof password !== "string" || password.length < 6) {
      res.status(400).json({ error: "password должен быть строкой не менее 6 символов" });
      return;
    }

    const safeUser = user.toObject();
    delete safeUser.passwordHash;

    res.status(201).json({ user: safeUser, message: `Пользователь ${userName} успешно зарегистрирован` });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;


    if (!email || !password) {
      res.status(400).json({ error: "email и password обязательны" });
      return;
    } if (typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({ error: "email должен содержать @" });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await getUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: "Неверный email или пароль 1" });
    }

    if (!password) {
      return res.status(401).json({ error: "Неверный email или пароль 2" });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ error: "Неверный email или пароль 3" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Неверный email или пароль 4" });
    }


    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = user.toObject();
    delete safeUser.passwordHash;

    res.json({ message: "Успешный вход", accessToken, user: safeUser });
  })
);


router.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {

    console.log(req.body);
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Введите email" });
      return;
    } if (typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({ error: "email должен содержать @" });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await getUserByEmail(normalizedEmail);
    
    if (!user) {
      return res.json({ message: `письмо для сброса пароля отправлено` });
    }
    
    const resetToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );


    const resetPasswordToken = await bcrypt.hash(resetToken, 10);
    const resetPasswordExpires = new Date(new Date().getTime() + 15 * 60 * 1000);

    const updated = await updateUser(user._id, { resetPasswordToken, resetPasswordExpires });

    console.log("updated: ", updated);

    res.json({ message: `письмо для сброса пароля отправлено`, resetToken });

  })
);


router.put(
  "/reset-password",
  asyncHandler(async (req, res) => {

    const { resetToken, password } = req.body;

    if (!resetToken) {
      res.status(400).json({ error: "необходим токен пользователя" });
      return;
    }

    if (!password) {
      res.status(400).json({ error: "password обязателен" });
      return;
    } if (typeof password !== "string" || password.length < 6) {
      res.status(400).json({ error: "password должен быть строкой не менее 6 символов" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);

    const payload = jwt.verify(resetToken, process.env.JWT_SECRET);

    const user = await getUserById(payload.userId);
    const currentTime = new Date();

    if (currentTime > user.resetPasswordExpires) {
      return res.status(400).json({ error: "время для смены пороля прошло" });
    }

    const tokenMatch = await bcrypt.compare(resetToken, user.resetPasswordToken);

    if (!tokenMatch) {
      return res.status(400).json({ error: "ошибка смены пароля" });
    }

    await updateUser(payload.userId, { passwordHash, resetPasswordToken: null, resetPasswordExpires: null });

    res.json({ message: `пароль успешно изменён! не забывайте его` });

  })
);


router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { userName, age } = req.body;

    const updated = await updateUser(req.params.id, { userName, age });

    if (!updated) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }

    res.json(updated);

  })
);



router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await deleteUser(req.params.id);

    if (!deleted) {
      res.status(404).json({ error: "Пользователь не найден, или уже удалён" });
      return;
    }
    res.json(deleted);
  })
);

router.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({ error: err.message || "Внутренняя ошибка сервера" });
});

module.exports = router;

