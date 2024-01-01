const Admin = require("../models/adminModel");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Generate token function
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3d" })
}

const loginAdminUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        // check user
        const admin = await Admin.findOne({ email })

        if (admin && await bcrypt.compare(password, admin.password)) {
            const token = generateToken(admin._id)
            const { _id, name, email, role } = admin
            return res.status(200).json({ admin: { _id, name, email, role }, adminToken: token })
        } else {
            return res.status(400).json({ message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Occurred" })
    }
}

//---------------------------- check if admin is logged in ----------------------------
const checkAdminLoggedIn = async (req, res) => {
    const bearerToken = req.headers.authorization
    if (!bearerToken) {
        return res.status(401).json({message:"Session Expired, Please login"})
    }
    const token = bearerToken.split(" ")[1]
    if (token === "null") {
        return res.status(401).json({message:"Session Expired, Please login"})
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(verified.id).select("_id name email role");
        return res.status(200).json({ admin, isLoggedIn: true });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({message:"Session Expired, Please login"});
        } else {
            return res.status(500).json({message:"Session Expired, Please login"});
        }
    }
}

module.exports = {
    loginAdminUser,
    checkAdminLoggedIn

}

// async function addAdmin() {
//     try {
//         const admin = await Admin.create({
//             name: "",
//             email: "",
//             password: ""
//         })
//         console.log(admin);
//     } catch (error) {
//         console.log(error);
//     }
// }
// addAdmin()