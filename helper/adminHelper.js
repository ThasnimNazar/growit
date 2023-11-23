const { Order }=require('../models/ordermodel')
const User=require('../models/userModel')
const { ObjectId } = require('mongodb')
const Product = require('../models/productmodel')

const findOrder  = (orderId) => {
    try {
      return new Promise((resolve, reject) => {
        Order.aggregate([
          {
            $match: {
              "orders._id": new ObjectId(orderId)
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
  

  const changeOrderStatus = (orderId, status) => {
    try {
      return new Promise((resolve, reject) => {
        Order.updateOne(
          { "orders._id": new ObjectId(orderId) },
          {
            $set: { "orders.$.orderStatus": status },
          }
        ).then((response) => {
          resolve({status:true,orderStatus:status});
        });
      });
    } catch (error) {
      console.log(error.message);
    }
}

const cancelOrder = (orderId,userId, status) => {
  try {
    return new Promise(async (resolve, reject) => {
      Order.findOne({ "orders._id": new ObjectId(orderId) }).then(async(orders) => {
        const order = orders.orders.find((order) => order._id == orderId);
        if(order.paymentMethod=='cod'){
          if (status == 'Cancel Accepted') {
            Order.updateOne(
              { "orders._id": new ObjectId(orderId) },
              {
                $set: {
                  "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "No Refund"
                }
              }
            )
            .then(async(response) => {
              await addToStock(orderId,userId)
              resolve(response);
            });
          }else if(status == 'Cancel Declined'){
            Order.updateOne(
              { "orders._id": new ObjectId(orderId) },
              {
                $set: {
                  "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "No Refund"
                }
              }
            ).then(async(response) => {
              resolve(response);
            });
          }
        }else if(order.paymentMethod=='razorpay'){
                  console.log(status,"sts");
          if(status == 'Cancel Accepted'){
            Order.updateOne(
              { "orders._id": new ObjectId(orderId) },
              {
                $set: {
                  "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "Cancel Accepted"
                }
              }
            ).then(async (response) => {
              console.log('aha')
              const user = await User.findOne({ _id: userId});
             
              user.wallet += parseInt(order.totalPrice);
              console.log(user,'ahad')
              await user.save();
              await addToStock(orderId,userId)
             
           
              resolve(response);
            });
          }else if(status == 'Cancel Declined'){
            Order.updateOne(
              { "orders._id": new ObjectId(orderId) },
              {
                $set: {
                  "orders.$.cancelStatus": status,
                  "orders.$.orderStatus": status,
                  "orders.$.paymentStatus": "No Refund"
                }
              }
            ).then((response) => {
              resolve(response);
            });
          }
        }
      });
    });
    
  } catch (error) {
    console.log(error.message);
  }
}






const getOnlineCount = async () => {
  try {
    const response = await Order.aggregate([
      { $unwind: "$orders" },
      {
        $match: {
          "orders.paymentMethod": "razorpay",
          "orders.orderStatus": "Delivered"
        }
      },
      {
        $group: {
          _id: null,
          totalPriceSum: { $sum: { $toInt: "$orders.totalPrice" } },
          count: { $sum: 1}
        }
      }
    ])
    return response
  } catch (error) {
    console.error("Error fetching online count: ", error)
    throw error
  }
}

const addToStock = async(orderId,userId)=>{
  Order.findOne({ "orders._id": new ObjectId(orderId) }).then(async(orders) => {
    const order = orders.orders.find((order) => order._id == orderId);
    const cartProducts = order.productDetails
    for(const cartProduct of cartProducts ){
      const productId = cartProduct.productId;
      const quantity = cartProduct.quantity;
      const product = await Product.findOne({_id:productId})
      await Product.updateOne({_id:productId},
        {$inc:{stock:quantity}}
        )
    }
  })
}


const getCodCount = async () => {
  try {
    const response = await Order.aggregate([
      { $unwind: "$orders" },
      {
        $match: {
          "orders.paymentMethod": "cod",
          "orders.orderStatus": "Delivered"
        }
      },
      {
        $group: {
          _id: null,
          totalPriceSum: { $sum: { $toInt: "$orders.totalPrice" } },
          count: { $sum: 1}
        }
      }
    ])
    return response
  } catch (error) {
    console.error("Error fetching online count: ", error)
    throw error
  }
}

const getSalesReport = async () => {
  try {
    const response = await Order.aggregate([
      { $unwind: "$orders" },
      { $match: { "orders.orderStatus": "Delivered"}}
    ])
    return response
  } catch (error) {
    console.log(error.message)
  }
}


const postReport = async (date) => {
  try {
    const start = new Date(date.startdate)
    const end = new Date(date.enddate)
    const response = await Order.aggregate([
      { $unwind: "$orders" },
      {
        $match: {
          $and: [
            {
              "orders.createdAt": {
                $gte: start,
                $lte: new Date(end.getTime() + 86400000)
              }
            }
          ]
        }
      }
    ]).exec()

    return response
  } catch (error) {
    console.log(error.message)
  }
}


const getsSalesReport = async () => {
  try {
    const response = await Order.aggregate([
      { $unwind: "$orders" },
      { $match: { "orders.orderStatus": "Delivered"}}
    ])
    return response
  } catch (error) {
    console.log(error.message)
  }
}




  module.exports={
    findOrder,
    changeOrderStatus,
    cancelOrder,
    getCodCount,
    getOnlineCount,
    getSalesReport,
    postReport,
    getsSalesReport

  }