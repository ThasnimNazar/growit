const session = require("express-session")
const User=require('../models/userModel')
const Category = require('../models/categoryModel')

const isLogout=async(req,res,next)=>{
    try{
        console.log(req.session?.user_id,"isLogout 1" )
        if(req.session?.user_id){
            console.log("isLogout2")
            res.redirect('/')
            next(); 
         }
        else{  
            console.log("!islogout")
            next();
        }
        
    }
    catch(error){  
        console.log(error.message);
 
    }
}



const isLogin=async(req,res,next)=>{
    try{

        if(req.session?.user_id){
            
            next()
        }else{
            console.log("lout1");
            res.redirect('/login')
        }
       
    }
    catch(error){
        console.log(error.message);

    }
}



const checkSession=async(req,res,next)=>{
    const user=await User.findById(req.session?.user_id)

    res.locals.user=user;
    res.locals.user_id=req.session?.user_id; 
    // console.log(user,'user1')
    res.locals.name=req.session?.username 
    console.log(req.session?.name,'name')
    const isAuthenticated=req.session?.user_id;
    res.locals.isAuthenticated=isAuthenticated; 
    next() 

}



const cartBlocked = async(req, res, next) => {
    console.log(req.session?.user_id,"cartblocked");
    const userData = await User.findById(req.session?.user_id)
    try {
        if(userData?.is_blocked){
          console.log('isblkdd')
            return res.send({status: "blocked"})
        }
        else{
            console.log('isblkdd11')
        next()
        }
    } catch (error) {
        console.log(error.message)
    }
}


const isBlocked = async(req, res, next) => {
        const userData = await User.findById(req.session?.user_id)
        console.log(req.session?.user_id,'is blked')
        try {
            if(userData?.is_blocked){
                res.redirect('/logout')
                //res.redirect('/error_403')
            }
            next()
        } catch (error) {
            console.log(error.message) 
        }
    }


module.exports={

    isLogin,
    isLogout,
    checkSession,
    isBlocked,
    cartBlocked

}            





