const bcrypt = require("bcrypt");
const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../services/upload.service");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  getUserByToken,
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
    const { userName, age, email, password } = req.body;


    if (!email) {
      res.status(400).json({ error: "email обязателен" });
      return;
    } if (typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({ error: "email должен быть строкой и содержать @" });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();


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

    const user = await createUser({
      userName,
      age,
      email: normalizedEmail,
      password,
    });

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

    const token = crypto.randomBytes(32).toString("hex");

    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    const resetPasswordExpires = new Date(new Date().getTime() + 15 * 60 * 1000);

    const updated = await updateUser(user._id, { resetPasswordToken, resetPasswordExpires });

    res.json({ message: `письмо для сброса пароля отправлено`, token });

  })
);


router.put(
  "/reset-password",
  asyncHandler(async (req, res) => {

    const { token, password } = req.body;

    if (!token) {
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

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await getUserByToken(tokenHash);

    if (!user) {
      return res.status(400).json({ error: "ошибка смены пароля" });
    }

    const currentTime = new Date();

    if (currentTime > user.resetPasswordExpires) {
      return res.status(400).json({ error: "время для смены пороля прошло" });
    }

    if (await bcrypt.compare(password, user.passwordHash)) {
      return res.status(400).json({ error: "необходимо ввести новый пароль" });
    }

    await updateUser(user._id, { passwordHash, resetPasswordToken: null, resetPasswordExpires: null });

    res.json({ message: `пароль успешно изменён! не забывайте его` });

  })
);


router.put(
  "/me",
  auth,
  asyncHandler(async (req, res) => {
    const { userName, age } = req.body;
    const updateData = {};
    if (userName !== undefined) updateData.userName = userName;
    if (age !== undefined) updateData.age = age;
    if (Object.keys(updateData).length === 0) return res.status(400).json({ error: "Нет данных для обновления" });

    const updated = await updateUser(req.user.userId, updateData);
    if (!updated) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }
    res.json(updated);
  })
);


router.put(
  "/me/avatar",
  auth,
  upload.single("avatar"),
  asyncHandler(async (req, res) => {
    const file = req.file;
    const user = await getUserById(req.user.userId);

    if (!file) {
      return res.status(400).json({ error: "avatar обязателен" });
    }

    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

    const result = await uploadToCloudinary(file.buffer, "avatars");

    const avatarUrl = result.secure_url;
    const avatarPublicId = result.public_id;

    const updated = await updateUser(req.user.userId, { avatarUrl, avatarPublicId });

    if (!updated) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }

    res.json(updated);
  })
);


router.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({ error: err.message || "Внутренняя ошибка сервера" });
});

module.exports = router;

