let mongoose = require("mongoose")

let bannerSchema = new mongoose.Schema({
    bannerImage: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

let banner = mongoose.model("bannerSchema", bannerSchema)

module.exports = banner