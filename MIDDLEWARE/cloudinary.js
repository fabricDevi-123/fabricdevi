const cloudinary = require("cloudinary")

cloudinary.config({
    cloud_name: "drizf8zcc",
    api_key: "442696378428464",
    api_secret: "OeMfhAeMUJV9U1KioU-7dBF0jXc"
})

let uploadImage = (path, originalname) => {
    return cloudinary.uploader.upload(
        path,
        { punlic_id: `${originalname}` },
        function (error, result) {
            return result;
        }
    )
}

module.exports = uploadImage