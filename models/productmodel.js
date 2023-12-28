const mongoose=require('mongoose')
const Schema=mongoose.Schema;

const productSchema=mongoose.Schema({
    
     id: { type: Schema.Types.ObjectId, ref: 'Product' },

    name:{
        type:String,
        required:true
    },
    

    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },

    images:{
        type:Array,
        required:true
    },

    category:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    },

    stock:{
        type:Number,
        default:0
     },

    //  status:{
    //     type:Boolean,
    //     default:true
    // },
    
    discountPercentage:{      
        type:Number,
        default:0
    },discountValidity:{
        type: Date,
        default: new Date()
    },
    discountedPrice:{
      type:Number,
      default:0
    },
    isListed:{
        type:Boolean,
        default:true
      },

    isProductListed:{
        type:Boolean,
        default:true
      },

      isCategoryListed:{
        type:Boolean,
        default:true
      },
    })
    
    
    const Product = mongoose.model('Product', productSchema);



    module.exports=Product



    

