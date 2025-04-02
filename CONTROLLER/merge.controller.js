const mongoose = require("mongoose");
const { cartSchema, wishlistSchema, uploadSchema: Uplod, userSchema } = require("../MODELS");

module.exports.mergeCartAndWishlist = async (req, res) => {
    const { userId, cartProducts = [], wishlistProducts = [] } = req.body;

    try {
        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId format" });
        }

        // Check if user exists
        const existingUser = await userSchema.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch or create cart
        let cart = await cartSchema.findOne({ userId });
        if (!cart) {
            cart = new cartSchema({ userId, quantity: [] });
        }

        // Fetch or create wishlist
        let wishlist = await wishlistSchema.findOne({ userId });
        if (!wishlist) {
            wishlist = new wishlistSchema({ userId, products: [] });
        }

        const productIds = [
            ...cartProducts.map(p => p.productId),
            ...wishlistProducts.map(p => p.productId)
        ].filter(Boolean);

        const uniqueProductIds = [...new Set(productIds)];

        // Fetch product details from DB
        const products = await Uplod.find({ _id: { $in: uniqueProductIds } });
        const productMap = products.reduce((acc, product) => {
            acc[product._id.toString()] = product;
            return acc;
        }, {});

        // Process Cart Merging
        for (const productData of cartProducts) {
            const { productId } = productData;

            if (!productId) {
                console.warn("Skipping product with undefined ID:", productData);
                continue;
            }

            const product = productMap[productId];
            if (!product) {
                console.warn(`Skipping missing product ID: ${productId}`);
                continue;
            }

            if (!Array.isArray(cart.quantity)) {
                cart.quantity = [];
            }

            // Check if product already exists in cart
            const existingProductIndex = cart.quantity.findIndex(item => item.productId.toString() === productId.toString());

            if (existingProductIndex > -1) {
                // Update quantity if product exists
                cart.quantity[existingProductIndex].quantity += 1;
                cart.quantity[existingProductIndex].totalPrice = product.price * cart.quantity[existingProductIndex].quantity * cart.quantity[existingProductIndex].quantity;
            } else {
                // Add new product to cart
                cart.quantity.push({
                    productId,
                    quantity: 1,
                    totalPrice: product.price
                });
            }
        }

        // Process Wishlist Merging
        wishlistProducts.forEach(({ productId }) => {
            if (!wishlist.products.some(item => item.productId.toString() === productId.toString())) {
                wishlist.products.push({ productId, isAlready: true });
            }
        });

        // Save updated cart and wishlist
        await cart.save();
        await wishlist.save();

        return res.status(201).json({
            message: "Cart and Wishlist merged successfully",
            cart,
            wishlist
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
