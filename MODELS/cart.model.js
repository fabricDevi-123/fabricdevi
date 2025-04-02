const mongoose = require('mongoose');

// Define the cart schema
const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.Mixed,
        ref: "User",
        required: true,
        default: null
    },
    quantity: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Upload",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        meter: {
            type: Number,
            require: true
        },
        totalPrice: {
            type: Number,
            require: true
        }
    }]
});

// Create the Cart model
const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;