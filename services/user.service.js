const bcrypt = require("bcrypt");
const User = require("../models/User");

const getUsers = async ({ search, page, limit, sort }) => {
  const filter = search
    ? { name: { $regex: search, $options: "i" } }
    : {};

  const users = await User.find(filter)
    .select("-passwordHash")
    .sort({ createdAt: sort })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await User.countDocuments(filter);

  return { users, total };
};


const getUserById = async (id) => {
  return User.findById(id).select("-passwordHash");
};

const createUser = async ({ name, age, email, password }) => {

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error("Пользователь с таким email уже существует");
    err.status = 409;
    throw err;
  };

  const passwordHash = await bcrypt.hash(password, 10);
  

  return User.create({ name, age, email, passwordHash });
};

const safeUser = (user) => {
  const safeUser = user.toObject();
  delete safeUser.passwordHash;
  return safeUser;
}

const getUserByEmail = async (email) => {
  return User.findOne({ email }).select("+passwordHash");
};

const updateUser = async (id, data) => {
  return User.findByIdAndUpdate(id, data, { new: true }).select("-passwordHash");
};

const deleteUser = async (id) => {
  return User.findByIdAndDelete(id);
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  safeUser,
};