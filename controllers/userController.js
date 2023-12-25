const User = require("../models/userModel")
const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs')

// Generate token function
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

//----------------------------- Login user google -----------------------------
const loginUserGoogle = async (req, res) => {
    try {
        const { name, email, profile } = req.body
        // Validation
        if (!email) {
            return res.status(400).json({ message: "Email not provided by google." })
        }
        // check if user exists
        const userExists = await User.findOne({ email })
        if (userExists) {
            const { name, email, _id } = userExists
            const token = generateToken(_id)
            return res.status(200).json({ user: { _id, name, email, profile }, token })
        } else {
            const user = await User.create({
                name,
                email,
                profile
            })
            if (user) {
                const { _id, name, email } = user
                const token = generateToken(_id)
                return res.status(201).json({ user: { _id, name, email, profile }, token })
            }
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error occurred while login." })
    }
}

//----------------------------- Login status -------------------
const loginStatus = async (req, res) => {
    const bearerToken = req.headers.authorization
    if (!bearerToken) {
        return res.status(401).json(false)
    }
    const token = bearerToken.split(" ")[1]
    if (token === "null") {
        return res.status(401).json(false)
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(verified.id).select("_id name email profile");
        return res.status(200).json({ user, isLoggedIn: true });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json(false);
        } else {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

}

//--------------------------- Register User ---------------------------
// const registerUser = async (req, res) => {
//     try {
//         const { name, username, email, password } = req.body
//         // Validations
//         if (!name || !username || !email || !password) {
//             return res.status(400).json({ message: "Please fill in all required fields." })
//         }
//         if (password.length < 8) {
//             return res.status(400).json({ message: "Password must be upto 8 characters." })
//         }
//         // check if username already exists
//         const usernameExists = await User.findOne({ username: username.toLowerCase() });
//         if (usernameExists) {
//             return res.status(400).json({ message: "Username already exists." })
//         }
//         // check if email already exists
//         const emailExists = await User.findOne({ email: email.toLowerCase() });
//         if (emailExists) {
//             return res.status(400).json({ message: "Email already exists." })
//         }
//         // create user
//         const user = await User.create({
//             name,
//             username: username.toLowerCase(),
//             email: email.toLowerCase(),
//             password
//         })
//         // Generate auth token
//         const token = generateToken(user._id)
//         // return data
//         if (user) {
//             const { _id, name, username, email } = user
//             res.status(201).json({
//                 user: { _id, name, username, email }, token
//             })
//         }
//     } catch (error) {
//         console.log(error);
//         const message = error.message || error._message
//         res.status(500).json({ message })
//     }
// }
//-------------------------------------- Login User --------------------------------------
// const loginUser = async (req, res) => {
//     try {
//         const { emailUsername, password } = req.body;
//         // validations
//         if (!emailUsername || !password) {
//             return res.status(400).json({ message: "Please fill in all required fields." })
//         }
//         // check if user exists
//         const user = await User.findOne({
//             $or: [{ username: emailUsername }, { email: emailUsername }]
//         })
//         // check password is correct
//         if (user && await bcrypt.compare(password, user.password)) {
//             const token = generateToken(user._id)
//             const { _id, name, username, email } = user
//             return res.status(200).json({ user: { _id, name, username, email }, token })
//         } else {
//             return res.status(400).json({ message: "Invalid credentials" })
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Error occurred, Please try again." })
//     }
// }


module.exports = {
    loginUserGoogle,
    loginStatus
}