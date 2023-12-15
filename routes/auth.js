const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/AuthController');

//register
router.post('/register', AuthController.register )

//login
router.post('/login', AuthController.login)

router.post('/logout', AuthController.logout)

module.exports = router