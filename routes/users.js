const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController');
const multer = require('multer');
const {avatarsStorage} = require('../cloudinary/cloudinary')
const supabase = require('../supabase');
const path = require('path');

const limit = 0.4* 1024 * 1024 //400kb

//getall
router.get('/', UserController.getAll )

// get
router.get('/:id', UserController.get)

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits:{
        fileSize: limit 
    },
    fileFilter: (req, file, callback) => {
        const fileSize = parseInt(req.headers['content-length']);
        if (fileSize > limit) {
        
          return callback (
            {message: 'Image too large'}
          )
        }
      callback(null, true);
    }
})

router.put('/user/update',upload.single('avatar'),async (req,res,next)=>{
  try {
    // if (!req.file) {
    //   return res.status(400).json({ error: 'No file uploaded' });
    // }
    const fileName = `${Date.now()}_${path.basename(req.file.originalname)}`;
    const filePath = `images/${fileName}`;

    // Upload the file to Supabase Storage
    const { error } = await supabase.storage
      .from('media')  
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,  // If false, existing files with the same name will not be overwritten
      });

    if (error) {
      throw error
    }

    // Get public URL of the uploaded file
    const { data } = supabase
    .storage
    .from('media')
    .getPublicUrl(filePath)

    // Respond with the public URL of the uploaded image
    req.publicURL = data.publicUrl
    console.log('File uploaded and public URL set, passing to next middleware');
    next()

  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ error: 'Error uploading file' });
  }
}, UserController.update)

module.exports = router