const { addIdea, voteIdea, downVoteIdea, removeIdea, getIdeas } = require('../controllers/ideaControllers')
const protect = require('../middlewares/authMiddleware')

const router = require('express').Router()

// submit Idea
router.post("/add", protect, addIdea)
// Remove Idea
router.delete("/remove", protect, removeIdea)
// vote Idea
router.post("/vote", protect, voteIdea)
// Dispose vote
router.post("/vote/dispose", protect, downVoteIdea)
// get ideas
router.get("/", getIdeas)



module.exports = router