const Product = require('../models/productmodel')
const Category = require('../models/categoryModel')

const addOfferPriceforSingleProduct = async(id)=>{
    try {
       let product = await Product.findById(id).populate("category")
       let discountedPrice
      if(product.isProductListed == true&& product.isCategoryListed ==true){
       if (product.discountPercentage > 0 && product.category.discountPercentage > 0) {
           if (product.discountPercentage + product.category.discountPercentage >= 99) {
               if (product.discountPercentage >= product.category.discountPercentage) {
                   discountedPrice =  Math.round(product.price - (product.price * (product.discountPercentage / 100)));
               } else {
                   discountedPrice = Math.round(product.price - (product.price * (product.category.discountPercentage / 100)));
               }
           } else {
               discountedPrice = Math.round(product.price - (product.price * ((product.discountPercentage + product.category.discountPercentage) / 100)));
           }
       } else if (product.discountPercentage > 0) {
           discountedPrice = Math.round(product.price - (product.price * (product.discountPercentage / 100)));
       } else if (product.category.discountPercentage > 0) {
           discountedPrice = Math.round(product.price - (product.price * (product.category.discountPercentage / 100)));
       }   

       discountedPrice = Math.round(discountedPrice);
   
       await Product.findByIdAndUpdate(id, {
           $set: {
               discountedPrice: discountedPrice
           }
       })
      }
       
    } catch (error) {
      console.error(error.message); 
    }
   }

   

    const addOfferPrice = async (id) => {
        try {
            let products = await Product.find({ category: id }).populate('category');

            for (let product of products) {
                let discountedPrice = 0
                if(product.isCategoryListed == true && product.isProductListed == true){
                    if (product.discountPercentage > 0 && product.category.discountPercentage > 0) {

                        if (product.discountPercentage + product.category.discountPercentage >= 99) {
                            if (product.discountPercentage >= product.category.discountPercentage) {
                                discountedPrice =  Math.round(product.price - (product.price * (product.discountPercentage / 100)));
                            } else {
                                discountedPrice =  Math.round(product.price - (product.price * (product.category.discountPercentage / 100)));
                            }
                        } else {
                            discountedPrice =  Math.round(product.price - (product.price * ((product.discountPercentage + product.category.discountPercentage) / 100)));
                        }
                    } else if (product.discountPercentage > 0) {
                        discountedPrice =  Math.round(product.price - (product.price * (product.discountPercentage / 100)));
                    } else if (product.category.discountPercentage > 0) {
                        discountedPrice =  Math.round(product.price - (product.price * (product.category.discountPercentage / 100)));
                    }
                    discountedPrice = Math.round(discountedPrice);
                    await Product.findByIdAndUpdate(product._id, {
                        $set: {
                            discountedPrice: discountedPrice
                        }
                    })
                }
                }
                
        } catch (error) {
            console.error(error.message);
        }
    }
    



    module.exports = {
        addOfferPriceforSingleProduct,
        addOfferPrice
    }