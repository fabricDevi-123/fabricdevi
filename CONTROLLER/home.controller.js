const { bannerSchema, uploadSchema, offerSchema, categorySchema } = require("../MODELS")

module.exports.homePage = async (req, res) => {
    try {
        let banner = await bannerSchema.find()

        let newArrivals = await uploadSchema.aggregate([
            { $sort: { createdAt: -1 } }
        ])

        let shopByCategory = await categorySchema.find()

        // let shopByCategory = await uploadSchema.distinct("category")

        let collection = await categorySchema.find()

        let offer = await categorySchema.find()

        return res.status(200).json({
            message: "get full details of home page successfully",
            banner,
            offer,
            newArrivals,
            shopByCategory,
            collection
        })


    } catch (err) {
        return res.status(500).json({ err: err.message })
    }
}