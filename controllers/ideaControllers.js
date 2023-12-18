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
        if (userIdea.length < 30) {
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

//----------------------------------- Delete and idea -----------------------------------

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

//----------------------------------- Vote an idea -----------------------------------
const voteIdea = async (req, res) => {
    try {

        const { ideaId } = req.body;
        // validation - check idead exists
        const idea = await Idea.findById(ideaId)
        if (!idea) {
            return res.status(404).json({ message: "Error voting, Idean not found" })
        }
        // check if the user already voted
        const alreadyVoted = idea.votes.voters.includes(req.user._id)
        if (alreadyVoted) {
            return res.status(400).json({ message: "You are already a voter" })
        }
        // add vote count and add user in voters
        idea.votes.count = +1
        idea.votes.voters.push(req.user._id)
        await idea.save()
        res.status(200).json({ message: "Voted" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error voting, please try again" })
    }
}

//----------------------------------- Dispose Vote -----------------------------------
const downVoteIdea = async (req, res) => {

    try {
        const { ideaId } = req.body;
        // validation - check idead exists
        const idea = await Idea.findById(ideaId)
        if (!idea) {
            return res.status(404).json({ message: "Error Disposing, Idean not found" })
        }
        // check if the voter field contains userId
        const validVoter = idea.votes.voters.includes(req.user._id)
        if (!validVoter) {
            return res.status(404).json({ message: "Error Disposing, You are not the voter" })
        }
        // Remove vote count and user from voters
        idea.votes.count = idea.votes.count - 1
        idea.votes.voters = idea.votes.voters.filter((userId) => userId.toString() !== req.user._id.toString())
        await idea.save()
        res.status(200).json({ message: "Vote disposed" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error voting, please try again" })
    }
}

//------------------------------- Get Ideas -------------------------------
const getIdeas = async (req, res) => {

    const sortOption = getSortOption(req.query.sort)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        const motions = await Idea.find().sort(sortOption).limit(limit).skip(offset).exec()
        res.status(200).json(motions)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error getting ideas, please try again." })
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
    voteIdea,
    downVoteIdea,
    getIdeas
}