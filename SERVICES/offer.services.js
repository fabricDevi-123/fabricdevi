const { offerSchema } = require("../MODELS")

module.exports.addOffer = (body) => {
    return offerSchema.create(body)
}

module.exports.getOffer = () => {
    return offerSchema.find()
}

module.exports.deleteOffer = (id) => {
    return offerSchema.findByIdAndDelete(id)
}