let mongoose = require("mongoose")

let categorySchema = new mongoose.Schema({
    categoryImage: {
        type: String,
        require: true
    }
})

let category = mongoose.model("categorySchema", categorySchema)

module.exports = category