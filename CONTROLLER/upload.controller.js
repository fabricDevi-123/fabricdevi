// const { uploadSchema } = require("../MODELS")


// module.exports.fillterProducts = async (req, res) => {
//     try {
//         const { category, subCategory, parentCategory } = req.body

// if (!category && !subCategory && !parentCategory) {
//     res.status(404).json({ message: "At least one filter parameter (category, subCategory, or parentCategory) is required." })
// }

//         const filterProduct = {}

//         if (category) {
//             filterProduct.category = category
//         }
//         if (subCategory) {
//             filterProduct.subCategory = subCategory
//         }
//         if (parentCategory) {
//             filterProduct.parentCategory = parentCategory
//         }

//         let products = await uploadSchema.find(filterProduct)

//         if (products.length === 0) {
//             return res.status(404).json({ message: "no product found in this given filter" })
//         }

//         res.status(200).json({
//             message: "all filttered product recived successfully",
//             products
//         })
//     } catch (err) {
//         res.status(500).json({ err: err.message })
//     }
// }

// module.exports.priceLowToHigh = async (req, res) => {
//     try {
//         let products = await uploadSchema.aggregate([
//             {
//                 $sort: { "price": 1 }
//             }
//         ])
//         if (products.length === 0) {
//             return res.status(404).json({ message: "no products found" })
//         }

//         res.status(200).json({
//             message: "product sort by their price successfylly",
//             products
//         })
//     } catch (err) {
//         res.status(500).json({ err: err.message })
//     }
// }

// module.exports.priceHighToLow = async (req, res) => {
//     try {
//         let products = await uploadSchema.aggregate([
//             {
//                 $sort: { "price": -1 }
//             }
//         ])
//         if (products.length === 0) {
//             return res.status(404).json({ message: "no products found" })
//         }

//         res.status(200).json({
//             message: "product sort by their price successfylly",
//             products
//         })
//     } catch (err) {
//         res.status(500).json({ err: err.message })
//     }
// }

// module.exports.newestFirst = async (req, res) => {
//     try {
//         let products = await uploadSchema.aggregate([
//             {
//                 $sort: { "createdAt": -1 }
//             }
//         ]);

//         if (products.length === 0) {
//             return res.status(404).json({ message: "No products found." });
//         }

//         res.status(200).json({
//             message: "Products sorted by newest first.",
//             products
//         });

//     } catch (err) {
//         res.status(500).json({ message: "Error fetching products", error: err.message });
//     }
// };

// module.exports.priceBelow500 = async (req, res) => {
//     try {
//         let product = await uploadSchema.aggregate([
//             {
//                 $match: { price: { $lt: 500 } }
//             }
//         ])

//         if (product.length === 0) {
//             return res.status(404).json({ message: "no product found below 500 rs" })
//         }

//         res.status(200).json({
//             message: "all products get below 500",
//             product
//         })
//     } catch (err) {
//         return res.status(500).json({ err: err.message })
//     }
// }

// const { uploadSchema } = require("../MODELS");

const { uploadSchema } = require("../MODELS");

module.exports.filterProducts = async (req, res) => {
    try {
        const { category, subCategory, parentCategory, priceOrder, sortBy, minPrice, maxPrice, colorBy } = req.body;

        if (!category && !subCategory && !parentCategory && !priceOrder && !sortBy && !colorBy && minPrice === undefined && maxPrice === undefined) {
            return res.status(400).json({ message: "At least one filter parameter is required." });
        }

        const filterProduct = {};

        if (category) filterProduct.Category = category;
        if (subCategory) filterProduct.subCategory = subCategory;
        if (parentCategory) filterProduct.parentCategory = parentCategory;
        if (colorBy) filterProduct.color = colorBy;

        let aggregationPipeline = [{ $match: filterProduct }];

        // Ensure minPrice is required but defaults to 0 if not provided
        let priceFilter = { $gte: minPrice !== undefined ? Number(minPrice) : 0 };
        if (maxPrice !== undefined) priceFilter.$lte = Number(maxPrice);

        aggregationPipeline.push({ $match: { price: priceFilter } });

        // Sorting by price
        if (priceOrder) {
            aggregationPipeline.push({ $sort: { price: priceOrder === 'lowToHigh' ? 1 : -1 } });
        }

        // Sorting by newest first
        if (sortBy === 'newestFirst') {
            aggregationPipeline.push({ $sort: { createdAt: -1 } });
        }

        let products = await uploadSchema.aggregate(aggregationPipeline);

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found with the given filters." });
        }

        res.status(200).json({
            message: "Filtered and sorted products fetched successfully.",
            products
        });

    } catch (err) {
        res.status(500).json({ message: "Error processing your request.", error: err.message });
    }
};
