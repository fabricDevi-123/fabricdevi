const uploadImage = require("../MIDDLEWARE/cloudinary")
const { categorySchema } = require("../MODELS")
const { categoryServices } = require("../SERVICES")

module.exports.categoryAdd = async (req, res) => {
    let body = req.body

    let { path, originalname } = req.file

    let cloud = await uploadImage(path, originalname)

    let newBody = {
        ...body,
        categoryImage: cloud.url
    }

    try {
        let category = await categoryServices.addCategory(newBody)
        res.status(201).json({
            message: "add category image successfully",
            category
        })
    } catch (err) {
        return res.status(500).json({ err: err.message })
    }
}

module.exports.getCategory = async (req, res) => {
    let category = await categoryServices.getCategory()
    console.log(category);

    res.status(200).json({
        message: "get category successfully",
        category
    })
}

module.exports.deleteCategory = async (req, res) => {
    let { id } = req.params

    try {
        let category = await categoryServices.removeCategory(id)

        res.status(200).json({
            message: "category data remove successfully",
            category
        })
    } catch (err) {
        return res.status(500).json({ err: err.message })
    }
}