const User = require('../models/userModel');
const authConfig = require("../configs/auth.config");
const jwt = require("jsonwebtoken");
const newOTP = require("otp-generators");
const mongoose = require('mongoose');
const Notification = require('../models/notificationModel');
const bcrypt = require("bcryptjs");







const reffralCode = async () => {
    var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let OTP = '';
    for (let i = 0; i < 9; i++) {
        OTP += digits[Math.floor(Math.random() * 36)];
    }
    return OTP;
}

exports.signup = async (req, res) => {
    try {
        const { fullName, mobileNumber, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            mobileNumber,
            email,
            password: hashedPassword,
            userType: "USER"
        });

        const savedUser = await newUser.save();
        const welcomeMessage = `Welcome, ${newUser.mobileNumber}! Thank you for registering.`;
        const welcomeNotification = new Notification({
            recipient: newUser._id,
            content: welcomeMessage,
            type: 'welcome',
        });
        await welcomeNotification.save();

        return res.status(201).json({ status: 201, data: savedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.loginWithPhone = async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        if (mobileNumber.replace(/\D/g, '').length !== 10) {
            return res.status(400).send({ status: 400, message: "Invalid mobileNumber number length" });
        }

        const user = await User.findOne({ mobileNumber: mobileNumber, userType: "USER" });
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        if (user) {
        //     let otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false });
        //     let otpExpiration = new Date(Date.now() + 60 * 1000);
        //     let accountVerification = false;
        //     const newUser = await User.create({ mobileNumber: mobileNumber, otp, otpExpiration, accountVerification, userType: "USER" });
        //     let obj = { id: newUser._id, otp: newUser.otp, mobileNumber: newUser.mobileNumber }
        //     const welcomeMessage = `Welcome, ${newUser.mobileNumber}! Thank you for registering.`;
        //     const welcomeNotification = new Notification({
        //         recipient: newUser._id,
        //         content: welcomeMessage,
        //         type: 'welcome',
        //     });
        //     await welcomeNotification.save();

        //     return res.status(200).send({ status: 200, message: "logged in successfully", data: obj });
        // } else {
            const userObj = {};
            userObj.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false });
            userObj.otpExpiration = new Date(Date.now() + 60 * 1000);
            userObj.accountVerification = false;
            const updated = await User.findOneAndUpdate({ mobileNumber: mobileNumber, userType: "USER" }, userObj, { new: true });
            let obj = { id: updated._id, otp: updated.otp, mobileNumber: updated.mobileNumber }
            return res.status(200).send({ status: 200, message: "logged in successfully", data: obj });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Server error" });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ status: 404, message: "user not found" });
        }
        console.log("Current Time:", new Date());
        console.log("OTP Expiration:", user.otpExpiration);

        if (user.otp !== otp || user.otpExpiration < Date.now()) {
            console.log("Invalid or expired OTP");
            return res.status(400).json({ status: 400, message: "Invalid or expired OTP" });
        }
        const updated = await User.findByIdAndUpdate({ _id: user._id }, { accountVerification: true }, { new: true });
        const accessToken = await jwt.sign({ id: user._id }, authConfig.secret, {
            expiresIn: authConfig.accessTokenTime,
        });
        let obj = {
            userId: updated._id,
            otp: updated.otp,
            mobileNumber: updated.mobileNumber,
            token: accessToken,
            completeProfile: updated.completeProfile
        }
        return res.status(200).send({ status: 200, message: "logged in successfully", data: obj });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ status: 500, error: "internal server error" + err.message });
    }
};

exports.resendOTP = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({ _id: id, userType: "USER" });
        if (!user) {
            return res.status(404).send({ status: 404, message: "User not found" });
        }
        const otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
        const otpExpiration = new Date(Date.now() + 60 * 1000);
        const accountVerification = false;
        const updated = await User.findOneAndUpdate({ _id: user._id }, { otp, otpExpiration, accountVerification }, { new: true });
        let obj = {
            id: updated._id,
            otp: updated.otp,
            mobileNumber: updated.mobileNumber
        }
        return res.status(200).send({ status: 200, message: "OTP resent", data: obj });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 500, message: "Server error" + error.message });
    }
};

exports.socialLogin = async (req, res) => {
    try {
        const { firstname, lastname, email, socialType } = req.body;

        const existingUser = await userModel.findOne({ $or: [{ email }], });

        if (existingUser) {
            const accessToken = jwt.sign({ id: existingUser.id, email: existingUser.email }, process.env.SECRETK, { expiresIn: "365d" });
            return res.status(200).json({
                status: 200,
                msg: "Login successfully",
                userId: existingUser._id,
                accessToken,
            });
        } else {
            const user = await userModel.create({ firstname, lastname, email, socialType, userType: "Distributor" });

            if (user) {
                const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.SECRETK, { expiresIn: "365d" });

                return res.status(200).json({
                    status: 200,
                    msg: "Login successfully",
                    userId: user._id,
                    accessToken,
                });
            }
        }
    } catch (err) {
        console.error("Error in socialLogin:", err);
        return res.status(500).json({
            status: 500,
            message: "Server error",
            error: err.message,
        });
    }
};

exports.registration = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id });
        if (user) {
            if (req.body.refferalCode == null || req.body.refferalCode == undefined) {
                req.body.otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false, });
                req.body.otpExpiration = new Date(Date.now() + 60 * 1000);
                req.body.accountVerification = true;
                req.body.refferalCode = await reffralCode();
                req.body.completeProfile = true;
                const userCreate = await User.findOneAndUpdate({ _id: user._id }, req.body, { new: true, });
                let obj = { id: userCreate._id, completeProfile: userCreate.completeProfile, phone: userCreate.mobileNumber }
                return res.status(200).send({ status: 200, message: "Registered successfully ", data: obj, });
            } else {
                const findUser = await User.findOne({ refferalCode: req.body.refferalCode });
                if (findUser) {
                    req.body.otp = newOTP.generate(6, { alphabets: false, upperCase: false, specialChar: false, });
                    req.body.otpExpiration = new Date(Date.now() + 60 * 1000);
                    req.body.accountVerification = true;
                    req.body.userType = "USER";
                    req.body.refferalCode = await reffralCode();
                    req.body.refferUserId = findUser._id;
                    req.body.completeProfile = true;
                    const userCreate = await User.findOneAndUpdate({ _id: user._id }, req.body, { new: true, });
                    if (userCreate) {
                        let updateWallet = await User.findOneAndUpdate({ _id: findUser._id }, { $push: { joinUser: userCreate._id } }, { new: true });
                        let obj = { id: userCreate._id, completeProfile: userCreate.completeProfile, phone: userCreate.mobileNumber }
                        return res.status(200).send({ status: 200, message: "Registered successfully ", data: obj, });
                    }
                } else {
                    return res.status(404).send({ status: 404, message: "Invalid refferal code", data: {} });
                }
            }
        } else {
            return res.status(404).send({ status: 404, msg: "Not found" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Server error" });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const memberSince = user.createdAt.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        });

        return res.status(200).json({
            status: 200,
            data: {
                user,
                memberSince,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getUserProfileById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const memberSince = user.createdAt.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        });

        return res.status(200).json({
            status: 200, data: {
                user,
                memberSince,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { image: req.file.path, }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        return res.status(200).json({ status: 200, message: 'Profile Picture Uploaded successfully', data: updatedUser });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Failed to upload profile picture', error: error.message });
    }
};

exports.editProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const { firstName, lastName, email, mobileNumber } = req.body;

        const updateObject = {};
        if (firstName) updateObject.firstName = firstName;
        if (lastName) updateObject.lastName = lastName;
        if (email) updateObject.email = email;
        if (mobileNumber) updateObject.mobileNumber = mobileNumber;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateObject },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        return res.status(200).json({ status: 200, message: 'Edit Profile updated successfully', data: updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};