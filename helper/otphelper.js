 const User=require('../models/userModel')
 const bcrypt=require('bcrypt')

 



 
 const resetPassword=async (mobileno, password) => {
    console.log("in reset pass");
    let Password = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
         
           
                console.log(mobileno, password, "dbbbb");
                User.updateOne({ mobileno: mobileno }, { $set: { password: Password } })
                    .then((data) => {
                        console.log(data, "password changed");
                        resolve()
                    }).catch((error) => {
                        console.log("error resetting password :", error);
                        reject(error)
                    })
           
    })
}

module.exports={resetPassword}     