const { addIdea, voteIdea, downVoteIdea, removeIdea } = require('../controllers/ideaControllers')
const protect = require('../middlewares/authMiddleware')

const router = require('express').Router()

// submit idea
router.post("/add", protect, addIdea)
// Remove idea
router.delete("/remove", protect, removeIdea)
// vote idea
router.post("/vote", protect, voteIdea)
// Dispose vote
router.post("/vote/dispose", protect, downVoteIdea)



module.exports = router