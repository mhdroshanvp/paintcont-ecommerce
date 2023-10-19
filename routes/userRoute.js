const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const user = require('../model/user');
const auth = require('../middleware/auth')
// ===========================================================

//home page
router.get('/home',auth.isLoggedIn,auth.isBlocked,userController.getHome)
//default route
router.get('/',auth.isLoggedIn,auth.isBlocked,userController.getLogin);
//login page
router.get('/login', userController.getLogin);
//login post
router.post('/login', userController.postLogin);
//signup page
router.get('/signup', userController.getSignup);
//signup post
router.post('/signup', userController.postSignup);
//otp page
router.get('/otp',userController.getOtp)
// otp post
router.post('/otp',userController.postOtp)
//resend otp route
router.get('/resend-otp', userController.resendOtp);
//otp send
router.get('/send-otp',userController.getSendOTPmail)
//pasword reset route
router.get('/reset-pass',userController.getResetPass)
//password reset post
router.post('/reset-pass',userController.postResetPass)
//mail for otp
router.get('/mail4otp',userController.getMail4otp)
//post mailforotp
router.post('/mail4otp',userController.PostMail4otp)
//forget otp
router.get('/forgetotp',userController.getforgetotp)
//post forget otp
router.post('/forgetotp',userController.postforgetotp)
//seen the products page
router.get('/products',auth.isLoggedIn,auth.isBlocked,userController.getProducts)
//single product page
router.get('/products/product-details',auth.isLoggedIn,auth.isBlocked,userController.getProductdetails)
//profile page
router.get('/profile',auth.isLoggedIn,auth.isBlocked,userController.getProfile)
//profile editing page
router.get('/profile/edit_personal',auth.isLoggedIn,auth.isBlocked,userController.getProfileEdit)
//post edit personal
router.post('/profile/edit_personal',auth.isLoggedIn,auth.isBlocked,userController.postProfileEdit)
//address editing page
router.get('/profile/edit_address',auth.isLoggedIn,auth.isBlocked,userController.getAddressEdit)
//post edit address
router.post('/profile/edit_address',auth.isLoggedIn,auth.isBlocked,userController.postAddressEdit)
//add address
router.get('/profile/add_address',userController.getAddAddress)
//post add address
router.post('/profile/add_address',userController.postAddAddress)
//user orders
router.get('/orders',auth.isLoggedIn,auth.isBlocked,userController.getOrders)
// Define routes for the cart
router.get('/cart', auth.isLoggedIn,auth.isBlocked,userController.getCart);
//get checkout
router.get('/cart/checkout',auth.isLoggedIn,auth.isBlocked,userController.getCheckout)
//post checkout
router.post('/cart/checkout',auth.isLoggedIn,auth.isBlocked,userController.postCheckout)
//post add to cart
router.post('/add-cart/:id', userController.postCart)
//post update qnty
router.post('/updateqnty/:id/:actions',userController.postUpdtqnty)
//post remove qnty
router.post('/remove-from-cart/:id', userController.getRemoveCart)
//logout
router.get('/logout',userController.logout)
//delete address
router.delete('/profile/edit_address/dltAddress',userController.deleteAddress);
//order success
router.get('/cart/checkout/orderSuccess',auth.isLoggedIn,auth.isBlocked,userController.getOrderSuccess)
//for cancel order
router.post('/orders/cancel-order/:id',userController.cancelOrder)
//confirm order
router.post('/verify-payment',auth.isLoggedIn,auth.isBlocked,userController.verifyPayment)
//wallet
router.get('/profile/wallet',auth.isLoggedIn,auth.isBlocked,userController.getWallet)
//apply coupon
router.post('/apply-coupon/:cp/:amt/:prdId',auth.isLoggedIn,auth.isBlocked,userController.applyCoupon)
//return order
router.patch('/return-request/:id',auth.isLoggedIn, userController.return_Request)
//invoice download
router.get('/orders/invoice/:OrderId',auth.isLoggedIn,auth.isBlocked,userController.invoice)
// ========================================================
//404 page :(
router.get('/error',userController.error)
//500 page :(
router.get('/internal-error',userController.Internalerror)

// ========================================================

module.exports = router;
