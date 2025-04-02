let mongoose = require("mongoose")

let ratingSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Upload", // Ensure this matches the Upload model name
        required: true
    },
    ratings: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userSchema", // Change "User" to match your user model name
            required: true
        },
        userRating: {
            type: Number,
            required: true
        },
        userReview: {
            type: String,
        },
        productImage: {
            type: String,
        },
        isApprove: {
            type: Boolean,
            default: false
        }
    }],
    rating: {
        type: Number
    }
});


let rating = mongoose.model("ratingSchema", ratingSchema)

module.exports = rating
