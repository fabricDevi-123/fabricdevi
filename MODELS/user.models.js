const mongoose = require("mongoose")

let userSchema = new mongoose.Schema({
    fullName: {
        firstName: {
            type: String,
            required: true,
            minLength: [3, "minLength must be at least 3 charcter long"]
        },
        lastName: {
            type: String,
            required: true,
            minLength: [3, "LastName must be at least 3 charecter long"]
        }
    },
    email: {
        type: String,
        required: true,
        minLength: [5, "email must be at least 5 charecter long"]
    },
    password: {
        type: String,
        required: true,
        minLength: [6, "email must be at least 5 charecter long"]
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    scoketId: {
        type: String
    }
})

let user = mongoose.model("userSchema", userSchema)

module.exports = user