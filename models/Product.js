const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema( {
  name: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true},
  valid: { type: Date },

  owner: {type: mongoose.Schema.Types.ObjectId, ref:"User", required: true }
},
{ timestamps: true, versionKey: false}
);

module.exports = mongoose.model("Product", ProductSchema);