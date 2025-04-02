const { uploadSchema } = require("../MODELS");

module.exports.getCategoryData = async (req, res) => {
    try {
        const { category, subCategory } = req.params;

        if (!category) {
            return res.status(400).json({ message: "Category is required." });
        }

        if (!subCategory) {
            const subCategories = await uploadSchema.distinct('subCategory', { category });

            if (subCategories.length === 0) {
                return res.status(404).json({ message: "No subcategories found for this category." });
            }

            return res.status(200).json({
                message: "Subcategories fetched successfully.",
                subCategories
            });
        }

        if (subCategory) {
            const parentCategories = await uploadSchema.distinct('parentCategory', {
                category,
                subCategory
            });

            if (parentCategories.length === 0) {
                return res.status(404).json({ message: "Parent categories not found for the given category and subcategory." });
            }

            return res.status(200).json({
                message: "Parent categories fetched successfully.",
                parentCategories
            });
        }
    } catch (err) {
        res.status(500).json({ message: "Error processing your request.", error: err.message });
    }
};
