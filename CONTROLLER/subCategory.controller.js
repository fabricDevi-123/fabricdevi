const { uploadSchema } = require("../MODELS");

module.exports.getAllSubCategory = async (req, res) => {
    try {
        const { category } = req.params;

        if (!category) {
            return res.status(404).json({ message: "category not found" })
        }
        const subCategories = await uploadSchema.distinct('subCategory', { category });

        if (subCategories.length === 0) {
            return res.status(404).json({ message: "No subcategories found for this category." });
        }

        res.status(200).json({
            message: "Subcategories fetched successfully.",
            subCategories
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}