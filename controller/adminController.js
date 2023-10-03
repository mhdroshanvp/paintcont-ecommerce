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



      const productPhoto = req.files.map((file) => file.filename )

      console.log(productPhoto,'<=================photo');

      const newProduct = new Product({
        productPhoto,
        productName,
        productPrice,
        paintCategory,
        paintColor,
        paintQuantity: productQuantity,
        productDescription,
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

      const productPhoto = req.files.map((file) => file.filename )
      console.log(productPhoto);// Default to the uploaded file

      const productId = req.query.productId;

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).send("Product not found");
      }

      if (!req.file && !productPhoto) {
        const { productName,productPrice,productCategory,productColor,productQuantity,productDescription, stock,} = req.body;
      } else {
        const {productName,productPrice,productCategory,productColor,productQuantity,productDescription,stock,} = req.body;

        product.productPhoto = productPhoto; 
        product.productName = productName;
        product.productPrice = productPrice;
        product.paintCategory = productCategory;
        product.paintColor = productColor;
        product.paintQuantity = productQuantity;
        product.productDescription = productDescription;
        product.stock = stock;
      }

      await product.save();
      res.redirect("/admin/products");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  getOrders: async (req, res) => {
    try {
      const user = await User.find();
      let orders = await order.find().populate('products.product').populate('user')
      // console.log(orders);
      const product = await Product.find()
      console.log(orders, "<== we found orders!!!!!!!!!!!!!!!!!!!!");
      console.log(user, "<== we found users!!!!!!!!!!!!!!!!!!!!");
      
      orders = await Promise.all(
        orders.map(async (order) => {
          const user = await User.findById(order.user);
          if (user) {
            order.userAddress = user.address[0]; // Assuming you want to display the first address in the array
          }
          return order;
        })
      );

      res.render("Admin/orderlisting",{orders});
    } catch (error) {
      console.log(error);
      res.redirect('/Admin/internal-error')
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
      // res.redirect('/Admin/internal-error')
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
      console.log(category);

      await Category.create({category})


      res.redirect('/admin/category')

      
    } catch (error) {

      console.error(error);
      res.status(500).send('error adding the category')
      res.redirect('/Admin/internal-error')

    }
    
},
postUpdtCat: async (req, res) => {
  const categoryId = req.params.categoryId;
  const upd = req.body.editCat; // Assuming req.body.editCat contains the update data
console.log(upd,"                            " ,categoryId);
  try {
    // Use findByIdAndUpdate to update the category by its ID
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      req.body,
      { new: true } // To get the updated category as the result
    );

    if (!updatedCategory) {
      // Handle the case where the category with the given ID was not found
      return res.redirect('/admin/category');
    }

    // Successfully updated the category, redirect to a success page or route
    return res.redirect('/admin/category');
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'An error occurred while updating the category' });
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
  }
},


getCoupon : (req,res) =>{
  res.render('Admin/coupons')
},
postCoupon : (req,res) =>{
  try {
    
  } catch (error) {
    console.log(error);
  }
}



}
// Export the controller object
module.exports = controllers;
