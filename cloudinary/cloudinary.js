const { CloudinaryStorage } = require('multer-storage-cloudinary');

const cloudinary = require('cloudinary').v2;
    
cloudinary.config({ 
  cloud_name: 'dv27yz95o', 
  api_key: '544885834897167', 
  api_secret: 'vOAdUCNRJ7T-tMFbYA0tGg33ztM' 
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'compoz/blogUploads',
        allowedFormats: ['jpeg', 'png', 'jpg'],
        maxFileSize: 0.8 * 1024 * 1024 //800kb
    }
})

const avatarsStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'compoz/avatars',
    allowedFormats: ['jpeg', 'png', 'jpg'],
    maxFileSize: 0.8 * 1024 * 1024 // 800kb
  }
});

cloudinary.uploader
  .destroy()
  .then(result => console.log(result));

module.exports = {
    storage,
    avatarsStorage
  }