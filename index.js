const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { Console } = require("console");

const app = express();


app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/backend_practice").then(() => console.log("MongoDB подключена")).catch(err => console.log("Ошибка MongoDB:", err.message));


const userSchema = new mongoose.Schema( {
  name: { type:String, required: true},
  age: { type: Number }
},
{ timestamps: true }
);

const User = mongoose.model("User", userSchema);



app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});



app.get("/users/:id", async (req, res) => {
const user = await User.findById(req.params.id);

if (!user) {
  res.status(404).json({ error: "пользователь не найден" });
  return;
}

  res.json(user);
});



app.post("/users", async (req, res) => {
  const { name, age } = req.body;

  if(!name) {
    res.status(400).json({error:"name обязателен" });
    return;
  }

  if(typeof name !== "string") {
    res.status(400).json({ error: "name должен быть стркой "});
    return;
  }

  if (age !== undefined && typeof age !== "number") {
    res.status(400).json({ error: "age должен быть числом" });
    return;
  }

  const newUser = await User.create({ name, age });

  res.status(201).json(newUser);
});



app.put("/users/:id", async (req, res) => {
  const { name, age } = req.body;

  const updated = await User.findByIdAndUpdate(
    req.params.id,
    {name, age },
    { new: true }
  );

  console.log('${req.params.type}');

  if (!updated) {
     res.status(404).json({error: "Пользователь не найден" });
     return;
   }

  res.json(updated);
})



app.delete("/users/:id", async (req, res) => {

  console.log("DELETE пришёл:", req.params.id);

  const deleted = await User.findByIdAndDelete(req.params.id);
  const { name } = req.body;

  if(!deleted) {
    res.status(404).json({error: "Пользователь не найден" });
    return;
  }

  res.json(deletedUser);
  Console.log(`error: "Клиент ${ name } удалён`);
})



app.listen(3000, () => {
    console.log("Сервер запущен на порту 3000");
})