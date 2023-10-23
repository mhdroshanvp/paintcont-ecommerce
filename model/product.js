const mongoose = require("mongoose");
// ========================================================
const productSchema = mongoose.Schema({
  productPhoto: {
    type: [String],
    require: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },  
  paintQuantity: {
    type: Number,
    required: true,
  },
  paintCategory:{
    type:String
  },
  paintColor: {
    type: String,
    required: true,
  },
  productDescription: {
    type: String,
    required: true,
  },
  list: {
    type: Boolean,
    default: false,
  },

  stock: {
    type: Number,
    require: true,
  },

  packageInfo: {
    type: String,
    require: true,
  },

  country: {
    type: String,
    require: true,
  },

});
// ========================================================
module.exports = mongoose.model("Product", productSchema);
