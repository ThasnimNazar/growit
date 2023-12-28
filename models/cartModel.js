const mongoose=require('mongoose')

const cartSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'

    },
    cartItems:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product'
            },
            quantity:{
                type:Number
            },
            total:{
                type:Number
                 
            },
            discountedPrice:
            {
            type:Number,
            default:0}
        }
    ],
    
    cartTotal:{
        type:Number
    }
})



module.exports=mongoose.model('Cart',cartSchema)