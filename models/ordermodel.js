const mongoose=require('mongoose')

const OrderSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    orders:{
        type:Array,
        required:true
    }

})

const Order=mongoose.model('Order', OrderSchema)

module.exports={
    Order
}