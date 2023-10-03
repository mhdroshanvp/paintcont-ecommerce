const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const path = require('path')
const { route } = require('./userRoute')
const multer = require('multer')
const adminAuth = require('../middleware/auth')

// ========================================================

const Storage = multer.diskStorage({
    destination: 'public/userimages',
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: Storage});

// ========================================================

//defualt route
router.get('/',adminController.getadmin)
//get login
router.get('/login',adminAuth.notlogged, adminController.getLogin);
// post login
router.post('/login', adminController.postLogin);
// get dashboard
router.get('/dashboard',adminAuth.loggedIn,adminController.getdashboard)
//get user
router.get('/user',adminAuth.loggedIn,adminController.getusermanagement)
//patch userblock
router.patch('/user/block',adminController.blockUser)
//patch userUnblock
router.patch('/user/unblock',adminController.unblock)
//get adddprod
router.get('/addproduct',adminAuth.loggedIn, adminController.addProductGet);
//post addprod
router.post('/addproduct', upload.array('image',4), adminController.addProductPost);
// patch list
router.patch('/products/list',adminController.patchList)
//patch unlist
router.patch('/products/unlist',adminController.patchUnList)
//get editprod
router.get('/products/editproduct',adminAuth.loggedIn,adminController.editProductGet)
//post edit prod
router.post('/products/editproduct',upload.array('image',4),adminController.editProductPost)
//get orders
router.get('/orders',adminAuth.loggedIn,adminController.getOrders)
//get logout
router.get('/products',adminAuth.loggedIn,adminController.getProductListing);
// get logout
router.get('/logout',adminController.logout)
//route for banner management
router.get('/banners',adminAuth.loggedIn,adminController.getBannerManage)
//post banner
router.post('/add-banners',upload.single('image'),adminController.adminBannersPost)
//banner deletion
router.get('/delete-banner',adminAuth.loggedIn,adminController.deletBanner)
//order cancelled 
router.post('/cancel-order',adminController.cancelOrder)
//status update 
router.post('/update-status/:id',adminController.updateStatus)
//coupon get
router.get('/coupon',adminController.getCoupon)
//coupon post
router.post('/coupon',adminController.postCoupon)
//category
router.get('/category',adminAuth.loggedIn,adminController.getCateogory)
router.post('/update-category/:categoryId',adminController.postUpdtCat)
router.delete('/delete-category/:categoryId',adminController.DltCat)
//post category
router.post('/category',adminController.postCategory)
// ========================================================
//404 page not found:(
router.get('/error',adminController.error)
//500 internal error :(
router.get('/internal-error',adminController.Internalerror)
// ========================================================
module.exports = router