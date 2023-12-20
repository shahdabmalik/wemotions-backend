const { addIdea, downVoteIdea, removeIdea, getIdeas, handleVote, handleDownVote, getEntityIdeas } = require('../controllers/ideaControllers')
const protect = require('../middlewares/authMiddleware')

const router = require('express').Router()

// get ideas
router.get("/", getIdeas)
// submit Idea
router.post("/add", protect, addIdea)
// Remove Idea
router.delete("/remove", protect, removeIdea)
// vote Idea
router.post("/vote", protect, handleVote)
// Dispose vote
router.post("/downvote", protect, handleDownVote)
// get entity idea
router.get("/entityidea", getEntityIdeas)



module.exports = router