const OpenAI = require("openai");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const addIdea = async (req, res) => {
    try {
        const { userIdea } = req.body;
        const { person } = req.params;
        const prompt = `I will give you an idea about a person or organisation. Provide a detailed explanation and a score between 0 to 100. The person / organisation is ${person} and the idea is "${userIdea}". I need the following keys in json object name - name of person / oragnisation, idea, explanation and score.`
        const response = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-3.5-turbo-1106",
            response_format: { "type": "json_object" },
        });
        const result = JSON.parse(response.choices[0].message.content);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports = {
    addIdea
}