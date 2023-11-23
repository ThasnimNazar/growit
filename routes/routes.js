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
router.get('/productPage',productController.productpage)
router.get('/categoryPage',auth.isBlocked,userController.categoryProduct)

//forgetpassword
router.get('/loadforget',userController.loadForgotpassword)
router.post('/forgetpassword',userController.forgotpasswordOtp)
router.post('/forgetOtp',userController.verifyforgetOtp)
router.post('/resetPassword',userController.resetPassword)
router.get('/wallet',userController.walletTransaction)

router.get('/profile',profileController.profile)
router.post('/editInfo',profileController.editInfo)



router.get('/Address',profileController.loadAddress)
router.get('/loadadd',profileController.loadaddAddress)
router.post('/submitAddress',profileController.submitAddress)
// router.get('/addAddress',profileController.addAddress)
router.get('/loadedit',profileController.loadEdit)
router.post('/edit',profileController.editAddress)
router.post('/deleteAddress',profileController.deleteAddress)



router.post('/addtocart/:id',auth.cartBlocked,cartController.addToCart)
router.get('/loadcart',cartController.loadCart)
router.put('/change-product-quantity',cartController.updateQuantity)
router.delete('/deleteCart',cartController.deleteProductController)

router.get('/checkout',cartController.checkOut)
router.get('/checkoutAddress',cartController.checkOutAddress)



router.post('/changeAddress',orderController.changePrimary)
router.post('/payment',orderController.Payment)
router.get('/success',orderController.orderSuccess)
router.put('/cancelOrder',orderController.cancel)
router.post('/verifyPayment', orderController.verifyPayment)

router.get('/orderPage',orderController.orderPage)
router.get('/orderdetail',orderController. orderDetails)
router.get('/invoice',orderController.Invoice)

router.get('/applyCoupon/:id',userController.applyCoupon)
router.get('/verifyCoupon/:id', userController.verifyCoupon)
   
router.get('/getwishlist',userController.getWishlist)
router.post('/addwishlist',auth.cartBlocked,userController.addtoWishlist)
router.post('/deletewishlist',userController.deleteWishlist)

router.get('/logout',userController.userLogout)  



module.exports=router
