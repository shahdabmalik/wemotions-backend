const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
mongoose.plugin(slug)

const entitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        slug: "name"
    },
    socialMediaLinks: [{
        name: {
            type: String
        },
        link: {
            type: String
        }
    }],
    additionalLinks: [String],
    image: {
        type: Object,
        default: {}
    }

}, { timestaps: true });

const Entity = mongoose.model('Entity', entitySchema)

module.exports = Entity