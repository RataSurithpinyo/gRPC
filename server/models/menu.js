const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const menuSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4(),
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  }
});

module.exports = mongoose.model("Menu", menuSchema);
