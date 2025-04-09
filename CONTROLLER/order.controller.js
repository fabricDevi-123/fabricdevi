const { default: mongoose } = require("mongoose");
const { orderSchema } = require("../MODELS");
const { response } = require("express");

module.exports.createOrder = async (req, res) => {
    try {
        let { userId, productId, address } = req.body

        if (!userId || !productId || !address) {
            return res.status(400).json({
                message: "userId,productId and address are required"
            })
        }

        if (!address.pincode || !address.city || !address.state || !address.fullName || !address.HouseNo_Building_Appartment || !address.area_sector_street_village || !address.landMark) {
            return res.status(400).json({
                message: "all address fields are required"
            })
        }

        const isValidPostalCode = /^[1-9]{1}[0-9]{5}$/.test(address.pincode);
        if (!isValidPostalCode) {
            return res.status(400).json({
                message: "Postal code must be in Indian format"
            });
        }

        let order = await orderSchema.create({
            userId,
            productId,
            address
        })

        res.status(201).json({
            message: "Order created successfully",
            order
        })
    } catch (err) {
        return res.status(500).json({ err: err.message })
    }
}

module.exports.getOrder = async (req, res) => {
    try {
        const { userId, productId } = req.params;

        // Validation
        if (!userId) {
            return res.status(400).json({ message: "userId parameter is missing" });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId format" });
        }

        if (!productId) {
            return res.status(400).json({ message: "productId parameter is missing" });
        }
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid productId format" });
        }

        console.log("userId:", userId);
        console.log("productId:", productId);

        // Query with filtering
        const order = await orderSchema.find({
            userId: userId,
            productId: productId
        }).populate("userId").populate("productId");

        if (!order || order.length === 0) {
            return res.status(404).json({
                message: "No order found for this user and product"
            });
        }

        return res.status(200).json({
            message: "Order retrieved successfully",
            order: order
        });

    } catch (err) {
        console.error("Error fetching order:", err);
        return res.status(500).json({ err: err.message });
    }
}

module.exports.removeOrder = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "invalid Order Id formet" })
        }

        let order = await orderSchema.findByIdAndDelete(id)
        if (!order) {
            return res.status(404).json({
                message: "order not found"
            })
        }

        response.status(200).json({
            message: "order removed successfully",
            order
        })
    } catch (err) {
        return res.status(500).json({ err: err.message })
    }
}

module.exports.getAllOrders = async (req, res) => {
    try {
        let order = await orderSchema.find().populate("userId").populate("productId");

        res.status(200).json({
            message: "get all order successfully",
            order
        })
    } catch (err) {
        return res.status(500).json({err: err.message})
    }
}