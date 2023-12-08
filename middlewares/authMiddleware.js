const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {

    try {
        const bearedToken = req.headers.authorization;
        if (!bearedToken) {
            return res.status(401).json({ message: "Request unauthorized, Please login 1" })
        }
        const token = bearedToken.split(" ")[1]
        if (token === "null" || !token) {
            return res.status(401).json({ message: "Request unauthorized, Please login 2" })
        }
        // verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        // get user id from token
        const user = await User.findById(verified.id).select("_id name username email")
        if (!user) {
            return res.status(401).json({ message: "Request unauthorized, Please login 3" })
        }
        req.user = user
        next()
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Request unauthorized, Please login 4" })
    }
}

module.exports = protect