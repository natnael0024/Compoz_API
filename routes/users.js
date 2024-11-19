const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController');
const multer = require('multer');
const {avatarsStorage} = require('../cloudinary/cloudinary')

const limit = 0.4* 1024 * 1024 //400kb

//getall
router.get('/', UserController.getAll )

// get
router.get('/:id', UserController.get)

//update
const upload = multer({
    storage: avatarsStorage,
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

router.put('/user/update',upload.single('avatar'), UserController.update)

module.exports = router