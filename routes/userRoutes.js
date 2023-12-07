const { registerUser, loginUser } = require('../controllers/userController')

const router = require('express').Router()

// Register user
router.post("/register", registerUser)
// Login user
router.post("/login", loginUser)


module.exports = router