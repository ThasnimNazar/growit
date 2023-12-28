const Product=require('../models/productmodel')
const Cart=require('../models/cartModel')
const Address=require('../models/addressmodel')
const User=require('../models/userModel')
const { ObjectId } = require('mongoose').Types;

    
const addCart = async (productId, userId) => {
    const product = await Product.findOne({ _id: productId }).populate('category')
    console.log(product,'pl')
    let  productObj
    let discountPercentage = product.category.discountPercentage+product.discountPercentage
    console.log(product.category.discountPercentage,product.discountPercentage,'see')
    if( discountPercentage >0&&discountPercentage<=99){
         productObj = {
            productId: productId,
            quantity: 1,
            total: (product.price)-((product.price)*discountPercentage)/100,
            discountedPrice: (product.price)-((product.price)*discountPercentage)/100    
        }
        console.log(productObj,'key')
    }else if(discountPercentage >99){
        if(product.category.discountPercentage>=product.discountPercentage){
            productObj = {
                productId: productId,
                quantity: 1,
                total: (product.price)-((product.price)*discountPercentage)/100,
                discountedPrice: Math.floor((product.price)-((product.price)*product.category.discountPercentage)/100)
            }    
        }else{
            productObj = {
                productId: productId,
                quantity: 1,
                total: (product.price)-((product.price)*discountPercentage)/100,
                discountedPrice: Math.floor((product.price)-((product.price)*product.discountPercentage)/100)
            }
        }
        
    }
    else{
        productObj = {
            productId: productId,
            quantity: 1,
            total: product.price,
        } 
        console.log("addToCart ;productObj",productObj);
    }

            
       
    
    try {
        return new Promise(async (resolve, reject) => {
            const quantity = await Cart.aggregate([
                { $match: { user: userId } },
                { $unwind: "$cartItems" },
                { $match: { "cartItems.productId": new ObjectId(productId) } },
                { $project: { "cartItems.quantity": 1 } }
            ])
            console.log(quantity,'qua') 
            console.log(userId,'arr')  
           
            Cart.findOne({ user: userId }).then(async (cart) => {
                if (cart) {
                    const productExist = await Cart.findOne({ user: userId, 'cartItems.productId': productId })
                    console.log(productExist,'los')
                    if (productExist) {
                        if (product.stock - quantity[0].cartItems.quantity > 0) {
                            console.log(product.stock,'st')
                            if(discountPercentage >0&&discountPercentage<=99){
                                Cart.updateOne(
                                    { user: userId, "cartItems.productId": productId },
                                    {
                                        $inc: {
                                            'cartItems.$.quantity': 1,
                                            'cartItems.$.total': (product.price)-((product.price)*discountPercentage)/100,
                                        },
                                        $set: {
                                            cartTotal: cart.cartTotal + (product.price)-((product.price)*discountPercentage)/100
                                        }
                                    }
                                ).then((response) => {
                                    resolve({response, status: true })
                                })
                            }else if(discountPercentage>99){
                                if(product.category.discountPercentage>=product.discountPercentage){
                                    Cart.updateOne(
                                        { user: userId, "cartItems.productId": productId },
                                        {
                                            $inc: {
                                                'cartItems.$.quantity': 1,
                                                'cartItems.$.total': (product.price)-((product.price)*product.category.discountPercentage)/100,
                                            },
                                            $set: {
                                                cartTotal: cart.cartTotal + (product.price)-((product.price)*product.category.discountPercentage)/100
                                            }
                                        }
                                    ).then((response) => {
                                        resolve({response, status: true })
                                    })
                                }else{
                                    Cart.updateOne(
                                        { user: userId, "cartItems.productId": productId },
                                        {
                                            $inc: {
                                                'cartItems.$.quantity': 1,
                                                'cartItems.$.total': (product.price)-((product.price)*product.discountPercentage)/100,
                                            },
                                            $set: {
                                                cartTotal: cart.cartTotal + (product.price)-((product.price)*product.discountPercentage)/100
                                            }
                                        }
                                    ).then((response) => {
                                        resolve({response, status: true })
                                    })
                                }
                            }else{
                                Cart.updateOne(
                                    { user: userId, "cartItems.productId": productId },
                                    {
                                        $inc: {
                                            'cartItems.$.quantity': 1,
                                            'cartItems.$.total': product.price,
                                        },
                                        $set: {
                                            cartTotal: cart.cartTotal + product.price
                                        }
                                    }
                                ).then((response) => {
                                    resolve({response, status: true })
                                })
                            }
                                    
                        } else {
                            resolve({status: "outOfStock"})
                        }
                    } else {
                        if (product.stock > 0) {
                            if(discountPercentage >0&&discountPercentage<=99){
                                Cart.updateOne(
                                    { user: userId },
                                    {
                                        $push: { cartItems: productObj },
                                        $inc: { cartTotal:  (product.price)-((product.price)*discountPercentage)/100 }
                                    }
                                ).then((response) => {
                                    resolve({ status: true })
                                })
                            }else if(discountPercentage >99){
                                if(product.category.discountPercentage>=product.discountPercentage){
                                    Cart.updateOne(
                                        { user: userId },
                                        {
                                            $push: { cartItems: productObj },
                                            $inc: { cartTotal:  Math.floor((product.price)-((product.price)*product.category.discountPercentage)/100) }
                                        }
                                    ).then((response) => {
                                        resolve({ status: true })
                                    })
                                }else{
                                    Cart.updateOne(
                                        { user: userId },
                                        {
                                            $push: { cartItems: productObj },
                                            $inc: { cartTotal:  Math.floor((product.price)-((product.price)*product.discountPercentage)/100) }
                                        }
                                    ).then((response) => {
                                        resolve({ status: true })
                                    })
                                }  
                               
                            }else{
                                Cart.updateOne(
                                    { user: userId },
                                    {
                                        $push: { cartItems: productObj },
                                        $inc: { cartTotal:  product.price }
                                    }
                                ).then((response) => {
                                    resolve({ status: true })    
                                }) 
                            }
                               
                            
                        } else {
                            resolve({ status: false })
                        }
                    }
                } else {
                    if (product.stock > 0) {
                        if(discountPercentage >0&&discountPercentage<=99){
                            const newCart = await Cart({
                                user: userId,
                                cartItems: productObj,
                                cartTotal: (product.price)-((product.price)*discountPercentage)/100,
                            })
                            await newCart.save().then((response) => {
                                resolve({ status: true })
                            })
                        }else if(discountPercentage >99){
                            if(product.category.discountPercentage>=product.discountPercentage){
                                const newCart = await Cart({
                                    user: userId,
                                    cartItems: productObj,
                                    cartTotal: Math.floor((product.price)-((product.price)*product.category.discountPercentage)/100),
                                })
                                await newCart.save().then((response) => {
                                    resolve({ status: true })
                                })
                            }else{
                                const newCart = await Cart({
                                    user: userId,
                                    cartItems: productObj,
                                    cartTotal: product.price   
                                })
                                await newCart.save().then((response) => {
                                    resolve({ status: true })
                                })
                            }
                            
                        }else{
                            const newCart = await Cart({
                                user: userId,
                                cartItems: productObj,
                                cartTotal: product.price
                            })
                            await newCart.save().then((response) => {
                                resolve({ status: true })
                            })
                        }
                            
                        
                    } else {
                        resolve({ status: false })
                    }
                }
            })

        })
    } catch (error) {
        console.error(error.message);
    }
}


const getCartCount = (userId) => {
    return new Promise((resolve, reject) => {
        let count = 0
        Cart.findOne({user: userId}).then((cart) => {
            if(cart){
                count = cart.cartItems.length
            }
            resolve(count)
        })
        
    })
}

const updateQuantity = async(data) => {
    const cartId = data.cartId;
    const proId = data.proId;
    const userId = data.userId;
    const count = data.count;
    const quantity = data.quantity;
    const product = await Product.findOne({ _id: proId }).populate('category')
    const discountPercentage = product.category.discountPercentage+product.discountPercentage
    const discountedPrice = (product.price)-((product.price)*discountPercentage)/100
    try {
        return new Promise(async (resolve, reject) => {
            if (quantity == 1 && count == -1) {
                if(discountPercentage >0){
                    Cart.findOneAndUpdate(
                        { _id: cartId, "cartItems.productId": proId },
                        {
                            $pull: { cartItems: { productId: proId } },
                            $inc: { cartTotal: discountedPrice * count }
                        }
                    ).then(() => {
                        resolve({ status: true })
                    })
                }else{
                    Cart.findOneAndUpdate(
                        { _id: cartId, "cartItems.productId": proId },
                        {
                            $pull: { cartItems: { productId: proId } },
                            $inc: { cartTotal: product.price * count }
                        }
                    ).then(() => {
                        resolve({ status: true })
                    })
                }
            } else {
                if (product.stock - quantity < 1 && count == 1) {
                    resolve({ status: 'Out of stock' })
                } else {
                        if(discountPercentage>0){
                            Cart.updateOne(
                                { _id: cartId, "cartItems.productId": proId },
                                {
                                    $inc: {
                                        "cartItems.$.quantity": count,
                                        "cartItems.$.total": discountedPrice * count,
                                        cartTotal: discountedPrice * count
                                    }
                                }
        
                            ).then(() => {
                                Cart.findOne(
                                    { _id: cartId, "cartItems.productId": proId },
                                    { "cartItems.$": 1, cartTotal: 1 }
                                ).then(async (cart) => {
                                    const newQuantity = cart.cartItems[0].quantity;
                                    const newSubTotal = cart.cartItems[0].total;
                                    const cartTotal = cart.cartTotal
                                    resolve({ status: true, newQuantity: newQuantity, newSubTotal: newSubTotal, cartTotal: cartTotal });
                                })
                            })
                        }else{
                            if(discountPercentage>0){
                                Cart.updateOne(
                                    { _id: cartId, "cartItems.productId": proId },
                                    {
                                        $inc: {
                                            "cartItems.$.quantity": count,
                                            "cartItems.$.total": discountedPrice * count,
                                            cartTotal: discountedPrice * count
                                        }
                                    }
            
                                ).then(() => {
                                    Cart.findOne(
                                        { _id: cartId, "cartItems.productId": proId },
                                        { "cartItems.$": 1, cartTotal: 1 }
                                    ).then(async (cart) => {
                                        const newQuantity = cart.cartItems[0].quantity;
                                        const newSubTotal = cart.cartItems[0].total;
                                        const cartTotal = cart.cartTotal
                                        resolve({ status: true, newQuantity: newQuantity, newSubTotal: newSubTotal, cartTotal: cartTotal });
                                    })
                                })
                            }
                            else{
                                Cart.updateOne(
                                    { _id: cartId, "cartItems.productId": proId },
                                    {
                                        $inc: {
                                            "cartItems.$.quantity": count,
                                            "cartItems.$.total": product.price * count,
                                            cartTotal: product.price * count
                                        }
                                    }
            
                                ).then(() => {
                                    Cart.findOne(
                                        { _id: cartId, "cartItems.productId": proId },
                                        { "cartItems.$": 1, cartTotal: 1 }
                                    ).then(async (cart) => {
                                        const newQuantity = cart.cartItems[0].quantity;
                                        const newSubTotal = cart.cartItems[0].total;
                                        const cartTotal = cart.cartTotal
                                        resolve({ status: true, newQuantity: newQuantity, newSubTotal: newSubTotal, cartTotal: cartTotal });
                                    })
                                })
                            }
                            }
                           
                    
                }
            }
        })

    } catch (error) {
        console.error(error.message);
    }
}





const deleteproducts = async (data) => {
    const cartId = data.cartId
    console.log(cartId,'cartId')
    const proId = data.proId
    console.log(proId,'productId')
    const userId = new ObjectId(data.userId);
    console.log(userId,'useri')
    const product = await Product.findOne({ _id: proId }).populate('category')
    console.log(product,'xx')
    const cart = await Cart.findOne({ _id: cartId })
    console.log(cart,'mm')
     const result = await Cart.aggregate([{$match:
    {user:userId}},
    {$unwind:"$cartItems"},
    {$match:{"cartItems.productId": new ObjectId(proId)}},
    {$project:{"cartItems.discountedPrice":1,_id:0}}
   ])
   console.log("deleteProduct",result);
    try {
        const cartItem = cart.cartItems.find(item => item.productId.equals(proId))
        const quantityToRemove = cartItem.quantity
        const categoryDiscountPercentage = product.category.discountPercentage
        const productDiscountPercentage = product.discountPercentage
        const discountedPrice = result[0].cartItems.discountedPrice
        return new Promise(async(resolve,reject)=>{
                if(categoryDiscountPercentage>0||productDiscountPercentage>0){
                    Cart.updateOne(
                        { _id: cartId, 'cartItems.productId': proId },
                        {
                            $inc: { cartTotal: discountedPrice * quantityToRemove * -1 },
                            $pull: { cartItems: { productId: proId } }
                        }
                    ).then(() => {
                        resolve({ status: true })
                    })
                }else{
                    Cart.updateOne(
                        { _id: cartId, 'cartItems.productId': proId },
                        {
                            $inc: { cartTotal: product.price * quantityToRemove * -1 },
                            $pull: { cartItems: { productId: proId } }
                        }
                    ).then(() => {
                        resolve({ status: true })
                    })
                }
                
            
        })
        
    } catch (error) {
        console.error(error.message);
    }
}







module.exports={
    addCart,
    getCartCount,
    updateQuantity,
    deleteproducts,

}


