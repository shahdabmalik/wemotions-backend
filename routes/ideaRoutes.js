const { addIdea, downVoteIdea, removeIdea, getIdeas, handleVote, handleDownVote } = require('../controllers/ideaControllers')
const protect = require('../middlewares/authMiddleware')

const router = require('express').Router()

// submit Idea
router.post("/add", protect, addIdea)
// Remove Idea
router.delete("/remove", protect, removeIdea)
// vote Idea
router.post("/vote", protect, handleVote)
// Dispose vote
router.post("/downvote", protect, handleDownVote)
// get ideas
router.get("/", getIdeas)



module.exports = router