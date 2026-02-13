require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(express.static("public"));


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Подключение к MongoDB успешно"))
  .catch((err) => console.error("Ошибка подключения к MongoDB:", err));

const usersRoutes = require("./routes/users.routes");
app.use("/users", usersRoutes);

const productRoutes = require("./routes/products.routes");
const User = require("./models/User");
app.use("/products", productRoutes)


app.use((err, req, res, next) => {
  console.log("ERROR:", err.message);

  res.status(500).json({
    error: "Внутренняя ошибка сервера"
  })
})


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
})