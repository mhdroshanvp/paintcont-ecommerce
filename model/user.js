const mongoose = require("mongoose");
const { Decimal128 } = require('mongodb');
// ========================================================
const userSchema = mongoose.Schema({
  name: {
    type: String,
  },

  phone: {
    type: Number,
  },

  email: {
    type: String,

    unique: true,
    match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
  },

  password: {
    type: String,
    required: true,
  },

  joinedDate: {
    type: Date,
    required: true,
  },

  block: {
    type: Boolean,
    default: false,
  },

  address: [
    {
      pincode: { type: Number },
      state: { type: String },
      city: { type: String },
      areaAndstreet: { type: String },
    },
  ],

  cart: [
    {
      productQuantity: {
        type: Number,
        require: true,
      },

      productId: {
        type: mongoose.Types.ObjectId,
        require: true,
      },

      color: {
        type: String,
      },

      total: {
        type: Number,
        require: true,
      },

      unit: {
        type: Number,
      },
      
    },
  ],
  wallet: {

    balance: {
        type: Decimal128,
  default: 0.0
    },
    transactions: [String]

},
});
// ========================================================
module.exports = mongoose.model("User", userSchema);
