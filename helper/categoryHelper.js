const Category=require('../models/categoryModel')
const Product=require('../models/productmodel')


// const createCategory=(category, description)=>{
//     return new Promise(async(resolve,reject)=>{
//         const saveCategory =new Category({
//             name:category.toLowerCase(),
//             description:description
//         })
//         saveCategory.save()
//         .then(savedCategory=>{
//             resolve(savedCategory)
//         })
//         .catch(error=>{
//             reject(error)
//         })
//         })
//     }

async function createCategory({category,description}) {
    try{
            const categoryRegex = new RegExp(`^${category}$`, 'i');
            const existingCategory = await Category.findOne({ name: categoryRegex });

            // const existingCategory=await Category.findOne({name:category.toLowerCase()})
            if(existingCategory)
            {
                throw new error("category already exists")
            }
                //create new category
                const newcategory=new Category({
                    name:category.toLowerCase(),
                    description:description
                })
                 const savedCategory=await newcategory.save();
                 return savedCategory;
            }
        catch(error){
         console.log(error.message)
        }
    }

    const updateCategory = async(categoryId,data)=>{
        try {
            await Category.findByIdAndUpdate({_id:categoryId},{$set:{name:data.category,description:data.description}});
          } catch (error) {
            console.log(error.message)
          }
        }

async function unlistCategory(categoryId){
    try{
const category=await Category.findByIdAndUpdate(categoryId,{isListed:false})
await Product.updateMany(
    { category: categoryId },
    { $set: { isListed: false } }
);

if(!category)
{
    console.log({message:"category not found"})
}
  return category
    }
    catch(error)
    {
        console.log(error.message)
    }
}

async function reListCategory(categoryId)
{
    try{
    const category=await Category.findByIdAndUpdate(categoryId,{isListed:true})
    await Product.updateMany(
        { category: categoryId },
        { $set: { isListed: false } }
    );

    if(!category)
{
    console.log({message:"category not found"})
}
  return category
    }
    catch(error)
    {
        console.log(error.message)
    }
}

const getCategory=async(req,res)=>{
    const category=await Category.find({})
    return category
}

 const addCategoryOffer = async (category, offer) => {
    let Offer=parseFloat(offer)
    if (!isNaN(Offer)) {
     return new Promise((resolve, reject) => {
             
                 Category.findOneAndUpdate({ Category: category }, { $set: { OfferPercentage: Offer } }).then(() => {

                             resolve()
                         

                 })
             
     })
 }
}






    module.exports={
        createCategory,
        updateCategory,
        unlistCategory,
        reListCategory,
        getCategory,
        addCategoryOffer
        
    }








    