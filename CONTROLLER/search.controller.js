const Fuse = require("fuse.js");
const { uploadSchema } = require("../MODELS");

const searchProducts = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const products = await uploadSchema.find();


    const fuseOptions = {
      threshold: 0.3,  
      includeScore: true,  
      keys: ["title", "category", "subCategory"],
    };

    const fuse = new Fuse(products, fuseOptions);

    const filteredProducts = fuse.search(query).map(result => result.item);

    if (filteredProducts.length === 0) {
      return res.status(404).json({ message: "No products found matching the search criteria" });
    }

    res.status(200).json(filteredProducts);

  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ message: "Error during search" });
  }
};

module.exports = { searchProducts };
