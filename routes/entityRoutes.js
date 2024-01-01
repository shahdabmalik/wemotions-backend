const router = require('express').Router()
const protect = require('../middlewares/authMiddleware')
const { addEntity, getAllEntities, getSingleEntity, getEntityBySearch, getAllEntitiesForAdmin, getSingleEntityById } = require('../controllers/entityController')

// add entity
router.post("/add", protect, addEntity)
// get all entities
router.get("/", getAllEntities)
// get all entities
router.get("/admin", getAllEntitiesForAdmin)
// get entity by search
router.get("/search", getEntityBySearch)
// get single entity by if
router.get("/admin/:id", getSingleEntityById)
// get single entity
router.get("/:slug", getSingleEntity)

module.exports = router