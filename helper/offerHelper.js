const Product = require('../models/productmodel')
const Category = require('../models/categoryModel')

const addOfferPriceforSingleProduct = async(id)=>{
    try {
       let product = await Product.findById(id).populate("category")
       let discountedPrice
      if(product.isProductListed == true){
       if (product.discountPercentage > 0 ) {
           if (product.discountPercentage) {
               if (product.discountPercentage) {
                   discountedPrice = Math.floor(product.price - (product.price * (product.discountPercentage / 100)));
               } else {
                   discountedPrice = Math.floor(product.price - (product.price * (product.category.discountPercentage / 100)));
               }
           } else {
               discountedPrice = product.price - (product.price * ((product.discountPercentage + product.category.discountPercentage) / 100));
           }
       } else if (product.discountPercentage > 0) {
           discountedPrice = product.price - (product.price * (product.discountPercentage / 100));
       } else if (product.category.discountPercentage > 0) {
           discountedPrice = product.price - (product.price * (product.category.discountPercentage / 100));
       }
   
       await Product.findByIdAndUpdate(id, {
           $set: {
               discountedPrice: discountedPrice
           }
       })
      }
    }
      catch(error){
        console.log(error.message)
      }
    }

    const addOfferPrice = async (id) => {
        try {
            let products = await Product.find({_id:id})
            console.log(products)

            for (let product of products) {
              
                let discountedPrice = 0
                if( product.isProductListed == true){
                    console.log('pp')
                    if (product.discountPercentage > 0 ) {
                        console.log('oo')

                        if (product.discountPercentage) {
                           
                                discountedPrice = product.price - (product.price * (product.discountPercentage / 100));
                                
                            } 
                        // } else {
                        //     discountedPrice = product.price - (product.price * ((product.discountPercentage + product.category.discountPercentage) / 100));
                        // }
                    } else if (product.discountPercentage > 0) {
                        discountedPrice = product.price - (product.price * (product.discountPercentage / 100));
                    // } else if (product.category.discountPercentage > 0) {
                    //     discountedPrice = product.price - (product.price * (product.category.discountPercentage / 100));
                    // }
                    await Product.findByIdAndUpdate(product.id, {
                        $set: {
                            discountedPrice: discountedPrice
                        }
                    })
                }
                } 
            } 
        }              
         catch (error) {
            console.error(error.message);
        }
    }
    



    module.exports = {
        addOfferPriceforSingleProduct,
        addOfferPrice
    }