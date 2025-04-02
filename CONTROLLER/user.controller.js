const { validationResult } = require("express-validator")
const { userService } = require("../SERVICES")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const { userSchema } = require("../MODELS")
const nodemailer = require("nodemailer")

module.exports.createUser = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
    }

    try {
        const body = req.body
        const email = body.email

        const duplicate = await userService.findByEmail(email)
        if (duplicate) {
            res.status(400).json({
                message: "USER ALREADY EXIST"
            })
        }

        const user = await userService.createUser(body)

        res.status(201).json({
            message: "USER CREATED SUCCESSFULLY",
            user
        })
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}

module.exports.getUser = async (req, res) => {
    try {
        let users = await userService.getAllUsers()

        let updatedUser = users.map((val) => {
            const { _id, ...body } = val.toObject()
            return {
                user_id: _id,
                ...body
            }
        })
        res.status(200).json({
            message: "GET ALL USER SUCCESSFULLY",
            user: updatedUser
        })
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}


module.exports.login = async (req, res) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
    }

    try {
        let { email, password } = req.body

        let user = await userService.findByEmail(email)
        if (!user) {
            return res.status(401).json({ message: "user not found" })
        }

        let validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
            return res.status(401).json({ message: "please enter valid password" })
        }

        const token = jwt.sign({ user }, process.env.SECRET_KEY, { expiresIn: "1d" })

        let loginUser = user.toObject();
        loginUser.user_id = loginUser._id;
        loginUser._id = undefined

        res.status(200).json({
            message: "user login successfully",
            token,
            loginUser
        })

    } catch (err) {

        return res.status(500).json({ err: err.message })
    }
}


module.exports.userProfile = async (req, res) => {
    try {
        const { id } = req.params

        let user = await userService.findById(id)

        const userProfile = user.toObject()
        userProfile.user_id = userProfile._id
        userProfile._id = undefined

        res.status(200).json({
            message: "user profile get successfully",
            userProfile
        })
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
}


module.exports.resetPassword = async (req, res) => {
    try {
        const { id } = req.params
        const { oldPassword, newPassword } = req.body

        let user = await userService.findById(id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const isOldPassword = await bcrypt.compare(oldPassword, user.password)
        if (!isOldPassword) {
            return res.status(404).json({ message: "oldPassword is incorrect" })
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(404).json({ message: "new password must be at least 6 charecter long" })
        }

        const hashedPasswors = await bcrypt.hash(newPassword, 10)

        user.password = hashedPasswors

        await user.save();

        return res.status(200).json({
            message: "password reset successfully",
            user
        })
    } catch (err) {
        return res.status(500).json({ err: err.message })
    }
}

// In-memory OTP storage (use a database in production)
let otpStore = {};

module.exports.forgotPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email } = req.body;
        const { id } = req.params;  // The user ID from the URL

        // Check if the user exists using the user ID
        let user = await userService.f(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate OTP
        const otp = generateOtp();

        // Store OTP in memory (in production, store in a database with expiration time)
        otpStore[email] = otp;

        // Set up Nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "mbkaneriya1998@gmail.com",  // Your Gmail address
                pass: "rmfnynwipqbiixyc",  // Your Gmail App Password
            },
        });

        // Send OTP email function
        await sendOtpEmail(email, otp, transporter);

        res.status(200).json({ message: "OTP sent to email successfully" });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
};

// Generate OTP function
const generateOtp = () => {
    return crypto.randomInt(1000, 9999).toString();
};

// Send OTP email function
const sendOtpEmail = (email, otp, transporter) => {
    return transporter.sendMail({
        from: '"👻" <mbkaneriya1998@gmail.com>',
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}`,
    });
};

// Controller to verify OTP and reset password
module.exports.verifyOtpAndResetPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, otp, newPassword } = req.body;
        const { id } = req.params;

        let user = await userService.findById(id);
        console.log("User found:", user);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("Stored OTP:", otpStore[email]);
        console.log("Entered OTP:", otp);

        if (otpStore[email] !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }

        console.log("New password to hash:", newPassword);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log("Hashed password:", hashedPassword);

        user.password = hashedPassword;
        console.log("Updating user with new password:", user.password);
        await user.save();

        console.log("Password updated successfully for user:", user._id);

        // Step 6: Remove OTP after successful verification
        delete otpStore[email];

        res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
        console.error("Error during password reset:", err);
        res.status(500).json({ err: err.message });
    }
};
