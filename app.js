require('dotenv').config()
const mongoose=require('mongoose')

mongoose.connect("mongodb+srv://Thasnim:lg2atUSE9qx8NlUS@cluster0.ixyvumc.mongodb.net/")
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const express = require('express')
const app = express();
const path = require('path')
const nocache=require('nocache')
app.use(express.json())


const mongoURI = "mongodb+srv://Thasnim:lg2atUSE9qx8NlUS@cluster0.ixyvumc.mongodb.net/";



mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
  .then((res) => {
    console.log("MongoDB Connected");
  });


  const userStore = new MongoDBSession({
    uri: mongoURI,
    collection: "userSessions",
  });

  const adminStore = new MongoDBSession({
    uri: mongoURI,
    collection: "adminSessions",
  })

  const userSession = session({
    secret: 'userSecret',
    resave: false,
    saveUninitialized: true,
    store: userStore,
    name: 'user_sid',
    cookie: { path: '/' }
  });


  const adminSession = session({
    secret: 'adminSecret',
    resave: false,
    saveUninitialized: true,
    store: adminStore,
    name: 'admin_sid',
    cookie: { path: '/admin' }
  });

 




// const storage=multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null,'./views/public/product-images')
//     },
//     filename:(req,file,cb)=>{
//         console.log(file)
//         cb(null,Date.now() + path.extname(file.originalname))
//     }
// })

// const upload=multer({storage:storage})

app.use(nocache())

//template engine ' 
app.set('view engine','ejs')
app.set('views','/views') 
 
//serve static file
app.use(express.static(path.join(__dirname,'views/public')))
app.use(express.static(path.join(__dirname,'views/admin')))
app.use(express.static('./views'))
app.use(express.static(path.join(__dirname,'public/css')))
app.use(express.static(path.join(__dirname,'./views/public/includes/header.ejs')))
app.use(express.static(path.join(__dirname,'./views/public/product-images/create-images')))


const mainRoute=require('./routes/routes') 
// app.use('/',mainRoute) 



const adminroute=require('./routes/adminRoute')
// app.use('/admin',adminroute)


app.use('/admin', (req, res, next) => {
    return next();
  }, adminSession, adminroute);

  app.use('/', (req, res, next) => {
    return next();
  }, userSession, mainRoute);


const port=process.env.PORT||3000






 

 
  
// app.get('/',(req,res)=>{
//     res.end("A home page")
// })

app.listen(port,()=>{
    console.log('server is running')
});
