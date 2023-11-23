
const multer  = require('multer')
const path = require('path');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../views/public', 'product-images', 'create-images'));
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + '-' + file.originalname;
    cb(null, fileName)
  }
});



const fileFilter = (req, file, cb) => {
  // Allowed file types
  const fileTypes = /jpeg|jpg|png|webp/;
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype) {
      cb(null, true);
  } else {
      cb(new Error('Invalid file type. Only jpg, jpeg, and png are allowed.'), false);
  }
};

const addBanner = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../views/public', 'product-images', 'create-images'))
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname)
  }
})
  
module.exports= {
  upload:multer({
  storage:storage,
  fileFilter: fileFilter,
  limits: {
      fileSize: 10 * 1024 * 1024 // setting the limit for each image to 10MB
  }
}).array("images", 4),

addBannerUpload: multer({storage: addBanner}).single('image')
}  // Here, '3' is the maximum number of images you can upload at a time.



