const router = require('express').Router()
const protect = require('../middlewares/authMiddleware')
const { addEntity, getAllEntities, getSingleEntity, getEntityBySearch } = require('../controllers/entityController')

// add entity
router.post("/add", protect, addEntity)
// get all entities
router.get("/", getAllEntities)
// get entity by search
router.get("/search", getEntityBySearch)
// get single entity
router.get("/:slug", getSingleEntity)

module.exports = router