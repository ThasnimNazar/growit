const Coupon=require('../models/coupon')
const User=require('../models/userModel')
const Order = require('../models/ordermodel')
const Cart=require('../models/cartModel')
const { ObjectId } = require('mongoose').Types;

const addCoupon = (data) => {
    try {
        return new Promise((resolve, reject) => {
            Coupon.findOne({ couponCode: data.couponCode })
                .then((coupon) => {
                    if (coupon) {
                    resolve({status: false})
                    } else {
                        new Coupon(data).save()
                            .then((response) => {
                            resolve({status:true})
                        })
                    }
                })
        })
    } catch (error) {
        console.log(error.message)
    }
}


const verifyCoupon = (userId, couponCode) => {
    try {
          return new Promise(async(resolve, reject) => {
            const couponExist = await Coupon.findOne({ couponCode: couponCode })
              if (couponExist) {
                if (new Date(couponExist.validity) - new Date() > 0) {
                  const usersCoupon = await User.findOne({
                    _id: userId,
                    coupons: { $in: [couponCode] },
                  });
  
                  if (usersCoupon) {
                    resolve({
                      status: false,
                      message: "Coupon already used by the user",
                    });
                  } else {
                    resolve({
                      status: true,
                      message: "Coupon added successfully",
                    });
                  }
                } else {
                  resolve({ status: false, message: "Coupon have expired" });
                }
              } else {
                resolve({ status: false, message: "Coupon doesn't exist" });
              }
        });
      } catch (error) {
        console.log(error.message)
        reject(error)
      }
  }


  const totalCheckOutAmount = (userId) => {
    try {
      return new Promise(async(resolve, reject) => {
        const data = await Cart.aggregate([
          {
            $match: {
              user: userId,
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
              as: "carted",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$carted", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
            },
          },
        ])
       
          .then((total) => {
            
          resolve(total[0]?.total);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  }


  



  const applyCoupon = (couponCode, total) => {
    try {
        return new Promise((resolve, reject) => {
          Coupon.findOne({ couponCode: couponCode })
            .then((couponExist) => {
            if (couponExist) {
              if (new Date(couponExist.validity) - new Date() > 0) {
                if (total >= couponExist.minPurchase) {
                  let discountAmount = (total * couponExist.minDiscountPercentage) / 100;
                  if (discountAmount > couponExist.maxDiscountValue) {

                    discountAmount = couponExist.maxDiscountValue;
                    resolve({
                      status: true,
                      discountAmount: discountAmount,
                      discount: couponExist.minDiscountPercentage,
                      couponCode: couponCode,
                    });
                  } else {
                    resolve({
                      status: true,
                      discountAmount: discountAmount,
                      discount: couponExist.minDiscountPercentage,
                      couponCode: couponCode,
                    });
                  }
                } else {
                  resolve({
                    status: false,
                    message: `Minimum purchase amount is ${couponExist.minPurchase}`,
                  });
                }
              } else {
                resolve({
                  status: false,
                  message: "Coupon expired",
                });
              }
            } else {
              resolve({
                status: false,
                message: "Coupon doesn't Exist",
              });
            }
          }
        );
      })
    } catch (error) {
        console.log(error.message)
    }
  }



  const addCouponToUser =  (couponCode, userId) => {
    try {
      console.log("addCouponToUser",userId)
      return new Promise(async(resolve, reject) => {
        const orderLength = await Order.findOne({ user: userId }).select('orders').then(order => order.orders.length);

        const updated = await Order.updateOne(
          { user: userId },
          { $set: { [`orders.${orderLength - 1}.couponCode`]: couponCode } }
        )
          .then((couponAdded) => {
            resolve("couponAdded",couponAdded);
          });
        console.log(updated);
      });
    } catch (error) {
      console.log(error.message);
    }
  }

 


module.exports={

    addCoupon,
    verifyCoupon,
    totalCheckOutAmount,
    applyCoupon,
    addCouponToUser

}