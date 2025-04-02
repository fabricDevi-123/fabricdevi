const bcrypt = require("bcrypt")
const { userSchema } = require("../MODELS")

module.exports.createUser = async (body) => {
    let { password } = body

    let hashPassword = await bcrypt.hash(password, 10)

    let newBody = {
        ...body,
        password: hashPassword
    }

    return userSchema.create(newBody)
}

module.exports.findByEmail = (email) => {
    return userSchema.findOne({ email })
}

module.exports.getAllUsers = () => {
    return userSchema.find()
}

module.exports.findByIdAndDelete = (id) => {
    return userSchema.findByIdAndDelete(id)
}

// module.exports.findById = (id) => {
//     return userSchema.findById(id).exec();
// }

module.exports.update = async (fieldsToUpdate, filter) => {
    try {
        const updatedUser = await userSchema.findOneAndUpdate(filter, fieldsToUpdate, { new: true });
        return updatedUser;
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Error updating user');
    }
}



module.exports.findById = (id) => {
    return userSchema.findById(id)
}