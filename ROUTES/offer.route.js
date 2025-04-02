let express = require("express")
const { offerController } = require("../CONTROLLER")
const upload = require("../MIDDLEWARE/upload")

let route = express.Router()

route.post("/addOffer",upload.single("offerImage"), offerController.addOffer)
route.get("/getOffer", offerController.getOffer)
route.delete("/deleteOffer", offerController.deleteOffer)

module.exports = route