const express=require('express')
const path=require('path')
const admin_route=express();
const session=require('express-session')
const config=require('../configs/config')
const auth=require('../middleware/auth')
// admin_route.use(session({secret:config.sessionSecrets,resave:false,saveUninitialized:false}))
const multer = require('../multer/multer')
;[[[]]]
const nocache=require('nocache')
admin_route.use(nocache())



  

admin_route.use(express.json())
admin_route.use(express.urlencoded({extended:true}));




admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')
admin_route.use(express.static(path.join(__dirname,'public')))
admin_route.use(express.static(path.join(__dirname,'views/admin')))
// admin_route.use(express.static('/views/admin'))

// admin_route.use(express.static('public'))



const adminController=require('../controller/admin/adminController')
const productController=require('../controller/product/productController')
const categoryController=require('../controller/category/categorycontroller')


//admin
admin_route.get('/admin',auth.isLogout,adminController.loadLogin) 

admin_route.post('/validation',auth.isLogout,adminController.VerifyLogging)

//load dashboard
admin_route.get('/dashboard',auth.isLogin,adminController.loadDashboard)

admin_route.get('/adminLogout',adminController.adminlogOut)



//product routes
admin_route.get('/products',auth.isLogin,productController.loadProduct)
admin_route.get('/addproduct',auth.isLogin,productController.createProduct)
admin_route.post('/addproducts',multer.upload, productController.saveProduct)
admin_route.get('/unlistproduct',productController.unlistProduct)
admin_route.get('/relistproduct',productController.reListProduct)
admin_route.get('/loadupdateProduct',auth.isLogin,productController.loadupdateProduct)
admin_route.post('/editproduct',auth.isLogin,multer.upload, productController.updateProduct)



//category routes
admin_route.get('/loadcategories',auth.isLogin,categoryController.loadcategory)
admin_route.get('/loadcategory',auth.isLogin,categoryController.loadNewcategory)
admin_route.get('/unListCategory',auth.isLogin,categoryController.unListCategory)
admin_route.get('/reListCategory',auth.isLogin,categoryController.reListCategory)
admin_route.get('/loadeditcategory',auth.isLogin,categoryController.loadUpdateCategory)
admin_route.post('/editCategory',auth.isLogin,categoryController.updateCategory)
admin_route.get('/categoryoffer',auth.isLogin,categoryController.categoryOffer)
admin_route.post('/postoffer',auth.isLogin,categoryController.addCategoryOffer)


// admin_route.post('/addcategories',categoryController.newCategory)
admin_route.post('/create-category',categoryController.savecategory)

//user routes
admin_route.get('/userlist',adminController.loadUsers)
admin_route.post('/blockUser',adminController.blockUser)
admin_route.post('/unblockuser',adminController.unBlockUser)

admin_route.get('/orderManage',adminController.loadOrder)
admin_route.put('/orderStatus',adminController.changeStatus)
admin_route.put('/cancelOrders',adminController.cancelOrder)
admin_route.put('/returnOrders',adminController.returnOrder)
admin_route.get('/orderDetails',adminController.orderDetails)

admin_route.get('/salesreport',adminController.getSalesReport)
admin_route.post('/postsalesreport',adminController.postReport)

admin_route.get('/couponlist',adminController.couponList)
admin_route.get('/addcoupun',adminController.loadAddcoupon)
admin_route.post('/addCoupon',adminController.addCoupon)
admin_route.delete('/removeCoupon',adminController.removeCoupon)

admin_route.get('/bannerlist',adminController.bannerList)
admin_route.get('/getBanner',adminController.getBanner)
admin_route.post('/postBanner',multer.addBannerUpload,adminController.addBannerPost)
admin_route.get('/editBanner',multer.addBannerUpload,adminController.loadEditBanner)
admin_route.post('/posteditBanner',multer.addBannerUpload,adminController.editBanner)
admin_route.get('/deleteBanner',adminController.deleteBanner)


admin_route.get('/loadoffer',adminController.loadOffer)
admin_route.get('/createCategoryoffer',adminController.loadcreateCategoryoffer)
admin_route.post('/postcategoryOffer',adminController.createCategoryOffer)
admin_route.get('/loadeditCategoryoffer',adminController.loadeditCategoryoffer)
admin_route.post('/posteditCatOffer',adminController.postEditCategory)
admin_route.delete('/deleteCatoffer',adminController.deleteCategoryoff)    


admin_route.get('/productOffer',adminController.productofferList)
admin_route.get('/addOffer',adminController.addproductOffer)
admin_route.post('/postProduct',adminController.createproductOffer)
admin_route.get('/editOffer',adminController.loadEditoffer)
admin_route.post('/posteditOffer',adminController.postOffer)
admin_route.delete('/deleteOffer',adminController.deleteOffer)













module.exports = admin_route;





