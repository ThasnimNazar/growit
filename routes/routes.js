const express=require('express')
const router=express();
const session=require('express-session')
const config=require('../configs/config')
const auth=require('../middleware/userAuthentication')
const middleware=('../middleware/categorymiddle.js')
// router.use(session({secret:config.session,resave:false,saveUninitialized:false}))
router.use(auth.checkSession)
// router.use(auth.isBlocked)













//get the controller
const userController = require('../controller/public/userController');
const productController=require('../controller/product/productController')
const cartController=require('../controller/public/cartController')
const orderController=require('../controller/public/orderController')
// const nocache = require('nocache');

router.set('views engine','ejs')
router.set('views','./views/public')

const nocache=require('nocache');
const profileController = require('../controller/public/profileController');
router.use(nocache())


router.use(express.json());
router.use(express.urlencoded({extended:true}));


router.get('/',auth.isBlocked,userController.loadHome)

 //login
router.get('/login',auth.isLogout,userController.Loginload)
router.post('/loginvalidation',auth.isLogout,userController.verifyLogin)
 
 
// router.get('/home',userController.loadHome) 
//registration
router.get('/registration',userController.Loadregister)
router.post('/verify',userController.verifyNumber)
router.post('/register',userController.insertUser)
router.post('/verifyOtp',userController.verifyOtp) 
 

//product
router.get('/displayproducts',auth.isBlocked,userController.displayProduct)
router.get('/productPage',auth.isLogin,auth.isBlocked,productController.productpage)
router.get('/categoryPage',auth.isLogout,auth.isBlocked,userController.categoryProduct)

//forgetpassword
router.get('/loadforget',userController.loadForgotpassword)
router.post('/forgetpassword',userController.forgotpasswordOtp)
router.post('/forgetOtp',userController.verifyforgetOtp)
router.post('/resetPassword',userController.resetPassword)
router.get('/wallet',userController.walletTransaction)

router.get('/profile',  auth.isBlocked,profileController.profile)
router.post('/editInfo',  auth.isBlocked,profileController.editInfo)



router.get('/Address',  auth.isBlocked,profileController.loadAddress)
router.get('/loadadd',  auth.isBlocked,profileController.loadaddAddress)
router.post('/submitAddress',  auth.isBlocked,profileController.submitAddress)
// router.get('/addAddress',profileController.addAddress)
router.get('/loadedit',  auth.isBlocked,profileController.loadEdit)
router.post('/edit', auth.isBlocked,profileController.editAddress)
router.post('/deleteAddress',auth.isBlocked,profileController.deleteAddress)   



router.post('/addtocart/:id',auth.cartBlocked,cartController.addToCart)    
router.get('/loadcart',auth.isLogin, auth.isBlocked,cartController.loadCart)
router.put('/change-product-quantity',cartController.updateQuantity)
router.delete('/deleteCart',cartController.deleteProductController)

router.get('/checkout', auth.isBlocked,cartController.checkOut)
router.get('/checkoutAddress', auth.isBlocked,cartController.checkOutAddress)



router.post('/changeAddress',orderController.changePrimary)
router.post('/payment',auth.isLogin, auth.isBlocked,orderController.Payment)
router.get('/success',auth.isLogin, auth.isBlocked,orderController.orderSuccess)
router.put('/cancelOrder',orderController.cancel)
router.post('/verifyPayment', orderController.verifyPayment)

router.get('/orderPage',auth.isLogin, auth.isBlocked,orderController.orderPage)
router.get('/orderdetail',auth.isLogin, auth.isBlocked,orderController. orderDetails)
router.get('/invoice',auth.isLogin, auth.isBlocked,orderController.Invoice)

router.get('/applyCoupon/:id', auth.isBlocked,userController.applyCoupon)
router.get('/verifyCoupon/:id', auth.isBlocked,userController.verifyCoupon)
   
router.get('/getwishlist',auth.isLogin, auth.isBlocked,userController.getWishlist)
router.post('/addwishlist',auth.isLogin, auth.isBlocked,auth.cartBlocked,userController.addtoWishlist)
router.post('/deletewishlist',auth.isLogin, auth.isBlocked,userController.deleteWishlist)

router.get('/logout',userController.userLogout)  



module.exports=router
