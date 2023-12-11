const mongoose = require('mongoose')

const ideaSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    entity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Entity",
        required: true
    },
    idea: {
        type: String,
        required: true,
        trim: true
    },
    aiExplanation: {
        type: String,
        required: true
    },
    aiScore: {
        type: Number,
        required: true
    },
    votes: {
        count: {
            type: Number,
            default: 0
        },
        voters: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }]
    }
}, { timestamps: true });

const Idea = mongoose.model('idea', ideaSchema)

module.exports = Idea