const Product=require('../models/productmodel')
const Category=require('../models/categoryModel')
const{ObjectId} = require('mongodb')
const fs = require('fs')   

// async function saveProducts(productName,productDescription,price,images,category,stock){
//   try{
//     console.log("entered to save")
//     console.log(productName,productDescription,images,price,category,stock)
//    const newProduct=new Product({
//     name:productName,
//     description:productDescription,
//     price:price,
//     image : images,
//     category:category,
//     stock:stock,
//     status:true
//    }) 
    
//   const savedData=await newProduct.save()
//   return savedData
//   }
//   catch(error){
//    console.log(error.message)
//   }
// }


const createProduct = (data,images) => {
  console.log(images)
  return new Promise((resolve,reject) =>{
    const newProduct = new Product({
      name:data.name,
      description:data.description,
      images:images,
      category:data.category,
      price:data.price,
      stock: data.stock
    });

    newProduct.save()
      .then(() =>{ 
          console.log("Product created successfully");
        resolve() 
      })
      .catch((err) => {
        console.error('Error adding product:', err);
        reject(err)
      });
    });
};
















  

  const unListProduct = (id) => {
    return new Promise((resolve, reject) => {
      // const id = query;
      Product.updateOne({ _id: id }, { isProductListed: false })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.log(error.message);
          reject(error);
        });
    });
  };


  

  const updateProduct = async (data, images,deletedImages) => {
    try {
      const id = (data.id)

      const currentProduct = await Product.find({_id:(id)});
console.log(currentProduct,'mm')
console.log(currentProduct[0].images,"222")
      // If there are new images uploaded
      if(images && images.length > 0 ) {
          // Append new images to the existing ones or replace them as necessary
          console.log(images,'11')
          // console.log(currentProduct.images,"222")
          images.forEach((img, index) => {
              if (currentProduct[0].images[index]) {
                  // If an image already exists at this position, replace it
                  currentProduct[0].images[index] = img;
                 
              } else {
                  // If not, simply add the new image to the end
                  currentProduct[0].images.push(img);
              }
          });
    } 

    if (deletedImages && deletedImages.length > 0) {
      console.log(deletedImages,'22')
  deletedImages.forEach(imgName => {
      console.log("Attempting to delete:", imgName);
      const imagePath = `../views/public/product-images/create-images/ ${imgName}`;
      console.log(fs.existsSync(imagePath),"img exist")
      if (fs.existsSync(imagePath)) {
          fs.unlink(imagePath, err => {
              if (err) {
                  console.error("Error deleting image: ", err.message);
              } else {
                  console.log("Successfully deleted image:", imgName);
              }
          });
      } else {
          console.error("Image not found on server:", imgName);
      }
      
      // Remove from currentProduct.images if it's still there
      const imgIndex = currentProduct[0].images.indexOf(imgName);
      if (imgIndex !== -1) {
          currentProduct[0].images.splice(imgIndex, 1);
      }
  });
}
          const updateQuery = {
            $set: {
              name: data.name,
              description: data.description,
              price:data.price,
              category: data.category,
              stock: data.stock,
              
            }
          };
          if(images && images.length > 0) {
            updateQuery.$set.images = images;
        }
        const productData = await Product.findByIdAndUpdate(
          data.id,
          updateQuery,
          { new: true } // Use { new: true } to return the updated document
        );
    
        return productData;
      
    } catch (error) {
      console.log(error.message);
    }
  }; 

         
     


  const addOffer = async(category,offer)=>{
    return new Promise ((resolve,reject)=>{
        Product.updateMany(
          { Category: category },
          [
            {
              $set: {
                Price: {
                  $subtract: [
                    "$RealPrice",
                    {
                      $multiply: ["$RealPrice", { $divide: [offer, 100] }],
                    },
                  ],
                },
              },
            },
          ],
          { upsert: true }
        ) .then(resolve())
      })
  }


module.exports = {
    createProduct,
    unListProduct,
    updateProduct,
    addOffer
  
}


    

   