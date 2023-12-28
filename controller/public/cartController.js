const Product=require('../../models/productmodel')
const Address=require('../../models/addressmodel')
const Category=require('../../models/categoryModel')
const Cart=require('../../models/cartModel')
const User=require('../../models/userModel')
const cartHelper=require('../../helper/cartHelper')
const Coupon = require('../../models/coupon')

const addToCart = (req, res) => {
    try {
        console.log(req.params.id,res.locals.user._id,"addtocartpost");

        cartHelper.addCart(req.params.id, res.locals.user._id)
        .then((response) => {
            console.log("addtocrt send res")
            res.send(response)
        })
    } catch (error) {
        console.log(error.message)
    }
}           


const loadCart = async (req, res) => {
    try {
           
        const user = res.locals.user
        console.log(user,'11')
        const count = await cartHelper.getCartCount(user.id)
        const category=await Category.find({})
        let cartTotal = 0
        const total = await Cart.findOne({user: user.id})
        console.log(total,'12')
        if(total){
            cartTotal = total.cartTotal
            console.log(cartTotal,'13')

            const cart = await Cart.aggregate([
                {
                    $match: {user: user._id}
                },
                {
                    $unwind:"$cartItems"
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "cartItems.productId",
                        foreignField: "_id",
                        as: "carted"
                    }
                },    
                {
                    $project:{
                        item: "$cartItems.productId",
                        quantity: "$cartItems.quantity",
                        total: "$cartItems.total",
                        discountedPrice:"$cartItems.discountedPrice",
                        carted: { $arrayElemAt: ["$carted", 0]}
                    }
                }
            ])
            console.log(cart,'hjbc')
            res.render('cart', {cart, user, count, cartTotal,category})
        } else {
            res.render('cart', {user, count,category, cartTotal, cart: []})
        }

       
    } catch (error) {
        console.log(error.message)
    }
}

const updateQuantity = (req, res) => {
    const userId = res.locals.user._id
    cartHelper.updateQuantity(req.body)
    .then(async (response) => {
        res.json(response)
    })
}



const checkOut = async(req,res)=>{
    try{
   const category=await Category.find({})

   const user=res.locals.user;

   const count=await cartHelper.getCartCount(user._id)

   const couponList = await Coupon.find()

   const total=await Cart.findOne({user:user._id})

   const address=await Address.findOne({user:user._id}).lean().exec()



   const cart = await Cart.aggregate([
    { $match: { user: user._id } },
    { $unwind: "$cartItems" },
    { $lookup: {
        from: "products",
        localField: "cartItems.productId",
        foreignField: "_id",
        as: "carted"
    }},
    { $project: {
        item: "$cartItems.productId",
        quantity: "$cartItems.quantity",
        total: "$cartItems.total",
        carted: { $arrayElemAt: ["$carted", 0] }
    }}
]);

if (address) {
   res.render('checkOut',{category,address:address.address, walletBalance: user.wallet,cart,total,count,couponList})
    }

else{
    res.render('checkOut', {
        address: [],
        cart,
        total,
        count,
        couponList 
    }
    )}
}
    catch(error){
        console.log(error.message)
    }
}



const checkOutAddress = async (req, res, next) => {
    try {
      const userId = res.locals.user._id;
      const name = req.body.name;
      const mobileNumber = req.body.mno;
      const address = req.body.address;
      const locality = req.body.locality;
      const city = req.body.city;
      const pincode = req.body.pincode;
      const state = req.body.state;
  
      const newAddress = {
        name: name,
        mobileNumber: mobileNumber,
        address: address,
        locality: locality,
        city: city,
        pincode: pincode,
        state: state,
      };
  
      const updatedUser = await profileHelper.submitAddress(userId, newAddress);
      if (!updatedUser) {
        await profileHelper.createAddress(userId, newAddress);
      }
      res.redirect("/checkOut"); 
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  }


  
  const deleteProductController = (req, res, next) => {
    console.log('enter')
    cartHelper.deleteproducts(req.body).then((response) => {
        res.send(response)
    })
}
  


 










module.exports={
    addToCart,
    loadCart,
    updateQuantity,
    checkOut,
    checkOutAddress,
    deleteProductController,
}