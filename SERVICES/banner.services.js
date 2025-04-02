const { bannerSchema } = require("../MODELS")

module.exports.addBanner = (body) => {
    return bannerSchema.create(body)
}

module.exports.findBanner = () => {
    return bannerSchema.find()
}

module.exports.findByIdAndDelete = (id) => {
    return bannerSchema.findByIdAndDelete(id)
}