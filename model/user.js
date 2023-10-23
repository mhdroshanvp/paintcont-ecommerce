const mongoose = require("mongoose");
const { Decimal128 } = require("mongodb");
const { ObjectId } = require("mongoose");
const crypto = require("crypto"); 
const { Date } = require("mongoose");
// ========================================================
const existingCodes = [];

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
      type: Number,
      default: 0.0,
    },

    transactions: [{
      id:{
        type:ObjectId
      },
      date:{
        type: Date
      },
      amount:{
        type:Number
      },
      status:{
        type:Boolean
      }
    }],

  },

  MyRefferalCode: {
    type: String,
    default: generateUniqueShortCode,
    unique: true,
  },


  usedCoupons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coupons" }],
});


// =========================================================
function generateUniqueShortCode() {
  const codeLength = 6;
  let shortCode;

  do {
    shortCode = crypto.randomBytes(codeLength).toString("hex").toUpperCase().substring(0, codeLength);
  } while (existingCodes.includes(shortCode)); // Ensure it's unique

  existingCodes.push(shortCode); // Add the code to the existingCodes array

  return shortCode;
}
// ========================================================
module.exports = mongoose.model("User", userSchema);
