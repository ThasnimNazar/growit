const mongoose=require("mongoose");

const WishlistSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    products:{
        type:Array,
        required:true
    }
});


           



module.exports= mongoose.model("Wishlist",WishlistSchema)



