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
//search user
router.post('/search',adminController.getUserSearchUser)
//search product
router.post('/prd-search',adminController.getPrdSearch)
//patch userblock
router.patch('/user/block',adminController.blockUser)
router.patch('/user/unblock',adminController.unblock)
//get adddprod
router.get('/products',adminAuth.loggedIn,adminController.getProductListing);
router.get('/addproduct',adminAuth.loggedIn, adminController.addProductGet);
router.post('/addproduct', upload.array('image',4), adminController.addProductPost);
router.patch('/products/list',adminController.patchList)
router.patch('/products/unlist',adminController.patchUnList)
router.get('/products/editproduct',adminAuth.loggedIn,adminController.editProductGet)
router.post('/products/editproduct',upload.array('image',4),adminController.editProductPost)
router.get('/products/editproduct/delete-edtImage', adminAuth.loggedIn, adminController.DltEdtImg);
//get orders
router.get('/orders',adminAuth.loggedIn,adminController.getOrders)
// get logout
router.get('/logout',adminController.logout)
//route for banner management
router.get('/banners',adminAuth.loggedIn,adminController.getBannerManage)
router.post('/add-banners',upload.single('image'),adminController.adminBannersPost)
router.get('/delete-banner',adminAuth.loggedIn,adminController.deletBanner)
//order cancelled 
router.post('/cancel-order',adminController.cancelOrder)
//status update 
router.post('/update-status/:id',adminController.updateStatus)
//coupon get
router.get("/coupons",adminAuth.loggedIn,adminController.getAllCoupons)
router.post("/create-coupon",adminAuth.loggedIn,adminController.createCoupon)
router.post("/update-coupon/:id",adminAuth.loggedIn,adminController.updateCoupons)
router.post("/unlist-coupon/:id",adminAuth.loggedIn,adminController.unListCoupons)
//category
router.get('/category',adminAuth.loggedIn,adminController.getCateogory)
router.post('/update-category/:categoryId',adminController.postUpdtCat)
router.delete('/delete-category/:categoryId',adminController.DltCat)
router.post('/category',adminController.postCategory)
// ========================================================
//404 / 505 errors 
router.get('/error',adminController.error)
router.get('/internal-error',adminController.Internalerror)
// ========================================================
module.exports = router