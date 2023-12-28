const User = require("../../models/userModel")
const bcrypt=require('bcrypt')
const orderHelper=require('../../helper/orderHelper')
const { Order }=require('../../models/ordermodel')
const adminHelper=require('../../helper/adminHelper')
const Category=require('../../models/categoryModel')
const Product=require('../../models/productmodel')
const Coupon=require('../../models/coupon')
const couponHelper = require('../../helper/couponHelper')
const Banner = require('../../models/bannermodel')
const bannerHelper = require('../../helper/bannerHelper')
const offerHelper = require('../../helper/offerHelper')
const { ObjectId } = require('mongodb')

const Securepassword=async(password)=>{
    try{
        const passwordHash=await bcrypt.hash(password,10);
        return passwordHash;
    }
    catch(error)
    {
        console.log(error.message)
    }
}

const loadLogin=async(req,res)=>
{
    try{
        res.render('login')
    }
    catch(error)
    {
        console.log(error.message)
    }
}

const VerifyLogging=async(req,res)=>
{
    try{
        const email=req.body.email;
        const password=req.body.password;
        console.log(email,password);
        const userData=await User.findOne({email:email});
        console.log(userData);
        if(userData)
        {
            const passwordMatch=await bcrypt.compare(password,userData.password)
            if(passwordMatch){
            if(userData.is_admin===0)
            {
                res.render('login',{message:"This is only for admins"})
            }
            else{
                req.session.admin_id=userData._id;
                req.session.loggedIn=true;
                req.session.admin=true;
                console.log('hi')
                res.redirect('/admin/dashboard');
            }
        }
        else
        {
            res.render('login',{message:"Email and Password Incorrect!"})
        }
    }else{
        res.render('login',{message:"Email and password Incorrect"})
    }
}
catch(error)
{
    console.log(error.message)
}
}











const loadDashboard=async(req,res)=>{
    try{
      const orders = await Order.aggregate([
        { $unwind: "$orders" },
        { $match: { "orders.orderStatus": "Delivered" } },
        {
          $group: {
            _id: null,
            totalPriceSum: { $sum: { $toInt: "$orders.totalPrice" } },
            count: { $sum: 1}
        }}
      ]) 
      const categorySales = await Order.aggregate([
        { $unwind: "$orders" },
        { $unwind: "$orders.productDetails"},
        { $match: { "orders.orderStatus": "Delivered" } },
        {
          $project: {
            CategoryId: "$orders.productDetails.category",
            totalPrice: {
              $multiply: [
                { $toDouble: "$orders.productDetails.productPrice" },
                { $toDouble: "$orders.productDetails.quantity"}
              ]
            }
          }
        },
        {
          $group: {
            _id: "$CategoryId",
            PriceSum: { $sum: "$totalPrice"}
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "categoryDetails"
          }
        },
        { $unwind: "$categoryDetails" },
        {
          $project: {
            categoryName: "$categoryDetails.name",
            PriceSum: 1,
            _id: 0
          }
        }
      ])


 
        
  
      const salesData = await Order.aggregate([
        { $unwind: "$orders" },
        {
          $match: {
            "orders.orderStatus": "Delivered"
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$orders.createdAt"
              }
            },
            dailySales: { $sum: { $toInt: "$orders.totalPrice" } }
          }
        },
        { $sort: { _id: 1 } }
      ])
  
      const salesCount = await Order.aggregate([
        { $unwind: "$orders" },
        { $match: { "orders.orderStatus": "Delivered" } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$orders.createdAt"
              }
            },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
  
      const categoryCount = await Category.find({}).count()
      const productsCount = await Product.find({}).count()
  
      const onlinePay = await adminHelper.getOnlineCount()
      console.log(onlinePay)
      const codPay = await adminHelper.getCodCount()
  
      const latestOrders = await Order.aggregate([
        { $unwind: "$orders" },
        {
          $sort: {
          'orders.createdAt': -1
          }
        },
        { $limit: 10 }
      ])
  
      res.render('dashboard', {orders, productsCount, categoryCount, salesCount, salesData, categorySales, onlinePay, codPay, order: latestOrders})
    }
    catch(error)
    {
        console.log(error.message)
    }
}



const productsList=async(req,res)=>{
    let products
    try{
        res.render('productlist',{products})
    }
    catch(error)
    {
        console.log(error.message)
    }
}

//Adding new product
      


const adminDashboard=async(req,res)=>
{
    try{
        let search=""
        if(req.query.search)
        {
            search=req.query.search
        }
        const userData= await User.find({
            is_admin:0,
            $or: [
    
                {name:{$regex:'.*'+search+'.*',$options:'i'}},
                {email:{$regex:'.*'+search+'.*',$options:'i'}},
                {mobile:{$regex:'.*'+search+'.*',$options:'i'}}
            ]
            
        })
        res.render('dashboard',{users:userData})
    }
    catch(error)
    {
        console.log(error.message)
    }  
}
const loadUsers=async(req,res)=>{
    try{
        const user = await User.find({})
            // console.log(user);
            res.render('userlist',{user})
        }
    catch(error){

        console.log(error.message)
    }
}

const blockUser = async(req,res)=>{
    try {
        console.log("blockeduser");
      const id = req.body.userId
      await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:true}})
      res.redirect('/admin/userlist')
    } catch (error) {
      console.log(error)
    }
  }





  

  const unBlockUser = async(req,res)=>{
    try {
        console.log("unblockeduser");
      const id = req.body.userId
      await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:false}})
      res.redirect('/admin/userlist')
    } catch (error) {
      console.log(error.message)
    }
  }

  const adminlogOut=async(req,res)=>
  {
    try{
        req.session.admin_id=null
        req.session.admin=null
        // req.session.destroy()
        res.redirect('/admin/admin')
    }
    catch(error){
        console.log(error.message)
    }
  }


  
  const loadOrder= (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    orderHelper.getOrderList(page, limit)
      .then(({ orders, totalPages, page: currentPage, limit: itemsPerPage }) => {
        
        res.render("ordermanage", {
          orders,
          totalPages,
          page: currentPage,
          limit: itemsPerPage,
        });
      })
      .catch((error) => {
        console.log(error.message);
      });
  }
        



    //   res.render('ordermanage')
  
  const changeStatus = async(req,res) => {
    const orderId = req.body.orderId
    const status = req.body.status
    adminHelper.changeOrderStatus(orderId, status)
    .then((response) => {
      console.log(response);
      res.json(response);
    });
  }



  const cancelOrder = async(req,res)=>{
    const userId = req.body.userId
    const orderId = req.body.orderId
    const status = req.body.status
    adminHelper.cancelOrder(orderId,userId,status).then((response) => {
      res.send(response);
    });
  } 
  
  
  const returnOrder = async(req,res)=>{
      const orderId = req.body.orderId
        const status = req.body.status
        const userId = req.body.userId
        adminHelper.returnOrder(orderId,userId,status).then((response) => {
          res.send(response);
        });
      }


      const orderDetails = async (req,res)=>{
        try {
          const id = req.query.id
          console.log(id)
          adminHelper.findOrder(id).then((orders) => {
            const address = orders[0].shippingAddress
            const products = orders[0].productDetails 
            res.render('orderDetails',{orders,address,products}) 
          });
        } catch (error) {
          console.log(error.message);
        }
      }


      const getSalesReport = async (req, res) => {
        try{
        const report = await adminHelper.getsSalesReport()
        let details = []
        const getDate = (date) => {
          const orderDate = new Date(date)
          const day = orderDate.getDate()
          const month = orderDate.getMonth() + 1
          const year = orderDate.getFullYear()
          return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${isNaN(year) ? "0000" : year}`
        }
        report.forEach((orders) => {
          details.push(orders.orders)
        })
        res.render('salesReport', {details, getDate})
      }
    catch(error){
      console.log(error.message)
    }
  }



      const postReport = async (req,res) => {
        let details = []
        const getDate = (date) => {
          const orderDate = new Date(date)
          const day = orderDate.getDate()
          const month = orderDate.getMonth() + 1
          const year = orderDate.getFullYear()
          return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${isNaN(year) ? "0000" : year}`
        }
    
        adminHelper.postReport(req.body).then((orderDate) => {
          orderDate.forEach((orders) => {
            details.push(orders.orders)
          })
          res.render('salesReport', {details, getDate})
        })
      }
    

      const couponList = async(req,res)=>{
        try{
          const couponList = await Coupon.find()
      res.render('couponList',{couponList})
        }
        catch(error){
          console.log(error.message)
        }
      }



      const loadAddcoupon=async(req,res,next)=>{
        try{
        res.render('loadAddcoupon')
      }
      catch(error){
        console.log(error.message)
      }
    }
      

    const addCoupon = (req, res, next) => {
      try {
          const data = {
              couponCode: req.body.coupon,
              validity: req.body.validity,
              minPurchase: req.body.minAmount,
              minDiscountPercentage: req.body.discountPercentage,
              maxDiscountValue: req.body.maxDiscount,
              description: req.body.description
          }
          couponHelper.addCoupon(data)
              .then((response) => {
                  res.json(response)
          })
      } catch (error) {
          console.log(error.message)
      }
  }


const removeCoupon = async(req, res, next) => {
    try {
        const id = req.body.couponId
        await Coupon.deleteOne({ _id: id })
        res.json({status: true})
    } catch (error) {
        console.log(error.message);
    }
}


const bannerList = async (req, res) => {
  try {
      bannerHelper.bannerListHelper().then((response) => {
          res.render('bannerList', {banners: response})
      })
  } catch (error) {
      console.log(error.message)
  }
}

const getBanner = async(req,res)=>{
  try{
    res.render('getBanner')
  }
  catch(error){
    console.log(error.message)
  }
}


const addBannerPost = async (req, res) => {
  bannerHelper.addBannerHelper(req.body, req.file?.filename).then((response) => {
      if (response) {
          res.redirect('/admin/bannerList')
      } else {
          res.status(500).send('Error encountered');
      }
  })
}

const loadEditBanner = async (req, res) => {
  bannerHelper.editBannerHelper(req.query.id).then((response) => {
      res.render('updateBanner', {banner: response[0]})
  })
}



const editBanner = async (req, res) => { 
  try {
      const bannerData = await Banner.findById(req.body.id)
      const updatedImage = req.file ? req.file.filename : bannerData.image;
      await bannerHelper.updateBannerHelper(req.body, updatedImage)
      res.redirect('/admin/bannerList')
  } catch (error) {
      console.log(error.message)
  }
}



const deleteBanner = async (req, res) => {
  bannerHelper.deleteBannerHelper(req.query.id).then((response) => {
      res.redirect('/admin/bannerList')
  })
}

const loadOffer = async(req,res)=>{
  try{
    const limit = parseInt(req.query.limit) || 3;
    const page = parseInt(req.query.page) || 1;
    const category = await Category.find({ discountPercentage: { $gt: 0 } }).skip((page-1)*limit).limit(limit)
    console.log(category,'uu')
    res.render('categoryOffer', { category, page});
  }
  catch(error){
    console.log(error.message)
  }
}        




const loadcreateCategoryoffer = async(req,res)=>{
  try{
     const category = await Category.find({});
     const product = await Product.find({})
     res.render('loadaddCategoryoff',{category,product})
  }
  catch(error){
    console,log(error.message)
  }
}





const createCategoryOffer = async (req, res) => {
  try {
      const categoryId = req.body.categoryId
      const Id = new ObjectId(categoryId)
      const currentDate = new Date()
      const category = await Category.findOne({ $and: [{ _id: Id,discountPercentage:{$gt:0} }] });
      if (category == null) {
          await Category.findOneAndUpdate({ _id: Id },
              {
                  $set:
                      { discountPercentage: req.body.discountPercentage, discountValidity: req.body.validity }
              }
          )
          offerHelper.addOfferPrice(Id).then((response)=>{
            res.send({ status: "true" })
          })
          
      } else {
          res.send({ status: 'false' })
      }
  } catch (error) {
      console.error(error.message);
  }
}

const loadeditCategoryoffer = async(req,res)=>{
  try{
    const id = req.query.id
    const category = await Category.find({_id:id})
    res.render('editCategoryOffer', {category})
} catch (error) {
  console.error(error.message);  
}

  }

  const postEditCategory = async(req,res)=>{
    try{
      const id = req.body.categoryId
      const category = await Category.findByIdAndUpdate({_id:id},{
       $set:{discountValidity:req.body.validity,discountPercentage:req.body.discountPercentage}
      }) 
      offerHelper.addOfferPrice(id) 
       category.save().then(()=>{
           res.send({status:true})
       })

    }
    catch(error){
      console.log(error.message)
    }
  }     


  const deleteCategoryoff = async(req,res)=>{
    try{
      const id = req.query.id
      await Category.findByIdAndUpdate({_id:id.toString()},{
           $set:{discountPercentage:0,discountValidity: null}
       })
       offerHelper.addOfferPrice(id.toString())
       .then((response)=>{
           res.send({status:true})
       })
      
   } catch (error) {
     console.error(error.message);  
   }
   
  }
 





const productofferList = async(req,res)=>{
  try{
    const product = await Product.find({discountPercentage:{$gt:0}})
    console.log(product[0].discountValidity,'pin')
     res.render('productOffer',{product})

  }
  catch(error){
    console.log(error.message)
  }
}



const addproductOffer = async(req,res)=>{
  try{
    const product = await Product.find({})
    console.log(product,'tu')
     res.render('addOffer',{product})
  }
  catch(error){
    console.log(error.message)
  }
}

    



const createproductOffer = async(req,res)=>{
    try {
        const id = new ObjectId(req.body.productId)
        const product = await Product.findOne({$and:[{_id:id,discountPercentage:{$gt:0}}]})
        if(product == null){
            await Product.findOneAndUpdate({_id:id},
                {$set:{
                    discountPercentage:req.body.discountPercentage,
                    discountValidity:req.body.validity
                }
            })
            offerHelper.addOfferPriceforSingleProduct(id).then((product)=>{
                res.send({status:"true"})
            })
        }else{
           res.send({status:"false"})
        }
    
    } catch (error) {
      console.error(error.message);  
    }
    
}    



const loadEditoffer = async(req,res)=>{
  try{
    const id = new ObjectId(req.query.id)
    console.log("loadEditOfer",id)
    const product = await Product.find({_id:id})
    console.log(product)
    res.render('editproductOffer',{product})
  }
  catch(error){
    console.log(error.message)
  }
}


const postOffer = async(req,res)=>{
  try{
    const id = req.body.productId
    const product = await Product.findByIdAndUpdate({_id:id},{
     $set:{discountValidity:req.body.validity,discountPercentage:req.body.discountPercentage}
    })  
    offerHelper.addOfferPriceforSingleProduct(id).then(()=>{
         res.send({status:true})
     })
    }
  catch(error){
    console.log(error.message)
  }
}

const deleteOffer = async(req,res)=>{
    try {
        const id = req.query.id
        console.log(id)
        const cat=await Category.find({_id:id})
        console.log(cat,"kkat")
       await Category.findByIdAndUpdate({_id:id.toString()},{
            $set:{discountPercentage:0,discountValidity: null}
        })
        offerHelper.addOfferPrice(id.toString())
        .then((response)=>{
            res.send({status:true})
        })
             
    } catch (error) {
      console.error(error.message);  
    }
}






module.exports={
    loadLogin,
    VerifyLogging,
    loadDashboard,
    productsList,
    loadUsers,
    blockUser,
    unBlockUser,
    adminlogOut,
    loadOrder,
    changeStatus,
    cancelOrder,
    returnOrder,
    orderDetails,
    getSalesReport,
    postReport,
    couponList,
    loadAddcoupon,
    addCoupon,
    removeCoupon,
    bannerList,
    getBanner,
    addBannerPost,
    deleteBanner,
    loadEditBanner,
    editBanner,
    loadOffer,
    createCategoryOffer,
    loadeditCategoryoffer,
    productofferList,
    addproductOffer,
    createproductOffer,
    loadEditoffer,
    postOffer,
    deleteOffer,
    loadcreateCategoryoffer,
    postEditCategory,
    deleteCategoryoff
    
}            






