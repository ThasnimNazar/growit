const { application } = require('express');
const User = require('../../models/userModel')
const bcrypt = require('bcrypt')
const Category = require('../../models/categoryModel')
const Product = require('../../models/productmodel')
const cartHelper= require('../../helper/cartHelper')
const couponHelper= require('../../helper/couponHelper')
const Banner = require('../../models/bannermodel')
const Wishlist = require('../../models/wishlistModel')
const { ObjectId } = require('mongoose')
const { query } = require('express')       
    



const accountSid = "ACddb6e92af5e063621abc032239cdf9ed";
const authToken = "df6599d3981a6d20cde3837b9297fbaf";
const verifySid = "VA6873f5c6b027b1a76fe16aaa3a0e4336";
const client = require("twilio")(accountSid, authToken);
require('dotenv').config()

const otpHelper = require('../../helper/otphelper')
const categoryhelper=require('../../helper/categoryHelper')
const jwt = require('jsonwebtoken')
     

const Securepassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    }
    catch (error) {
        console.log(error.message)
    }
}


const Loadregister = async (req, res) => {
    try {
        const category=await Category.find({})
        res.render("signUp", { message: "" ,category})
    }
    catch (error) {
        console.log(error.message)
    }
}






const verifyNumber = async (req, res) => {
    try {
        const category=await Category.find({})
        console.log(req.body.mobileno, "veri num u-c")
        const mobileno = req.body.mobileno
        const existinguserwithMobile = await User.findOne({ mobileno: req.body.mobileno })

        const indianMobileRegex = /^[6789]\d{9}$/;

        if (!indianMobileRegex.test(mobileno)) {
            return res.render("signUp", { message: "Please enter a valid Indian mobile number.", formData: req.body ,category});
        }

        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(mobileno)) {
            return res.render("signUp", { message: "Mobile Number should have 10 digits!", formData: req.body ,category});
        }

        const mobilePattern = /^[1-9]\d{9}$/; // Allows any non-zero digit followed by 9 digits
        if (!mobilePattern.test(mobileno)) {
            res.render("signUp", { message: "Invalid Mobile pattern!" ,category})
        }

        if (existinguserwithMobile) {
            return res.render("signUp", { message: "user with mobile no exists!",category })
        }
        client.verify.v2
            .services(verifySid)
            .verifications.create({ to: `+91${mobileno}`, channel: "sms" })
            .then((verification) => {
                console.log(verification.status)

                res.render('otpverification', { mobileno: mobileno ,message:'',category})
            }).catch((err)=>{
                console.log(err,"tttt");
                res.render("signUp", { message: err ,category})
            })
    }
    catch (error) {
        console.log(error.message)
    }  
}


function generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 6;
    let referralCode = '';
  
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      referralCode += characters.charAt(randomIndex);
    }
  
    return referralCode;
  }


const insertUser = async (req, res) => {
    try {
        //  const spassword=await Securepassword(password)
        const category = await Category.find({})
        const mobile =req.session.mobileno
        const { name, email, password, mobileno } = req.body
        console.log(email)
        const existingUserwithEmail = await User.findOne({ email: req.body.email })
        const existinguserwithMobile = await User.findOne({ mobileno: req.body.mobileno })
        const spassword = await Securepassword(password)

        let referralCode = req.body.enteredReferralCode;

        const referringUser = await User.findOne({ referralCode: referralCode });
        if (!referralCode || referringUser) {
            // Generate a unique referral code for the user
            referralCode = generateReferralCode(); // Assuming you have a function to generate referral codes
  
            const userReferral = {
              referredUserId: null, // The referred user hasn't signed up yet
              dateReferred: new Date(),
            };
  
            if (referringUser) {
              userReferral.referredUserId = referringUser._id; // Store the ID of the referring user
            }


        console.log(mobileno);

        if (!req.body.name || req.body.name.trim().length === 0) {
            return res.render("registration", {mobileno: mobile, message: "Name is required!", formData: req.body,category })
        }

        if (/\d/.test(req.body.name)) {
            return res.render("registration", {mobileno: mobile, message: "Name should not contain numbers!", formData: req.body,category  });
        }

        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(mobileno)) {
            return res.render("registration", {mobileno: mobile, message: "Mobile Number should have 10 digits!", formData: req.body,category  });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.render("registration", {mobileno: mobile, message: "Email Not Valid!", formData: req.body ,category });
        }

        const mobilePattern = /^[1-9]\d{9}$/; // Allows any non-zero digit followed by 9 digits
        if (!mobilePattern.test(mobileno)) {
            res.render("registration", {mobileno: mobile, message: "Invalid Mobile pattern!" ,category })
        }



        if (existingUserwithEmail) {
            // console.log("mobile:",mobileno);
            return res.render("registration", {mobileno: mobile, message: "user with this email already exits!", formData: req.body ,category })
        }

        if (existinguserwithMobile) {
            return res.render("registration", {mobileno: mobile, message: "user with mobile no exists!",category  })
        }


        const user = new User({
            name: name,
            email: email,
            mobileno: mobile,
            password: spassword,
            is_admin: 0,
            referralCode: referralCode, // Store the user's unique referral code
            referrals: [userReferral],
 
        })
        const saveData = await user.save()
        if (referringUser){
            // Add referral bonuses to the wallets

            console.log(referringUser,'refer')
            const BonusAmount=referringUser.wallet

            const referralBonusAmount = 50 + BonusAmount;
             // Adjust this amount as needed

             const Bonus=50;

            referringUser.wallet = referralBonusAmount;
            referringUser.walletTransaction.push({ amount: Bonus, type: 'Credited' });
            
            user.wallet=Bonus;
            user.walletTransaction.push({ amount: Bonus, type: 'Credited' });

            await referringUser.save();
            await user.save();
          }
        const users = await User.findOne({ mobileno: req.body.mobileno })
        console.log(users,"u-c reg");
        if(saveData){
            req.session.user_id=users.id
            res.redirect('/')
        }

}
    }
catch (error) {
    console.log(error.message)
}
}


const Loginload = async (req, res) => {
    try {

        const category=await Category.find({})
        if (req.session?.user_id) {
            res.render('index',{category})
           
        }
        else {
            res.render('login', {category, message: "" })
        }
    }
    catch (error) {
        console.log(error.message)
    }

}


const verifyLogin = async (req, res) => {
    try {
        const category=await Category.find({})
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email })

        if (userData) {


            if (userData.is_blocked) {
                res.render('login', { category,message: "your account is blocked" })
            }

            else {
                const passwordMatch = await bcrypt.compare(password, userData.password)

                if (passwordMatch) {
                    if(!userData.referralCode){
                        const referralCode = generateReferralCode();
            
                        // Update the user's document with the referral code
                        userData.referralCode = referralCode;
                        await userData.save();
                      }

                   console.log(userData,req.session,"verifylogin")
                    req.session.user_id = userData._id;
                    req.session.username = userData.name
                    res.locals.user_id=userData._id;
                    res.redirect('/');
                }

                else {
                    res.render('login', {category, message: "Password incorrect" })
                }
            }
        }
        else {
            res.render('login', {category, message: "User doesnt exist" })
        }
    }

    catch (error) {
        console.log(error.message);

    }
}



const loadHome = async (req, res) => {
    try {
       
        const products = await Product.find({ $and: [{ isListed: true }, { isProductListed: true }]}).populate('category')
                console.log(req.session,"session")
                const category=await Category.find({})
                const banner = await Banner.find({})
                const page = parseInt(req.query.page) || 1; 
                const limit = 8;
                const searchQuery = req.query.search || '';
                const skip = (page - 1) * limit;

                

                const filterCriteria = {
                    $and: [
                      { isListed: true },
                      { isProductListed: true },
                      {
                        $or: [
                          { name: { $regex: new RegExp(searchQuery, 'i') } },
                        ]
                      }] };

                 const totalProducts = await Product.countDocuments(filterCriteria);
            
                const totalPages = Math.ceil(totalProducts / limit);

                const product = await Product.find(filterCriteria)
        .populate('category')
        .skip(skip) 
        .limit(limit) 

                res.render('index',{category,banner,product,totalPages,skip,limit,currentPage: page})
    }  
            catch(error){
                console.log(error.message)
            }  
        }




const verifyOtp = async (req, res) => {
    try {
        const category=await Category.find({})
        const Otp = req.body.otp
        console.log(Otp)
        const mobileno = req.body.mobileno
        console.log(mobileno)
        client.verify.v2
            .services(verifySid)
            .verificationChecks.create({ to: `+91${mobileno}`, code: Otp })
            .then((verification_check) => {
                console.log(verification_check.status,'status');
                if (verification_check.status === "approved") {

                      req.session.mobileno = mobileno;
                    //   req.session.user_id = user;
                    res.render('registration', { mobileno: mobileno, message: "" ,category});


                } else if(verification_check.status === "denied") {
                    console.log('Incorrect otp')
                    res.render('otpverification', { message: 'Incorrect OTP',mobileno: mobileno ,category});
                }
            }).catch((err)=>{

                console.log(err,"otp err");
                res.render('otpverification', { message: 'Incorrect OTP',mobileno: mobileno ,category});
            })
        //   }
    } catch (error) {
        console.log(error.message)
    }
}





const userLogout = async (req, res) => {
    try {
        req.session.user_id = null
        req.session.destroy()
        res.redirect('/login')
    }
    catch (error) {
        console.log(error.message)
    }
}



const displayProduct = async (req, res) => {
    try {
        const category = await Category.find({isListed:true});
        const products = await Product.find({ $and: [{ isListed: true }, { isProductListed: true }]}).populate('category')
        const filteredProducts = products.filter(product => category.some(category => category._id.equals(product.category._id)));
        const selectedCategoryId = req.query.id || null;

      const page = parseInt(req.query.page) || 1; 
      const limit = 6;
      const skip = (page - 1) * limit;

      const searchQuery = req.query.search || '';
      console.log(searchQuery,'search')
      // Get the search query from request query parameters
      const sortQuery = req.query.sort; // Get the sort query from request query parameters (default value is 'default')
      const minPrice = parseFloat(req.query.minPrice); // Get the minimum price from request query parameters
      const maxPrice = parseFloat(req.query.maxPrice)

      const filterCriteria = {
        $and: [
          { isListed: true },
          { isProductListed: true },
          {
            $or: [
              { name: { $regex: new RegExp(searchQuery, 'i') } },
            ]
          }] };

      if (selectedCategoryId) {
        filterCriteria.category = selectedCategoryId;
      }
 
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        filterCriteria.$and.push({ price: { $gte: minPrice, $lte: maxPrice } });
      }

      let sortOption = {};
      if (sortQuery === 'price_asc' ) {
        sortOption = { price: 1 }; 
      } else if (sortQuery === 'price_desc') {
        sortOption = { price: -1 }; 
      }


      const totalProducts = await Product.countDocuments(filterCriteria);
      
      const totalPages = Math.ceil(totalProducts / limit);

      const product = await Product.find(filterCriteria)
        .populate('category')
        .skip(skip) 
        .limit(limit) 
        .sort(sortOption)
        console.log(totalProducts,product,"count search");
        


        res.render('loadproducts', { product: product,filteredProducts, category,selectedCategoryId, currentPage: page, totalPages,sortQuery});
    } catch (error) {
        console.log(error.message)
      

    }
}




const loadForgotpassword = async (req, res) => {
    try {
        const category=await Category.find({})
        res.render('forgotpassword',{category})
    }
    catch (error) {
        console.log(error.message)
    }
}
 
const forgotpasswordOtp = async (req, res) => {
        try {
            const category=await Category.find({})
            const user = await User.findOne({ mobileno: req.body.mobileno })
            console.log(user)
            if (!user) {
                res.render('forgotpassword', { message: "Invalid user" })
            }
            else {
                client.verify.v2
                    .services(verifySid)
                    .verifications.create({ to: `+91${req.body.mobileno}`, channel: "sms" })
                    .then((verification) => console.log(verification.status))
                    .then(() => {
                        const readline = require("readline").createInterface({
                            input: process.stdin,
                            output: process.stdout,
                        });
                        req.session.mobileno = user.mobileno
                        res.render('forgetOtp',{category})
                    });
            }
        }
        catch (error) {
            console.log(error.message)
        }
    }



    
const verifyforgetOtp = async (req, res) => {
    const otp = req.body.otp;
    const mobileno = req.session.mobileno
    const user = await User.findOne({ mobileno: mobileno })
    // console.log(otp,mobileno,user,"hh");
    if (!user) {
        res.render('forgetOtp', { message: "User not registered" })
    } else {
        client.verify.v2
            .services(verifySid)
            .verificationChecks.create({ to: `+91${mobileno}`, code: otp })
            .then((verification_check) => {
                console.log(verification_check.status);
                if (verification_check.status === "approved") {
                    //   req.session.loggedIn = true;
                    //   req.session.user_id = user._id;
                    res.render('resetPssword');
                } else if (verification_check.status === "denied") {
                    res.render('forgetOtp', { message: 'Incorrect OTP' });
                }
            })
    }

}

const categoryProduct = async(req,res)=>{
    try{
       const category=req.query.category
       const categoryData=await Category.find({});
       const products=await Product.find({category:category})
       const page = parseInt(req.query.page) || 1; 
       const limit = 10;
       const searchQuery = req.query.search || '';
       const sortQuery = req.query.sort;
      
       const filterCriteria = {
        $and: [
          { isListed: true },
          { isProductListed: true },
          {
            $or: [
              { name: { $regex: new RegExp(searchQuery, 'i') } },
            ]
          }] };

          const totalProducts = await Product.countDocuments(filterCriteria);
      
          const totalPages = Math.ceil(totalProducts / limit);


       console.log(products,"cdata u-c");
      
        res.render('loadproducts',{product:products,currentPage:page,category:categoryData,totalPages,sortQuery})
    }
    catch(error){
        console.log(error.message)
    }  
}


const resetPassword = async (req, res) => {
    const category=await Category.find({})
    const newPw = req.body.newPassword
    const confirmPw = req.body.confirmPassword
    const mobileno = req.session.mobileno
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(req.body.newPassword)) {
        return res.render('resetPssword', { message: "Password Should Contain atleast 8 characters,one number and a specialr characte" })
    }
    if (newPw === confirmPw) {

        const sPassword = await Securepassword(newPw)
        const newUser = await User.updateOne({ mobileno: mobileno }, { $set: { password: sPassword } })
        res.redirect('/login')
    } else {
        console.log("else");
        res.render('resetPssword', { message: "Password and Confirm Password is not matching" })
    }
}



const walletTransaction = async(req, res, next)=>{
    try {
        const category = await Category.find({})
      const user = res.locals.user
      const count = await cartHelper.getCartCount(user.id)
      // const userData= await User.findOne({_id:user._id})
      const wallet = await User.aggregate([
        {$match:{_id:user._id}},
        {$unwind:"$walletTransaction"},
        {$sort:{"walletTransaction.date":-1}},
        {$project:{walletTransaction:1,wallet:1}}
      ])
      res.render('walletTransaction',{wallet, count,category})
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  }



  const verifyCoupon = (req, res, next) => {
    const couponCode = req.params.id
    const userId = res.locals.user._id
    couponHelper.verifyCoupon(userId, couponCode)
        .then((response) => {
            res.send(response)
        })
}


const applyCoupon = async (req, res, next) => {
    console.log("apply");
    const couponCode = req.params.id
    const userId = res.locals.user._id
    const total = await couponHelper.totalCheckOutAmount(userId)
    couponHelper.applyCoupon(couponCode, total)
        .then((response) => {
            console.log(response,"applycoup");
            res.send(response)
        })
}


const addtoWishlist = async(req,res)=>{
    try {
      console.log(req.query,"addtowish")   
          const { productId } = req.query;
          const userId = res.locals.user._id;
          console.log(userId)
          let wishlistLength
          const userData = await Wishlist.findOne({ userId: userId });
          console.log(userData,'gg')   
          if (userData) {  
            if (userData.products.includes(productId)) {
              await Wishlist.updateOne(
                { userId: userId },
                { $pull: { products: productId } }
              );
              const newWishlist = await Wishlist.findOne({
                userId:userId,
              });
             

              const wishlistLength = newWishlist.products.length;
              res.json({ status: false, wishlistLength });
            } else {
              userData.products.push(productId);
              await userData.save();
              const wishlistLength = userData.products.length;
              res.json({ status: true, wishlistLength });
            }
          } else {
            console.log("else con");

            const newWishlist = new Wishlist({
              userId: userId,
              products: [productId],
            });          
            await newWishlist.save();
            console.log(newWishlist,'so')
            const wishlistLength = newWishlist.products.length;
            res.json({ status: true, wishlistLength });
          }
        } catch (error) {
          console.log(error.message);
        }
    }


    const getWishlist = async(req,res)=>{
        try{
            console.log('getwishlist')
            const category = await Category.find({})
            console.log(category,'ok')
            const userId = res.locals.user._id;
            const products = await Wishlist.aggregate([
                { $match: { userId: userId } },
                { $unwind: "$products" },
                {
                  $lookup: {
                    from: "products",
                    let: { productId: { $toObjectId: { $trim: { input: "$products" } } } },
                    pipeline: [
                      { $match: { $expr: { $eq: ["$_id", "$$productId"] } } },
                      {
                        $project: {
                          _id: 1,
                          item: "$_id",
                          quantity: "$stock",
                          name: 1,
                          images: 1,
                          price: 1,
                          description: 1,
                          
                        },
                      },
                    ],
                    as: "product",
                  },
                },
                { $unwind: "$product" },
                {
                  $project: {
                    _id: 0,
                    item: "$product.item",
                    quantity: "$product.quantity",
                    name: "$product.name",
                    images: "$product.images",
                    price: "$product.price",
                    description: "$product.description",
                    
                  },
                },
              ]);
    console.log(products,'nee')
           res.render('wishList',{category,products})
        }
        catch(error){
            console.log(error.message)
        }
    }

    const deleteWishlist = async(req,res)=>{
            try {
              const { productId } = req.body;
              const userId = res.locals.user._id;
              console.log(userId)
              await Wishlist.updateOne(
                { userId: userId },
                { $pull: { products: productId } }
              );
              const updatedWishlist = await Wishlist.findOne();
              const wishlistLength = updatedWishlist.products.length;
              res.json({ message: "Product deleted successfully", wishlistLength });
            } catch (error) {
              console.log(error.message);
            }
          };


     
module.exports = {
    Loadregister,
    insertUser,
    Loginload,
    verifyLogin,
    userLogout,
    loadHome,
    verifyOtp,
    displayProduct,
    loadForgotpassword,
    forgotpasswordOtp,
    verifyforgetOtp,
    resetPassword,
    verifyNumber,
    categoryProduct,
    walletTransaction,
    verifyCoupon,
    applyCoupon,
    addtoWishlist,
    getWishlist,
    deleteWishlist   

}



























