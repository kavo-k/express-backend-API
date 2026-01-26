const mongoose = require("mongoose");

const userSchema = new mongoose.Schema( {
  name: { type:String, required: true},
  age: { type: Number }
},
{ timestamps: true, versionKey: false}
);

module.exports = mongoose.model("User", userSchema);