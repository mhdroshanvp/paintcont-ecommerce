const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  address: {
    city: String,
    state: String,
    areaAndstreet: String,
    pincode: Number,
  },
  products: [
    {
      product: mongoose.Schema.Types.ObjectId,
      qnty: Number,
      price: Number,
      color: String,
      total: Number,
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  totalAmount: Number,

  discount: String,

  paymentMethod: String,

  status: {
    type: String,
    default: "Pending",
  },
  orderDate: {
    type: Date,
  },
});

module.exports = mongoose.model("Orders", orderSchema);
