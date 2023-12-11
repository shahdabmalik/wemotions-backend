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

module.exports = {
    addIdea
}