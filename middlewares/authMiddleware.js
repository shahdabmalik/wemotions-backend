const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {

    try {
        const bearedToken = req.headers.authorization;
        if (!bearedToken) {
            return res.status(401).json({ message: "Session Expired, Please login" })
        }
        const token = bearedToken.split(" ")[1]
        if (token === "null" || !token) {
            return res.status(401).json({ message: "Session Expired, Please login" })
        }
        // verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) return res.status(401).json({ message: "Session Expired, Please Login" })
        // get user id from token
        const user = await User.findById(verified.id).select("_id name username email")
        if (!user) {
            return res.status(401).json({ message: "Session Expired, Please login" })
        }
        req.user = user
        next()
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Session Expired, Please login" })
    }
}

module.exports = protect