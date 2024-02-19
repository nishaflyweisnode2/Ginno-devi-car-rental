const User = require('../models/userModel');
const authConfig = require("../configs/auth.config");
const jwt = require("jsonwebtoken");
const newOTP = require("otp-generators");
const mongoose = require('mongoose');
const Notification = require('../models/notificationModel');
const bcrypt = require("bcryptjs");
const City = require('../models/cityModel');
const Brand = require('../models/brandModel');
const Car = require('../models/carModel');
const Review = require('../models/ratingModel');
const HostReview = require('../models/hostRatingModel');
const Policy = require('../models/policiesModel');
const MainCategory = require('../models/rental/mainCategoryModel');
const Category = require('../models/rental/categoryModel');
const SubscriptionCategory = require('../models/subscription/subscriptionCategoryModel');
const Offer = require('../models/offerModel');
const Coupon = require('../models/couponModel');
const Booking = require('../models/bookingModel');
const Location = require("../models/carLocationModel");
const AdminPackage = require('../models/adminPackageModel');
const AdminCarPrice = require('../models/adminCarPriceModel');
const DoorstepDeliveryPrice = require('../models/doorstepPriceModel');
const Plan = require('../models/kmPlanModel');
const DriverPrice = require('../models/driverPriceModel');
const CancelReason = require('../models/cancelReasonModel');
const RefundCharge = require('../models/refunfChargeModel');
const Refund = require('../models/refundModel');
const InspectionModel = require('../models/carInsceptionModel');
const Image = require('../models/imageModel');
const SubscriptionVsBuying = require('../models/subscription/subscriptionBuyingModel');
const SubScriptionFAQ = require('../models/subscription/subscriptionFaqModel');
const SharedCar = require('../models/shareCarModel');
const CallUs = require('../models/callUsModel');
const Feedback = require('../models/feedbackModel');
const FAQ = require('../models/faqModel');
const Transaction = require('../models/transctionModel');
const CarFeatures = require('../models/carFeaturesModel');
const cron = require('node-cron');
const ReferralBonus = require('../models/referralBonusAmountModel');
const Tax = require('../models/taxModel');
const ReferralLevel = require('../models/referralLevelModel');





const reffralCode = async () => {
    var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let OTP = '';
    for (let i = 0; i < 9; i++) {
        OTP += digits[Math.floor(Math.random() * 36)];
    }
    return OTP;
}

const generateBookingCode = async () => {
    const digits = "0123456789";
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let code = '';

    for (let i = 0; i < 5; i++) {
        code += digits[Math.floor(Math.random() * 10)];
    }

    for (let i = 0; i < 3; i++) {
        code += letters[Math.floor(Math.random() * 26)];
    }

    return code;
}

exports.signup1 = async (req, res) => {
    try {
        const { fullName, mobileNumber, email, password, confirmPassword, referralCode } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ status: 400, message: 'Passwords and ConfirmPassword do not match' });
        }

        const existingUser = await User.findOne({ mobileNumber: mobileNumber, userType: "USER" });
        if (existingUser) {
            return res.status(409).json({ status: 409, message: 'User Already Registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let referredBy;
        let referralUser;
        if (referralCode) {
            referredBy = await User.findOne({ refferalCode: referralCode });
            if (!referredBy) {
                return res.status(400).json({ status: 400, message: 'Invalid referral code' });
            }
            referralUser = referredBy;
        }

        let referralBonusAmount = 0;
        const referralBonus = await ReferralBonus.findOne({ type: 'UserReferral' });
        if (referralBonus) {
            const adminUser = await User.findOne({ userType: 'ADMIN' });
            if (!adminUser) {
                return res.status(404).json({ status: 404, message: 'Admin user not found' });
            }

            referralBonusAmount = Math.round(adminUser.wallet * (referralBonus.percentage / 100));
        }
        console.log("referralBonusAmount", referralBonusAmount);

        const newUser = new User({
            fullName,
            mobileNumber,
            email,
            password: hashedPassword,
            userType: "USER",
            refferalCode: await reffralCode(),
        });

        if (referredBy) {
            newUser.level = referredBy.level + 1;
            newUser.referredBy.push(referredBy._id);
            if (referralUser) {
                referralUser.referredTo.push(newUser._id);
                await referralUser.save();
            }
        }

        const savedUser = await newUser.save();

        const referralUserLevel = await User.findOne({ _id: referralUser });
        if (!referralUserLevel) {
            return res.status(404).json({ status: 404, message: 'referralUser user not found' });
        }
        const referredByUserLevel = await User.findOne({ _id: newUser._id });
        if (!referredByUserLevel) {
            return res.status(404).json({ status: 404, message: 'referredBy user not found' });
        }
        console.log("referralUserLevel", referralUserLevel._id);
        console.log("referredByUserLevel", referredByUserLevel._id);
        console.log("referralUserLevel", referralUserLevel.level);
        console.log("referredByUserLevel", referredByUserLevel.level);

        let referralLevelAmount = 0;
        const referralLevel = await ReferralLevel.findOne({ type: 'UserReferral' });
        // console.log("referralLevel", referralLevel);

        // if (referralLevel) {
        //     referralLevelAmount = referralLevel.amount;
        // }

        // if (referredBy) {
        //     referredBy.wallet += referralBonusAmount;
        //     await referredBy.save();
        //     savedUser.wallet += referralBonusAmount;
        //     await savedUser.save();
        // }

        const accessToken = await jwt.sign({ id: savedUser._id }, authConfig.secret, {
            expiresIn: authConfig.accessTokenTime,
        });

        const welcomeMessage = `Welcome, ${savedUser.mobileNumber}! Thank you for registering.`;
        const welcomeNotification = new Notification({
            recipient: savedUser._id,
            content: welcomeMessage,
            type: 'welcome',
        });
        await welcomeNotification.save();

        return res.status(201).json({ status: 201, data: { accessToken }, savedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.signup = async (req, res) => {
    try {
        const { fullName, mobileNumber, email, password, confirmPassword, referralCode } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ status: 400, message: 'Passwords and ConfirmPassword do not match' });
        }

        const existingUser = await User.findOne({ mobileNumber: mobileNumber, userType: "USER" });
        if (existingUser) {
            return res.status(409).json({ status: 409, message: 'User Already Registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let referredBy;
        let referralUser;
        if (referralCode) {
            referredBy = await User.findOne({ refferalCode: referralCode });
            if (!referredBy) {
                return res.status(400).json({ status: 400, message: 'Invalid referral code' });
            }
            referralUser = referredBy;
        }

        let referralBonusAmount = 0;
        const referralBonus = await ReferralBonus.findOne({ type: 'UserReferral' });
        if (referralBonus) {
            const adminUser = await User.findOne({ userType: 'ADMIN' });
            if (!adminUser) {
                return res.status(404).json({ status: 404, message: 'Admin user not found' });
            }
            referralBonusAmount = Math.round(adminUser.wallet * (referralBonus.percentage / 100));
        }
        console.log("referralBonusAmount", referralBonusAmount);

        const newUser = new User({
            fullName,
            mobileNumber,
            email,
            password: hashedPassword,
            userType: "USER",
            refferalCode: await reffralCode(),
        });

        if (referredBy) {
            newUser.level = referredBy.level + 1;
            newUser.referredBy.push(referredBy._id);
            if (referralUser) {
                referralUser.referredTo.push(newUser._id);
                await referralUser.save();
            }

            const referralLevel = await ReferralLevel.findOne({ type: 'UserReferral' });
            if (referralLevel) {
                const levelPercentage = referralLevel.allLevels.find(level => level.level === newUser.level.toString());
                if (levelPercentage) {
                    referralBonusAmount += Math.round(referralBonusAmount * (parseInt(levelPercentage.percentage) / 100));
                    console.log("referralBonusAmount", referralBonusAmount);

                }
            }
            console.log("referralLevel", referralLevel);

            referredBy.wallet += referralBonusAmount;
            await referredBy.save();
            newUser.wallet += referralBonusAmount;
        }

        const savedUser = await newUser.save();

        const accessToken = await jwt.sign({ id: savedUser._id }, authConfig.secret, {
            expiresIn: authConfig.accessTokenTime,
        });

        const welcomeMessage = `Welcome, ${savedUser.mobileNumber}! Thank you for registering.`;
        const welcomeNotification = new Notification({
            recipient: savedUser._id,
            content: welcomeMessage,
            type: 'welcome',
        });
        await welcomeNotification.save();

        return res.status(201).json({ status: 201, data: { accessToken }, savedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.loginWithPhone = async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        if (mobileNumber.replace(/\D/g, '').length !== 10) {
            return res.status(400).json({ status: 400, message: "Invalid mobile number length" });
        }

        const user = await User.findOne({ mobileNumber, userType: "USER" });

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const userObj = {
            otp: newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false }),
            otpExpiration: new Date(Date.now() + 60 * 1000),
            accountVerification: false,
        };

        const updatedUser = await User.findOneAndUpdate(
            { mobileNumber, userType: "USER" },
            userObj,
            { new: true }
        );

        const responseObj = {
            id: updatedUser._id,
            otp: updatedUser.otp,
            mobileNumber: updatedUser.mobileNumber,
        };

        return res.status(200).json({ status: 200, message: "Logged in successfully", data: responseObj });
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

        const updatedUser = await User.findByIdAndUpdate(userId, { image: req.file.path, completeProfile: true }, { new: true });

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

        const { fullName, email, password, confirmPassword, mobileNumber } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ status: 400, message: 'Passwords and ConfirmPassword do not match' });
        }

        const updateObject = {};
        if (fullName) updateObject.fullName = fullName;
        if (email) updateObject.email = email;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateObject.password = hashedPassword;
        }
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

exports.updateLocation = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id });
        if (!user) {
            return res.status(404).send({ status: 404, message: "User not found" });
        }

        let updateFields = {};

        if (req.body.currentLat || req.body.currentLong) {
            const coordinates = [parseFloat(req.body.currentLat), parseFloat(req.body.currentLong)];
            updateFields.currentLocation = { type: "Point", coordinates };
        }

        if (req.body.state) {
            updateFields.state = req.body.state;
            updateFields.isState = true;
        }

        if (req.body.city) {
            updateFields.city = req.body.city;
            updateFields.isCity = true;
        }

        const updatedUser = await User.findByIdAndUpdate(
            { _id: user._id },
            { $set: updateFields },
            { new: true }
        );

        if (updatedUser) {
            let obj = {
                currentLocation: updatedUser.currentLocation,
                state: updatedUser.state,
                city: updatedUser.city,
            };
            return res.status(200).send({ status: 200, message: "Location update successful.", data: obj });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 500, message: "Server error" + error.message });
    }
};

exports.getAllCities = async (req, res) => {
    try {
        const cities = await City.find();

        return res.status(200).json({
            status: 200,
            message: 'Cities retrieved successfully',
            data: cities,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getCityById = async (req, res) => {
    try {
        const city = await City.findById(req.params.id);

        if (!city) {
            return res.status(404).json({ message: 'City not found' });
        }

        return res.status(200).json({
            status: 200,
            message: 'City retrieved successfully',
            data: city,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllCars = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const partnerCars = await Car.find();

        return res.status(200).json({ status: 200, data: partnerCars });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }
        return res.status(200).json({ status: 200, data: car });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.createReview = async (req, res) => {
    try {
        const { carId, rating, comment } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ status: 400, message: 'Invalid rating. Rating should be between 1 and 5.' });
        }

        const newReview = new Review({
            user: userId,
            car: carId,
            rating,
            comment
        });

        await newReview.save();

        const reviewsForCar = await Review.find({ car: carId });
        const numOfUserReviews = reviewsForCar.length;

        let totalRating = 0;
        reviewsForCar.forEach(review => {
            totalRating += review.rating;
        });

        const averageRating = totalRating / numOfUserReviews;

        newReview.numOfUserReviews = numOfUserReviews;
        newReview.averageRating = Math.round(averageRating);

        await newReview.save();

        res.status(201).json({ status: 201, message: 'Review created successfully', data: newReview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getReviewsByCar = async (req, res) => {
    try {
        const { carId } = req.params;

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ status: 404, message: 'Car not found' });
        }

        const reviews = await Review.find({ car: carId }).populate({
            path: 'user',
            select: 'fullName mobileNumber email image',
        });

        let totalRating = 0;
        reviews.forEach(review => {
            totalRating += review.rating;
        });
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

        res.status(200).json({ status: 200, data: { reviews, numOfUserReviews: reviews.length, averageRating } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.createHostReview = async (req, res) => {
    try {
        const { carId, hostRating, hostComment } = req.body;

        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        if (hostRating < 0 || hostRating > 5) {
            return res.status(400).json({ status: 400, message: 'Invalid hostRating. HostRating should be between 0 and 5.', data: {} });
        }

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        const existingReview = await HostReview.findOne({ user: userId, car: carId });
        if (existingReview) {
            return res.status(400).json({ status: 400, message: 'You have already reviewed this host' });
        }

        const review = new HostReview({
            user: userId,
            car: carId,
            host: car.owner,
            hostRating,
            hostComment,
        });

        await review.save();

        const reviewsForCar = await HostReview.find({ car: carId });
        const numOfUserReviews = reviewsForCar.length;

        let totalRating = 0;
        reviewsForCar.forEach(review => {
            totalRating += review.hostRating;
        });

        const averageRating = totalRating / numOfUserReviews;

        review.numOfHostReviews = numOfUserReviews;
        review.averageHostRating = Math.round(averageRating);

        await review.save();

        return res.status(201).json({ status: 201, message: 'Host review created successfully', data: review });
    } catch (error) {
        console.error('Error creating host review:', error);
        return res.status(500).json({ status: 500, message: 'Server error', error: error.message });
    }
};

exports.getHostReviewById = async (req, res) => {
    try {
        const { hostId } = req.params;

        const user = await User.findById(hostId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const car = await Car.findOne({ owner: hostId });
        if (!car) {
            return res.status(404).json({ status: 404, message: 'Car not found' });
        }

        const reviews = await HostReview.find({ owner: hostId });

        let totalRating = 0;
        reviews.forEach(review => {
            totalRating += review.hostRating;
        });
        const averageHostRating = reviews.length > 0 ? totalRating / reviews.length : 0;

        res.status(200).json({ status: 200, data: { reviews, numOfUserReviews: reviews.length, averageHostRating } });
    } catch (error) {
        console.error('Error fetching host review by ID:', error);
        return res.status(500).json({ status: 500, message: 'Server error', error: error.message });
    }
};

exports.getAllMainCategories = async (req, res) => {
    try {
        const categories = await MainCategory.find();

        const count = categories.length;

        return res.status(200).json({ status: 200, data: count, categories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching MainCategories', error: error.message });
    }
};

exports.getMainCategoryById = async (req, res) => {
    try {
        const mainCategoryId = req.params.mainCategoryId;

        const category = await MainCategory.findById(mainCategoryId);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Main Category not found' });
        }

        return res.status(200).json({ status: 200, data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching Main Category', error: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('mainCategory');

        const count = categories.length;

        return res.status(200).json({ status: 200, data: count, categories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching categories', error: error.message });
    }
};

exports.getCategoryByMainCategory = async (req, res) => {
    try {
        const mainCategoryId = req.params.id;

        const mainCategory = await MainCategory.findById(mainCategoryId);

        if (!mainCategory) {
            return res.status(404).json({ status: 404, message: 'Main category not found' });
        }

        const subcategories = await Category.find({ mainCategory: mainCategoryId }).populate('mainCategory');

        const count = subcategories.length;

        return res.status(200).json({ status: 200, data: count, subcategories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching subcategories', error: error.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        const category = await Category.findById(categoryId).populate('mainCategory');

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }

        return res.status(200).json({ status: 200, data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching category', error: error.message });
    }
};

exports.getAllSubscriptionCategories = async (req, res) => {
    try {
        const categories = await SubscriptionCategory.find().populate('mainCategory');

        const count = categories.length;

        return res.status(200).json({ status: 200, data: count, categories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching Subscription Category', error: error.message });
    }
};

exports.getSubcategoriesByMainCategory = async (req, res) => {
    try {
        const mainCategoryId = req.params.id;

        const mainCategory = await MainCategory.findById(mainCategoryId);

        if (!mainCategory) {
            return res.status(404).json({ status: 404, message: 'Main category not found' });
        }

        const subcategories = await SubscriptionCategory.find({ mainCategory: mainCategoryId }).populate('mainCategory');

        const count = subcategories.length;

        return res.status(200).json({ status: 200, data: count, subcategories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching subcategories', error: error.message });
    }
};

exports.getSubscriptionCategoryById = async (req, res) => {
    try {
        const subscriptioncategoryId = req.params.subscriptioncategoryId;

        const category = await SubscriptionCategory.findById(subscriptioncategoryId).populate('mainCategory');

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Subscription not found' });
        }

        return res.status(200).json({ status: 200, data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching Subscription Category', error: error.message });
    }
};

exports.getAllOffers = async (req, res) => {
    try {
        const allOffers = await Offer.find();

        return res.status(200).json({ status: 200, data: allOffers });
    } catch (error) {
        console.error('Error fetching offers:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getOfferById = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);

        if (!offer) {
            return res.status(404).json({ status: 404, message: 'Offer not found' });
        }

        return res.status(200).json({ status: 200, data: offer });
    } catch (error) {
        console.error('Error fetching offer by ID:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.status(200).json({ status: 200, data: coupons });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Server error' });
    }
};

exports.getCouponById = async (req, res) => {
    try {
        const couponId = req.params.id;
        const coupon = await Coupon.findById(couponId);

        if (!coupon) {
            return res.status(404).json({ status: 404, message: 'Coupon not found' });
        }

        res.status(200).json({ status: 200, data: coupon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Server error' });
    }
};

exports.getAllAdminPackages = async (req, res) => {
    try {
        const adminPackages = await AdminPackage.find();
        return res.status(200).json({ status: 200, data: adminPackages });
    } catch (error) {
        console.error('Error fetching admin packages:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getAdminPackageById = async (req, res) => {
    try {
        const adminPackage = await AdminPackage.findById(req.params.id);

        if (!adminPackage) {
            return res.status(404).json({ status: 404, message: 'Admin package not found' });
        }

        return res.status(200).json({ status: 200, data: adminPackage });
    } catch (error) {
        console.error('Error fetching admin package:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.find();
        return res.status(200).json({ status: 200, data: plans });
    } catch (error) {
        console.error('Error fetching plans:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getPlanById = async (req, res) => {
    try {
        const planId = req.params.id;
        const plan = await Plan.findById(planId);

        if (!plan) {
            return res.status(404).json({ status: 404, message: 'Plan not found' });
        }

        return res.status(200).json({ status: 200, data: plan });
    } catch (error) {
        console.error('Error fetching plan by ID:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getPlanByMainCategory = async (req, res) => {
    try {
        const mainCategory = req.params.mainCategory;

        const category = await MainCategory.findById(mainCategory);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Main Category not found' });
        }

        const plans = await Plan.find({ mainCategory: mainCategory });

        if (!plans || plans.length === 0) {
            return res.status(404).json({ status: 404, message: 'No plans found for the specified main category' });
        }

        return res.status(200).json({ status: 200, data: plans });
    } catch (error) {
        console.error('Error fetching plans by main category:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

function getDistanceBetweenCoordinates(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = degToRad(lat2 - lat1);
    const dLon = degToRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    return distance;
}
function degToRad(deg) {
    return deg * (Math.PI / 180);
}

exports.checkCarAvailability1 = async (req, res) => {
    try {
        const { pickup, destinationLocation, pickupDate, dropOffDate, pickupTime, dropOffTime } = req.query;

        const [latitude, longitude] = decodeURIComponent(pickup).split(',').map(Number);
        console.log('pickup:', pickup);
        console.log('latitude:', latitude);
        console.log('longitude:', longitude);
        const locationDetails = await Location.findOne({
            coordinates: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: 10000,
                },
            },
        });

        console.log("Location details array:", locationDetails);

        if (!locationDetails) {
            return res.status(404).json({ status: 404, message: 'Location not found' });
        }

        const startDateTime = new Date(`${pickupDate}T${pickupTime}`);
        const endDateTime = new Date(`${dropOffDate}T${dropOffTime}`);

        const bookedCars = await Booking.find({
            $and: [
                {
                    $or: [
                        { pickupTime: { $lte: pickupTime }, dropOffTime: { $gte: dropOffTime } },
                        { pickupTime: { $gte: pickupTime }, dropOffTime: { $lte: dropOffTime } },
                    ],
                },
                {
                    $or: [
                        { pickupDate: { $lte: pickupDate }, dropOffDate: { $gte: dropOffDate } },
                        { pickupDate: { $gte: pickupDate }, dropOffDate: { $lte: dropOffDate } },
                    ],
                },
                {
                    $or: [
                        { status: 'PENDING', isTripCompleted: false },
                        { isSubscription: false },
                        { isTimeExtended: true, timeExtendedDropOffTime: { $gte: startDateTime, $lte: endDateTime } },
                    ],
                },
            ],
        });

        const bookedCarIds = bookedCars.map(booking => booking.car);

        const availableCars = await Car.find({
            _id: { $nin: bookedCarIds },
            pickup: locationDetails._id,
            isOnTrip: false,
            isAvailable: true,
            nextAvailableDateTime: { $gte: startDateTime, $lte: endDateTime },
        }).populate('pickup');

        const nearbyCars = availableCars.filter(car => {
            const carCoordinates = car.pickup && car.pickup.coordinates;
            console.log("Car pickup object:", car.pickup);

            if (carCoordinates && Array.isArray(carCoordinates) && carCoordinates.length === 2) {
                const carLatitude = carCoordinates[1];
                const carLongitude = carCoordinates[0];

                console.log(`Valid car coordinates: [${carLatitude}, ${carLongitude}]`);

                const distance = getDistanceBetweenCoordinates(latitude, longitude, carLatitude, carLongitude);

                console.log(`Distance to car: ${distance} meters`);

                if (distance <= 10000) {
                    return true;
                }
            } else {
                console.log("Invalid car coordinates");
            }

            return false;
        });

        console.log("nearbyCars", nearbyCars);

        if (nearbyCars.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No available cars found for the specified location and time window.',
            });
        }

        return res.status(200).json({ status: 200, data: nearbyCars });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'An error occurred while checking car availability.' });
    }
};

exports.checkCarAvailability = async (req, res) => {
    try {
        const { pickup, destinationLocation, mainCategory, pickupDate, dropOffDate, pickupTime, dropOffTime } = req.query;

        const [latitude, longitude] = decodeURIComponent(pickup).split(',').map(Number);
        console.log('pickup:', pickup);
        console.log('latitude:', latitude);
        console.log('longitude:', longitude);

        const locationDetails = await Location.findOne({
            coordinates: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: 10000,
                },
            },
        });

        console.log("Location details:", locationDetails);
        const startDateTime = new Date(`${pickupDate}T${pickupTime}`);
        const endDateTime = new Date(`${dropOffDate}T${dropOffTime}`);

        const bookedCars = await Booking.find({
            $and: [
                {
                    $or: [
                        { pickupTime: { $lte: pickupTime }, dropOffTime: { $gte: dropOffTime } },
                        { pickupTime: { $gte: pickupTime }, dropOffTime: { $lte: dropOffTime } },
                    ],
                },
                {
                    $or: [
                        { pickupDate: { $lte: pickupDate }, dropOffDate: { $gte: dropOffDate } },
                        { pickupDate: { $gte: pickupDate }, dropOffDate: { $lte: dropOffDate } },
                    ],
                },
                {
                    $or: [
                        { status: 'PENDING', isTripCompleted: false },
                        { isSubscription: false },
                        { isTimeExtended: true, timeExtendedDropOffTime: { $gte: startDateTime, $lte: endDateTime } },
                    ],
                },
            ],
        });

        const bookedCarIds = bookedCars.map(booking => booking.car);
        let availableCars;

        if (locationDetails) {
            availableCars = await Car.find({
                _id: { $nin: bookedCarIds },
                pickup: locationDetails._id,
                isOnTrip: false,
                isAvailable: true,
                nextAvailableDateTime: { $gte: startDateTime, $lte: endDateTime },
            }).populate('pickup');
        } else {
            const nearbyCars = await Car.find({
                _id: { $nin: bookedCarIds },
                'pickup.coordinates': {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [longitude, latitude],
                        },
                        $maxDistance: 10000,
                    },
                },
                isOnTrip: false,
                isAvailable: true,
                nextAvailableDateTime: { $gte: startDateTime, $lte: endDateTime },
            }).populate('pickup');

            if (nearbyCars.length === 0) {
                return res.status(404).json({
                    status: 404,
                    message: 'No available cars found for the specified location and time window.',
                });
            }

            availableCars = nearbyCars;
        }

        console.log("Available cars:", availableCars);

        const combinedData = [];
        for (let car of availableCars) {
            const adminCarPrice = await AdminCarPrice.findOne({ car: car._id, mainCategory: mainCategory });
            let rentalPrice = 0;
            if (adminCarPrice) {
                rentalPrice = adminCarPrice.autoPricing ? adminCarPrice.adminHourlyRate : adminCarPrice.hostHourlyRate;
            }
            combinedData.push({ ...car.toObject(), rentalPrice });
        }

        if (combinedData.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No available cars found for the specified location and time window.',
            });
        }

        if (availableCars.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No available cars found for the specified location and time window.',
            });
        }

        return res.status(200).json({ status: 200, data: combinedData });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'An error occurred while checking car availability.' });
    }
};

exports.checkSharingCarAvailability1 = async (req, res) => {
    try {
        const { leavingFrom, goingTo, date, seat } = req.query;

        const leavingFromCoordinates = {
            type: "Point",
            coordinates: leavingFrom.split(',').map(parseFloat)
        };

        const goingToCoordinates = {
            type: "Point",
            coordinates: goingTo.split(',').map(parseFloat)
        };

        const sharedCars = await SharedCar.find({
            type: "Sharing",
            pickupCoordinates: leavingFromCoordinates,
            dropCoordinates: goingToCoordinates,
            availableFrom: date,
            noOfPassenger: { $gte: seat }
        });

        if (sharedCars.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No shared cars found for the specified route and date.',
            });
        }

        const carIds = sharedCars.map(car => car.car);

        const cars = await Car.find({ _id: { $in: carIds } });

        const combinedData = sharedCars.map(sharedCar => {
            const carDetails = cars.find(car => car._id.toString() === sharedCar.car.toString());
            return { ...sharedCar.toObject(), carDetails };
        });

        return res.status(200).json({ status: 200, data: combinedData });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'An error occurred while checking car availability.' });
    }
};

exports.checkSharingCarAvailability = async (req, res) => {
    try {
        const { leavingFrom, goingTo, date, seat } = req.query;

        const leavingFromCoordinates = {
            type: "Point",
            coordinates: leavingFrom.split(',').map(parseFloat)
        };

        const goingToCoordinates = {
            type: "Point",
            coordinates: goingTo.split(',').map(parseFloat)
        };
        console.log("date", date);
        const sharedCars = await SharedCar.find({
            type: "Sharing",
            pickupCoordinates: leavingFromCoordinates,
            dropCoordinates: goingToCoordinates,
            availableFrom: date,
            noOfPassenger: { $gte: seat }
        });

        if (sharedCars.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No shared cars found for the specified route and date.',
            });
        }

        const carIds = sharedCars.map(car => car.car);

        const bookedCars = await Booking.find({
            $and: [
                {
                    $or: [
                        { pickupDate: date },
                    ],
                },
                {
                    $or: [
                        { dropOffDate: date },
                    ],
                },
                {
                    $or: [
                        { status: 'PENDING', isTripCompleted: false },
                        { isSubscription: false },
                        { isTimeExtended: true, timeExtendedDropOffTime: { $gte: date, $lte: date } },
                    ],
                },
            ],
        });
        const bookedCarIds = bookedCars.map(booking => booking.car);

        const availableCarIds = carIds.filter(carId => !bookedCarIds.includes(carId));

        const availableCars = await Car.find(
            {
                _id: { $in: availableCarIds },
                isSharing: true
            }
        );

        if (availableCars.length === 0) {
            return res.status(404).json({ status: 404, message: 'No shared cars found.', });
        }

        const combinedData = [];

        // const combinedData = sharedCars.map(sharedCar => {
        //     const carDetails = availableCars.find(car => car._id.toString() === sharedCar.car.toString());
        //     return { ...sharedCar.toObject(), carDetails };
        // });

        for (const sharedCar of sharedCars) {
            const carDetails = availableCars.find(car => car._id.toString() === sharedCar.car.toString());
            const adminCarPrice = await AdminCarPrice.findOne({ car: sharedCar.car, mainCategory: sharedCar.mainCategory });
            console.log("****", adminCarPrice);

            let rentalPrice;
            if (adminCarPrice) {
                if (adminCarPrice.autoPricing) {
                    rentalPrice = adminCarPrice.adminHourlyRate;
                } else {
                    rentalPrice = adminCarPrice.hostHourlyRate;
                }
            }
            console.log("****", rentalPrice);
            const carData = { ...sharedCar.toObject(), carDetails, rentalPrice };
            combinedData.push(carData);
        }

        return res.status(200).json({ status: 200, data: combinedData });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'An error occurred while checking car availability.' });
    }
};

exports.createBooking = async (req, res) => {
    try {
        const userId = req.user._id;
        let { carId, mainCategory, category, carChoice, plan, destinationLocation, pickupDate, dropOffDate, pickupTime, dropOffTime, subscriptionMonths, accessoriesId, tripPackage } = req.body;

        const currentDate = new Date();
        const requestedPickupDate = new Date(`${pickupDate}T${pickupTime}:00.000Z`);

        if (subscriptionMonths) {
            if (!subscriptionMonths || subscriptionMonths <= 0) {
                return res.status(400).json({ status: 400, message: 'Invalid subscription duration', data: null });
            }

            const carCheck = await Car.findById(carId);
            if (!carCheck) {
                return res.status(400).json({ status: 400, message: 'Car not available', data: null });
            }

            if (!carCheck.isSubscription) {
                return res.status(400).json({ status: 400, message: 'Car not available for Subscription', data: null });
            }

            dropOffDate = new Date(requestedPickupDate);
            dropOffDate.setUTCMonth(dropOffDate.getUTCMonth() + subscriptionMonths);
            dropOffDate.setUTCHours(0, 0, 0, 0);
            const dropOffDateString = dropOffDate.toISOString().split('T')[0];
            dropOffDate = dropOffDateString
            dropOffTime = pickupTime
        }
        console.log("dropOffDate", dropOffDate);

        if (requestedPickupDate < currentDate) {
            return res.status(400).json({ status: 400, message: 'Invalid pickup date. Pickup date cannot be earlier than the current date.', data: null });
        }

        let driverPrice;
        if (category) {
            const checkCategory = await Category.findById(category);
            if (!checkCategory) {
                return res.status(404).json({ status: 404, message: 'Category not found' });
            }

            const price = await DriverPrice.findOne({ category: category });
            if (!price) {
                return res.status(404).json({ status: 404, message: 'Price not found' });
            }
            driverPrice = price.price
        }

        if (mainCategory) {
            const checkMainCategory = await MainCategory.findById(mainCategory);
            if (!checkMainCategory) {
                return res.status(404).json({ status: 404, message: 'MainCategory not found' });
            }
        }

        const checkPlan = await Plan.findById(plan);
        if (!checkPlan) {
            return res.status(404).json({ status: 404, message: 'Plan not found' });
        }

        let tripProtctionMoney = 0;
        if (tripPackage) {
            const package = await AdminPackage.findById(tripPackage)
            if (!package) {
                return res.status(400).json({ status: 400, message: 'Trip packages Not Found', data: null });
            }
            tripProtctionMoney = package.price
        }

        let carChoicePrice;
        if (carChoice) {
            const category = await Category.findById(carChoice);
            if (!category) {
                return res.status(404).json({ status: 404, message: 'Category not found' });
            }

            const option = await DoorstepDeliveryPrice.findOne({ category: carChoice })
            if (!option) {
                return res.status(400).json({ status: 400, message: 'Car Choice Not Found', data: null });
            }

            carChoicePrice = option.price
        }

        const existingBookingPickup = await Booking.findOne({
            car: carId,
            pickupDate,
            pickupTime,
            dropOffDate: { $gte: pickupDate },
            isTripCompleted: false,
            isSubscription: true,
        });

        const existingBookingDrop = await Booking.findOne({
            car: carId,
            pickupDate: { $lte: dropOffDate },
            dropOffDate,
            dropOffTime,
            isTripCompleted: false,
            isSubscription: true,
        });

        const existingExtendedBookingPickup = await Booking.findOne({
            car: carId,
            extendedDropOffDate: pickupDate || extendedDropOffDate,
            extendedDropOffTime: pickupTime || extendedDropOffTime,
            isTripCompleted: false,
            isSubscription: true,
        });

        const existingExtendedBookingDrop = await Booking.findOne({
            car: carId,
            pickupDate: { $lte: dropOffDate },
            dropOffDate,
            dropOffTime,
            isTripCompleted: false,
            isSubscription: true,
        });

        if (existingBookingPickup || existingBookingDrop || existingExtendedBookingPickup || existingExtendedBookingDrop) {
            return res.status(400).json({ status: 400, message: 'Car is already booked for the specified pickup and/or drop-off date and time.', data: null, });
        } else {

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ status: 404, message: 'User not found', data: null });
            }

            if (user.isVerified === false) {
                return res.status(404).json({ status: 404, message: 'User can not book Car first approved account by admin', data: null });
            }

            const carExist = await Car.findById(carId);
            if (!carExist) {
                return res.status(400).json({ status: 400, message: 'Car not available', data: null });
            }

            const isBikeAvailable = await checkBikeAvailability(carId, pickupDate, dropOffDate, pickupTime, dropOffTime);
            if (!isBikeAvailable) {
                return res.status(400).json({ status: 400, message: 'Car is not available for the specified dates and times.', data: null });
            }

            let accessoriesPrice = 0;
            if (accessoriesId) {
                const accessory = await Accessory.findById(accessoriesId);
                if (accessory) {
                    const bikeStore = await BikeStoreRelation.findOne({ bike: bikeId });
                    const accessoryStore = await BikeStoreRelation.findOne({ accessory: accessoriesId });

                    if (!bikeStore || !accessoryStore || bikeStore.store.toString() !== accessoryStore.store.toString()) {
                        return res.status(400).json({ status: 400, message: 'Car and accessory must be in the same store for booking.', data: null });
                    }

                    accessoriesPrice = accessory.price || 0;
                }
            }

            const adminCarPrice = await AdminCarPrice.findOne({ car: carId, mainCategory: mainCategory });
            console.log("adminCarPrice", adminCarPrice);
            let rentalPrice;
            if (adminCarPrice.autoPricing) {
                rentalPrice = adminCarPrice.adminHourlyRate;
            } else {
                rentalPrice = adminCarPrice.hostHourlyRate;
            }

            console.log("rentalPrice", rentalPrice);


            const durationInDays = calculateDurationInDays(pickupDate, dropOffDate, pickupTime, dropOffTime);
            console.log("durationInDays", durationInDays);

            let basePrice = rentalPrice * durationInDays;
            basePrice = basePrice + accessoriesPrice

            const totalPrice = basePrice;

            console.log("totalPrice", totalPrice);

            if (isNaN(totalPrice) || totalPrice < 0) {
                return res.status(400).json({ status: 400, message: 'Invalid totalPrice', data: null });
            }

            const roundedBasePrice = Math.round(basePrice);
            const roundedTotalPrice = Math.round(totalPrice);

            const taxPercentage = await Tax.findOne();
            const taxAmountPercentage = taxPercentage.percentage;

            const taxAmount = roundedTotalPrice * (taxAmountPercentage / 100);

            const totalPriceWithAccessories = roundedTotalPrice + accessoriesPrice + adminCarPrice.depositedMoney + tripProtctionMoney + carChoicePrice + driverPrice + taxAmount;

            const newBooking = await Booking.create({
                user: user._id,
                car: carExist._id,
                mainCategory,
                category,
                plan,
                destinationLocation,
                pickupLocation: carExist.pickup,
                dropOffLocation: carExist.drop,
                pickupDate,
                dropOffDate,
                pickupTime,
                dropOffTime,
                status: "PENDING",
                price: roundedBasePrice,
                totalPrice: totalPriceWithAccessories,
                depositedMoney: adminCarPrice.depositedMoney,
                isSubscription: subscriptionMonths ? true : false,
                subscriptionMonths,
                subscriptionMonthlyPaymentAmount: Math.round(totalPriceWithAccessories / subscriptionMonths) || null,
                accessories: accessoriesId,
                accessoriesPrice,
                tripPackage,
                tripProtctionMoney: tripProtctionMoney,
                carChoice,
                carChoicePrice,
                driverPrice,
                uniqueBookinId: await generateBookingCode(),
                taxAmount
            });

            user.coin += carExist.quackCoin
            await user.save();
            const welcomeMessage = `Welcome, ${user.fullName}! Thank you for Booking, your Booking details ${newBooking}.`;
            const welcomeNotification = new Notification({
                recipient: user._id,
                content: welcomeMessage,
                type: 'Booking',
            });
            await welcomeNotification.save();

            const newTransaction = new Transaction({
                user: userId,
                amount: totalPriceWithAccessories,
                type: 'Booking',
                details: 'Booking creation',
                dr: true
            });

            await newTransaction.save();

            if (subscriptionMonths > 1) {
                const monthlyPaymentAmount = totalPriceWithAccessories / subscriptionMonths;
                let currentDate = new Date(requestedPickupDate);
                const upcomingPayments = [];

                for (let i = 1; i < subscriptionMonths; i++) {
                    const paymentDueDate = new Date(currentDate);
                    paymentDueDate.setUTCMonth(paymentDueDate.getUTCMonth() + i);
                    paymentDueDate.setUTCHours(0, 0, 0, 0);

                    const paymentDetails = {
                        amount: Math.round(monthlyPaymentAmount),
                        dueDate: paymentDueDate,
                        status: 'Pending'
                    };

                    upcomingPayments.push(paymentDetails);
                }

                newBooking.upcomingPayments = upcomingPayments;
            }

            await newBooking.save();

            return res.status(201).json({ status: 201, message: 'Booking created successfully', data: newBooking });

        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

function calculateDurationInDays(pickupDate, dropOffDate, pickupTime, dropOffTime) {
    const pickupDateTime = new Date(`${pickupDate}T${pickupTime}:00.000Z`);
    console.log("pickupDateTime", pickupDateTime);

    const dropOffDateTime = new Date(`${dropOffDate}T${dropOffTime}:00.000Z`);
    console.log("dropOffDate", dropOffDate);

    const durationInMilliseconds = dropOffDateTime - pickupDateTime;
    console.log("durationInMilliseconds", durationInMilliseconds);

    const durationInDays = durationInMilliseconds / (1000 * 60 * 60 /** 24*/);
    console.log("durationInDays", durationInDays);

    return durationInDays;
}

async function checkBikeAvailability(carId, pickupDate, dropOffDate, pickupTime, dropOffTime) {
    const existingBookings = await Booking.find({
        car: carId,
        $or: [
            {
                $and: [
                    { pickupDate: { $lte: pickupDate } },
                    { dropOffDate: { $gte: pickupDate } },
                    { pickupTime: { $lte: pickupTime } },
                    { dropOffTime: { $gte: pickupTime } },
                ],
            },
            {
                $and: [
                    { pickupDate: { $lte: dropOffDate } },
                    { dropOffDate: { $gte: dropOffDate } },
                    { pickupTime: { $lte: dropOffTime } },
                    { dropOffTime: { $gte: dropOffTime } },
                ],
            },
            // {
            //     $and: [
            //         // { isTimeExtended: true },
            //         { timeExtendedDropOffTime: { $gte: pickupDate, $lte: dropOffTime } },
            //     ],
            // },
        ],
        isTripCompleted: false,
        isSubscription: false,
    });

    return existingBookings.length === 0;
}

exports.createBookingForSharingCar = async (req, res) => {
    try {
        const userId = req.user._id;
        const { carId, mainCategory, leavingFrom, goingTo, date, seat } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        if (user.isVerified === false) {
            return res.status(404).json({ status: 404, message: 'User can not book Car first approved account by admin', data: null });
        }

        const carExist = await Car.findById(carId);
        if (!carExist) {
            return res.status(400).json({ status: 400, message: 'Car not available', data: null });
        }

        const checkMainCategory = await MainCategory.findById(mainCategory);
        if (!checkMainCategory) {
            return res.status(404).json({ status: 404, message: 'MainCategory not found' });
        }

        const existingBooking = await Booking.findOne({
            carId,
            mainCategory,
            'pickupCoordinates.coordinates': leavingFrom,
            'dropCoordinates.coordinates': goingTo,
            date,
            seat
        });

        if (existingBooking) {
            return res.status(400).json({ status: 400, message: 'Booking with the same details already exists', data: null });
        }

        const adminCarPrice = await SharedCar.findOne({ car: carId, mainCategory: mainCategory });
        console.log("adminCarPrice", adminCarPrice);
        if (!adminCarPrice) {
            return res.status(404).json({ status: 404, message: 'Shared car not found' });
        }

        let rentalPrice = adminCarPrice.seatprice;

        console.log("rentalPrice", rentalPrice);


        const totalPrice = rentalPrice * seat;

        console.log("totalPrice", totalPrice);

        if (isNaN(totalPrice) || totalPrice < 0) {
            return res.status(400).json({ status: 400, message: 'Invalid totalPrice', data: null });
        }

        const roundedTotalPrice = Math.round(totalPrice);

        const newBooking = new Booking({
            user: user._id,
            car: carId,
            mainCategory,
            'pickupCoordinates.type': 'Point',
            'pickupCoordinates.coordinates': leavingFrom,
            'dropCoordinates.type': 'Point',
            'dropCoordinates.coordinates': goingTo,
            date,
            seat,
            totalPrice: roundedTotalPrice
        });

        await newBooking.save();

        const welcomeMessage = `Welcome, ${user.fullName}! Thank you for Booking, your Booking details ${newBooking}.`;
        const welcomeNotification = new Notification({
            recipient: user._id,
            content: welcomeMessage,
            type: 'Booking',
        });
        await welcomeNotification.save();

        const newTransaction = new Transaction({
            user: userId,
            amount: roundedTotalPrice,
            type: 'Booking',
            details: 'Booking creation',
            dr: true
        });

        await newTransaction.save();

        return res.status(201).json({ status: 201, message: 'Booking created successfully', data: newBooking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'An error occurred while creating the booking', error: error.message });
    }
};

exports.getBookingsByUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const bookings = await Booking.find({ user: userId }).populate('car user pickupLocation dropOffLocation');

        // .populate({
        //     path: 'bike',
        //     select: 'modelName rentalPrice',
        // })
        // .populate({
        //     path: 'user',
        //     select: 'username email',
        // })
        // .populate({
        //     path: 'pickupLocation dropOffLocation',
        //     select: 'locationName address',
        // });

        return res.status(200).json({ status: 200, message: 'Bookings retrieved successfully', data: bookings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getBookingsById = async (req, res) => {
    try {
        const userId = req.user._id;
        const bookingId = req.params.bookingId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const bookings = await Booking.find({ _id: bookingId, user: userId }).populate('car user pickupLocation dropOffLocation');

        if (!bookings) {
            return res.status(404).json({ status: 404, message: 'Bookings not found', data: null });
        }

        // .populate({
        //     path: 'bike',
        //     select: 'modelName rentalPrice',
        // })
        // .populate({
        //     path: 'user',
        //     select: 'username email',
        // })
        // .populate({
        //     path: 'pickupLocation dropOffLocation',
        //     select: 'locationName address',
        // });

        return res.status(200).json({ status: 200, message: 'Bookings retrieved successfully', data: bookings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.updateBookingById = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }
        return res.status(200).json({ status: 200, message: 'Booking updated successfully', data: booking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getCompletedBookingsByUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const bookings = await Booking.find({ user: userId, status: "COMPLETED" }).populate('car user pickupLocation dropOffLocation');

        // .populate({
        //     path: 'bike',
        //     select: 'modelName rentalPrice',
        // })
        // .populate({
        //     path: 'user',
        //     select: 'username email',
        // })
        // .populate({
        //     path: 'pickupLocation dropOffLocation',
        //     select: 'locationName address',
        // });

        return res.status(200).json({ status: 200, message: 'Completed Bookings retrieved successfully', data: bookings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getUpcomingBookingsByUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const bookings = await Booking.find({ user: userId, pickupDate: { $gte: new Date() } }).populate('car user pickupLocation dropOffLocation');

        // .populate({
        //     path: 'bike',
        //     select: 'modelName rentalPrice',
        // })
        // .populate({
        //     path: 'user',
        //     select: 'username email',
        // })
        // .populate({
        //     path: 'pickupLocation dropOffLocation',
        //     select: 'locationName address',
        // });

        return res.status(200).json({ status: 200, message: 'Bookings retrieved successfully', data: bookings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.applyCouponToBooking = async (req, res) => {
    try {
        const { bookingId, couponCode } = req.body;

        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        if (booking.isQuackCoinApplied) {
            return res.status(400).json({ status: 400, message: 'Quack Coin has already been applied to this booking you use any one either coupon or coin', data: null });
        }

        if (booking.isCouponApplied) {
            return res.status(400).json({ status: 400, message: 'Coupon has already been applied to this booking', data: null });
        }

        const coupon = await Coupon.findOne({ code: couponCode });
        if (!coupon || !coupon.isActive || new Date(coupon.expirationDate) < new Date()) {
            return res.status(400).json({ status: 400, message: 'Invalid or expired coupon code', data: null });
        }

        booking.offerCode = couponCode;
        booking.discountPrice = Math.round(booking.totalPrice * (coupon.discount / 100));
        booking.totalPrice = Math.round(booking.totalPrice - booking.discountPrice);
        booking.isCouponApplied = true;

        await booking.save();

        return res.status(200).json({ status: 200, message: 'Coupon applied successfully', data: booking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.removeCouponFromBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        booking.totalPrice = Math.round(booking.totalPrice + booking.discountPrice);

        booking.offerCode = null;
        booking.discountPrice = 0;

        booking.isCouponApplied = false;

        await booking.save();

        return res.status(200).json({ status: 200, message: 'Coupon removed successfully', data: booking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.applyWalletToBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        if (booking.isWalletUsed) {
            return res.status(400).json({ status: 400, message: 'Wallet has already been applied to this booking', data: null });
        }

        if (user.wallet <= 0) {
            return res.status(400).json({ status: 400, message: 'Insufficient wallet balance', data: null });
        }

        const walletAmountToUse = Math.min(user.wallet, booking.totalPrice);
        user.wallet -= walletAmountToUse;
        await user.save();

        booking.walletAmount = walletAmountToUse;
        booking.totalPrice -= walletAmountToUse;
        booking.isWalletUsed = true;

        await booking.save();

        const newTransaction = new Transaction({
            user: userId,
            amount: walletAmountToUse,
            type: 'Wallet',
            details: 'Wallet apply in Booking',
            dr: true
        });

        await newTransaction.save();

        return res.status(200).json({ status: 200, message: 'Wallet applied successfully', data: booking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.applyQuackCoinToBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        if (booking.isCouponApplied) {
            return res.status(400).json({ status: 400, message: 'Coupon has already been applied to this booking you use any one either coupon or coin', data: null });
        }

        if (booking.isQuackCoinApplied) {
            return res.status(400).json({ status: 400, message: 'Quack Coin has already been applied to this booking', data: null });
        }

        if (user.coin <= 0) {
            return res.status(400).json({ status: 400, message: 'Insufficient Coin balance', data: null });
        }

        const maxQuackCoinToUse = Math.floor(user.coin * 0.2);


        const quackCoinToUse = Math.min(maxQuackCoinToUse, booking.totalPrice);

        user.coin -= quackCoinToUse;
        await user.save();

        booking.coinAmount = quackCoinToUse;
        booking.totalPrice -= quackCoinToUse;
        booking.isQuackCoinApplied = true;
        await booking.save();

        const newTransaction = new Transaction({
            user: userId,
            amount: quackCoinToUse,
            type: 'Qc',
            details: 'Qc Coin apply in Booking',
            dr: true
        });

        await newTransaction.save();

        return res.status(200).json({ status: 200, message: 'Wallet applied successfully', data: booking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.removeQuackCoinFromBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        booking.totalPrice = Math.round(booking.totalPrice + booking.coinAmount);

        user.coin += booking.coinAmount;
        await user.save();

        const newTransaction = new Transaction({
            user: userId,
            amount: booking.coinAmount,
            type: 'Qc',
            details: 'Qc Coin remove in Booking',
            cr: true
        });

        await newTransaction.save();

        booking.coinAmount = 0;

        booking.isQuackCoinApplied = false;

        await booking.save();

        return res.status(200).json({ status: 200, message: 'Coin removed successfully', data: booking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const bookingId = req.params.bookingId;
        const { paymentStatus, referenceId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const updatedBooking = await Booking.findOne({ _id: bookingId });

        if (!updatedBooking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        const validStatusValues = ['PENDING', 'FAILED', 'PAID'];
        if (!validStatusValues.includes(paymentStatus)) {
            return res.status(400).json({ error: "Invalid Payment status value" });
        }

        updatedBooking.paymentStatus = paymentStatus;
        updatedBooking.referenceId = referenceId;

        if (paymentStatus === 'PAID') {
            const carId = updatedBooking.car;

            const car = await Car.findOne({ _id: carId });

            car.rentalCount += 1;

            await car.save();
        }

        if (paymentStatus === 'FAILED') {
            const carId = updatedBooking.car;

            const car = await Car.findOne({ _id: carId });

            user.coin -= car.quackCoin;

            await user.save();
        }

        await updatedBooking.save();

        return res.status(200).json({
            status: 200,
            message: 'Payment status updated successfully',
            data: updatedBooking,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Server error while updating payment status',
            data: null,
        });
    }
};

const isCarAvailableForPeriod = async (carId, pickupDate, dropOffDate, pickupTime, dropOffTime, extendedDropOffDate, extendedDropOffTime) => {
    const startTime = new Date(`${pickupDate}T${pickupTime}`);
    const endTime = new Date(`${dropOffDate}T${dropOffTime}`);
    const extendTime = new Date(`${extendedDropOffDate}T${extendedDropOffTime}`);

    const existingBookings = await Booking.find({
        car: carId,
        isTripCompleted: false,
        $or: [
            { pickupTime: { $lt: endTime }, dropOffTime: { $gt: startTime } },
            { pickupTime: { $lt: startTime }, dropOffTime: { $gt: startTime } },
            { $and: [{ extendedDropOffTime: { $lt: extendTime } }, { dropOffTime: { $gt: extendTime } }] },
        ],
    });

    return existingBookings.length === 0;
};

const getPricingInfo = async (carId) => {
    try {
        const car = await Car.findById(carId);
        if (!car) {
            throw new Error("Car not found");
        }

        const adminCarPrice = await AdminCarPrice.findOne({ car: carId });

        let rentalPrice;
        if (adminCarPrice.autoPricing) {
            rentalPrice = adminCarPrice.adminHourlyRate;
        } else {
            rentalPrice = adminCarPrice.hostHourlyRate;
        }

        const pricingInfo = {
            hourlyRate: rentalPrice,
            extendPrice: adminCarPrice.extendPrice,
        };
        console.log("pricingInfo", pricingInfo);

        return pricingInfo;

    } catch (error) {
        console.error("Error getting pricing information:", error.message);
        throw error;
    }
};

function calculateDurationInDays1(extendedDropOffDate, dropOffDate, extendedDropOffTime, dropOffTime) {
    const dropOffDateTime = new Date(`${dropOffDate}T${dropOffTime}:00.000Z`);
    console.log("dropOffDateTime", dropOffDateTime);

    const parsedExtendedDropOffDate = new Date(extendedDropOffDate).toISOString().split('T')[0];

    const extendDropOffDateTimeString = `${parsedExtendedDropOffDate}T${extendedDropOffTime}:00.000Z`;

    if (isNaN(new Date(extendDropOffDateTimeString))) {
        console.error("Invalid date string:", extendDropOffDateTimeString);
        return null;
    }

    const extendDropOffDateTime = new Date(extendDropOffDateTimeString);
    console.log("extendDropOffDateTime", extendDropOffDateTime);

    const durationInMilliseconds = dropOffDateTime - extendDropOffDateTime;
    console.log("durationInMilliseconds", durationInMilliseconds);

    const durationInDays = durationInMilliseconds / (1000 * 60 * 60);
    console.log("durationInDays", durationInDays);

    return durationInDays;
}

const calculateExtendPrice = async (bookingId, extendedDropOffDate, extendedDropOffTime) => {
    try {
        const extendedBooking = await Booking.findById(bookingId);
        if (!extendedBooking) {
            throw new Error("Booking not found");
        }

        const extendDurationInDays = calculateDurationInDays1(
            extendedBooking.dropOffDate,
            extendedDropOffDate,
            extendedBooking.dropOffTime,
            extendedDropOffTime
        );

        const pricingInfo = await getPricingInfo(extendedBooking.car);

        const extendPrice = pricingInfo.extendPrice * extendDurationInDays;
        console.log("extendPrice1***", extendPrice);
        return extendPrice;
    } catch (error) {
        console.error("Error calculating extend price:", error.message);
        throw error;
    }
};

exports.extendBooking = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const { extendedDropOffDate, extendedDropOffTime } = req.body;

        const extendedBooking = await Booking.findById(bookingId);
        if (!extendedBooking) {
            return res.status(404).send({ status: 404, message: "Booking not found" });
        }

        const extendPrice = await calculateExtendPrice(bookingId, extendedDropOffDate, extendedDropOffTime);
        console.log("extendPrice2***", extendPrice);

        const isAvailable = await isCarAvailableForPeriod(
            extendedBooking.car,
            extendedBooking.pickupDate,
            extendedBooking.dropOffDate,
            extendedBooking.pickupTime,
            extendedBooking.dropOffTime
        );

        if (!isAvailable) {
            return res.status(400).send({ status: 400, message: "Car is not available for the extended period" });
        }

        const taxPercentage = await Tax.findOne();
        const taxAmountPercentage = taxPercentage.percentage;

        const taxAmount = extendPrice * (taxAmountPercentage / 100);

        extendedBooking.isTimeExtended = true;
        extendedBooking.extendedDropOffDate = extendedDropOffDate;
        extendedBooking.extendedDropOffTime = extendedDropOffTime;

        extendedBooking.extendedPrice = extendPrice;
        extendedBooking.extendedTax = Math.round(taxAmount);
        extendedBooking.totalExtendedPrice = Math.round(extendedBooking.totalPrice + extendPrice + taxAmount);

        await extendedBooking.save();

        return res.status(200).json({
            status: 200,
            message: 'Booking extended successfully',
            data: extendedBooking,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Server error while extending booking',
            data: null,
        });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const userId = req.user._id;
        const bookingId = req.params.bookingId;
        const { refundPreference, upiId, cancelReason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        const findCancelReason = await CancelReason.findById(cancelReason);
        if (!findCancelReason) {
            return res.status(404).json({ status: 404, message: 'Cancel reason not found', data: null });
        }

        if (booking.paymentStatus === 'PENDING') {
            return res.status(400).json({ status: 400, message: 'Booking Is Not Cancellable First Paid Amount', data: null });
        }

        if (booking.status === 'CANCELLED' || booking.isTripCompleted) {
            return res.status(400).json({ status: 400, message: 'Booking is not cancellable', data: null });
        }

        if (booking.paymentStatus === 'PAID') {
            const carId = booking.car;
            const car = await Car.findById(carId);
            if (car) {
                car.rentalCount -= 1;
                await car.save();
            }
        }

        const refundCharges = await RefundCharge.findOne();
        const refundAmount = booking.totalPrice

        const extendedPriceRefund = booking.isExtendedPricePaid ? booking.extendedPrice : 0;
        const totalRefundAmount = refundAmount - refundCharges.refundAmount + extendedPriceRefund;

        const newRefund = new Refund({
            booking: booking._id,
            refundAmount: refundAmount,
            refundCharges: refundCharges.refundAmount || 0,
            extendedPrice: extendedPriceRefund,
            totalRefundAmount: totalRefundAmount,
            refundStatus: 'PENDING',
            refundDetails: refundPreference,
            userPaymentDetails: upiId,
            refundTransactionId: '',
        });


        const savedRefund = await newRefund.save();
        console.log("booking.totalPrice", booking.totalPrice);
        booking.status = 'CANCELLED';
        booking.refundPreference = refundPreference;
        booking.upiId = upiId;
        booking.refund = savedRefund._id;
        booking.cancelReason = cancelReason;
        await booking.save();

        console.log(booking.car);
        if (booking.car) {
            const carExist = await Car.findById(booking.car);

            user.coin -= carExist.quackCoin;
            await user.save();
        } else {
            console.error('QuackCoin value not found for the car associated with the booking.');
        }

        return res.status(200).json({ status: 200, message: 'Booking cancelled successfully', data: booking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getRefundStatusAndAmount = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;

        const booking = await Booking.findOne({ _id: bookingId });

        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        const refund = await Refund.findOne({ booking: bookingId })
            .populate({
                path: 'booking',
                populate: {
                    path: 'car user pickupLocation dropOffLocation',
                },
            });
        if (!refund) {
            return res.status(404).json({ status: 404, message: 'Refund not found', data: null });
        }

        const response = {
            status: 200,
            message: 'Refund status and amount retrieved successfully',
            data: refund,
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Server error while retrieving refund status and amount',
            data: null,
        });
    }
};

exports.getCancelBookingsByUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const bookings = await Booking.find({ user: userId, status: "CANCELLED" }).populate('car user pickupLocation dropOffLocation');

        // .populate({
        //     path: 'bike',
        //     select: 'modelName rentalPrice',
        // })
        // .populate({
        //     path: 'user',
        //     select: 'username email',
        // })
        // .populate({
        //     path: 'pickupLocation dropOffLocation',
        //     select: 'locationName address',
        // });

        return res.status(200).json({ status: 200, message: 'Canceled Bookings retrieved successfully', data: bookings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getAllCancelReasons = async (req, res) => {
    try {
        const cancelReasons = await CancelReason.find();
        return res.status(200).json({ status: 200, message: 'Success', data: cancelReasons });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getCancelReasonById = async (req, res) => {
    try {
        const cancelReason = await CancelReason.findById(req.params.id);
        if (!cancelReason) {
            return res.status(404).json({ status: 404, message: 'Cancel reason not found', data: null });
        }
        return res.status(200).json({ status: 200, message: 'Success', data: cancelReason });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.uploadImage = async (req, res) => {
    try {
        let images = [];
        if (req.files) {
            for (let j = 0; j < req.files.length; j++) {
                let obj = {
                    img: req.files[j].path,
                };
                images.push(obj);
            }
        }

        const image = await Image.create({
            images
        })

        return res.status(200).json({ status: 200, message: 'Image Upload Successfully', data: image });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.createInspectionExterior = async (req, res) => {
    try {
        const inspectionData = req.body;

        const carExist = await Car.findById(req.body.car);
        if (!carExist) {
            return res.status(400).json({ status: 400, message: 'Car not available', data: null });
        }

        const newInspection = await InspectionModel.create(inspectionData);
        return res.status(201).json({ status: 201, message: 'Inspection created successfully', data: newInspection });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.updateCarInspectionById = async (req, res) => {
    try {
        const inspectionId = req.params.inspectionId;

        const carExist = await Car.findById(req.body.car);
        if (!carExist) {
            return res.status(400).json({ status: 400, message: 'Car not available', data: null });
        }

        const updatedInspection = await InspectionModel.findByIdAndUpdate(inspectionId, req.body, { new: true });
        if (!updatedInspection) {
            return res.status(404).json({ status: 404, message: 'Inspection not found', data: null });
        }
        return res.status(200).json({ status: 200, message: 'Inspection updated successfully', data: updatedInspection });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getAllInspections = async (req, res) => {
    try {
        const inspections = await InspectionModel.find().populate('car');
        return res.status(200).json({ status: 200, message: 'Inspections retrieved successfully', data: inspections });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getInspectionById = async (req, res) => {
    try {
        const inspectionId = req.params.inspectionId;
        const inspection = await InspectionModel.findById(inspectionId).populate('car');
        if (!inspection) {
            return res.status(404).json({ status: 404, message: 'Inspection not found', data: null });
        }
        return res.status(200).json({ status: 200, message: 'Inspection retrieved successfully', data: inspection });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.updateInspectionById = async (req, res) => {
    try {
        const inspectionId = req.params.inspectionId;
        const updatedInspection = await InspectionModel.findByIdAndUpdate(inspectionId, req.body, { new: true });
        if (!updatedInspection) {
            return res.status(404).json({ status: 404, message: 'Inspection not found', data: null });
        }
        return res.status(200).json({ status: 200, message: 'Inspection updated successfully', data: updatedInspection });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.deleteInspectionById = async (req, res) => {
    try {
        const inspectionId = req.params.inspectionId;
        const deletedInspection = await InspectionModel.findOneAndDelete(inspectionId);
        if (!deletedInspection) {
            return res.status(404).json({ status: 404, message: 'Inspection not found', data: null });
        }
        return res.status(200).json({ status: 200, message: 'Inspection deleted successfully', data: deletedInspection });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getAllOptions = async (req, res) => {
    try {
        const options = await SubscriptionVsBuying.find();
        return res.status(200).json({ status: 200, message: 'Options fetched successfully', data: options });
    } catch (error) {
        console.error('Error fetching subscription vs buying options:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.getOptionById = async (req, res) => {
    try {
        const optionId = req.params.id;
        const option = await SubscriptionVsBuying.findById(optionId);
        if (!option) {
            return res.status(404).json({ status: 404, message: 'Option not found' });
        }
        return res.status(200).json({ status: 200, message: 'Option fetched successfully', data: option });
    } catch (error) {
        console.error('Error fetching subscription vs buying option by ID:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.getAllSubScriptionFAQ = async (req, res) => {
    try {
        const faqs = await SubScriptionFAQ.find();
        return res.status(200).json({ status: 200, data: faqs });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getSubScriptionFAQById = async (req, res) => {
    try {
        const faqId = req.params.id;
        const faq = await SubScriptionFAQ.findById(faqId);

        if (!faq) {
            return res.status(404).json({ status: 404, message: 'SubScription FAQ not found' });
        }

        return res.status(200).json({ status: 200, data: faq });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getMostSubscribeCar = async (req, res) => {
    try {
        const bestSubscribedCars = await HostReview.aggregate([
            {
                $group: {
                    _id: '$car',
                    totalReviews: { $sum: 1 }
                }
            },
            {
                $sort: { totalReviews: -1 }
            }
        ]);

        const bestCarIds = bestSubscribedCars.map(car => car._id);

        const cars = await Car.find({ _id: { $in: bestCarIds } });

        return res.status(200).json({ status: 200, data: cars });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getCarsByMainCategory = async (req, res) => {
    try {
        const { mainCategory } = req.params;

        const checkMainCategory = await MainCategory.findById(mainCategory);
        if (!checkMainCategory) {
            return res.status(404).json({ status: 404, message: 'MainCategory not found' });
        }

        const cars = await Car.find({ mainCategory });

        return res.status(200).json({ status: 200, data: cars });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getCarsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        console.log(category);
        const checkCategory = await Category.findById(category);
        if (!checkCategory) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }

        const cars = await Car.find({ category });

        return res.status(200).json({ status: 200, data: cars });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getCarsByPlan = async (req, res) => {
    try {
        const { plan } = req.params;

        const checkPlan = await Plan.findById(plan);
        if (!checkPlan) {
            return res.status(404).json({ status: 404, message: 'Plan not found' });
        }

        const cars = await Car.find();

        const availableCars = [];
        for (const car of cars) {
            const isBooked = await Booking.exists({
                car: car._id,
                status: 'PENDING',
                isTripCompleted: false,
            });

            if (!isBooked && !car.isOnTrip) {
                const carPrice = checkPlan.price;

                const carDetails = {
                    _id: car._id,
                    licenseNumber: car.licenseNumber,
                    brand: car.brand,
                    model: car.model,
                    variant: car.variant,
                    yearOfRegistration: car.yearOfRegistration,
                    fuelType: car.fuelType,
                    transmissionType: car.transmissionType,
                    kmDriven: car.kmDriven,
                    chassisNumber: car.chassisNumber,
                    sharingFrequency: car.sharingFrequency,
                    isCarDocumentsUpload: car.isCarDocumentsUpload,
                    isDlUpload: car.isDlUpload,
                    status: car.status,
                    isFastTag: car.isFastTag,
                    isAvailable: car.isAvailable,
                    rentalStart: car.rentalStart,
                    rentalEnd: car.rentalEnd,
                    rentalCount: car.rentalCount,
                    isOnTrip: car.isOnTrip,
                    createdAt: car.createdAt,
                    updatedAt: car.updatedAt,
                    carDocuments: car.carDocuments,
                    dlBack: car.dlBack,
                    dlFront: car.dlFront,
                    carDocumentsText: car.carDocumentsText,
                    dlNumber: car.dlNumber,
                    isGovernmentTendor: car.isGovernmentTendor,
                    isRental: car.isRental,
                    isSharing: car.isSharing,
                    isSubscription: car.isSubscription,
                    quackCoin: car.quackCoin,
                    images: car.images,
                    price: carPrice,
                };

                availableCars.push(carDetails);
            }
        }

        return res.status(200).json({ status: 200, data: availableCars });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getAllCarFeaturesByCarId = async (req, res) => {
    try {
        const userId = req.user._id;
        const carId = req.params.carId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const userCars = await Car.find({ car: carId });
        if (!userCars || userCars.length === 0) {
            return res.status(404).json({ status: 404, message: 'No cars found for the user' });
        }

        const carIds = userCars.map(car => car._id);
        const carFeatures = await CarFeatures.find({ car: { $in: carIds } }).populate('car');

        return res.status(200).json({ status: 200, data: carFeatures });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getCarFeatureById = async (req, res) => {
    try {
        const carFeatureId = req.params.carFeatureId;
        const carFeature = await CarFeatures.findById(carFeatureId).populate('car');

        if (!carFeature || carFeature.length === 0) {
            return res.status(404).json({ status: 404, message: 'Car feature not found' });
        }

        return res.status(200).json({ status: 200, data: carFeature });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getAllCallUs = async (req, res) => {
    try {
        const contactUsEntries = await CallUs.find();
        return res.status(200).json({ status: 200, data: contactUsEntries });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getCallUsById = async (req, res) => {
    try {
        const contactUsId = req.params.id;
        const contactUsEntry = await CallUs.findById(contactUsId);

        if (!contactUsEntry) {
            return res.status(404).json({ status: 404, message: 'Contact us entry not found' });
        }

        return res.status(200).json({ status: 200, data: contactUsEntry });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.createFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        if (rating < 1 || rating > 10) {
            return res.status(400).json({ error: 'Rating must be between 1 and 10' });
        }

        const feedback = new Feedback({
            user: userId,
            rating,
            comment
        });

        const savedFeedback = await feedback.save();
        return res.status(201).json({ status: 201, data: savedFeedback });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal server error' });
    }
};

exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find().populate('user', 'fullName mobileNumber email');
        return res.status(200).json({ status: 200, data: feedback });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal server error' });
    }
};

exports.getFeedbackById = async (req, res) => {
    try {
        const feedbackId = req.params.id;
        const feedback = await Feedback.findById(feedbackId).populate('user', 'fullName mobileNumber email');
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        return res.status(200).json({ status: 200, data: feedback });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal server error' });
    }
};

exports.updateFeedback = async (req, res) => {
    try {
        const feedbackId = req.params.id;
        const { rating, comment } = req.body;

        if (rating < 1 || rating > 10) {
            return res.status(400).json({ error: 'Rating must be between 1 and 10' });
        }

        const updatedFeedback = await Feedback.findByIdAndUpdate(
            feedbackId,
            { rating, comment },
            { new: true }
        );

        if (!updatedFeedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        return res.status(200).json({ status: 200, data: updatedFeedback });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal server error' });
    }
};

exports.deleteFeedback = async (req, res) => {
    try {
        const feedbackId = req.params.id;
        const deletedFeedback = await Feedback.findByIdAndDelete(feedbackId);
        if (!deletedFeedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        return res.status(200).json({ status: 200, message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal server error' });
    }
};

exports.getAllFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find();
        return res.status(200).json({ status: 200, data: faqs });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getFAQById = async (req, res) => {
    try {
        const faqId = req.params.id;
        const faq = await FAQ.findById(faqId);

        if (!faq) {
            return res.status(404).json({ status: 404, message: 'FAQ not found' });
        }

        return res.status(200).json({ status: 200, data: faq });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getAllRentalCars = async (req, res) => {
    try {
        const { mainCategoryId } = req.params;

        const rentalCars = await Car.find({ isRental: true });
        const carsWithPrices = [];

        for (const car of rentalCars) {
            const adminCarPrice = await AdminCarPrice.findOne({ car: car._id, mainCategory: mainCategoryId });

            if (!adminCarPrice) {
                continue;
            }

            let rentalPrice;
            if (adminCarPrice.autoPricing) {
                rentalPrice = adminCarPrice.adminHourlyRate;
            } else {
                rentalPrice = adminCarPrice.hostHourlyRate;
            }

            carsWithPrices.push({
                car: car,
                rentalPrice: rentalPrice
            });
        }

        return res.status(200).json({ status: 200, data: carsWithPrices });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getAllSubscriptionCars = async (req, res) => {
    try {
        const { mainCategoryId } = req.params;

        const SharingCars = await Car.find({ isSubscription: true });
        const carsWithPrices = [];

        for (const car of SharingCars) {
            const adminCarPrice = await AdminCarPrice.findOne({ car: car._id, mainCategory: mainCategoryId });

            if (!adminCarPrice) {
                continue;
            }

            let rentalPrice;
            if (adminCarPrice.autoPricing) {
                rentalPrice = adminCarPrice.adminHourlyRate;
            } else {
                rentalPrice = adminCarPrice.hostHourlyRate;
            }

            carsWithPrices.push({
                car: car,
                rentalPrice: rentalPrice
            });
        }

        return res.status(200).json({ status: 200, data: carsWithPrices });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getTransactionDetailsByUserId = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const transactions = await Transaction.find({ user: userId });

        let totalCredit = 0;
        let totalDebit = 0;

        transactions.forEach(transaction => {
            if (transaction.cr) {
                totalCredit += transaction.amount;
            }
            if (transaction.dr) {
                totalDebit += transaction.amount;
            }
        });

        return res.status(200).json({
            status: 200,
            data: {
                transactions: transactions,
                totalCredit: totalCredit,
                totalDebit: totalDebit
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getIncomeDetailsByUserId = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const transactions = await Transaction.find({ user: userId, type: { $in: ['Wallet', 'Qc'] } });

        let totalWalletCredit = 0;
        let totalWalletDebit = 0;
        let totalQcCredit = 0;
        let totalQcDebit = 0;

        transactions.forEach(transaction => {
            if (transaction.type === 'Wallet') {
                if (transaction.cr) {
                    totalWalletCredit += transaction.amount;
                }
                if (transaction.dr) {
                    totalWalletDebit += transaction.amount;
                }
            } else if (transaction.type === 'Qc') {
                if (transaction.cr) {
                    totalQcCredit += transaction.amount;
                }
                if (transaction.dr) {
                    totalQcDebit += transaction.amount;
                }
            }
        });

        return res.status(200).json({
            status: 200,
            data: {
                transactions: transactions,
                totalWalletCredit: totalWalletCredit,
                totalWalletDebit: totalWalletDebit,
                totalQcCredit: totalQcCredit,
                totalQcDebit: totalQcDebit,
                totalQcCoinBalance: user.coin,
                totalWalletBalance: user.wallet,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getAllPolicy = async (req, res) => {
    try {
        const termAndCondition = await Policy.find();

        if (!termAndCondition) {
            return res.status(404).json({ status: 404, message: 'Policy not found' });
        }

        return res.status(200).json({ status: 200, message: "Sucessfully", data: termAndCondition });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

exports.getPolicyById = async (req, res) => {
    try {
        const termAndConditionId = req.params.id;
        const termAndCondition = await Policy.findById(termAndConditionId);

        if (!termAndCondition) {
            return res.status(404).json({ status: 404, message: 'Policy not found' });
        }

        return res.status(200).json({ status: 200, message: 'Sucessfully', data: termAndCondition });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

exports.searchBookings = async (req, res) => {
    try {
        const userId = req.user._id;
        const { mainCategory, status, startDate, endDate } = req.query;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        let query = { user: userId };

        if (mainCategory) {
            query.mainCategory = mainCategory;
        }
        if (status) {
            query.status = status;
        }
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            end.setHours(23, 59, 59, 999);

            query.createdAt = { $gte: start, $lte: end };
        }

        const bookings = await Booking.find(query)
            .populate('car user pickupLocation dropOffLocation');

        return res.status(200).json({ status: 200, message: 'Bookings retrieved successfully', data: bookings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getAllLocations = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const locations = await Location.find();

        res.status(200).json({ status: 200, data: locations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getLocationById = async (req, res) => {
    try {
        const { locationId } = req.params;

        const location = await Location.findById(locationId);

        if (!location) {
            return res.status(404).json({ status: 404, message: 'Location not found' });
        }

        res.status(200).json({ status: 200, data: location });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

// For Upcoming booking for subscription
// cron.schedule('* * * * *', async () => {
cron.schedule('0 0 * * *', async () => {
    try {
        console.log("Cron Job Started");

        const upcomingBookings5Days = await Booking.find({
            'upcomingPayments.dueDate': { $gte: new Date(), $lte: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000) },
            'upcomingPayments.status': "Pending"
        }).populate('user');

        const upcomingBookings1Day = await Booking.find({
            'upcomingPayments.dueDate': { $gte: new Date(), $lte: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000) },
            'upcomingPayments.status': "Pending"
        }).populate('user');

        for (const booking of upcomingBookings5Days) {
            const user = booking.user;
            const notificationMessage = `Hello, ${user.fullName}! Your payment of ₹${booking.subscriptionMonthlyPaymentAmount.toFixed(2)} for booking ${booking.uniqueBookinId} is due soon (5 days left). Please make the payment before the due date.`;

            const newNotification = new Notification({
                recipient: user._id,
                content: notificationMessage,
                type: 'PaymentReminder',
            });

            await newNotification.save();
        }

        for (const booking of upcomingBookings1Day) {
            const user = booking.user;
            const notificationMessage = `Hello, ${user.fullName}! Your payment of ₹${booking.subscriptionMonthlyPaymentAmount.toFixed(2)} for booking ${booking.uniqueBookinId} is due tomorrow. Please make the payment before the due date.`;

            const newNotification = new Notification({
                recipient: user._id,
                content: notificationMessage,
                type: 'PaymentReminder',
            });

            await newNotification.save();
        }

        console.log("Cron Job End");

    } catch (error) {
        console.error('Error processing upcoming payments:', error);
    }
});

exports.getCarBrands = async (req, res) => {
    try {
        const carBrands = await Brand.find();

        res.status(200).json({ status: 200, data: carBrands });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

exports.getCarBrandById = async (req, res) => {
    try {
        const { carBrandId } = req.params;

        const carBrand = await Brand.findById(carBrandId);

        if (!carBrand) {
            return res.status(404).json({ status: 404, message: 'CarBrand not found' });
        }

        res.status(200).json({ status: 200, data: carBrand });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

exports.getPendingUpcomingForSubscriptionPayments = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const bookings = await Booking.find({ user: userId });

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ status: 404, message: 'Bookings not found for the user', status: 'Error' });
        }

        let pendingPayments = [];

        for (const booking of bookings) {
            if (booking.upcomingPayments && booking.upcomingPayments.length > 0) {
                const pending = booking.upcomingPayments.filter(payment => payment.status === 'Pending');
                pendingPayments = pendingPayments.concat(pending);
            }
        }

        if (pendingPayments.length === 0) {
            return res.status(404).json({ status: 404, message: 'No pending payments found', status: 'Error' });
        }

        return res.status(200).json({ status: 200, data: pendingPayments, bookings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal Server Error', status: 'Error' });
    }
};

exports.upcomingPaymentsForSubscription = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found' });
        }

        if (booking.user.toString() !== userId.toString()) {
            return res.status(403).json({ status: 403, message: 'Unauthorized access' });
        }

        const nextPendingPayment = booking.upcomingPayments.find(payment => payment.status === 'Pending');
        if (!nextPendingPayment) {
            return res.status(404).json({ status: 404, message: 'Next pending payment not found' });
        }

        nextPendingPayment.status = 'Paid';
        await booking.save();

        return res.status(200).json({ status: 200, message: 'Payment successful', data: booking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

exports.getAllReferralBonuses = async (req, res) => {
    try {
        const referralBonuses = await ReferralBonus.find();

        return res.status(200).json({ status: 200, data: referralBonuses });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getDirectReferrals = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const directReferrals = await User.find({ referredBy: userId });

        return res.status(200).json({ status: 200, data: directReferrals });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

