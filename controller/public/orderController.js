const Address = require('../../models/addressmodel')
const Cart = require('../../models/cartModel')
const User = require('../../models/userModel')
const Product = require('../../models/productmodel')
const Category = require('../../models/categoryModel')
const { Order } = require('../../models/ordermodel')
const orderHelper = require('../../helper/orderHelper')
const cartHelper = require('../../helper/cartHelper');
const couponHelper = require('../../helper/couponHelper')
const { ObjectId } = require('bson');
const easyInvoice = require('easyinvoice')
const fs = require('fs')
const { Readable } = require('stream')



const changePrimary = async (req, res, next) => {
    try {


      const userId = res.locals.user._id
      const result = req.body.addressRadio;
      const user = await Address.find({ user: userId.toString() });
  
      const addressIndex = user[0].address.findIndex((address) =>
        address._id.equals(result)
      );
      if (addressIndex === -1) {
        throw new Error("Address not found");
      }
  
      const removedAddress = user[0].address.splice(addressIndex, 1)[0];
      user[0].address.unshift(removedAddress);
  
      const final = await Address.updateOne(
        { user: userId },
        { $set: { address: user[0].address } }
      );
  
      res.redirect("/checkOut");
    } catch (error) {
      console.log(error.message);
      next(error);
    }
}



const Payment = async (req, res, next) => {
  try {
        const userId = res.locals.user._id;
        const data = req.body;
        // await couponHelper.addCouponToUser(data.couponCode, userId);

        const checkStock = await orderHelper.checkStock(userId);
        if (!checkStock) {
            await Cart.deleteOne({ user: userId });
            return res.json({ status: 'OrderFailed' });
        }
 
        const userData = await User.findById({ _id: userId })
        const walletAmount = userData.wallet
 
         // If payment option is wallet + razorpay
        if (data.payment_option === "wallet_razorpay") {
          if (walletAmount >= data.total) {
        await orderHelper.updateStock(userId);
        await orderHelper.placeOrder(data, userId);
        await Cart.deleteOne({ user: userId });
        return res.json({ orderStatus: true, message: "order placed successfully using wallet" });

    } else {
        // Handle the case when the wallet doesn't have enough balance and the rest will be handled by Razorpay
        
        const remainingAmount = data.finalAmount;

        await orderHelper.placeOrder(data, userId);
        const order = await orderHelper.generateRazorpay(userId, remainingAmount);
        return res.json(order);
    }
} else {
            // ... rest of your code
          if (data.payment_option === "cod" || data.payment_option === "wallet") {
            await orderHelper.updateStock(userId);
            await orderHelper.placeOrder(data, userId);
            await Cart.deleteOne({ user: userId });

            if (data.payment_option === "cod") {
              console.log("pay otion cod");
                return res.json({ codStatus: true ,method:'cod'});
            }

            return res.json({ orderStatus: true, message: "order placed successfully" });
          } else if (data.payment_option === "razorpay") {
              await orderHelper.placeOrder(data, userId);
            const order = await orderHelper.generateRazorpay(userId, data.total);
              return res.json(order);
          }
        }
        
    } catch (error) {
        console.error("Error in postCheckOut:", error.message);
        if (error.message === "Insufficient wallet balance!") {
          return res.status(400).json({ error: "Insufficient wallet balance!" });
        }
    return res.status(500).json({ error: "An error occurred while processing your request." });
    }
}





const orderSuccess = async(req,res,next)=>{
    try{
     const category=await Category.find({})
     res.render('orderSuccess',{category})
    }
    catch(error){
    console.log(error.message)
    }
}




const orderPage = async(req,res,next)=>{
  try{
    console.log("ordrpg")
    const category=await Category.find({})
    console.log(category)
          const user = res.locals.user
          const count = await cartHelper.getCartCount(user.id)
  
          const orders = await Order.aggregate([
              {$match: {user:user._id}},
              {$unwind: "$orders"},
              {$sort: {"orders.createdAt": -1}}
          ])
          // console.log(orders,"orderpage")
          res.render('orderPage',{category,orders,count})
  }
  catch(error){
    console.log(error.message)
  }
}





const orderDetails = async (req,res,next)=>{
  try {
    const category=await Category.find({})
    console.log(category)
    const user = res.locals.user
    console.log(user)
    const count = await cartHelper.getCartCount(user.id)
    console.log(count,'22')

    const id = req.query.id
    console.log(req.query,"query",id,"orderidd")   
    orderHelper.findOrder(id, user._id).then((orders) => {
      const address = orders[0].shippingAddress
      console.log(address,'33')
      const products = orders[0].productDetails
      console.log(products,'44')
      
      res.render('orderDetails',{orders, address, products, count,category})
    });      
  } catch (error) {
    console.log(error.message);
    next(error);
  }

}






const cancel = async(req,res)=>{
  const orderId = req.body.orderId
  const status = req.body.status
  const userId=res.locals.user_id;

  orderHelper.cancelOrder(orderId, status).then((response) => {
   
    res.send(response);
  })
}


const verifyPayment = (req, res, next) => {
  console.log("payment");
const orderId = req.body.order.receipt
  orderHelper.verifyPayment(req.body)
      .then(() => {
  orderHelper.changePaymentStatus(res.locals.user._id, req.body.order.receipt,req.body.payment.razorpay_payment_id)
    .then(() => {
      res.json({ status: true });
    })
    .catch((err) => {
      res.json({ status: false });
    });
}).catch(async(err)=>{
  console.log(err);
  next(err);
});
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



const Invoice = async (req, res, next) => {
  try {
    const id = req.query.id
    const userId = res.locals.user._id
    const result = await orderHelper.findOrder(id, userId)
    const date = result[0].createdAt.toLocaleDateString()
    const product = result[0].productDetails 

    const order = {
      id: id,
      total: parseInt(result[0].totalPrice),
      date: date,
      payment: result[0].paymentMethod,
      name: result[0].shippingAddress.item.name,
      street: result[0].shippingAddress.item.address,
      locality: result[0].shippingAddress.item.locality,
      city: result[0].shippingAddress.item.city,
      state: result[0].shippingAddress.item.state,
      pincode: result[0].shippingAddress.item.pincode,
      product: result[0].productDetails
    }
    
        let totalQuantity = 0;

    // Iterate through the products and sum up the quantities
    for (const products of product) {
      totalQuantity += products.quantity;
    } 

    console.log('Total Quantity:', totalQuantity, result[0].discountAmount, totalQuantity);

    const discountUsed = parseFloat((result[0].discountAmount) / totalQuantity)
    
    const products = order.product.map((product) => ({
      "quantity": parseInt(product.quantity),
      "description": product.productName,
      "tax-rate": 0,
      // "price": parseInt(product.productPrice)
      "price": parseFloat(product.productPrice-discountUsed), 
      // "discount": parseFloat(discountUsed)
    }))
    

    var data = {
      customize: {},
      images: {
        background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
      },
      sender: {
        company: "Grow It",
        address: "Brototype",
        zip: "673407",
        city: "Maradu",
        country: "India"
      },
      client: {
        company: order.name,
        address: order.street,
        zip: order.pincode,
        city: order.city,
        country: "India"
      },
      information: {
        number: order.id,
        date: order.date,
        "due-date": "Nil"
      },
      products: products,
      "bottom-notice": "Thank you, Keep Shopping"
    }

    easyInvoice.createInvoice(data, async function (result) {
      await fs.writeFileSync("invoice.pdf", result.pdf, "base64")

      res.setHeader('Content-Disposition', 'attachment; filename= "invoice.pdf"')
      res.setHeader('Content-Type', 'application/pdf')

      const pdfStream = new Readable()
      pdfStream.push(Buffer.from(result.pdf, 'base64'))
      pdfStream.push(null)

      pdfStream.pipe(res)
    })
  } catch (error) {
    console.log(error.message)
    next(error);
  }
}








module.exports={
    changePrimary,
    Payment,
    orderSuccess,
    orderPage,
    orderDetails,
    cancel,
    verifyPayment,
    removeCoupon,
    Invoice,
    


}