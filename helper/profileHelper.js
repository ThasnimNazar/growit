

const Address=require('../models/addressmodel')
const User=require('../models/userModel')

const submitAddress = async (userId, newAddress) => {
    
    const updatedUser = await Address.findOneAndUpdate(
        {user: userId},
        {$push: {address: newAddress}},
        {new: true}
    )
    return updatedUser
}

const createAddress = async (userId, newAddress) => {
    const user=await User.findById(userId);
    console.log("new",newAddress)
    if(user){
    const userAddress = new Address({
        user: userId,
        address: [newAddress]
    })
  
    await userAddress.save()
    console.log("useraddress",
    userAddress)
}
}

module.exports = {
    submitAddress,
    createAddress
}












