//------------------------------------------Multer Setup ------------------------------------------
const path = require('path')
const multer = require("multer");

// Define Storage
const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, path.join(__dirname, "..", "tmp"))
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname)
    }
})

// Specifile file format that can be saved
function fileFilter(req, file, cb) {

    if (file.mimetype === "image/jpg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/webp" ||
        file.mimetype === "image/avif"
    ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({ storage, fileFilter })

// File size formatter
const fileSizeFormatter = (bytes, decimal) => {
    if (bytes == 0) return '0 Bytes';
    const dm = decimal || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1000));
    return parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) + ' ' + sizes[index];
}


module.exports = { upload, fileSizeFormatter }