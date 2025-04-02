const uploadImage = require("../MIDDLEWARE/cloudinary")
const { bannerService } = require("../SERVICES")

module.exports.addBanner = async (req, res) => {
    const body = req.body
    const { path, originalname } = req.file

    const cloud = await uploadImage(path, originalname)

    let newBody = {
        ...body,
        bannerImage: cloud.url
    }

    try {
        let banner = await bannerService.addBanner(newBody)
        res.status(201).json({
            message: "banner uploaded successfully",
            banner
        })
    } catch (err) {
        res.status(500).json({ err: err.messsage })
    }
}

module.exports.getBanner = async (req, res) => {
    try {
        let banner = await bannerService.findBanner()

        if(banner.length === 0){
            return res.status(404).json({
                message:"no any banner available"
            })
        }

        const banners = banner.map((val) => {
            const { _id, ...body } = val.toObject()
            return {
                banner_id: _id,
                ...body
            }
        })

        res.status(200).json({
            message: "get banner successfully",
            banners
        })
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}

module.exports.removeBanner = async (req, res) => {
    try {
        let { id } = req.params
        let banner = await bannerService.findByIdAndDelete(id)
        res.status(200).json({
            message: "remove banner successfully",
            banner
        })
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}
