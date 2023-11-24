const Product = require('../models/productmodel')
const User = require('../models/userModel')
const Cart = require('../models/cartModel')
const Address = require('../models/addressmodel')
const { Order } = require('../models/ordermodel')
const mongoose = require('mongoose')
const { ObjectId } = require('bson');
const Razorpay = require('razorpay')

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});




const checkStock = async(userId)=>{
    const products = await Cart.findOne({user:userId})
    const cartProducts = products.cartItems
    for(const cartProduct of cartProducts ){
      const productId = cartProduct.productId;
      const product = await Product.findOne({_id:productId})
      if(product.stock < cartProduct.quantity ){
        console.log(product.stock,"<",cartProduct.quantity,"chkstck");
        return false
      }
    }
    return true
}


const placeOrder = (data, user) => {
  return new Promise(async (resolve, reject) => {
      try {
       
          const productDetails = await Cart.aggregate([
            {
                $match: {
                user: user,
                },
            },
            {
                $unwind: "$cartItems",
            },
            {
                $project: {
                item: "$cartItems.productId",
                quantity: "$cartItems.quantity",
                },
            },
            {
                $lookup: {
                from: "products",
                localField: "item",
                foreignField: "_id",
                as: "productDetails",
                },
            },
            {
                $unwind: "$productDetails",
            },
            {
                $project: {
                productId: "$productDetails._id",
                productName: "$productDetails.name",
                productPrice: "$productDetails.price",
                quantity: "$quantity",
                category: "$productDetails.category",
                image: "$productDetails.images",
                },
            },
          ]);
          const addressData = await Address.aggregate([
              {
                $match: { user: user.toString() },
              },
              {
                $unwind: "$address",
              }
              ,
              {
                $match: { "address._id": new ObjectId(data.address) },
              },
              {
                $project: { item: "$address" },
              },
          ]);
          console.log(user,addressData,"placeorder");
          let status, orderStatus;

          const userData = await User.findById({ _id: user });
          if (data.payment_option === "wallet_razorpay") {
            if (userData.wallet >= data.total) {
              console.log("wallet 1 b")
              console.log("waallet 1b ", userData.wallet, data.total)
                  // Deduct the total amount from the wallet
                  userData.wallet -= data.total;
                  await userData.save()
                  const walletTransaction = {
                      date: new Date(),
                      type: "Debit",
                      amount: data.total,
                  }

                  await User.updateOne(
                      { _id: user },
                      { $push: { walletTransaction: walletTransaction } }
                  );
                  

                  (status = "Success"), (orderStatus = "Placed");
            } else {
              console.log("waallet 2b")
               console.log("waallet 2b ", userData.wallet, data.total)
                  // Deduct the entire wallet amount
                  const deductedWalletAmount = userData.wallet;
                  userData.wallet = 0;
                  await userData.save()
                  const walletTransaction = {
                      date: new Date(),
                      type: "Debit",
                      amount: deductedWalletAmount,
                  }

                  await User.updateOne(
                      { _id: user },
                      { $push: { walletTransaction: walletTransaction } }
                  );

                  // The remaining amount will be handled by Razorpay
                  (status = "Pending"), (orderStatus = "Pending");
              }
          } else if (data.payment_option === "cod") {
              (status = "Success"), (orderStatus = "Placed");

          } else if (data.payment_option === "wallet") {
              if (userData.wallet < data.total) {
                  return reject(new Error("Insufficient wallet balance!"));
              } else {
                  userData.wallet -= data.total;
                  await userData.save();

                  const walletTransaction = {
                      date: new Date(),
                      type: "Debit",
                      amount: data.total,
                  }

                  await User.updateOne(
                      { _id: user },
                      { $push: { walletTransaction: walletTransaction } }
                  );

                  (status = "Success"), (orderStatus = "Placed");
              }

          } else {
            console.log("payment pending");
              // Assuming other options will default to Razorpay
              (status = "Pending"), (orderStatus = "Pending");
          }
          // console.log(data,addressData,"placeorder");
          const orderData = {
              _id: new ObjectId(),
              name: addressData[0].item.name,
              paymentStatus: status,
              paymentMethod: data.payment_option,
              productDetails: productDetails,
              shippingAddress: addressData[0],
              orderStatus: orderStatus,
              totalPrice: data.total,
              discountPercentage:data.discountPercentage,
              discountAmount:data.discountAmount,
              couponCode:data.couponCode,
              cancelStatus:'false',
              
              createdAt:new Date()
          }
          console.log(orderData,"placeorder");
          const order = await Order.findOne({ user: user });
          console.log(userData,"placeorder");

          if (order) {
              await Order.updateOne(
                  { user: user },
                  { $push: { orders: orderData } }
              ).then((response) => {
                  resolve(response);
              });
          } else {
              const newOrder = Order({
                  user: user,
                  orders: orderData,
              });
            await newOrder.save().then((response) => {
                  resolve(response);
              });
          }

      } catch (error) {
          console.log(error.message);
          reject(error);
      }
  });
}















const updateStock = async(userId,codStatus,status)=>{
    console.log('enter')
    const products = await Cart.findOne({user:userId})
   
    const cartProducts = products.cartItems
    for(const cartProduct of cartProducts ){
        const productId = cartProduct.productId;
        const quantity = cartProduct.quantity;

        const product = await Product.findOne({_id:productId})

        if(product.stock < cartProduct.quantity ){
        return false
        }

        await Product.updateOne({_id:productId},
        {$inc:{stock:-quantity}}
        )

       const orders=await Order.find({})
       if(orders.orderStatus == 'Cancel Accepted')
       {
        await Product.updateOne({_id:productId},
          {$inc:{stock:quantity}}
          )
       }
    }
    return true
}






const findOrder  = (orderId, userId) => {
  try {
    return new Promise((resolve, reject) => {
      Order.aggregate([
        {
          $match: {
            "orders._id": new ObjectId(orderId),
            user: new ObjectId(userId),
          },
        },
        { $unwind: "$orders" },
      ]).then((response) => {
        let orders = response
          .filter((element) => {
            if (element.orders._id == orderId) {
              return true;
            }
            return false;
          })
          .map((element) => element.orders);

        resolve(orders);
      });
    });
  } catch (error) {
    console.log(error.message);
  }
} 



const getOrderList = (page, limit) => {
    return new Promise((resolve, reject) => {
      Order.aggregate([
        { $unwind: "$orders" },
        { $group: { _id: null, count: { $sum: 1 } } },
      ])
        .then((totalOrders) => {
          const count = totalOrders.length > 0 ? totalOrders[0].count : 0;
          console.log(count,'ghdsc')
          const totalPages = Math.ceil(count / limit);
          const skip = (page - 1) * limit;
  
          Order.aggregate([
            { $unwind: "$orders" },
            { $sort: { "orders.createdAt": -1 } },
            { $skip: skip },
            { $limit: limit },
          ])
            .then((orders) => {
              console.log(orders)
              resolve({ orders, totalPages, page, limit });
            })
            .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    });
  };




  const cancelOrder = async(orderId,status)=>{
    try {
      return new Promise((resolve, reject) => {
        Order.updateOne(
          { "orders._id": new ObjectId(orderId) },
          {
            $set: { "orders.$.orderStatus": status },
          }
        ).then((response) => {
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
}


const generateRazorpay = (userId, total)=> {
  try {
    return new Promise(async (resolve, reject) => {
      let orders = await Order.find({ user: userId });

      let order = orders[0].orders.slice().reverse();
    
      let orderId = order[0]._id;

      var options = {
        amount: total * 100, 
        currency: "INR",
        receipt: "" + orderId,
      };
      console.log("Amount sent to Razorpay:", options.amount)
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
          reject(err)
        } else {
          resolve(order);
        }
      });
      console.log("resolve");
    });
  } catch (err) { 
    console.log("error");
    console.log(err.message);
  }
}

const verifyPayment =  async(details) => {
  try {
    await Order.updateOne({})

    let key_secret = process.env.RAZORPAY_SECRET;
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", key_secret);

      hmac.update(
        details.payment.razorpay_order_id +
          "|" +
          details.payment.razorpay_payment_id
      );
      hmac = hmac.digest("hex");
      if (hmac == details.payment.razorpay_signature) {
        resolve();
      } else {
        console.log('no matchhhhhhhhhhhhh');
        reject("not match");
      }
    });
  } catch (error) {
    console.log(error.message);
  }
}



const changePaymentStatus =  (userId, orderId,razorpayId) => {
  try {
    return new Promise(async (resolve, reject) => {
      await Order.updateOne(
        { "orders._id": new ObjectId(orderId) },
        {
          $set: {
            "orders.$.orderStatus": "Placed",
            "orders.$.paymentStatus": "Success",
            "orders.$.razorpayId": razorpayId
          },
        }
      ),
        await updateStock(userId)
        Cart.deleteMany({ user: userId }).then(() => {
          resolve();
        });
    });
  } catch (error) { 
    console.log(error.message);
  }
}


 




  

module.exports={
    checkStock,
    placeOrder,
    updateStock,
    findOrder,
    getOrderList,
    cancelOrder,
    generateRazorpay,
    verifyPayment,
    changePaymentStatus,

   
}

