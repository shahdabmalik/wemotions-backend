const User = require("../models/userModel")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// Generate token function
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

//--------------------------- Register User ---------------------------
const registerUser = async (req, res) => {
    try {
        const { name, username, email, password } = req.body
        // Validations
        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: "Please fill in all required fields." })
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be upto 8 characters." })
        }
        // check if username already exists
        const usernameExists = await User.findOne({ username: username.toLowerCase() });
        if (usernameExists) {
            return res.status(400).json({ message: "Username already exists." })
        }
        // check if email already exists
        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if (emailExists) {
            return res.status(400).json({ message: "Email already exists." })
        }
        // create user
        const user = await User.create({
            name,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password
        })
        // Generate auth token
        const token = generateToken(user._id)
        // return data
        if (user) {
            const { _id, name, email } = user
            res.status(201).json({
                _id, name, email, token
            })
        }
    } catch (error) {
        console.log(error);
        const message = error.Error || error.message || error._message
        res.status(500).json({ message })
    }
}

const loginUser = async (req, res) => {
    try {
        const { emailUsername, password } = req.body;
        // validations
        if (!emailUsername || !password) {
            return res.status(400).json({ message: "Please fill in all required fields." })
        }
        // check if user exists
        const user = await User.findOne({
            $or: [{ username: emailUsername }, { email: emailUsername }]
        })
        // check password is correct
        const passwordIsCorrect = await bcrypt.compare(password, user.password)
        if (user && passwordIsCorrect) {
            const token = generateToken(user._id)
            const { _id, name, username, email } = user
            return res.status(200).json({ _id, name, username, email, token })
        } else {
            return res.status(400).json({message: "Invalid credentials"})
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error occurred, Please try again." })
    }
}


module.exports = {
    registerUser,
    loginUser
}