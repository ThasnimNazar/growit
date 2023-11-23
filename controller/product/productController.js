const Product = require('../../models/productmodel')
const categorymodel = require('../../models/categoryModel')
const productHelper = require('../../helper/productHelper')
const Wishlist = require('../../models/wishlistModel')
const { ObjectId } = require('mongoose');
const fs = require('fs')   
// const multer=require('../../multer/multer')



const addProduct = async (req, res) => {
  try {
    const categories = await categorymodel.find({})
    res.render('addproduct', { category: categories })
  }
  catch (error) {
    console.log(error.message)
  }
}



// 

const createProduct = async (req, res) => {
  try {
    const category = await categorymodel.find({ status: true })
    res.render('addproduct', { category })
  } catch (error) {
    console.log(error.message)
  }
}

const saveProduct = async(req, res, next) => {
  try {
    const categories = await categorymodel.find({})
    if (!req.body.name || req.body.name.trim().length === 0) {
      return res.status(400).send("Name is required");
    }
    if (!req.body.description || req.body.description.trim().length === 0) {
      return res.status(400).send("Description is required");
    }
    if(req.body.price<=0){
      return res.status(400).send("Product Price Should be greater than 0");
    }
    if(req.body.stock< 0 || req.body.stock.trim().length === 0 ){
      return res.status(400).send("Stock Should be greater than 0");
    }

    const images = req.files.map(file => file.filename);
    console.log(images)
    await productHelper.createProduct(req.body,images)

    res.redirect('/admin/products');
  } catch (error) {
    console.log(error)
    next(error)
  }
}


















// const saveProduct = async (req, res) => {
//   try {
//     console.log("save product here ", req.files , req.body)
//     if (!req.files || req.files.length === 0) {
//       console.log("11 ")
//       return res.status(500).send("no images here")
//     }
//     const images = []
//     for (let i = 0; i < req.files.length; i++) {
//       console.log(req.files[i].filename)
//       images.push(req.files[i].filename)
//     }


//     const { productName, productDescription, price, category, stock } = req.body;
//     //image upload using multer
//     console.log("enter to save")
//     const savedProduct = await productHelper.saveProducts(productName, productDescription, price, images, category, stock)
//     console.log("product addded")
//     res.status(200).json({ status: 'success', msg: 'product created successfully', data: savedProduct })
//     console.log("33")
//   }
//   catch (err) {
//     console.log("err")
//     res.status(500).json({ status: 'error', msg: err.message })
//   }
// }


//   const updateProduct=async(req,res)=>{
//       try{
//         const productId = req.body.id;
//         console.log(productId)
//        const productData = await Product.findById(productId);

//        console.log(req.body,"123456789");
//       const categories = await categorymodel.find({})

//       if (typeof req.body.name !== 'string' || req.body.name.trim().length === 0) {
//         console.log(productData,"1");

//         if (!productData) {
//           return res.status(404).send("Product not found");
//         }

//         return res.render("updateproducts", { message: "Name is required",product:productData,category:categories });
//     }
//     if (!req.body.description || req.body.description.trim().length === 0) {
//       console.log("2");
//       return res.render("updateproducts", { message: "Description is required",product:productData,category:categories });
//   }
//     if(req.body.price<=0){
//       console.log("3");
//       return res.render("updateproducts", { message: "Product Price Should be greater than 0",product:productData,category:categories });
//     }
//     if(req.body.stock<0 || req.body.stock.trim().length === 0 ){
//       console.log("4");
//       return res.render("updateproducts", { message: "Stock Should be greater than 0",product:productData,category:categories });
//     }

//     if(!req.files||req.files.length===0){
//       console.log("5");
//       return res.status(500).send("no images")
//     }
//     const image = []
//     for(let i=0;i<req.files.length;i++){
//       image.push(req.files[i].filename)
//     }

//     const updatedImages = image.length > 0 ? image : productData.image;
//     await productHelper.updateProduct(req.body,updatedImages)
//     res.redirect('/admin/products')
//   }

//     catch(error){
//       console.log (error.message)
//       }
//     }

const updateProduct = async (req, res) => {
  try {
    console.log(req.body)
    const images = req.files ? req.files.map(file => file.filename) : undefined;
      const deletedImages = req.body.deletedImages ? req.body.deletedImages.split(",") : [];
      console.log('update product',deletedImages)
      console.log(deletedImages,'ik')
      const currentProduct = await Product.findById(req.body.id);
      console.log(currentProduct,'nn')


       // If there are new images, add the old image names to the deleted images array
        if (images && images.length > 0) {
            images.forEach((img, index) => {
                const oldImageName = currentProduct.images[index];
                if (oldImageName) {
                    deletedImages.push(oldImageName);
                }
            }); 
        }
      await productHelper.updateProduct(req.body, images, deletedImages)
    console.log("oo");
    res.redirect('/admin/products');


  }
  catch (error) {
    console.log(error.message)
  }
}

    


const displayProduct = async (req, res) => {
  // //  try{
  // //      const products = await Product.find({})
  // //    res.render('productlist',{products:products})    
  // //  }
  // // catch(error){
  // //  console.log(error.message)
  // //   }
  // // }

    


  // // const createProduct=async(req,res)=>{
  // //     try{
  // //       const categories=await categorymodel.find({});
  // //       if(!req.body.name||req.body.name.trim().length===0)
  // //       {
  // //         res.render('addproducts',{message:"Name is required",category:categories})
  // //       }
  // //       if(!req.body.price||req.body.price<=0)
  // //       {
  // //         res.render('addproducts',{message:"price should be greater than 0"})
  // //       }
  // //       if(!req.body.description||req.body.description.trim().length===0)
  // //       {
  // //         res.render('addproducts',{message:"description is required",category:categories})
  // //       }
  // //       if(!req.body.category||req.body.category.trim().length===0)
  // //       {
  // //         res.render('addproducts',{message:"category is required",category:categories})
  // //       }
  // //       if(!req.body.stock||req.body.stock.trim().length===0)
  // //       {
  // //         res.render('addproducts',{message:"stock is required",category:categories})
  // //       }
  // //       const images=req.files.map((file)=>file.filename)

  // //       await productHelper.addProduct(req.body,images)
  // //         res.render("/admin/productlist") 

  // //     }
  // //     catch(error)
  // //     {
  // //         console.log(error.message)
  // //     }
}

const unlistProduct = async (req, res) => {
  try {
    await productHelper.unListProduct(req.query.id)
    res.redirect('/admin/products')
  }

  catch (error) {
    console.log(error.message)
  }
}

const reListProduct = async (req, res) => {
  try {
    const id = req.query.id

    const relist = await Product.findByIdAndUpdate(id, { isProductListed: true, isListed: true });

    res.redirect('/admin/products')
  } catch (error) {
    console.log(error.message);
  }
}

const loadupdateProduct = async (req, res) => {

  try {
    const categories = await categorymodel.find({})
    const id = req.query.id;
    const product = await Product.findOne({ _id: id })
    console.log(categories, product, "l")
    res.render('updateproducts', { product, category: categories })

  } catch (error) {
    console.log(error)

  }
}


   




const loadProduct = async (req, res) => {
  try {
    const products = await Product.find({}).populate('category');

    res.render('productlist', { products })
  }
  catch (error) {
    console.log(error.message)
  }
}


const productpage = async (req, res) => {
  try {
    console.log('this is productpage')
    const category=await categorymodel.find({})
    console.log(category)
    const id = req.query.id;
    console.log(id,'pp')

    // const wishlist = await Wishlist.findOne({
    //   userId: new ObjectId(res.locals.user._id),
    // });

    const product = await Product.findById({ _id: id }).populate('category')
    if (product.isProductListed == true && product.isListed == true) {
      console.log(product.images[0],'this is image')
      res.render('productPage', { product: product,category})
    }
  }
  catch (error) {
    console.log(error.message)
  }
}



















module.exports = {
  unlistProduct,
  loadProduct,
  addProduct,
  createProduct,
  saveProduct,
  reListProduct,
  updateProduct,
  loadupdateProduct,
  productpage,
  // addnewProduct,

}
