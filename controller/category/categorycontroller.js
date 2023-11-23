const Category=require('../../models/categoryModel')
const categoryHelper=require('../../helper/categoryHelper')
const productHelper=require('../../helper/productHelper')
const mongoose = require('mongoose')


const loadcategory=async(req,res)=>{
    try{
   const categories=await Category.find({})
       res.render('category',{categories})
    }
    catch(error)
    {
        console.log(error.message)
    }
}




const loadNewcategory=async(req,res)=>{
    try{
        res.render('addcategory')
    }
    catch(error)
    {
        console.log(error.message)
    }
}

// const newCategory=async(req,res)=>{
//  try{
//     const categoryName=req.body.name.toLowerCase();
//     console.log(req.body)
//     const existingCategory=await Category.findOne({name:categoryName})
//     if(existingCategory){
//         return res.render('addcategory',{message:"Category Alreadt exists"})
//     }
//     if(!req.body.name||req.body.name.trim().length===0)
//     {
//         return res.render('addcategory',{message:"Name is required" })
//     }
//     await categoryHelper.createCategory(req.body)
//     res.redirect('/admin/loadcategories')
//     }
//     catch(error)
//     {
//         console.log(error.message)
//         res.status(500).json({ error: 'Failed to create category' });
//     }
// }

const savecategory = async (req, res) => {
    try{
        const {category , description} = req.body;
        // const newCategory=new Category({
        //    name:category.toLowerCase(),
        //     description:decsription
        // })

        const savedCategory=await categoryHelper.createCategory({category,description})
        
          // The category already exists
       
        res.status(200).json({status : 'success', msg : 'category created successfully',data:savedCategory})
    //     res.redirect('/categorylist?message=category created successfully',savedCategory);
    }
    catch(error){
      // console.error(error);
      res.status(500).json({ status: 'error', msg: error.message });
    }
}
 

const loadUpdateCategory = async(req,res)=>{
  try {
    const id = req.query.id
    const category = await Category.findById(id);
    res.render('updateCategory', { category: category});
  } catch (error) {
    console.log(error.message)
  }
}








// const loadUpdateCategory = async(req,res)=>{
//     try {
//       const id = req.query.id
//       const Categorydata = await categoryHelper.loadUpdateCategory(id)
//       res.render('updateCategory',{category:Categorydata})
//     } catch (error) {
//       console.log(error.message)
//     }
//   }

const updateCategory = async (req, res)=>{
  try {
    const id  = new mongoose.Types.ObjectId(req.body.id)
    //await categoryHelper.updateCategory(categoryId,req.body)
    await Category.findByIdAndUpdate({_id:id},{$set:{name:req.body.name,description:req.body.description}});
    res.redirect('/admin/loadcategories')
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: 'Failed to update category' });
  }
}


  // async function updateCategory(req, res) {
  //   try {
  //     const categoryId  = req.body.id
  //     await categoryHelper.updateCategory(categoryId,req.body)
  //     res.render('updateCategory',{category:category})
  //   } catch (error) {
  //     console.log(error.message)
  //     res.status(500).json({ error: 'Failed to update category' });
  //   }
  // }

 
  

  

const unListCategory = async(req, res)=>{
  try {
    await categoryHelper.unlistCategory(req.query.id)
    res.redirect('/admin/loadcategories')
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
}

const reListCategory = async(req, res)=>{
  try {
    await categoryHelper.reListCategory(req.query.id)
    res.redirect('/admin/loadcategories')
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
}


const categoryOffer = async(req,res)=>{
  try{
    const category = await Category.find({isListed:true})
    res.render('categoryOffer',{category})
  }
  catch(error){
    console.log(error.message)
  }
}



const addCategoryOffer = async (req, res) => {
  try {
    const categoryId = req.body.categoryId; // Assuming you have a categoryId
    const offerPercentage = parseFloat(req.body.offerPercentage);

    // Find the category by its ID and update the offerPercentage
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    category.offerPercentage = offerPercentage;
    await category.save();

    res.json({ message: 'Category offer added successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred' });
  }
};


module.exports={
    loadNewcategory,
    loadcategory,
    savecategory,
    updateCategory,
    loadUpdateCategory,
    unListCategory,
    reListCategory,
    categoryOffer,
    addCategoryOffer
}