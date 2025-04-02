let multer = require("multer")
let fs = require("fs")
let path = require("path")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        fs.mkdirSync(path.join(__dirname, "../public/images"), { recursive: true });
        cb(null, path.join(__dirname, "../public/images"))
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.originalname + "-" + parseInt(Math.random() * 10000) + ".png"
        )
    }
})

const upload = multer({ storage: storage })

module.exports = upload;