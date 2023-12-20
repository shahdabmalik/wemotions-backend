const OpenAI = require("openai");
const Idea = require("../models/ideaModel");
const Entity = require('../models/entityModel')

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

// --------------------------------Submit Idea--------------------------------
const addIdea = async (req, res) => {
    try {
        const { userIdea, entityId } = req.body;
        // userIdea validation
        if (userIdea.length < 20) {
            return res.status(400).json({ message: "Idea should be valid and upto 30 characters long." })
        }
        // find entity
        const entity = await Entity.findById(entityId)
        if (!entity) {
            return res.status(404).json({ message: "Entity not found." })
        }
        // prompt
        const prompt = `I will give you an idea about a person or organisation. If the idea provided is not a valid description or is abusive or just random sentence then just return: false in json object, for exmple if the idea is "asdas sdfs gkl rsdfsd" then just return result: fasle in json object. If the idea is valid then provide a detailed explanation of the idea and a score between 0 to 100 based on its different factors and impacts. The person / organisation is ${entity.name} and the idea is "${userIdea}". I need the following keys in json object name - name of person / oragnisation, idea, aiExplanation and aiScore.`
        // OPEN AI response
        const response = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-3.5-turbo-1106",
            response_format: { "type": "json_object" },
        });
        // Parse the response
        const parsedResponse = JSON.parse(response.choices[0].message.content);
        if (parsedResponse.result === false || parsedResponse.result === "false") {
            return res.status(400).json({ message: "Please provide a valid idea." })
        }
        // create idea document in database
        const idea = await Idea.create({
            author: req.user._id,
            entity: entity._id,
            idea: parsedResponse.idea,
            aiExplanation: parsedResponse.aiExplanation,
            aiScore: parsedResponse.aiScore,
        })
        res.status(200).json({ message: "Idea submitted", idea });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

//----------------------------------- Delete idea -----------------------------------

const removeIdea = async (req, res) => {

    try {

        const { ideaId } = req.body;
        // find the idea
        const idea = await Idea.findById(ideaId)
        if (!idea) {
            return res.status(404).json({ message: "Error Removing, Idea not found" })
        }
        // see if user is the author of idea
        const userIsAuthor = idea.author.toString() === req.user._id.toString()
        if (!userIsAuthor) {
            return res.status(401).json({ message: "Error Removing, You are not the author" })
        }
        // remove idea
        await Idea.findByIdAndDelete(ideaId)
        res.status(200).json({ message: "Idea Removed" })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Removing" })
    }

}

//----------------------------------- Handle Vote -----------------------------------
const handleVote = async (req, res) => {
    try {
        const { ideaId } = req.body;
        // validation - check idead exists
        const idea = await Idea.findById(ideaId);
        if (!idea) {
            return res.status(404).json({ message: "Error Occurred, Idea not found" })
        }
        let update = {};

        if (idea.votes.voters.includes(req.user._id)) {
            // User is undoing their vote
            update = {
                $inc: { 'votes.count': -1 },
                $pull: { 'votes.voters': req.user._id }
            };
            const updatedIdea = await Idea.findByIdAndUpdate(ideaId, update, { new: true }).populate('entity');
            return res.status(200).json({ message: "Vote disposed", idea: updatedIdea })
        } else {
            // User is voting or switching from downvote to vote
            update = {
                $inc: { 'votes.count': 1, 'downVotes.count': idea?.downVotes?.downVoters.includes(req.user._id) ? -1 : 0 },
                $addToSet: { 'votes.voters': req.user._id },
                $pull: { 'downVotes.downVoters': req.user._id }
            };
            const updatedIdea = await Idea.findByIdAndUpdate(ideaId, update, { new: true }).populate('entity');
            return res.status(200).json({ message: "Voted", idea: updatedIdea })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error Occurred" })
    }
}

//----------------------------------- Handle Down Vote -----------------------------------
const handleDownVote = async (req, res) => {
    try {
        const { ideaId } = req.body;
        // validation - check idead exists
        const idea = await Idea.findById(ideaId);
        if (!idea) {
            return res.status(404).json({ message: "Error Occurred, Idea not found" })
        }
        let update = {};

        if (idea?.downVotes?.downVoters.includes(req.user._id)) {
            // User is undoing their downvote
            update = {
                $inc: { 'downVotes.count': -1 },
                $pull: { 'downVotes.downVoters': req.user._id }
            };
            const updatedIdea = await Idea.findByIdAndUpdate(ideaId, update, { new: true }).populate('entity');
            return res.status(200).json({ message: "Down vote disposed", idea: updatedIdea })
        } else {
            // User is voting or switching from downvote to vote
            update = {
                $inc: { 'downVotes.count': 1, 'votes.count': idea?.votes?.voters.includes(req.user._id) ? -1 : 0 },
                $addToSet: { 'downVotes.downVoters': req.user._id },
                $pull: { 'votes.voters': req.user._id }
            };
            const updatedIdea = await Idea.findByIdAndUpdate(ideaId, update, { new: true }).populate('entity');
            return res.status(200).json({ message: "Down Voted", idea: updatedIdea })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error Occurred" })
    }
}

//------------------------------- Get Ideas -------------------------------
const getIdeas = async (req, res) => {

    const sortOption = getSortOption(req.query.sort)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        const motions = await Idea.find().sort(sortOption).limit(limit).skip(offset).populate('entity').exec()
        res.status(200).json(motions)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error getting ideas, please try again." })
    }
}

//----------------------------- Get ideas of entity -----------------------------
const getEntityIdeas = async (req, res) => {
    const entity = req.query.entity
    const sortOption = getSortOption(req.query.sort)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit

    try {
        const motions = await Idea.find({ entity }).sort(sortOption).limit(limit).skip(offset).populate('entity').exec()
        res.status(200).json({ motions })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Occurred" })
    }

}

// get sort option function
const getSortOption = (sortType) => {
    switch (sortType) {
        case 'A.I':
            return { aiScore: -1 };
        case 'Votes':
            return { 'votes.count': -1 };
        case 'Latest':
            return { createdAt: -1 };
        default:
            return {}; // Default sorting, if needed
    }
};

module.exports = {
    addIdea,
    removeIdea,
    getIdeas,
    handleVote,
    handleDownVote,
    getEntityIdeas
}