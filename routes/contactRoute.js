const { contactMail } = require('../controllers/contactController')

const router = require('express').Router()

// contact form
router.post("/", contactMail)


module.exports = router