const uploadImage = require("../MIDDLEWARE/cloudinary")
const { offerService } = require("../SERVICES")

module.exports.addOffer = async (req, res) => {
    try {
        const body = req.body
        const { path, originalname } = req.file

        const cloud = await uploadImage(path, originalname)

        let newBody = {
            ...body,
            offerImage: cloud.url
        }

        let offer = await offerService.addOffer(newBody)
        console.log(offer);
        
        res.status(201).json({
            message: "offer uploaded successfully",
            offer
        })
    } catch (err) {
        return res.status(500).json({ err: err.message })
    }
}

module.exports.getOffer = async (req, res) => {
    try {
        let offer = await offerService.getOffer()

        if (offer.length === 0) {
            return res.status(404).json({
                message: "no offer avilable"
            })
        }

        res.status(200).json({
            message: "offer fatched successfully",
            offer
        })
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}

module.exports.deleteOffer = async (req, res) => {
    try {
        let { id } = req.params
        let offer = await offerService.deleteOffer(id)
        res.status(200).json({
            message: "offer deleted successfully",
            offer
        })
    } catch (err) {
        return res.status(500).json({ err: err.message })
    }
}