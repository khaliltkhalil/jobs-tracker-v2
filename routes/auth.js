const express = require('express')
const router = express.Router()
const {register, login, updatUser} = require('../controllers/auth')
const authenticateUser =  require('../middleware/authentication')


router.post('/register', register)
router.post('/login', login)
router.route('/updateUser').patch(authenticateUser, updatUser)


module.exports = router

