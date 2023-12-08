const router = require('express').Router()
const protect = require('../middlewares/authMiddleware')
const { addEntity, getAllEntities } = require('../controllers/entityController')

// add entity
router.post("/add", protect, addEntity)
// get all entities
router.get("/", getAllEntities)
module.exports = router