const Product = require("../models/Product");


const getProducts = async ({ search, page, limit, sort, type }) => {

  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (type) {
    filter.type = { $regex: type, $options: "i" };
  }


  const products = await Product.find(filter)
    .populate("owner", "userName name age")
    .sort({ createdAt: sort })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Product.countDocuments(filter);

  return { products, total };
};


const getProductById = async (id) => {
  return Product.findById(id).populate("owner", "userName name age");
};


const getOwnerProducts = async ({ search, page, limit, sort, userId }) => {
  const filter = search
    ? { owner: userId, name: { $regex: search, $options: "i" } }
    : { owner: userId };

  const products = await Product.find(filter)
    .sort({ createdAt: sort })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Product.countDocuments(filter);

  return { products, total };
}


const createProduct = async ({ name, type, valid, price, owner, description, images }) => {
  return Product.create({ name, type, valid, price, owner, description, images });
};


const updateProduct = async (id, data) => {
  return Product.findByIdAndUpdate(id, data, { new: true });
};


const deleteProduct = async (id) => {
  return Product.findByIdAndDelete(id);
}


module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getOwnerProducts,
};
