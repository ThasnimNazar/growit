const mongoose=require('mongoose')
const Schema=mongoose.Schema;



const categorySchema=mongoose.Schema({
   
    id: { type: Schema.Types.ObjectId, ref: 'Category' },

    name:{
        type:String,
        // required:true,
        unique:true
    },  

    isListed:{    
        type:Boolean,
        default:true
    },

    description:{
        type:String,
        // required:true
    },
    offerPercentage: {
        type: Number,
        default: 0 // Default to 0% discount
      }

   
})


















module.exports=mongoose.model('Category',categorySchema)