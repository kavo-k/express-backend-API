const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema( {
  product: { type: String, required: true },
  user: { type: String, required: true },
  rating: { type: Number, required: true },
  text: { type: String, },
},
{ timestamps: true, versionKey: false}
);

module.exports = mongoose.model("Review", reviewSchema);