let mongoose = require("mongoose")

const isValidObjectId = (objectId) => mongoose.Types.objectId.isValid(objectId)

const isValidIndianPostalCode = (posttalCode) => /^[1-9]{1}[0-9]{5}$/.test(posttalCode);

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userSchema",
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Upload",
        required: true
    },
    address: {
        pincode: {
            type: String,
            validate: {
                validator: isValidIndianPostalCode,
                message: 'postal code must be in avalid Indian format'
            }
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        fullName: {
            type: String,
            required: true
        },
        HouseNo_Building_Appartment: {
            type: String,
            required: true
        },
        area_sector_street_village: {
            type: String,
            required: true
        },
        landMark: {
            type: String,
            required: true
        }
    },
    // status: {
    //     type: String,
    //     enum: ["pending", "shipped", "delivered", "cancelled"],
    //     default: "pending",
    //     required: true
    // },
    // orderDate: {
    //     type: Date,
    //     default: Date.now,
    //     required: [true, "orderDate is required"]
    // }

})

let order = mongoose.model("orderSchema", orderSchema)

module.exports = order