const OpenAI = require("openai");
const Entity = require("../models/entityModel");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

// Normalize name function
function normalizeName(name) {
    return name.toLowerCase().replace(/[^a-z\s-]/gi, '');
}

//------------------------------------ Add entity ------------------------------------
const addEntity = async (req, res) => {
    try {
        const { name, type } = req.body
        // validation
        if (!name || !type) {
            res.status(400).json({ message: "All fields are required." })
        }
        const normalizedName = normalizeName(name);
        // find if entity with the same name exists
        const entityExists = await Entity.exists({ name: normalizedName })
        if (entityExists) {
            return res.status(409).json({ message: "Entity with the given name already exists." })
        }
        // get short description of entity from open ai
        // const prompt = `Give the breif description of the given entity, the entity can only be a person or organization. The entity is ${normalizedName}. I need three keys in json object "found", "entity" and "description". If you find the entity with the given name the found key will be true, otherwise it will be false. The entity key will be the name of entity. The description key will have the description of found entity.`
        const prompt = `I will give you a name and type of a entity, name can only be a person or organization. If you can't find enough information of the given entity name just return result: false and description: "no information" in json object. For example, if someone give you random name like "aasfba", "asdad" and "acdfeef" etc. just return result: false and description: "no information" in json object. If you find the information of the given entity name. I need three keys in json object "result", "entity" and "description. The result key will be true, entity key will have entity full name without any designation and description key will have the proper full description of the entity. The entity is ${normalizedName} and type is ${type}.  `
        // OPEN AI response
        const response = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-3.5-turbo-1106",
            response_format: { "type": "json_object" },
        });
        // parse respnse
        const parsedResponse = JSON.parse(response.choices[0].message.content)
        // entity not found
        console.log(parsedResponse);
        if (parsedResponse.result === false) {
            return res.status(404).json({ message: "There is no entity found with the given name" })
        }
        // no description or entity found - sometime the result comes true but no entity found.
        if (parsedResponse.description.toLowerCase().includes("no information")) {
            return res.status(404).json({ message: "There is no entity found with the given name" })
        }
        // again check if the entity with name from open ai exists
        const entityOpenaiExists = await Entity.exists({ name: normalizeName(parsedResponse.entity) })
        if (entityOpenaiExists) {
            return res.status(409).json({ message: "Entity with the given name already exists." })
        }
        // create entity
        const entity = await Entity.create({
            name: normalizeName(parsedResponse.entity),
            type: type,
            description: parsedResponse.description,
        })
        if (entity) {
            res.status(201).json(entity)
        } else {
            res.status(500).json({ message: "Error Occurred, please try again." })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Occurred, please try again." })
    }
}

//---------------------------------- Get all entities ----------------------------------
const getAllEntities = async (req, res) => {

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        // get documets
        const entities = await Entity.find().skip(offset).limit(limit);
        const totalEntities = await Entity.countDocuments()
        const totalPages = Math.ceil(totalEntities / limit)
        res.status(200).json({
            totalPages,
            page,
            result: entities
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Occurred, please try again." })
    }

}

module.exports = {
    addEntity,
    getAllEntities
}