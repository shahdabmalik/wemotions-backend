const { addIdea } = require('../controllers/ideaControllers')

const router = require('express').Router()

router.post("/:person/add", addIdea)



module.exports = router