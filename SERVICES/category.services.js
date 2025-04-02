const { categorySchema } = require("../MODELS")

module.exports.addCategory = (body) => {
    return categorySchema.create(body)
}

module.exports.getCategory = () => {
    return categorySchema.find()
}

module.exports.removeCategory = (id) => {
    return categorySchema.findByIdAndDelete(id)
}