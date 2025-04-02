let mongoose = require("mongoose")


let offerSchema = new mongoose.Schema({
    offerImage: {
        type: String,
        required: true
    }
}, { timestamps: true })

let offer = mongoose.model("offerSchema", offerSchema)

module.exports = offer