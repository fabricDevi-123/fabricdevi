const uploadImage = require("../MIDDLEWARE/cloudinary");
const { ratingSchema } = require("../MODELS")

module.exports.addRating = async (req, res) => {
    try {
        let { productId, userId, userRating, userReview } = req.body;
        console.log(req.body);
        

        // Validate required fields
        if (!userId || !productId || !userRating) {
            return res.status(400).json({
                message: "All fields are required: userId, productId, userRating"
            });
        }

        // Validate rating range
        if (userRating < 1 || userRating > 5) {
            return res.status(400).json({
                message: "User rating must be between 1 and 5"
            });
        }

        let productImage = null;
        if (req.file) {
            try {
                let { path, originalname } = req.file;
                let cloud = await uploadImage(path, originalname);
                productImage = cloud.url;
            } catch (uploadError) {
                return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
            }
        }

        // Find if product already has ratings
        const existingRating = await ratingSchema.findOne({ productId });

        if (existingRating) {
            // Check if user has already rated this product
            let userAlreadyRated = existingRating.ratings.some(rating => rating.userId.toString() === userId.toString());

            if (userAlreadyRated) {
                return res.status(400).json({
                    message: "You have already submitted a rating for this product"
                });
            }

            // Add new rating
            existingRating.ratings.push({ userId, userRating, userReview, productImage });

            // Calculate new average rating
            const totalRating = existingRating.ratings.reduce((acc, rating) => acc + rating.userRating, 0);
            existingRating.rating = totalRating / existingRating.ratings.length;

            await existingRating.save();

            return res.status(201).json({
                message: "Rating updated successfully",
                existingRating
            });
        } else {
            // Create new rating entry
            const newRating = new ratingSchema({
                productId,
                ratings: [{ userId, userRating, userReview, productImage }],
                rating: userRating
            });

            await newRating.save();

            return res.status(201).json({
                message: "Rating created successfully",
                newRating
            });
        }
    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};


module.exports.getReview = async (req, res) => {
    const { productId } = req.params

    if (productId) {
        const productRting = await ratingSchema.findOne({ productId })

        if (!productRting) {
            return res.status(404).json({
                message: "no rating found for this product"
            })
        }

        return res.status(200).json({
            message: "product rating fatched successfully",
            productRting
        })
    }
}

module.exports.removeRating = async (req, res) => {
    try {
        const { userId, productId } = req.params;

        if (!userId || !productId) {
            return res.status(400).json({
                message: "Both userId and productId are required"
            });
        }

        const existingRating = await ratingSchema.findOne({ productId });

        if (!existingRating) {
            return res.status(404).json({
                message: "No ratings found for this product"
            });
        }

        const ratingIndex = existingRating.ratings.findIndex(rating => rating.userId.toString() === userId.toString());

        if (ratingIndex === -1) {
            return res.status(404).json({
                message: "You have not rated this product"
            });
        }

        existingRating.ratings.splice(ratingIndex, 1);

        const totalRating = existingRating.ratings.reduce((acc, rating) => acc + rating.userRating, 0);
        const avgRating = existingRating.ratings.length > 0 ? totalRating / existingRating.ratings.length : 0;

        existingRating.rating = avgRating;

        await existingRating.save();

        return res.status(200).json({
            message: "Rating removed successfully",
            existingRating
        });
    } catch (err) {
        return res.status(500).json({
            message: "An error occurred while removing the rating",
            error: err.message
        });
    }
};

module.exports.updateRating = async (req, res) => {
    try {
        const { userId, productId, userRating, userReview } = req.body;

        if (!userId || !productId || userRating === undefined) {
            return res.status(400).json({
                message: "userId, productId, and userRating are required"
            });
        }

        const existingRating = await ratingSchema.findOne({ productId });

        if (!existingRating) {
            return res.status(404).json({
                message: "No ratings found for this product"
            });
        }

        const ratingIndex = existingRating.ratings.findIndex(rating => rating.userId.toString() === userId.toString());

        if (ratingIndex === -1) {
            return res.status(404).json({
                message: "You have not rated this product yet"
            });
        }

        let productImage = existingRating.ratings[ratingIndex].productImage
        if (req.file) {
            let { path, originalname } = req.file
            let cloud = await uploadImage(path, originalname);
            productImage = cloud.url
        }

        existingRating.ratings[ratingIndex].userRating = userRating;
        existingRating.ratings[ratingIndex].userReview = userReview;
        existingRating.ratings[ratingIndex].productImage = productImage;

        const totalRating = existingRating.ratings.reduce((acc, rating) => acc + rating.userRating, 0);
        const avgRating = existingRating.ratings.length > 0 ? totalRating / existingRating.ratings.length : 0;

        existingRating.rating = avgRating;

        await existingRating.save();

        return res.status(200).json({
            message: "Rating updated successfully",
            existingRating
        });
    } catch (err) {
        return res.status(500).json({
            message: "An error occurred while updating the rating",
            error: err.message
        });
    }
};

module.exports.removeWholeRatingOfProduct = async (req, res) => {
    try {
        let { id } = req.params

        let rating = await ratingSchema.findByIdAndDelete(id)

        return res.status(200).json({
            message: "WHOLE RATING OF PRODUCT IS REMOVED",
            rating
        })
    } catch (err) {
        return res.status(500).json({
            err: err.message
        })
    }
}

module.exports.approveRating = async (req, res) => {
    try {
        const { userRatingId, userId, productId } = req.body
        const productRating = await ratingSchema.findOne({ productId })
        if (!productRating) {
            return res.status(400).json({
                message: "product rating not found"
            })
        }

        const rating = productRating.ratings.find(
            (val) => val._id.toString() === String(userRatingId) && val.userId.toString() === String(userId)
        )

        if (!rating) {
            throw new Error("rating not found")
        }

        rating.isApprove = true

        const approveRatings = productRating.ratings.filter(val => val.isApprove)
        const totalRating = approveRatings.reduce((acc, val) => acc + val.userRating, 0)
        const approveRatingCount = approveRatings.length;
        productRating.rating = approveRatingCount > 0 ? totalRating / approveRatingCount : 0;

        await productRating.save()

        res.status(201).json({
            message: "rating approved successfully",
            productRating
        })
    } catch (err) {
        return res.status(500).json({ err: err.message })
    }
}