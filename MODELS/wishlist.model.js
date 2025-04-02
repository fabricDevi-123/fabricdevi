const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        products: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Upload",
                    required: true
                }
            }
        ]
    },
    { timestamps: true }
);

// Prevent duplicate productId for the same userId
wishlistSchema.index({ userId: 1, "products.productId": 1 }, { unique: true });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;
