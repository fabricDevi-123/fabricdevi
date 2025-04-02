let express = require("express")
const { mergeController } = require("../CONTROLLER")

let route = express.Router()

route.post("/mergeWishlistAndCart", mergeController.mergeCartAndWishlist)

module.exports = route