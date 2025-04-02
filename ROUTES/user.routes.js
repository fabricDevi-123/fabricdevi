const express = require("express")
const { userController } = require("../CONTROLLER")
const { body } = require("express-validator")
const { tokenVeryfy, isAdmin } = require("../MIDDLEWARE/jwtVeryfy")

const route = express.Router()

route.post("/createUser", [
    body("email").isEmail().withMessage("invalid email id"),
    body("fullName.firstName").isLength({ min: 3 }).withMessage("first name must be atleast 3 character long"),
    body("password").isLength({ min: 6 }).withMessage("password must be at least 6 character long")
], userController.createUser)

route.get("/getUser", tokenVeryfy, isAdmin, userController.getUser)
route.get("/userProfile/:id", tokenVeryfy, userController.userProfile)

// route.post("/forgotPassword", userController.forgotPassword)
// route.post("/resetPassword", userController.resetPassword)

route.post("/login", [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({ min: 6 }).withMessage("password must be at least 6 charecter long")
], userController.login)

route.post("/resetPassword/:id", userController.resetPassword)

route.post("/forgotPassword/:id", userController.forgotPassword)

route.post("/veryfyAndReset/:id", userController.verifyOtpAndResetPassword)

module.exports = route