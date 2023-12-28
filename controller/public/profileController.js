const User=require('../../models/userModel')
const Category=require('../../models/categoryModel')
const profileHelper=require('../../helper/profileHelper')
const Address=require('../../models/addressmodel')
const cartHelper=require('../../helper/cartHelper')

const profile = async(req,res,next)=>{
    try{
    const usercart = res.locals.user;
    const category = await Category.find({})
    const count = await cartHelper.getCartCount(usercart.id)
    const user = res.locals.user
    const address = await Address.find({user: usercart._id.toString()})
    if(address){
        const ad = address.forEach((x) => {
            return (arr = x.address)
        })

    const user = res.locals.user
    res.render('userProfile', { user, count ,category,ad});
    }
  } catch (error) {
    console.log(error.message)
    next(error);
}
}


const editInfo = async (req, res, next) => {
    try {
      const userId = res.locals.user._id;
      const { name, email, mobile } = req.body;
      const result = await User.updateOne(
        { _id: userId }, // Specify the user document to update based on the user ID
        { $set: { name, email, mobile } } // Set the new field values
      );
      res.redirect("/profile");
    } catch (error) {
      console.log(error.message);
      next(error);
    }
}


const loadAddress = async(req,res)=>{
    try{
        const category = await Category.find({})
        let arr = []
        const user = res.locals.user
        const address = await Address.find({user: user._id.toString()})
        if(address){
            const ad = address.forEach((x) => {
                return (arr = x.address)
            })
            console.log(ad,arr,"k");
     res.render('loadAddress',{category,arr})
    }
}
    catch(error){
        console.log(error.message)
    }
}

const loadaddAddress = async(req,res)=>
{
    try{
        const category = await Category.find({})
        res.render('addAddress',{category})
    }
    catch(error){
        console.log(error.message)
    }
}




const submitAddress = async(req,res)=>
{
    try{
     const userId=res.locals.user_id
    //  console.log(userId,req.body,"yy")
     const name=req.body.name;
     const mobileNumber=req.body.mobileno;
     const address=req.body.address;
     const locality=req.body.locality;
     const city=req.body.city;
     const pincode=req.body.pincode;
     const state=req.body.state;

     const newAddress = {
        name: name,
        mobileNumber: mobileNumber,
        address: address,
        locality: locality,
        city: city,
        pincode: pincode,
        state: state
    };

3
    const updatedUser = await profileHelper.submitAddress(userId, newAddress)
    if(!updatedUser){
        console.log("!updt user");
        await profileHelper.createAddress(userId, newAddress)
    }
    
    res.json({message: "Address saved successfully"})

    }
    catch(error){
        console.log(error.message)
    }
}

const loadEdit = async(req,res)=>{
    const category = await Category.find({})
    const id = req.query.id
    const user = res.locals.user._id
    const address = await Address.findOne({user:user, 'address._id':id},
    { 'address.$': 1 })
    console.log(address,"h",address.address[0],"addressedit")
    res.render('editAddress',{category,address:address.address[0]}) 
}






const editAddress = async (req, res) => {
    try{
        console.log('enter')
    const id = req.body.id;
    console.log(id,'12')
    const name = req.body.name;
    console.log(name,'13')
    const mobileNumber = req.body.mobileno;
    const address = req.body.address;
    const locality = req.body.locality;
    const city = req.body.city;
    const pincode = req.body.pincode;
    const state = req.body.state;
  


  
    const update = await Address.updateOne(
      { "address._id": id }, 

      {
        $set: {
          "address.$.name": name,
          "address.$.mobileNumber": mobileNumber,
          "address.$.address": address,
          "address.$.locality": locality,
          "address.$.city": city,
          "address.$.pincode": pincode,
          "address.$.state": state,
        },
      }
    );
    console.log(update)
    }
    catch(error){
        console.log(error.message)
    }

}






const deleteAddress = async (req, res) => {
    console.log("here1");
    const userId = res.locals.user._id;
    const addId = req.body.addressId;
  
    const deleteobj = await Address.updateOne(
      { user: userId }, 
      { $pull: { address
        
        
        : { _id: addId } } }
    );
    console.log(userId,addId,"here1");
  
    // res.redirect("/Address");
  }






 






module.exports={
    profile,
    loadAddress,
    submitAddress,
    loadaddAddress,
    editAddress,
    loadEdit,
    deleteAddress,
    editInfo,
    


}





