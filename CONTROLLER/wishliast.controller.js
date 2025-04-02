const mongoose = require("mongoose");
const { v4: uuidv4, validate: uuidValidate } = require("uuid");
const { userSchema, uploadSchema, wishlistSchema } = require("../MODELS");

module.exports.addToWishlist = async (req, res) => {
    let { userId, productId } = req.body;

    try {
        // Generate a guest userId if not provided
        if (!userId) {
            userId = uuidv4(); // Generate a new guest user
        }

        // Validate userId (Accepts both MongoDB ObjectId and UUID)
        let wishlistUserId;
        if (mongoose.Types.ObjectId.isValid(userId)) {
            wishlistUserId = userId;
        } else if (uuidValidate(userId)) {
            wishlistUserId = userId;
        } else {
            return res.status(400).json({ status: false, message: "Invalid userId format" });
        }

        // Validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ status: false, message: "Invalid productId format" });
        }

        // Find or Create Wishlist
        let wishlist = await wishlistSchema.findOne({ userId: wishlistUserId });

        if (!wishlist) {
            wishlist = new wishlistSchema({
                userId: wishlistUserId,
                products: [{ productId }]
            });
        } else {
            const productExists = wishlist.products.some(item => item.productId.toString() === productId);
            if (productExists) {
                return res.status(400).json({ status: false, message: "Product already in wishlist" });
            }
            wishlist.products.push({ productId });
        }

        await wishlist.save();

        return res.status(201).json({
            status: true,
            message: "Product added to wishlist",
            // userId: wishlistUserId, // Send back userId for guest users
            wishlist
        });

    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
};

module.exports.getWishlist = async (req, res) => {
    const { userId } = req.params;

    try {
        if (!userId) {
            return res.status(400).send({ status: false, message: "User ID is required" });
        }

        // Validate userId (Accepts both MongoDB ObjectId and UUID)
        let wishlistUserId;
        if (mongoose.Types.ObjectId.isValid(userId)) {
            wishlistUserId = userId;
        } else if (uuidValidate(userId)) {
            wishlistUserId = userId;
        } else {
            return res.status(400).json({ status: false, message: "Invalid userId format" });
        }

        let wishlist = await wishlistSchema.findOne({ userId: wishlistUserId }).populate("products.productId");

        if (!wishlist) {
            return res.status(404).send({ status: false, message: "Wishlist not found" });
        }

        const updatedWishlist = {
            wishlist_id: wishlist._id,
            ...wishlist.toObject(),
            _id: undefined,
            products: wishlist.products.map(product => {
                const { _id, productId, ...body } = product.toObject();
                return {
                    _id: undefined,
                    ...body,
                    productId: {
                        product_id: productId._id,
                        ...productId,
                        _id: undefined
                    }
                };
            })
        };

        return res.status(200).send({ status: true, message: "Wishlist retrieved", wishlist: updatedWishlist });

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

module.exports.removeFromWishlist = async (req, res) => {
    const { userId, productId } = req.params;

    try {
        // Validate userId (Accepts both MongoDB ObjectId and UUID)
        let wishlistUserId;
        if (mongoose.Types.ObjectId.isValid(userId)) {
            wishlistUserId = userId; // Registered user
        } else if (uuidValidate(userId)) {
            wishlistUserId = userId; // Guest user
        } else {
            return res.status(400).json({ status: false, message: "Invalid userId format" });
        }

        // Validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ status: false, message: "Invalid productId format" });
        }

        // Find Wishlist
        const wishlist = await wishlistSchema.findOne({ userId: wishlistUserId });
        if (!wishlist) {
            return res.status(404).send({ status: false, message: "Wishlist not found" });
        }

        // Find Product in Wishlist
        const productIndex = wishlist.products.findIndex(item => item.productId.toString() === productId.toString());
        if (productIndex === -1) {
            return res.status(404).send({ status: false, message: "Product not found in wishlist" });
        }

        // Remove Product
        wishlist.products.splice(productIndex, 1);

        // If Wishlist is Empty, Delete it
        if (wishlist.products.length === 0) {
            await wishlistSchema.deleteOne({ userId: wishlistUserId });
            return res.status(200).send({ status: true, message: "Wishlist is now empty" });
        }

        // Save Updated Wishlist
        await wishlist.save();
        return res.status(200).send({ status: true, message: "Product removed from wishlist", wishlist });

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

module.exports.mergeWishlist = async (req, res) => {
    const { userId, productIds } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId) && !uuidValidate(userId)) {
            return res.status(400).json({ message: "Invalid userId format" });
        }

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ message: "Invalid productIds, expected a non-empty array" });
        }

        const existingUser = await userSchema.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        let wishlist = await wishlistSchema.findOne({ userId });

        if (!wishlist) {
            wishlist = new wishlistSchema({
                userId,
                products: productIds.map(val => ({ productId: val }))
            });
        } else {
            productIds.forEach(val => {
                const productExists = wishlist.products.some(item => item.productId.toString() === val.toString());
                if (!productExists) {
                    wishlist.products.push({ productId: val });
                }
            });
        }

        await wishlist.save();

        return res.status(201).json({
            message: "Wishlist merged successfully",
            wishlist
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
