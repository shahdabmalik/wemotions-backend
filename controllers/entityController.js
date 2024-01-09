const OpenAI = require("openai");
const cloudinary = require("cloudinary").v2;
const sharp = require('sharp')
const fs = require("fs");
const Entity = require("../models/entityModel");
const { fileSizeFormatter } = require("../utils/imageUpload");
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
        const { name, type, twitter, instagram, facebook, tiktok, youtube, link1, link2, link3 } = req.body

        const socialMediaLinks = [
            { name: "twitter", link: twitter && twitter.length > 0 ? twitter : null },
            { name: "instagram", link: instagram && instagram.length > 0 ? instagram : null },
            { name: "facebook", link: facebook && facebook.length > 0 ? facebook : null },
            { name: "tiktok", link: tiktok && tiktok.length > 0 ? tiktok : null },
            { name: "youtube", link: youtube && youtube.length > 0 ? youtube : null },
        ]
        const additionalLinks = [
            link1 && link1.length > 0 ? link1 : null,
            link2 && link2.length > 0 ? link2 : null,
            link3 && link3.length > 0 ? link3 : null,
        ]
        // validation
        if (!name || !type) {
            return res.status(400).json({ message: "All fields are required." })
        }
        const normalizedName = normalizeName(name);
        // find if entity with the same name exists
        const entityExists = await Entity.exists({ name: normalizedName })
        if (entityExists) {
            return res.status(409).json({ message: "Page with the given name already exists." })
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
        if (parsedResponse.result === false) {
            return res.status(404).json({ message: "Please enter valid entity name" })
        }
        // no description or entity found - sometime the result comes true but no entity found.
        if (parsedResponse.description.toLowerCase().includes("no information")) {
            return res.status(404).json({ message: "Please enter valid given name" })
        }
        // again check if the entity with name from open ai exists
        const entityOpenaiExists = await Entity.exists({ name: normalizeName(parsedResponse.entity) })
        if (entityOpenaiExists) {
            return res.status(409).json({ message: "Page with the given name already exists." })
        }
        // file process and upload to cloudinary
        let fileData = {}
        const processedImage = await processImage(req.file.path)
        const uploadResult = await uploadToCloudinary(processedImage)
        fileData = {
            name: req.file.originalname,
            url: uploadResult.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(uploadResult.bytes, 2),
            public_id: uploadResult.public_id
        }
        // create entity
        const entity = await Entity.create({
            name: normalizeName(parsedResponse.entity),
            type: type,
            description: parsedResponse.description,
            socialMediaLinks,
            additionalLinks,
            image: fileData
       })
        if (entity) {
            res.status(201).json({ message: "Page Added" })
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
        res.status(200).json(entities)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Occurred, please try again." })
    }
}

//-------------------------------- Get single entity --------------------------------
const getSingleEntity = async (req, res) => {
    const { slug } = req.params
    try {
        const entity = await Entity.findOne({ slug })
        res.status(200).json({ entity })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Occurred" })
    }
}

//-------------------------------- Entity by search --------------------------------
const getEntityBySearch = async (req, res) => {
    const { search, limit } = req.query
    try {
        const regex = new RegExp(search, 'i'); // 'i' for case-insensitive
        const entities = await Entity.find({ name: { $regex: regex } }).limit(limit);
        res.status(200).json(entities)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Occurred" })
    }
}
//--------------------------------get entity for admin --------------------------------
const getAllEntitiesForAdmin = async (req, res) => {
    try {
        const entities = await Entity.find().select("name _id image");
        res.status(200).json(entities)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Occurred" })
    }
}
//--------------------------------Get Entity by ID --------------------------------
const getSingleEntityById = async (req, res) => {
    try {
        const { id } = req.params;
        const entity = await Entity.findById(id);
        res.status(200).json(entity)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Occurred" })
    }
}

async function processImage(filePath) {
    try {
        return await sharp(filePath)
            .resize(600, 600, { fit: 'cover' })
            .jpeg({ mozjpeg: true, quality: 70 })
            .toFormat("jpeg")
            .toBuffer()
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}

async function uploadToCloudinary(buffer) {
    try {
        // This returns a promise which resolves with the upload result
        return await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder: "wemotions/entities",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            const stream = require('stream');
            const bufferStream = new stream.PassThrough();
            bufferStream.end(buffer);
            bufferStream.pipe(uploadStream);
        });
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
}

module.exports = {
    addEntity,
    getAllEntities,
    getSingleEntity,
    getEntityBySearch,
    getAllEntitiesForAdmin,
    getSingleEntityById
}