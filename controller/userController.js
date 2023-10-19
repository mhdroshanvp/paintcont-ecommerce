const User = require("../model/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const Product = require("../model/product");
const orders = require("../model/orders");
const { name } = require("ejs");
const product = require("../model/product");
const order = require("../model/orders");
const user = require("../model/user");
const mongoose = require("mongoose");
const banner = require("../model/banner");
const Razorpay = require('razorpay')
require("dotenv").config();
const Category = require('../model/category')
const Coupons = require('../model/coupons')
// -----------------------------------------------
//================================================

// Create a nodemailer transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "roshanvp2004@gmail.com",
    pass: "nyurzfypcfdjfevx",
  },
});

// -----------------------------------------------

// Function to generate OTP
const generateOTP = () => {
  return randomstring.generate({
    length: 6,
    charset: "numeric",
  });
};

// -----------------------------------------------

// Function to send OTP via email
const sendOTPByEmail = (email, otp) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: "roshanvp2004@gmail.com",
      to: email,
      subject: "OTP Verification",
      text: `Your OTP for registration: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        console.log("OTP sent via email:", info.response);
        resolve();
      }
    });
  });
};

// -----------------------------------------------

// Route for resending OTP
const resendOtp = async (req, res) => {
  try {
    const email = req.session.email;

    if (!email) {
      return res.redirect("/login");
    }

    if (req.session.otp) {
      delete req.session.otp;
    }

    const otp = generateOTP();

    req.session.otp = otp;

    await sendOTPByEmail(email, otp);

    res.redirect("/otp");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
    res.redirect('/internal-error')
  }
};

// -----------------------------------------------

// Route to display the OTP sending form
const getSendOTPmail = (req, res) => {
  if (req.session.otp) {
    res.render("user/sendOTPto");
  } else {
    res.redirect("/signup");
  }
};

// -----------------------------------------------

// Route to handle OTP sending
const postSendOTPmail = async (req, res) => {
  try {
    const email = req.session.email.trim(); // Trim white spaces from the email

    if (!email) {
      return res.redirect("/login");
    }

    const otp = generateOTP();
    req.session.otp = otp;

    await sendOTPByEmail(email, otp);
  } catch (error) {
    res.redirect('/internal-error');
  }
};


// -----------------------------------------------

// Route to display OTP verification form
const getOtp = (req, res) => {
  if (req.session.otp) {
    res.render("User/otp");
  } else {
    res.redirect("/signup");
  }
};

// Route to handle OTP verification
// Route to handle OTP verification
const postOtp = async(req, res) => {

  try {
    const enteredOtp = req.body.otp.trim(); // Trim white spaces from the entered OTP

    if (enteredOtp === req.session.otp) {


    let userData=req.session.signup


let refferal=userData.refferal




const amountToIncrement = 100;
let wallet=false

const refferedUser = await User.findOne({ MyRefferalCode: refferal });

if (refferedUser) {

  refferedUser.wallet.balance += parseInt(amountToIncrement);

  await refferedUser.save();


 wallet=true;

} else {
  console.log(`User with referral code ${refferal} not found.`);
}

let newUser;

if (wallet) {
  // If a wallet exists, set the new user's wallet balance to 50 Rs
   newUser = {
    name: userData.name,
    password: userData.hashedPassword,
    phone: userData.phone,
    email: userData.email,
    joinedDate: new Date(),
    wallet: {
      balance: 50, // Set the wallet balance to 50 Rs
      transactions: [], // You can initialize this as an empty array
    },
  };
} else {
  // If no wallet exists, create a new user without a wallet
  newUser = {
    name: userData.name,
    password: userData.hashedPassword,
    phone: userData.phone,
    email: userData.email,
    joinedDate: new Date(),
  };
}


// const user = new User(newUser);
// await user.save();

await User.create(newUser);


      res.redirect("/home");
    } else {
      // Handle incorrect OTP
      res.redirect("/signup"); // You might want to add an error message here
    }
  } catch (error) {
    console.log(error);
    res.redirect('/internal-error');
  }
};



// -----------------------------------------------

// Route to get email for OTP
const getMail4otp = (req, res) => {
  try {
    let errorMessage = req.session.mailOTPerror

    setTimeout(() => {
      delete req.session.mailOTPerror;
    }, 5000);
    
    
    res.render("User/email4otp",{errorMessage});
  } catch (error) {
    res.redirect('/internal-error')
  }
};
 

//================================================
// -----------------------------------------------

// Route to display the login form
const getLogin = (req, res) => {
  if (req.session.user) {
    res.redirect("/home");
  } else {
    res.render("User/login", { errorMessage: "" });
  }
};

// -----------------------------------------------

// Route to post the login form
const postLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.render("user/login", { errorMessage: "type something" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.render("user/login", {
        errorMessage: "Invalid username or password",
      });
    }
    req.session.user = user.email;
    console.log(req.session.user);

    res.redirect("/home");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
    res.redirect('/internal-error')
  }
};
 

//================================================
// -----------------------------------------------

// Route to display the signup form
const getSignup = (req, res) => {
  let  errorMessage

//   if (req.session.errorMessage) {
//  errorMessage = req.session.errorMessage;
//     delete req.session.errorMessage;
//   }
 
  if (req.session.user) {
    res.redirect("/home");
  } else {
    res.render("User/signup", { errorMessage });
  }
};

// -----------------------------------------------

// Route to handle signup
const postSignup = async (req, res) => {
  // const userEmail = req.session.user
  

  // console.log(refferal,"lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll");
  // const usersRefferal = user.MyRefferalCode

  // console.log(usersRefferal,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>USERR>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

  try {
    if (
      !req.body.name ||!req.body.phone ||!req.body.email ||!req.body.password) {
      const errorMessage = "Required fields are missing";
      return res.render("User/signup", { errorMessage });
    }

    if(req.body.phone < 0){

      const errorMessage = "Values must be greater than or equal to 0"
      return res.render("User/signup", {errorMessage})

    }

    let { name, phone, email, password,refferal } = req.body;

    name = name.trim()
    phone = phone.trim();
    email = email.trim();
    password = password.trim();

    if(!name||!phone||!email||!password) {
     errorMessage = "Required fields are missing";
      return res.render("User/signup", { errorMessage });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorMessage = "Invalid email format";
      return res.render("User/signup", { errorMessage });
    }

    
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const errorMessage =
      "Email is already registered. Please choose a different email.";
      return res.render("User/signup", { errorMessage });
    }
    
    
    const otp = generateOTP();

    req.session.email = email;
    req.session.otp = otp;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let user={
      name,
      phone,
      email,
      hashedPassword,
      refferal
    }
    
    req.session.signup=user
    
  
    
    

    await sendOTPByEmail(email, otp);

   
  
    return res.render("user/otp");
   
  } catch (error) {
    console.error(error);
    const errorMessage = "Internal Server Error";
    return res.render("User/signup", { errorMessage });
  }
};


//================================================
// -----------------------------------------------

// Route to display the home page
const getHome = async (req, res) => {
  if (req.session.user) {
    const Banner = await banner.find();

    res.render("User/index", { Banner: Banner });
  } else {
    res.redirect("/login");

  }
};

//================================================
// -----------------------------------------------

// Route to display the reset password form
const getResetPass = async (req, res) => {
  if (req.session.otp) {
    res.render("User/resetpassword");
  } else {
    res.redirect("/login");
  }
};

// -----------------------------------------------

const postResetPass = async (req, res) => {
  try {
    const password = req.body.new_password.trim(); // Trim white spaces from the new password
    const hashedPassword = bcrypt.hashSync(password, 5);
    const email = req.session.email;
    console.log(email);
    const user = await User.findOne({ email: email });
    console.log(user);

    const updt = await User.updateOne(
      { email: email },
      { $set: { password: hashedPassword } }
    );

    if (updt) {
      res.redirect("/home");
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect('/internal-error');
  }
};


//================================================
// -----------------------------------------------

// Route to display product list
const getProducts = async (req, res) => {
  if (req.session.user) {
    const categories = await Category.find();
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;
    const { priceFrom, priceTo } = req.query;


    let productQuery = { list: false };
    // Handle price filtering
    if (priceFrom && priceTo) {
      productQuery.productPrice = { $gte: priceFrom, $lte: priceTo };
    }

    const products = await Product.find(productQuery)
      .skip(skip)
      .limit(limit)
      .exec();

    const totalCount = await Product.countDocuments(productQuery);
    const totalPages = Math.ceil(totalCount / limit);

    res.render("User/product_list", {
      products,
      categories,
      currentPage: page,
      totalPages,
      priceFrom,
      priceTo,
      selectedCategory: req.query.category || "All",
    });
  } else {
    res.redirect("/login");
  }
};


//================================================
// -----------------------------------------------

const PostMail4otp = async (req, res) => {
  try {
    const email = req.body.email.trim(); // Trim white spaces from the provided email

    req.session.email = email;
    const alreadymail = await User.findOne({ email });

    if (!alreadymail) {
      console.log(error.message);
      req.session.mailOTPerror = "email not found"
      
      setTimeout(() => {
        delete req.session.mailOTPerror;
      }, 5000);      


      res.redirect('/mail4otp')
    } else if (alreadymail) {
      req.session.email = email;
      console.log(req.session.email, "<<<<<<<<<<<<<<<<<<<<<mail in the mail 4 OTP page");
      const otp = generateOTP();
      req.session.otp = otp;
      await sendOTPByEmail(email, otp);
      res.redirect("/forgetotp");
    }
  } catch (error) {
    console.log("error 123");
    res.redirect('/internal-error');
  }
};


//================================================
// -----------------------------------------------

// Route to display the forget OTP form
const getforgetotp = async (req, res) => {
  try {
    
    res.render("User/forgetotp");
  } catch (error) {
    res.redirect('/internal-error')
  }
  // console.log(req.session.email,'<===========');
};

// -----------------------------------------------

// Route to post forget OTP
const postforgetotp = async (req, res) => {
  try {
    const providedOTP = req.body.otp.trim(); // Trim white spaces from the provided OTP

    if (providedOTP === req.session.otp) {
      res.redirect("/reset-pass");
    } else {
      res.render('User/forgetOTP', { error: "Invalid OTP, please try again" });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect('/internal-error');
  }
};


//================================================
// -----------------------------------------------

// Route to get product details
const getProductdetails = async (req, res) => {
  try {
    if (!req.session.user) {
      res.redirect("/user/login");
    } else {
      const id = req.query.productId;
      const product = await Product.findOne({ _id: id });

      res.render("User/productDetails", { product });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect('/internal-error')
  }
};


//================================================
// -----------------------------------------------

// Route to get user profile
const getProfile = async (req, res) => {
  try {
    if (req.session.user) {
      const email = req.session.user;
      const user = await User.findOne({ email: email });
      console.log(user);
      res.render("User/profile", { user: user });

    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
    res.redirect('/internal-error')
  }
};


//================================================
// -----------------------------------------------

// Route to edit user profile
const getProfileEdit = async (req, res) => {
  try {
    if (req.session.user) {
      const email = req.session.user;
      const user = await User.findOne({ email: email });
      res.render("User/edit_profile", { user: user });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
    res.redirect('/internal-error')
  }
};


// -----------------------------------------------

// Route to update user profile
const postProfileEdit = async (req, res) => {
  try {
    const currentEmail = req.session.user; // Rename the variable
    const user = await User.findOne({ email: currentEmail });

    // Validate and trim white spaces from user inputs
    const name = req.body.name ? req.body.name.trim() : '';
    // const newEmail = req.body.email ? req.body.email.trim() : ''; // Rename the variable
    const phone = req.body.phone ? req.body.phone.trim() : '';

    user.name = name;
    // user.email = newEmail; // Use the renamed variable here
    user.phone = phone;

    await user.save();

    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
    res.redirect('/internal-error');
  }
};





//================================================
// -----------------------------------------------

// Route to edit user address
const getAddressEdit = async (req, res) => {
  const index = req.query.index;

  if (req.session.user) {
    const email = req.session.user;
    const user = await User.findOne({ email: email });
    const userAddress = user.address[index];
    console.log(userAddress);
    res.render("User/edit_address", { user: user, userAddress });
  } else {
    res.redirect("/login");
  }
};

// -----------------------------------------------

// Route to update user address
const postAddressEdit = async (req, res) => {
  try {
    const email = req.session.user;
    console.log("here", req.body.addressId, email);



console.log(req.body);



    const data = {
      pincode: req.body.pincode ? req.body.pincode.trim() : '',
      state: req.body.State ? req.body.State.trim() : '',
      city: req.body.city ? req.body.city.trim() : '',
      areaAndstreet: req.body.areaAndstreet ? req.body.areaAndstreet.trim() : '',
    };


    await User.updateOne(
      {
        email: email,
        "address._id": req.body.addressId,
      },
      {
        $set: {
          "address.$.pincode": data.pincode,
          "address.$.state": data.state,
          "address.$.city": data.city,
          "address.$.areaAndstreet": data.areaAndstreet,
        },
      }
    );

    res.redirect("/profile");
  } catch (error) {
    console.log(error);
    // res.redirect('/internal-error');
  }
};



//================================================
// -----------------------------------------------

// Route to get add address form
const getAddAddress = async (req, res) => {
  if (req.session.user) {




    res.render("User/add_address");
  } else {
    res.redirect("/login");
  }
};

// -----------------------------------------------

// Route to post add address
const postAddAddress = async (req, res) => {
  try {
    console.log(
      "Reached here!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    );
    if (!req.body.pincode ||!req.body.state ||!req.body.areaAndstreet ||!req.body.city) {
      return res.render("User/add_address",{error : "Required fields are missing" });
    }

    let { pincode, state, areaAndstreet, city } = req.body;

    const trimPincode = pincode.trim()
    const trimState = state.trim()
    const trimArea = areaAndstreet.trim()
    const trimCity = city.trim()

    const address = {
      pincode : trimPincode,
      state : trimState,
      areaAndstreet : trimArea,
      city : trimCity,
    };
    console.log(address);
    const email = req.session.user;
    const isUpdated = await User.updateOne({ email }, { $push: { address } });
    console.log(isUpdated);
    if (isUpdated.modifiedCount) {
      return res.redirect("/profile");
    } else {
      return res.status(500).send("Error creating Address");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
    res.redirect('/internal-error')
  }
};


//================================================
// -----------------------------------------------

//delete the address in the profile
const deleteAddress = async (req, res) => {
  try {
    const email = req.session.user;
    const addressId = req.query.addressId;
    await User.updateOne({ email }, { $pull: { address: { _id: addressId } } });

    res.status(200).send("Address deleted successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
    res.redirect('/internal-error')
  }
};


//================================================
// -----------------------------------------------

// Route to get user orders
const getOrders = async (req, res) => {
  if (req.session.user) {
    const email = req.session.user;

    const user = await User.findOne({ email: email });

    const userId = user._id;

    let orderData = await order.find({ user: userId });

    orderData = await order.aggregate([
      {
        $match: { user: userId },
      },
      {
        $sort: { orderDate: -1 },
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },  
      },
    ]);

    // console.log(user, '<===== user inside the user!!!!!!!!!');
    console.log(orderData, "<===== user inside the order!!!!!!!");
    res.render("User/orders", { user, orderData });
  } else {
    res.redirect("/login");
  }
};


//================================================
// -----------------------------------------------

// Route to place an order
const placeOrder = async (req, res) => {
  try {
    const userId = req.session.user;
    const cart = req.session.cart;

    const totalOrderPrice = calculateTotalPrice(cart);

    const order = {
      products: cart,
      totalPrice: totalOrderPrice,
    };

    const user = await User.findOne({ _id: userId });
    user.orders.push(order);

    req.session.cart = [];

    await user.save();

    res.redirect("/orders");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
    res.redirect('/internal-error')
  }
};


//================================================
// -----------------------------------------------

// Route to display the add to cart
const getAddtoCart = (req, res) => {
  if (req.session.user) {
    const email = req.session.user;
    const user = User.findOne({ email });
    const userId = user._id;
  } else {
    res.redirect("/login");
  }
};


//================================================
// -----------------------------------------------

// Route to display the cart
const getCart = async (req, res) => {
  if (req.session.user) {
    const email = req.session.user;
    const user = await User.findOne({ email: email })
      .populate({
        path: "cart.productId",
        model: "Product",
      })
      .exec();

      // console.log(user,"UUUUUUUUSSSSSSSSSSSEEEEEEEEEEEEEEEERRRRRRRRRRRRRRR");

      // console.log(user.ca);
      // const category = await Category.find()
      // console.log(category,"<<<<<<<<<<<<<<<<<<<==========================================="); 
    console.log(user.cart,"hehehehhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");

    res.render("User/cart", { user });
  } else {
    res.redirect("/login");
  }
};

// -----------------------------------------------

// Route to post cart
const postCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const quantity = 1;
    const userId = req.session.user;
    const user = await User.findOne({ email: userId });

    const product = await Product.findById(productId);
    const prize = product.productPrice;
    const productPhoto = product.productPhoto;
    if (user) {
      const existingCartItem = user.cart.find(
        (item) => item.productId.toString() === productId
      );

      if (existingCartItem) {
        
        if(existingCartItem.productQuantity < product.stock){
        existingCartItem.productQuantity += quantity;

        existingCartItem.total =
          existingCartItem.productQuantity * existingCartItem.unit;
        }
      } else {
        user.cart.push({
          productPhoto: productPhoto,
          productId: productId,
          productQuantity: quantity,
          total: prize,
          unit: prize,
        });
      }
      await user.save();
      res.status(200).json({ message: "Product added to cart successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({
      message: "An error occurred while adding the product to the cart",
      error: error.message,
    });
    res.redirect('/internal-error')
  }
};


//================================================
// -----------------------------------------------

// Route to display the checkout
const getCheckout = async (req, res) => {
  try {
    const email = req.session.user;
    const user = await User.findOne({ email: email }).populate({
      path: "cart.productId",
      model: "Product",
    }).exec();

    const coupon = await Coupons.find({isDeleted:false})
    console.log(coupon);

    


    if (user  && user.cart.length > 0 ) {
        
      res.render("User/checkout", { user , coupon });

    } else {

      res.redirect("/login");

    }
  } catch (error) {

    console.error(error);

    res.status(500).send("Internal Server Error");

    res.redirect('/internal-error')

  }
};


// -----------------------------------------------
const razorpay = new Razorpay({

  key_id : process.env.RAZORPAY_ID_KEY,
  key_secret : process.env.RAZORPAY_SECRET_KEY

})




//route for post checkout
const postCheckout = async (req, res) => {
  try {
    const add=req.body.userAddress

    if(!add){
      return res.json({ error: true, message: "Please add an address , go to the profile for add address" });
  }
  
      const {
        userAddress,
        coupon,
        paymentMethod,
        cartTotal,
        qnty,
        unit,
        totalAmount,
        product,
        prevTotal,
        wallet

      } = req.body;

      const Coupon = await Coupons.find({code:coupon})
      console.log(Coupon,"couponnnnnnnnnnnnnnn");

      let discount = Coupon.discount

    console.log(req.body,"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");


    const email = req.session.user;
    const user = await User.findOne({ email: email });
    const userData = user._id;
    console.log(product,"!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

    const address = await user.address.find((item) => item._id.toString() == userAddress);

    console.log(req.body);

    // console.log(address,'<=====ADDRESS');

    const addresses = {
      city: address.city,
      state: address.state,
      areaAndstreet: address.areaAndStreet,
      pincode: address.pincode,
    };

    const productId = req.body.productId;
    console.log(req.body);
    const productdata = await Product.findById(product);
    console.log(productdata);
    let products = [];

    if (paymentMethod === "cash") {

      if (Array.isArray(product)) {

        product.forEach((prd, index) => {

          products.push({
            product: new mongoose.Types.ObjectId(prd),
            qnty: parseInt(qnty[index]),
            price: parseInt(unit[index]),
          });

        });

      } else {
        
        products.push({
          product: new mongoose.Types.ObjectId(product),
          qnty: parseInt(qnty),
          price: parseInt(unit),
        });

      }

      const order = new orders({
        products,
        user: userData,
        totalAmount,
        status: "Pending",
        paymentMethod: paymentMethod,
        address: addresses,
        discount: discount,
        orderDate: new Date(),
      });

      await order.save();

      await User.findByIdAndUpdate(userData, {
        $pull: {
          cart: { productId: { $in: products.map((item) => item.product) } },
        },
      });

      if (productdata && productdata.stock >= qnty) {
        productdata.stock -= qnty;
        await productdata.save();
      }

      res.json({ success: true, message: "Order placed successfully!" });





    }else if(paymentMethod === 'online'){
      console.log(req.body,"''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''")
      // console.log('<==================================================<<<<<<<<<<<<<<<</<<<<<<<<<<<<<<<<<<<<<<<<==============================');
     

      let amount = totalAmount

      // console.log(prevTotal,"'<==================================================<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<=============================='");

      if(totalAmount > 0){

        console.log();

        let walletused;

          

        if(wallet){

          console.log('joooooo');

          const userId = userData
          let userWallet = parseInt(user.wallet.balance)


// console.log(userWallet,"---------------------------------------------------------");
          if(userWallet >= totalAmount){
            

            userWallet = userWallet - totalAmount



            console.log(userWallet)
            
      if (Array.isArray(product)) {

        product.forEach((prd, index) => {

          products.push({
            product: new mongoose.Types.ObjectId(prd),
            qnty: parseInt(qnty[index]),
            price: parseInt(unit[index]),
          });

        });

      } else {
        
        products.push({
          product: new mongoose.Types.ObjectId(product),
          qnty: parseInt(qnty),
          price: parseInt(unit),
        });

      }


      const order = new orders({
        products,
        user: userData,
        totalAmount,
        status: "Pending",
        paymentMethod: paymentMethod,
        address: addresses,
        discount: discount,
        orderDate: new Date(),
      });

      await order.save();
      
     
      
      await User.findByIdAndUpdate(userData, {
        $pull: {
          cart: { productId: { $in: products.map((item) => item.product) } },
        },
      });

      if (productdata && productdata.stock >= qnty) {
        productdata.stock -= qnty;
        await productdata.save();
      }
          // decrease the stock
          


      
          // is there any coupon its code saved in used coupons


          if(Coupon){

            let couponId = Coupon._id
            if(couponId!==null){
              const userdata = await User.findOneAndUpdate(
                { _id: userId },
                { $push: { usedCoupons: couponId } },
                { new: true }
              );

            }
           

          }


          const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { $set: { 'wallet.balance': userWallet } },
            { new: true }
          );


          console.log(updatedUser,"ppppppppppppppppppppppppppppppppppppppppppppppppp")

            // req.session.ordered = true;
      return res.json({ walletSuccess: true });



        }else if(totalAmount > userWallet) {

          amount = totalAmount - userWallet
          console.log('amount',amount);
          walletused = true;

        }          
      }
      
      
      req.session.orderamount = amount;
      req.session.usedwallet=walletused;

   
        

      

      const randomOrderID = Math.floor(Math.random() * 1000000).toString();
        const options = {
          amount: amount * 100,
          currency: "INR",
          receipt: randomOrderID,
        };



            
        razorpay.orders.create(options, (err) => {
              if (!err) {
                res.status(200).send({
                  razorSuccess: true,
                  msg: "order created",
                  amount: amount * 100,
                  key_id: "rzp_test_AnUy4SFu7121nG",
                  name: user.name,
                  contact: user.phone,
                  email: user.email,
                });

              } else {
                console.error("Razorpay Error:", err);
                res.status(400).send({ razorSuccess: false, msg: "Error creating order with Razorpay" });
              }
            });




          }

        }else{

                // Handle other payment options or scenarios
      res.status(404).send("Invalid payment option");

        }


  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Order failed. Please try again." });
    res.redirect('/internal-error')
  }
};


const verifyPayment = async (req,res) =>{


  

  const email = req.session.user
    
    const user = await User.findOne({email:email})
    
    const userId = user._id
  
    try {


    if(req.session.usedwallet){
      const wallet =req.session.usedwallet

      if(wallet){
        const updatedUser = await User.findOneAndUpdate(
          { _id: userId },
          { $set: { 'wallet.balance': 0} },
          { new: true }
        );


        delete req.session.usedwallet
      }
      
    }




  
    const {
      userAddress,
      coupon,
      paymentMethod,
      cartTotal,
      qnty,
      unit,
      totalAmount,
      product,
    } = req.body;

    let Coupon  = await Coupons.findOne({code:coupon})
    let discount = Coupon.discount

    // console.log(req.body);

    const email = req.session.user;
    const user = await User.findOne({ email: email });
    const userData = user._id;
    console.log(product);

    const address = await user.address.find(
      (item) => item._id.toString() == userAddress
    );

    console.log(req.body);

    // console.log(address,'<=====ADDRESS');

    const addresses = {
      city: address.city,
      state: address.state,
      areaAndstreet: address.areaAndStreet,
      pincode: address.pincode,
    };

    const productId = req.body.productId;
    console.log(req.body);
    const productdata = await Product.findById(product);
    console.log(productdata);
    let products = [];


      if (Array.isArray(product)) {

        product.forEach((prd, index) => {

          products.push({
            product: new mongoose.Types.ObjectId(prd),
            qnty: parseInt(qnty[index]),
            price: parseInt(unit[index]),
          });

        });

      } else {
        
        products.push({
          product: new mongoose.Types.ObjectId(product),
          qnty: parseInt(qnty),
          price: parseInt(unit),
        });

      }

      const order = new orders({
        products,
        user: userData,
        totalAmount,
        status: "Pending",
        paymentMethod: paymentMethod,
        address: addresses,
        discount: discount,
        orderDate: new Date(),
      });

      await order.save();

      await User.findByIdAndUpdate(userData, {
        $pull: {
          cart: { productId: { $in: products.map((item) => item.product) } },
        },
      });

      if (productdata && productdata.stock >= qnty) {
        productdata.stock -= qnty;
        await productdata.save();
      }

      res.json({ success: true, message: "Order placed successfully!" });

}catch (error) {
    res.redirect('/internal-error')
}
}


//================================================
// -----------------------------------------------

// Route to display the order succuss
const getOrderSuccess = (req, res) => {
  if (req.session.user) {
    res.render("User/orderSuccess");
  } else {
    res.redirect("/login");
  }
};


//================================================
// -----------------------------------------------

// Route to display remove cart
const getRemoveCart = async (req, res) => {
  try {
    const email = req.session.user;
    const productId = req.params.id;

    console.log("Email from session:", productId);

    const user = await User.findOne({ email: req.session.user });

    console.log("User found:", user); // Log the user object

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );

    await user.save();

    return res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({ message: "Internal server error" });
    res.redirect('/internal-error')
  }
};


//================================================
// -----------------------------------------------

// Route to logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send("Session destruction failed");
    } else {
      res.redirect("/login");
    }
  });
};


//================================================
// -----------------------------------------------

// Route to post update qnty
const postUpdtqnty = async (req, res) => {
  try {
    console.log("inside route");
    const productId = req.params.id;
    const email = req.session.user;
    const actions = req.params.actions;

    console.log("Product ID:", productId);
    console.log("Actions:", actions);

    const product = await Product.findById(productId);
    const user = await User.findOne({ email: email });
    const unitPrice = product.productPrice;
    const stock = product.stock;
    console.log(stock, "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    const cartItems = user.cart.find(
      (item) => item.productId.toString() === productId
    );
    
      if (actions === "increase") {
        if (cartItems.productQuantity < stock) {
        console.log("Increasing quantity");
        cartItems.productQuantity++;
      }
      } else if (actions === "decrease" && cartItems.productQuantity > 1) {
        console.log("Decreasing quantity");
        cartItems.productQuantity--;
      }
    

    cartItems.total = parseInt(cartItems.productQuantity * unitPrice);
    console.log("Updated:", cartItems);
    await user.save();

    const qnty = cartItems.productQuantity;
    const total = cartItems.total;
    res.status(200).json({ success: true, total, qnty });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
    res.redirect('/internal-error')
  }
};


//================================================
// -----------------------------------------------

// Route to display wishlisy
const getWishList = (req, res) => {
  if (req.session.user) {
    res.render("User/wishlist");
  } else {
    res.redirect("/login");
  }
};


//================================================
// -----------------------------------------------

const submitProductRating = async (req, res) => {
  const { productId, rating } = req.body;
  const userId = req.session.user;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Invalid rating value" });
  }

  try {
    const existingRating = await Product.findOne({
      _id: productId,
      "ratings.user": userId,
    });

    if (existingRating) {
      return res
        .status(400)
        .json({ message: "You have already rated this product" });
    }

    await Product.findByIdAndUpdate(
      productId,
      {
        $push: {
          ratings: { user: userId, rating: rating },
        },
      },
      { new: true }
    );

    res.status(200).json({ message: "Rating submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
    res.redirect('/internal-error')
  }
};

////////////////////////////////////////




const applyCoupon = async (req, res) => {
  const couponCode = req.params.cp.trim();
  const prevTotal = req.params.amt;
  const productId=req.params.prdId
  console.log(productId);
  // const userCategory = req.body.userCategory; // Assuming you have a way to get the user's category

  // console.log(userCategory);

  try {
    // Check if the coupon code exists in the database
    const email = req.session.user;
    const user = await User.findOne({ email });
    const coupon = await Coupons.findOne({ code: couponCode });
    const product=await Product.findOne({_id:productId})


    console.log(product);

    let cgt=[]



    let prdCategory = product.paintCategory
    console.log(product.paintCategory,"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
console.log(coupon.category,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    if (coupon && !coupon.isDeleted) {
      // Check if the coupon has expired
      const currentDate = new Date();
      if (currentDate > coupon.expiry) {
        res.json({ success: false, message: 'Coupon has expired' });
        return;
      }

      // Check if the coupon is applicable to the user's category
      if(coupon.category){

        if (coupon.category!==prdCategory) {
          res.json({ success: false, message: 'Coupon is not applicable to your category' });
          return;
        }
        if (coupon.min > prevTotal) {
          res.json({ success: false, message: 'Minimum purchase amount not met' });
          return;
        }
  
        if (user.usedCoupons.includes(coupon._id)) {
          res.json({ success: false, message: 'Coupon already used by this user' });
          return;
        }
  
        let discount = coupon.discount;
        let discountedPrice;
  
        if (coupon.type === 'OFF') {
          const discounted = prevTotal * (discount / 100);
          discountedPrice = Math.floor(prevTotal - discounted);
          discount = coupon.discount + '%';
        } else if (coupon.type === 'FLAT') {
          discountedPrice = prevTotal - discount;
        }


        res.json({ success: true, discountedPrice, message: 'Coupon added', discount });
      }

      // Check the minimum purchase amount
      if (coupon.min > prevTotal) {
        res.json({ success: false, message: 'Minimum purchase amount not met' });
        return;
      }

      if (user.usedCoupons.includes(coupon._id)) {
        res.json({ success: false, message: 'Coupon already used by this user' });
        return;
      }

      let discount = coupon.discount;
      let discountedPrice;              

      if (coupon.type === 'OFF') {
        const discounted = prevTotal * (discount / 100);
        discountedPrice = Math.floor(prevTotal - discounted);
        discount = coupon.discount + '%';
      } else if (coupon.type === 'FLAT') { 
        discountedPrice = prevTotal - discount;
      }

      // Respond with the discounted price
      res.json({ success: true, discountedPrice, message: 'Coupon added', discount });
    } else {
      // Coupon code is not found in the database
      res.json({ success: false, message: 'Invalid coupon code' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
    // res.redirect('/internal-error');
  }
};


//================================================



// ##############


//================================================
// -----------------------------------------------

const cancelOrder = async (req,res) =>{
  try {
    const orderID = req.params.id


    console.log(orderID);
    const email = req.session.user

    const user = await User.findOne({email:email});

    // console.log(user._id,'  qwertyuiopsdfghjkrfggggggggggggggggggggggggggggggggggggggggg');


    const userId = user._id

    // console.log(userId,"'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''");

    await order.findByIdAndUpdate(orderID, { status: 'cancelled' });
    
 
    const cancelledOrder = await order.findById(orderID);
    console.log(cancelledOrder,'===================================================');
    if (!cancelledOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const totalAmount = cancelledOrder.totalAmount;
    const payment=cancelledOrder.paymentMethod

    console.log("payment method", cancelledOrder.paymentMethod)

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
// ===================================
if(cancelledOrder.paymentMethod==="online"){
  const currentDate = new Date();
  const date =  currentDate.toDateString();

  console.log(date,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Current date<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");


  const updatedOrder = await order.findByIdAndUpdate(
    orderID,
    { status: 'cancelled' },
    { new: true }
  )

  await User.findByIdAndUpdate(userId, {
    $inc: { 'wallet.balance': totalAmount },

    $push: {
      'wallet.transactions': {
        id: updatedOrder._id,
        date: date, // Replace this with the actual date value
        amount: updatedOrder.totalAmount, // Replace this with the actual amount value
        status: true, // Replace this with the actual status value
      }
    }

    
  });
  }else if(cancelledOrder.paymentMethod==="COD"){

  const updatedOrder = await order.findByIdAndUpdate(
    orderID,
    { status: 'cancelled' },
    { new: true }
  )

}


const productsToUpdate = cancelledOrder.products;

// Update the stock for each product in the productsToUpdate array
for (const productData of productsToUpdate) {
  const productId = productData.product;
  const quantity = productData.qnty;

  // Find the product in the products collection
  const product = await Product.findById(productId);

  if (product) {
    // Increment the stock by the canceled quantity
    product.stock += quantity;
    await product.save();
  }
}



res.status(200).json({ success: true });
} catch (error) {
console.log(error.message);
const statusCode = error.status || 500;
res.status(statusCode).send(error.message);
res.redirect('/internal-error')
}
};

// ===============================


const getWallet = async (req,res) =>{
  try {
    const email = req.session.user
    const user = await User.findOne({email:email})
    res.render('User/wallet',{user})
  } catch (error) {
    res.redirect('/internal-error')
  }
}


//================================================
//================================================


const return_Request = async (req, res) => {

  // const userId = req.session.userId;
  const email = req.session.user
  const user = await User.findOne({email:email})
  const userId = user._id

  try {

    const orderId = req.params.id
    
    const Orders = await order.findByIdAndUpdate(orderId,{ $set: { status: 'Return requested' } },{ new: true });
    
    res.status(200).json({ success: true });

  } catch (e) {

    console.log(e.message)
    res.redirect('/internal-error')
  }
}
//================================================
//================================================

const invoice = async (req,res) => {
  try {
    // console.log("gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg");
    const orderId = req.params.OrderId
    const email = req.session.user
    const user = await User.findOne({email:email})
    const userId = user._id
    // console.log(orderId,"||||||||||||||||||||||||||||||||||||||||||||||||||||||||");




    // let order = await order.find({ user: userId });

   let order = await orders.aggregate([
      {
        $match: { user: userId },
      },
      {
        $sort: { orderDate: -1 },
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },  
      },
    ]);

    // console.log(order.)

    
      
    // console.log(order,"//////////////////////////////////////////////////////");
  res.render('User/invoice',{order , user})
  } catch (error) {
    console.log(error);
    res.redirect('/internal-error')
  }
}



//================================================
//================================================

const Internalerror = (req,res) =>{
  res.render('User/500pageInternalError')
}

const error = (Req, res) => {
  res.render("User/404page");
};

//================================================
//================================================

module.exports = {
  getLogin,
  postLogin,
  getSignup,
  postSignup,
  getProducts,
  getOtp,
  postOtp,
  getHome,
  resendOtp,
  getSendOTPmail,
  postSendOTPmail,
  getResetPass,
  getMail4otp,
  PostMail4otp,
  getforgetotp,
  postforgetotp,
  getProductdetails,
  getProfile,
  getProfileEdit,
  postProfileEdit,
  getAddressEdit,
  getAddAddress,
  postAddAddress,
  postAddressEdit,
  getCart,
  postCart,
  getAddtoCart,
  getCheckout,
  getOrderSuccess,
  getRemoveCart,
  postUpdtqnty,
  postCheckout,
  getOrders,
  submitProductRating,
  error,
  postResetPass,
  deleteAddress,
  cancelOrder,
  getWallet,
  Internalerror,
  verifyPayment,
  applyCoupon,
  return_Request,
  invoice,
  logout,
};

//================================================
//================================================