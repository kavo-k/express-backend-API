const User = require("../models/User");

const getUsers = async ({ search, page, limit, sort }) => {
  const filter = search
    ? { name: { $regex: search, $options: "i" } }
    : {};

  const users = await User.find(filter)
    .sort({ createdAt: sort })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await User.countDocuments(filter);

  return { users, total };
};


const getUserById = async (id) => {
    return User.findById(id);
};

const createUser = async ({ name, age }) => {
    return User.create({ name, age });
};

const updateUser = async (id, data) => {
    return User.findByIdAndUpdate(id, data, { new: true });
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
};