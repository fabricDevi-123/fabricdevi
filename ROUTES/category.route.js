let express = require("express")
const { categoryController } = require("../CONTROLLER")
const upload = require("../MIDDLEWARE/upload")

let route = express.Router()

route.post("/addCategory", upload.single("categoryImage"), categoryController.categoryAdd)
route.get("/getCategory", categoryController.getCategory)
route.delete("/removeCategory/:id", categoryController.deleteCategory)

module.exports = route




