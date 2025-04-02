let express = require("express")
const { wishlistController } = require("../CONTROLLER")

const route = express.Router()

route.post("/create_wishlist", wishlistController.addToWishlist)
route.get("/get_wishlist/:userId", wishlistController.getWishlist)
route.delete("/remove_wishlist/:userId/:productId", wishlistController.removeFromWishlist)
route.post("/mergeWishlist", wishlistController.mergeWishlist)

module.exports = route 