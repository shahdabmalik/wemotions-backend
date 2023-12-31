const router = require('express').Router()
const protect = require('../middlewares/authMiddleware')
const { addEntity, getAllEntities, getSingleEntity, getEntityBySearch, getAllEntitiesForAdmin, getSingleEntityById } = require('../controllers/entityController')
const adminProtect = require('../middlewares/authAdminMiddleware')
const { upload } = require('../utils/imageUpload')

// add entity
router.post("/add", adminProtect, upload.single('image'), addEntity)
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