const { isValidObjectId, isObjectIdOrHexString, default: mongoose } = require("mongoose");
const { userSchema, cartSchema, uploadSchema } = require("../MODELS");
const { validate: uuidValidate } = require("uuid")
const { v4: uuidv4 } = require("uuid")

module.exports.addToCart = async (req, res) => {
    let { product, user, quantity, meter } = req.body;

    meter = meter || 10;
    quantity = quantity || 1; // Ensure quantity is at least 1

    console.log(req.body);

    let cartUserId;
    if (user) {
        if (mongoose.Types.ObjectId.isValid(user)) {
            let existingUser = await userSchema.findById({ _id: user });
            if (!existingUser) {
                return res.status(400).json({ message: "User not found" });
            }
            cartUserId = user;
        } else if (uuidValidate(user)) {
            cartUserId = user;
        } else {
            return res.status(400).json({
                message: "Invalid user ID format"
            });
        }
    } else {
        cartUserId = uuidv4();
    }

    if (!product || !isValidObjectId(product)) {
        return res.status(400).send({ status: false, message: "Invalid product ID" });
    }

    let upload = await uploadSchema.findOne({ _id: product });
    console.log(upload);

    if (!upload) {
        return res.status(400).send({ status: false, message: "Product not found" });
    }

    let cart = await cartSchema.findOne({ userId: cartUserId });

    if (cart) {
        let productIndex = cart.quantity.findIndex((item) => item.productId.toString() === product.toString());

        if (productIndex > -1) {
            // Update quantity
            cart.quantity[productIndex].quantity += quantity;
            cart.quantity[productIndex].meter = meter;
            cart.quantity[productIndex].totalPrice = cart.quantity[productIndex].quantity * meter * upload.price;
        } else {
            // Add new product entry
            cart.quantity.push({
                productId: product,
                quantity,
                meter,
                totalPrice: quantity * meter * upload.price
            });
        }

        // Calculate total cart price
        let totalCartPrice = cart.quantity.reduce((sum, val) => sum + val.totalPrice, 0);
        cart.totalPrice = totalCartPrice;
        await cart.save();

        return res.status(200).send({ status: true, updatedCart: cart, totalCartPrice });

    } else {
        // Create a new cart if not found
        const newCart = await cartSchema.create({
            userId: cartUserId,
            quantity: [{
                productId: product,
                quantity,
                meter,
                totalPrice: quantity * meter * upload.price
            }],
        });

        return res.status(201).send({ status: true, newCart: newCart });
    }
};
module.exports.getCart = async (req, res) => {
    let { user } = req.params;
    if (!user || !isValidObjectId(user)) {
        return res.status(400).send({ status: false, message: "Invalid user ID" });
    }

    try {
        let existingUser = await userSchema.exists({ _id: user });
        if (!existingUser) {
            return res.status(404).send({ status: false, message: "User not found" });
        }

        let cart = await cartSchema.findOne({ userId: user }).populate('quantity.productId');
        console.log(cart.quantity);

        let totalCartPrice = cart.quantity.reduce((sum, val) => sum + val.totalPrice, 0)

        if (!cart) {
            return res.status(404).send({ status: false, message: "Cart is empty" });
        }

        const availableProducts = cart.quantity.filter(product => product.productId != null);

        const updatedCart = {
            cart_id: cart._id,
            ...cart.toObject(),
            _id: undefined,
            quantity: undefined,
            __v: undefined,

            products: availableProducts.map(product => {
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

        if (availableProducts.length === 0) {
            return res.status(404).send({ status: false, message: "No available products in the cart" });
        }

        return res.status(200).send({
            status: true,
            message: "Cart fetched successfully",
            cart: updatedCart,
            totalCartPrice
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ status: false, message: err.message });
    }
};
module.exports.removeItemFromCart = async (req, res) => {
    let { user, product } = req.params;

    if (!user || !isValidObjectId(user)) {
        return res.status(400).send({ status: false, message: "Invalid user ID" });
    }

    if (!product || !isValidObjectId(product)) {
        return res.status(400).send({ status: false, message: "Invalid product ID" });
    }

    try {
        let existingUser = await userSchema.exists({ _id: user });
        if (!existingUser) {
            return res.status(404).send({ status: false, message: "User not found" });
        }

        let cart = await cartSchema.findOne({ userId: user });

        if (!cart) {
            return res.status(404).send({ status: false, message: "Cart is empty" });
        }

        let updatedCart = await cartSchema.findOneAndUpdate(
            { userId: user },
            { $pull: { quantity: { productId: product } } },
            { new: true }
        );


        if (!updatedCart) {
            return res.status(404).send({ status: false, message: "Product not found in cart" });
        }

        if (updatedCart.quantity.length === 0) {
            await cartSchema.findByIdAndDelete(updatedCart._id);
            return res.status(200).send({ status: true, message: "Cart is now empty" });
        }

        return res.status(200).send({
            status: true,
            message: "Product removed from cart successfully",
            updatedCart: updatedCart
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ status: false, message: err.message });
    }
};
module.exports.incrementItem = async (req, res) => {
    try {
        const { cartId, productId, quantity } = req.body;

        // Validate cartId and productId
        if (!cartId || !isValidObjectId(cartId)) {
            return res.status(404).json({ message: "cartId is not valid" });
        }

        if (!productId || !isValidObjectId(productId)) {
            return res.status(404).json({ message: "productId is not valid" });
        }

        // Find the cart by ID
        let cart = await cartSchema.findById(cartId);

        // If cart not found
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Find the product index within the cart
        let productIndex = cart.quantity.findIndex(item => item.productId.toString() === productId.toString());

        // If product not found in cart
        if (productIndex === -1) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        // Increment the quantity of the product
        cart.quantity[productIndex].quantity += quantity;

        // Save the updated cart
        await cart.save();

        // Create the response object
        const updatedResponse = {
            cart_id: cart._id,
            userId: cart.userId,
            quantity: cart.quantity.map(val => ({
                productId: val.productId,
                quantity: val.quantity
            }))
        };

        // Respond with the updated cart
        return res.status(200).json({
            message: "Product quantity incremented successfully",
            updatedResponse
        });

    } catch (err) {
        // Catch and return any errors
        console.error(err);
        return res.status(500).json({ err: err.message });
    }
};
module.exports.decrementItem = async (req, res) => {
    try {
        const { cartId, productId, quantity } = req.body;

        // Validate cartId and productId
        if (!cartId || !isValidObjectId(cartId)) {
            return res.status(404).json({ message: "cartId is not valid" });
        }

        if (!productId || !isValidObjectId(productId)) {
            return res.status(404).json({ message: "productId is not valid" });
        }

        // Find the cart by ID
        let cart = await cartSchema.findById(cartId);

        // If cart not found
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Find the product index within the cart
        let productIndex = cart.quantity.findIndex(item => item.productId.toString() === productId.toString());

        // If product not found in cart
        if (productIndex === -1) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        // Increment the quantity of the product
        cart.quantity[productIndex].quantity -= quantity;

        // Save the updated cart
        await cart.save();

        // Create the response object
        const updatedResponse = {
            cart_id: cart._id,
            userId: cart.userId,
            quantity: cart.quantity.map(val => ({
                productId: val.productId,
                quantity: val.quantity
            }))
        };

        // Respond with the updated cart
        return res.status(200).json({
            message: "Product quantity incremented successfully",
            updatedResponse
        });

    } catch (err) {
        // Catch and return any errors
        console.error(err);
        return res.status(500).json({ err: err.message });
    }
};

// module.exports.decrementItem = async (req, res) => {
//     const { cartId, productId, quantity } = req.body

//     if (!cartId || !isValidObjectId(cartId)) {
//         return res.status(404).json({
//             message: "invalid CartId"
//         })
//     }
//     if (!productId || !isObjectIdOrHexString(productId)) {
//         return res.status(400).json({
//             message: "enter valid productId"
//         })
//     }
//     if (!quantity || !quantity <= 0) {
//         return res.status(404).json({
//             message: "enter valid quantity or quantity must be a positive number"
//         })
//     }

//     try {
//         let cart = await cartSchema.findById(cartId)

//         if (!cart) {
//             return res.status(404).json({
//                 message: "cart not found"
//             })
//         }

//         let productIndex = cart.quantity.findIndex(val => val.productId.toString() === productId.toString())

//         if (productIndex === -1) {
//             return res.status(404).json({
//                 message: "product not found in cart"
//             })
//         }

//         if (cart.quantity[productIndex].quantity > quantity) {
//             cart.quantity[productIndex].quantity -= quantity;
//         } else {
//             return res.status(400).json({
//                 message: "quantity cannot be lessthen 1"
//             })
//         }

//         await cart.save()

//         const updatedCartResponse = {
//             cart_id: cart._id,
//             userId: cart.userId,
//             quantity: cart.quantity.map(item => ({
//                 productId: item.productId,
//                 quantity: item.quantity
//             }))
//         };

//         return res.status(200).json({
//             message: "product quantity decrement successfully",
//             updateCart: updatedCartResponse
//         })

//     } catch (err) {
//         return res.status(500).json({ err: err.message })
//     }
// }

module.exports.mergeCart = async (req, res) => {
    const { userId, productIds } = req.body

    try {
        if (!mongoose.Types.ObjectId.isValid(userId) && !uuidValidate(userId)) {
            return res.status(400).json({
                message: "invalid user id formet"
            })
        }

        const existingUser = await userSchema.findById({ userId })
        if (!existingUser) {
            return res.status(400).json({
                message: "user not found"
            })
        }

        let cart = await cartSchema.findOne({ userId })

        if (!cart) {
            cart = new cartSchema({
                userId,
                products: []
            })
        }

    } catch (err) {

    }
}

module.exports.mergeCart = async (req, res) => {
    const { userId, productIds } = req.body;

    try {
        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId) && !uuidValidate(userId)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        // Validate productIds array
        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ message: "Invalid productIds format, expected a non-empty array" });
        }

        const existingUser = await userSchema.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        let cart = await cartSchema.findOne({ userId });

        if (!cart) {
            cart = new cartSchema({
                userId,
                quantity: []
            });
        }

        for (const { productId, meter } of productIds) {
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ message: `Invalid product ID: ${productId}` });
            }

            const productExists = await uploadSchema.findById(productId);
            if (!productExists) {
                return res.status(400).json({ message: `Product not found: ${productId}` });
            }

            const existingProductIndex = cart.quantity.findIndex(item => item.productId.toString() === productId.toString());

            if (existingProductIndex > -1) {
                cart.quantity[existingProductIndex].meter += meter || 1;
            } else {
                cart.quantity.push({ productId, meter: meter || 1 });
            }
        }

        await cart.save();

        return res.status(201).json({
            message: "Cart merged successfully",
            cart
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
