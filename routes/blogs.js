const express = require('express')
const router = express.Router()
const BlogController = require('../controllers/BlogController');
const multer = require('multer');
// const {storage} = require('../cloudinary/cloudinary')
const supabase = require('../supabase');
const path = require('path');

//get All
router.get('/',BlogController.getBlogs)

//get Single
router.get('/:id',BlogController.getBlog)
const limit = 0.4* 1024 * 1024
//create
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


/**
 * @swagger
 * /api/blogs/create:
 *   post:
 *     summary: Create a new blog
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 */
router.post('/create', upload.single('image'), async(req,res,next)=>{
  try {
    if (req.file) {
    const fileName = `${Date.now()}_${path.basename(req.file.originalname)}`;
    const filePath = `blog/${fileName}`;

    // Upload the file to Supabase Storage
    const { error } = await supabase.storage
      .from('media')  
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,  // If false, existing files with the same name will not be overwritten
      });

    if (error) {
      console.log(error)
    }

    // Get public URL of the uploaded file
    const { data } = supabase
    .storage
    .from('media')
    .getPublicUrl(filePath)

    // Respond with the public URL of the uploaded image
    req.publicURL = data.publicUrl
    console.log('File uploaded and public URL set, passing to next middleware');
  }
    next()

  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ error: 'Error uploading file' });
  }
} , BlogController.createBlog)

//update
router.put('/:id/update',upload.single('image'),async(req,res,next)=>{
  try {
    if (req.file) {
    const fileName = `${Date.now()}_${path.basename(req.file.originalname)}`;
    const filePath = `blog/${fileName}`;

    // Upload the file to Supabase Storage
    const { error } = await supabase.storage
      .from('media')  
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,  // If false, existing files with the same name will not be overwritten
      });

    if (error) {
      console.log(error)
    }

    // Get public URL of the uploaded file
    const { data } = supabase
    .storage
    .from('media')
    .getPublicUrl(filePath)

    // Respond with the public URL of the uploaded image
    req.publicURL = data.publicUrl
    console.log('File uploaded and public URL set, passing to next middleware');
  }
    next()

  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ error: 'Error uploading file' });
  }
}, BlogController.update)

//delete
router.delete('/:id/delete', BlogController.delete)

module.exports = router