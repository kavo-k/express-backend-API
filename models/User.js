const express = require("express");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema( {
  name: { type:String, required: true},
  age: { type: Number },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true},
  passwordHash: { type: String, required: true, select: false},
  role: { type: String, enum: ["user", "admin"], default: "user"}
},
{ timestamps: true, versionKey: false}
);

module.exports = mongoose.model("User", userSchema);