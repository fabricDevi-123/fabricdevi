let express = require("express")
const { homeController } = require("../CONTROLLER")

let route = express.Router()

route.get("/homeDetails", homeController.homePage)

module.exports = route