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
