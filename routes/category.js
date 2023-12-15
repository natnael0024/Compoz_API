const CategoryController = require('../controllers/CategoryController')

const router = require('express').Router()

//get all 
router.get('/',CategoryController.getCategories)
//get
router.get('/',CategoryController.get)
//create
router.post('/create',CategoryController.create)
//delete
router.delete('/:id/delete', CategoryController.delete)
//update
router.put('/:id/update',CategoryController.update)

module.exports = router