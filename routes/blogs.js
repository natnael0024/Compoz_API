const express = require('express')
const router = express.Router()
const BlogController = require('../controllers/BlogController');
const multer = require('multer');
const {storage} = require('../cloudinary/cloudinary')

//get All
router.get('/',BlogController.getBlogs)

//get Single
router.get('/:id',BlogController.getBlog)
const limit = 0.4* 1024 * 1024
//create
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
router.post('/create', upload.single('image'),  BlogController.createBlog)

//update
router.put('/:id/update',upload.single('image'), BlogController.update)

//delete
router.delete('/:id/delete', BlogController.delete)

module.exports = router