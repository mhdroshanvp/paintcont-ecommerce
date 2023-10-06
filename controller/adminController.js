const User = require("../model/user");
const bcrypt = require("bcrypt");
const Product = require("../model/product");
const dotenv = require("dotenv");
const order = require("../model/orders");
const banner = require("../model/banner");
const path = require("path");
let Jimp = require("jimp");
const { log } = require("console");
const Category = require('../model/category')
const Coupons = require('../model/coupons')

// Create an object to define various controller functions
const controllers = {
  getadmin: (req, res) => {
    if (req.session.admin) {
      res.redirect("/admin/dashboard");
    } else {
      res.redirect("/Admin/login");
    }
  },

  // Render the login page with an optional error message
  getLogin: (req, res) => {
    try {
      let errorMessage = req.session.errormsg;
      res.render("Admin/login", { errorMessage });
    } catch (error) {
      console.log(error.message);
    }
  },

  // Handle the login form submission
  postLogin: async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;

      const adminMail = process.env.adminEmail;
      const adminPass = process.env.adminPassword;

      if (adminMail === email) {
        if (password === adminPass) {
          req.session.admin = adminMail;
          console.log(req.session.admin);
          res.redirect("/admin/dashboard");
        } else {
          req.session.errormsg = "Incorrect password!";
          return res.redirect("/admin/login");
        }
      } else {
        req.session.errormsg = "Incorrect email!";
        return res.redirect("/admin/login");
      }
    } catch (error) {
      let errorMessage = "Admin not found!!!";
      console.log(error.message);
    }
  },

  // Render the admin dashboard if authenticated, otherwise redirect to the login page
  getdashboard: (req, res) => {
    try {
      if (req.session.admin) {
        res.render("Admin/index");
      } else {
        res.redirect("/admin/login");
      }
    } catch (error) {
      console.log(error.message);
      res.redirect('/Admin/internal-error')
    }
  },

  // Retrieve user data and render the user management page
  getusermanagement: async (req, res) => {
    try {
      const data = await User.find();
      res.render("Admin/usermanage", { data });
    } catch (error) {
      console.log(error.message);
      res.redirect('/Admin/internal-error')
    }
  },

  getUserSearchUser : async (req,res) =>{
    try {
      const searchElem = req.body.search
      
      const user = await User.find({  
        $or:[
          {name: {$regex: searchElem, $options: 'i'}},
          {email: {$regex: searchElem, $options: 'i'}}
        ]
      })

      res.render('Admin/usermanage',{data : user})
    } catch (error) {
      res.redirect('/Admin/internal-error')
    }
  },

  getPrdSearch : async (req,res) =>{
    // console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    try {
      const searchPrd = req.body.search
      // console.log(searchPrd);
      const products = await Product.find({
        $or:[
        {productName: {$regex: searchPrd, $options : 'i'}},
        {paintCategory: {$regex: searchPrd, $options : 'i'}}
        ]
      })

      res.render('Admin/productListing',{products})
    } catch (error) {
      res.redirect('/Admin/internal-error') 
    }
  },

// Block a user based on their ID
  blockUser: async (req, res) => {
    try {
      const id = req.body.id;
      let isUpdated;
      if (id) {
        isUpdated = await User.updateOne(
          { _id: id },
          { $set: { block: true } }
        );
      }
      if (isUpdated.modifiedCount) {
        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ error: "Not blocked" });
      }
    } catch (error) {
      console.log(error.message);
      res.redirect('/Admin/internal-error')
    }
  },

  // Unblock a user based on their ID
  unblock: async (req, res) => {
    try {
      const id = req.body.id;
      let isUpdated;
      if (id) {
        isUpdated = await User.updateOne(
          { _id: id },
          { $set: { block: false } }
        );
      }
      if (isUpdated.modifiedCount) {
        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ error: "Not blocked" });
      }
    } catch (error) {
      console.log(error.message);
      res.redirect('/Admin/internal-error')
    }
  },

  // Render the page to add a new product
  addProductGet: async (req, res) => {
    try {
      const categories = await Category.find(); 
      res.render("Admin/addproduct",{categories});
    } catch (error) {
      console.log(error.message);
      res.redirect('/Admin/internal-error')
    }
  },

  // Handle the submission of a new product
  addProductPost: async (req, res) => {
    try {
      const {
        productName,
        productPrice,
        paintCategory,
        paintColor,
        productQuantity,
        productDescription,
        stock,
      } = req.body;


      trimmedProductName = productName.trim()
      trimmedPaintColor = paintColor.trim()
      trimmedDescription = productDescription.trim()


      const productPhoto = req.files.map((file) => file.filename )

      console.log(productPhoto,'<=================photo');

      const newProduct = new Product({
        productPhoto,
        productName : trimmedProductName,
        productPrice,
        paintCategory,
        paintColor : trimmedPaintColor,
        paintQuantity: productQuantity,
        productDescription :trimmedDescription,
        stock,
      });

      await newProduct.save();

      res.redirect("/admin/products");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error adding the product.");
    }
  },

  // Retrieve a list of products and render the product listing page
  getProductListing: async (req, res) => {
    try {
      const products = await Product.find();
      console.log(products);
      res.render("Admin/productListing", { products });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Error in fetching product data");
      res.redirect('/Admin/internal-error')
    }
  },

  // Update a product's listing status (set to true)
  patchList: async (req, res) => {
    try {
      const id = req.body.id;
      console.log(id);
      let isUpdated;
      if (id) {
        isUpdated = await Product.updateOne(
          { _id: id },
          { $set: { list: true } }
        );
      }
      if (isUpdated.modifiedCount) {
        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ error: "Not blocked" });
      }
    } catch (error) {
      console.log(error.message);
      res.redirect('/Admin/internal-error')
    }
  },

  // Update a product's listing status (set to false)
  patchUnList: async (req, res) => {
    try {
      const id = req.body.id;
      let isUpdated;
      if (id) {
        isUpdated = await Product.updateOne(
          { _id: id },
          { $set: { list: false } }
        );
      }
      if (isUpdated.modifiedCount) {
        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ error: "Not blocked" });
      }
    } catch (error) {
      console.log(error.message);
      res.redirect('/Admin/internal-error')
    }
  },

  // Render the page to edit a product
  editProductGet: async (req, res) => {
    const productId = req.query.productId;
    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).send("Product not found");
      }
      
      // Fetch the list of categories to be used in the dropdown
      const categories = await Category.find();
  
      res.render("Admin/editproduct", { product, categories });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
      res.redirect('/Admin/internal-error')
    }
  },
  

  editProductPost: async (req, res) => {
    try {

      // Default to the uploaded file

      const productId = req.query.productId;

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).send("Product not found");
      }


      const {productName,productPrice,paintCategory,paintColor,productQuantity,productDescription,stock} = req.body;


      const trimmedProductName = productName.trim()
      const trimmedPaintColor = paintColor.trim()
      const trimmedProductDescription = productDescription.trim()


      const updatedProductData = {
      productName : trimmedProductName ,
      productPrice,
      paintCategory,
      paintColor : trimmedPaintColor,
      paintQuantity:productQuantity,
      productDescription : trimmedProductDescription,
      stock
      }

      if (req.files && req.files.length > 0) {
        updatedProductData.productPhoto = req.files.map((file) => file.filename);
      } else {
        updatedProductData.productPhoto = product.productPhoto;
      }

      const updatedProduct = await Product.findOneAndUpdate(
    { _id: productId },
    { $set: updatedProductData },
    { new: true }
  );

  
  res.redirect("/admin/products");

      }catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
      res.redirect('/Admin/internal-error')
    }
  },



  DltEdtImg: async (req, res) => {
    try {
      const DltEdtImgId = req.query.id;
      const imageIndex = parseInt(req.query.index);
  
      // Retrieve the product by ID
      const product = await Product.findById(DltEdtImgId);
  
      if (!product) {
        return res.status(404).send("Edit product not found");
      }
  
      // Check if the imageIndex is valid
      if (imageIndex >= 0 && imageIndex < product.productPhoto.length) {
        // Remove the image at the specified index
        product.productPhoto.splice(imageIndex, 1);
        
        // Save the updated product
        await product.save();
      } else {
        return res.status(400).send("Invalid image index");
      }
  
      res.redirect("/admin/products");
    } catch (error) {
      console.log(error);
      res.redirect('/Admin/internal-error');
    }
  },
  

  

  getOrders: async (req, res) => {
    try {
      const users = await User.find();
      const products = await Product.find();
  
      const orders = await order
        .find({})
        .sort({ orderDate: -1 })
        .populate([
          {
            path: "products.product",
            model: "Product", // Specify the name of the Product model
          },
          {
            path: "user",
            model: "User", // Specify the name of the User model
            select: "name",
          },
        ]);
  
      console.log(orders, "========================================================================");
  
      res.render("Admin/orderlisting", { orders, products });
    } catch (error) {
      console.log(error);
      res.redirect('/Admin/internal-error');
    }
  },
  




  // Render the page to manage banners
  getBannerManage: async (req, res) => {
    try {
      const Banner = await banner.find();
      // console.log(Banner);
      res.render("Admin/banner", { Banner: Banner });
    } catch (error) {
      console.log(error.message);
    }
  },

  adminBannersPost: async (req, res) => {
    try {
      const bannerImg = req.file ? req.file.filename : "";
      // console.log(req.file);
      const newBanner = new banner({
        bannerImage: bannerImg,
      });

      await newBanner.save();

      res.redirect('/admin/banners')

    } catch (error) {
      console.error("Error adding banner:")
      res.status(500).send("internal server error");
      res.redirect('/Admin/internal-error')
    }
  },  

  deletBanner: async (req, res) => {
    try {
      const bannerId = req.query.id;

      const deletedBanner = await banner.deleteOne({ _id: bannerId });

      if (!deletedBanner) {
        return res.status(404).send("Banner not found");
      }

      res.redirect("/admin/banners");
    } catch (error) {
      console.error("Error deleting banner:", error);
      res.status(500).send("Error deleting banner");
    }
  },

  cancelOrder: async (req, res) => {
    try {
      const orderId = req.query.orderId;

      // Update the order status to 'cancelled' in the database
      const updatedOrder = await order.findOneAndUpdate(
        { _id: orderId },
        { $set: { status: "cancelled" } }
      );

      if (updatedOrder) {
        res.status(200).json({ message: "Order cancelled successfully" });
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
      res.redirect('/Admin/internal-error')
    }o
  },

  updateStatus: async (req, res) => {
    const orderId=req.params.id;
    const { newValue } = req.body;

  try {
    // Find the order by ID and update the order status
    const updatedOrder = await order.findByIdAndUpdate(orderId, { status: newValue }, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Send a success response
    res.redirect('/admin/orders')
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
    res.redirect('/Admin/internal-error')
  }
},
  
  

  // =========================
  error: (Req, res) => {
    res.render("User/404page");
  },

  Internalerror : (req,res) =>{
    res.render('User/500pageInternalError')
  },
  

  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        res.status(500).send("Session destruction failed");
      } else {
        res.redirect("/admin/login");
      }
    });
  },
  getCateogory: async (req, res) => {
    try {
      const categories = await Category.find(); 
      res.render('Admin/category', { categories });
    } catch (error) {
      console.log(error);
      res.redirect('/Admin/internal-error');
    }
  },
  
  postCategory: async (req,res) =>{
    try {

      const {category} = req.body

      category = category.trim()


      console.log(category);

      await Category.create({category})


      res.redirect('/admin/category')

      
    } catch (error) {

      console.error(error);
      res.status(500).send('error adding the category')
      res.redirect('/Admin/internal-error')

    }
    
},


postCategory: async (req, res) => {
  try {
    let { category } = req.body;

    // Trim the category string to remove leading and trailing white spaces
    category = category.trim();

    console.log(category);

    const newCategory = await Category.create({ category });

    if (newCategory) {
      res.redirect('/admin/category');
    } else {
      throw new Error('Category creation failed.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding the category: ' + error.message);
    res.redirect('/Admin/internal-error');
  }
},

postUpdtCat: async (req, res) => {
  const categoryId = req.params.categoryId;
  const updCat = req.body.editCat;

  try {
    if (updCat !== undefined) {
      updCat = updCat.trim();
    } else {
      // Handle the case where editCat is undefined
      // You can choose to skip the trimming or handle it differently here
      console.log('cannot trim :(');
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { category: updCat },
      { new: true }
    );

    if (!updatedCategory) {
      return res.redirect('/admin/category');
    }

    return res.redirect('/admin/category');
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'An error occurred while updating the category' });
    res.redirect('/Admin/internal-error');
  }
},



DltCat: async (req, res) => {
  console.log('DltCat route reached');
  const categoryId = req.params.categoryId;
  console.log('Deleting category with ID:', categoryId);
  try {
    // Use the category ID to find and delete the category
    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      // Handle the case where the category with the given ID was not found
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Successfully deleted the category  
    return res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'An error occurred while deleting the category' });
    res.redirect('/Admin/internal-error')
  }
},


createCoupon: async (req, res) => {
  try {
    const coupon = {
      code: req.body.code.trim(),
      type: req.body.type.trim(),
      expiry: req.body.expiry.trim(),
      discount: req.body.discount.trim(),
      min: req.body.min.trim(),
    };

    const exist = await Coupons.findOne({ code: coupon.code });

    if (exist) {
      res.send("Coupon code already exists.");
      return res.redirect('/admin/coupon');
    } else {
      const newCoupon = await Coupons.create(coupon);
      return res.redirect('/admin/coupons');
    }
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: 'An error occurred while creating the coupon.' });
    return res.redirect('/Admin/internal-error');
  }
},




getAllCoupons : async (req, res) => {
  try {
    const coupons = await Coupons.find();
    res.render('admin/coupons', { coupons, users: false })
  } catch (error) {
    throw new Error(error)
    res.redirect('/Admin/internal-error')
  }
},



updateCoupons : async (req, res) => {
  const { id } = req.params;

  try {
    const updatecoupon = await Coupons.findByIdAndUpdate(id, req.body, { new: true });
    res.redirect('/admin/coupons')
    res.json(updatecoupon);
  } catch (error) {
    console.error(error.message);
    res.redirect('/Admin/internal-error')
  }
},



unListCoupons : async (req, res) => {
  const couponId = req.params.id;


  const coupon = await Coupons.findById(couponId);

 

  if (!coupon) {
    return res.status(404).send("coupon not found");
  }

  coupon.isDeleted = !coupon.isDeleted;

  await coupon.save();

  res.redirect("/admin/coupons");
}





}
// Export the controller object
module.exports = controllers;
