let express = require("express")
const { bannerController } = require("../CONTROLLER")
const upload = require("../MIDDLEWARE/upload")

const route = express.Router()

route.post("/addBanner",upload.single("bannerImage"), bannerController.addBanner)
route.get("/getBanner", bannerController.getBanner)
route.delete("/deleteBanner/:id", bannerController.removeBanner)

module.exports = route