const OpenAI = require("openai");
const Idea = require("../models/ideaModel");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})
// --------------------------------Submit Idea--------------------------------
const addIdea = async (req, res) => {
    try {
        const { userIdea } = req.body;
        const { person } = req.params;
        // prompt
        const prompt = `I will give you an idea about a person or organisation. Provide a detailed explanation and a score between 0 to 100. The person / organisation is ${person} and the idea is "${userIdea}". I need the following keys in json object name - name of person / oragnisation, idea, aiExplanation and aiScore.`
        // OPEN AI response
        const response = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-3.5-turbo-1106",
            response_format: { "type": "json_object" },
        });
        // Parse the response
        const result = JSON.parse(response.choices[0].message.content);
        // create idea document in database
        // const idea = await Idea.create({
        //     authot
        // })
        res.status(200).json({ message: "Idea submitted", idea });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports = {
    addIdea
}