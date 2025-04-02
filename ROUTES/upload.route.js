const express = require("express");
const fs = require("fs");
const path = require("path");
const { uploadSchema } = require("../MODELS");
const { uploadController } = require("../CONTROLLER");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");



const upload = multer({ dest: "uploads/" });

// const filePath = path.join(__dirname, "../../products.json");

router.post("/post_upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ error: "No file uploaded" });
        }

        const filePath = req.file.path; // Temporary file path
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log("Extracted Data:", sheetData);

        if (!Array.isArray(sheetData) || sheetData.length === 0) {
            return res.status(400).send({ error: "Invalid or empty Excel file" });
        }

        const updatedProducts = [];

        for (let product of sheetData) {
            const existingProduct = await uploadSchema.findOne({ sku: product.sku });

            if (existingProduct) {
                Object.assign(existingProduct, product);
                updatedProducts.push(await existingProduct.save());
            } else {
                const newProduct = new uploadSchema(product);
                updatedProducts.push(await newProduct.save());
            }
        }

        // Save all products to JSON file
        const allProducts = await uploadSchema.find();
        fs.writeFileSync(filePath, JSON.stringify(allProducts, null, 2));

        // Remove uploaded file after processing
        fs.unlinkSync(filePath);

        res.status(200).send({
            message: "Products uploaded successfully!",
            data: updatedProducts,
        });
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).send({ error: "Failed to process file" });
    }
});

// module.exports = router;


router.get("/get_upload", async (req, res) => {
    try {

        const products = await uploadSchema.find();

        const updatedProducts = products.map(product => {
            const { _id, ...body } = product.toObject();
            return { product_id: _id, ...body };
        });

        res.status(200).json(updatedProducts);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Error fetching products" });
    }
});

router.get("/get_id/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const product = await uploadSchema.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const updatedProduct = {
            product_id: product._id,
            ...product.toObject(),
            _id: undefined
        }


        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        res.status(500).json({ message: "Error fetching product" });
    }
});


router.delete("/remove/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const product = await uploadSchema.findByIdAndDelete(id)
        if (!product) {
            return res.status(404).json({ message: "product not found" })
        }
        res.status(200).json({
            message: "product remove suiccessfully",
            product
        })
    } catch (err) {
        return res.status(500).json({ err: err.message })
    }
})


// router.post("/get_filtered_products", async (req, res) => {
//     try {
//         const { category, subCategory, parentCategory } = req.body;

//         if (!category && !subCategory && !parentCategory) {
//             return res.status(400).json({
//                 message: "At least one filter parameter (category, subCategory, or parentCategory) is required."
//             });
//         }

//         const filterQuery = {};

//         if (category) {
//             filterQuery.category = category;
//         }
//         if (subCategory) {
//             filterQuery.subCategory = subCategory;
//         }
//         if (parentCategory) {
//             filterQuery.parentCategory = parentCategory;
//         }
//         console.log("Filter Query:", filterQuery);

//         const products = await uploadSchema.find(filterQuery);

//         // If no products are found
//         if (products.length === 0) {
//             return res.status(404).json({ message: "No products found with the given filters." });
//         }

//         // If products are found, return them
//         res.status(200).json(products);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching filtered products", error: error.message });
//     }
// });

// module.exports = router;

router.post("/get_filtered_products", uploadController.filterProducts)

// router.get("/priceLowToHigh", uploadController.priceLowToHigh)

// router.get("/priceHighToLow", uploadController.priceHighToLow)

// router.get("/newestFirst", uploadController.newestFirst)

// router.get("/priceBelow500", uploadController.priceBelow500)


module.exports = router