let express = require("express")
const { searchController } = require("../CONTROLLER")

let route = express.Router()

route.post("/searchProduct", searchController.searchProducts)

module.exports = route