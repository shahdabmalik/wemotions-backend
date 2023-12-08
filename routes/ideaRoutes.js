const { addIdea } = require('../controllers/ideaControllers')
const protect = require('../middlewares/authMiddleware')

const router = require('express').Router()

router.post("/:person/add", protect, addIdea)



module.exports = router