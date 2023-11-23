const mongoose=require('mongoose')
const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobileno:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true
    },
    is_blocked:{
        type:Boolean,
        default:false,
        required:true
    },
    wallet: {
        type: Number,
        default: 0
    },
    walletTransaction: {
        type: Array,
       
    },


    referralCode:{
        type:String,
        unique:true,
        required:true
    },
    referrals: [{
        referredUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Reference to the User collection
        },
        dateReferred: {
          type: Date,
          default: Date.now,
        },
      }],
})










module.exports=mongoose.model('User',userSchema)