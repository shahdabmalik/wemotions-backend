const { loginAdminUser, checkAdminLoggedIn } = require('../controllers/adminController')

const router = require('express').Router()

// login admin
router.post("/login", loginAdminUser)
// check login status
router.get("/loggedin", checkAdminLoggedIn)



module.exports = router