let express = require("express")
const { orderController } = require("../CONTROLLER")

let route = express.Router()

route.post("/addOrder", orderController.createOrder)
route.get("/getOrder/:userId/:productId", orderController.getOrder)
route.delete("/removeOrder", orderController.createOrder)
route.get("/getAllorder", orderController.getAllOrders)

module.exports = route