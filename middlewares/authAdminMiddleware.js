const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');

const adminProtect = async (req, res, next) => {
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
        const user = await Admin.findById(verified.id).select("_id name role email")
        if (!user) {
            return res.status(401).json({ message: "Session Expired, Please login" })
        }
        if (user.role === "admin" || user.role === "editor") {
            req.user = user
            return next()
        } else {
            return res.status(401).json({ message: "You are not authorized to perform this action" })
        }
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Session Expired, Please login" })
    }
}

module.exports = adminProtect