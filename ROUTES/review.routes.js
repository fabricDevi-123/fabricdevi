let express = require("express")
const { reviewController } = require("../CONTROLLER")
const upload = require("../MIDDLEWARE/upload")

let route = express.Router()

route.post("/sendRating",upload.single("productImage"), reviewController.addRating)
route.get("/getRating/:productId", reviewController.getReview)
route.delete("/removeRating/:productId/:userId", reviewController.removeRating)
route.put("/updateReview", reviewController.updateRating)
// route.get("/getRating/:productId", reviewController.getReview)

module.exports = route