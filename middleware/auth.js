const isLogin=async(req,res,next)=>{
    try{
        if(!req.session.admin_id)
        { res.redirect('/admin/admin')}
      
       
        else{
            next();   
        }
        

        
    }
    catch(error){
        console.log(error.message);

    }
}

const isLogout=async(req,res,next)=>{
    try{

        if( req.session.admin_id){
            res.redirect('/admin/dashboard')
            console.log('login');
        }
        else 
        {
            console.log('kya heii');
            next()
        }
         
    }
    catch(error){
        console.log(error.message);

    }
}



module.exports={

    isLogin,
    isLogout
}
