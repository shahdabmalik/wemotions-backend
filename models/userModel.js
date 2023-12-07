const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please enter a email."],
        unique: true,
        trim: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Please enter a valid email."]
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Hashing password
userSchema.pre('save', async function (next) {
    // only update password field if modified
    if (!this.isModified('password')) {
        return next()
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User