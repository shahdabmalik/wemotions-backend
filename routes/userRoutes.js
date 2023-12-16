const { registerUser, loginUser, loginUserGoogle, loginStatus } = require('../controllers/userController')

const router = require('express').Router()

// login user google
router.post("/google", loginUserGoogle)

// login status
router.get("/loggedin", loginStatus)

// Register user
// router.post("/register", registerUser)
// Login user
// router.post("/login", loginUser)


module.exports = router