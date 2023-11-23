const Categorymodel=require('../models/categoryModel')

const categoryData=async(req,res,next)=>{
    try{
        const category=await Categorymodel.find({isListed:true})
        res.locals=category
        next
    }
    catch(error){
        next(error.message)
    }
}

module.exports={
    categoryData
}





