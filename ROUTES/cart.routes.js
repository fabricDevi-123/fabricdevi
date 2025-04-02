let express = require("express")
const { cartController } = require("../CONTROLLER")

const route = express.Router()

route.post("/addCart", cartController.addToCart)
route.get("/getCart/:user", cartController.getCart)
route.delete("/remove/:user/:product", cartController.removeItemFromCart)
route.post("/increment", cartController.incrementItem)
route.post("/decrement", cartController.decrementItem)
route.post("/mergeCart", cartController.mergeCart)

module.exports = route