const mongoose = require("mongoose");

const UploadSchema = new mongoose.Schema({

    s_no: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    Category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        // required: true
    },
    parentCategory: {
        type: String,
        required: true
    },
    fabricSpecification: {
        type: String,
        required: true
    },
    uses: {
        type: String,
        required: true
    },
    images: {
        type: String,
    }
}, { timestamps: true });

const Upload = mongoose.model("Upload", UploadSchema);

module.exports = Upload;
