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
const Policy = require('../models/policiesModel');
const MainCategory = require('../models/rental/mainCategoryModel');
const Category = require('../models/rental/categoryModel');
const SubscriptionCategory = require('../models/subscription/subscriptionCategoryModel');
const Offer = require('../models/offerModel');
const Coupon = require('../models/couponModel');
const Booking = require('../models/bookingModel');
const Location = require("../models/carLocationModel");
const AdminPackage = require('../models/adminPackageModel');




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
            return res.status(400).json({ status: 400, message: 'Passwords and ConfirmPassword do not match' });
        }

        const existingUser = await User.findOne({ mobileNumber: mobileNumber, userType: "USER" });
        if (existingUser) {
            return res.status(409).json({ status: 409, message: 'User Already Registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            mobileNumber,
            email,
            password: hashedPassword,
            userType: "USER",
            refferalCode: await reffralCode()
        });

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
        return res.status(500).json({ error: 'Internal Server Error' });
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
        return res.status(500).json({ error: 'Internal Server Error' });
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

        if (rating < 0 || rating > 5) {
            return res.status(400).json({ status: 400, message: 'Invalid rating. Rating should be between 0 and 5.', data: {} });
        }

        const newReview = await Review.create({ user: userId, car: carId, rating, comment });

        if (!car.reviews || !Array.isArray(car.reviews)) {
            car.reviews = [];
        }

        newReview.numOfUserReviews = newReview.numOfUserReviews + 1;

        const totalRating = car.reviews.length > 0
            ? car.reviews.reduce((sum, review) => sum + review.rating, 0)
            : 0;

        newReview.averageRating = totalRating / newReview.numOfUserReviews;

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

        const reviews = await Review.findById(carId);

        if (!reviews) {
            return res.status(404).json({ status: 404, message: 'reviews not found' });
        }

        res.status(200).json({ status: 200, data: reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Internal Server Error' });
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

exports.checkCarAvailability1 = async (req, res) => {
    try {
        const { pickupLocation, dropOffLocation, pickupDate, dropOffDate, pickupTime, dropOffTime } = req.query;

        const startDateTime = new Date(`${pickupDate}T${pickupTime}`);
        const endDateTime = new Date(`${dropOffDate}T${dropOffTime}`);

        const bookedCars = await Booking.find({
            $and: [
                {
                    $or: [
                        { pickupTime: { $lte: pickupTime }, dropOffTime: { $gte: dropOffTime } },
                        { pickupTime: { $gte: pickupTime }, dropOffTime: { $lte: dropOffTime } },
                    ]
                },
                {
                    $or: [
                        { pickupDate: { $lte: pickupDate }, dropOffDate: { $gte: dropOffDate } },
                        { pickupDate: { $gte: pickupDate }, dropOffDate: { $lte: dropOffDate } },
                    ]
                },
                {
                    $or: [
                        { status: 'PENDING', isTripCompleted: false },
                        { isSubscription: false },
                        { isTimeExtended: true, timeExtendedDropOffTime: { $gte: startDateTime, $lte: endDateTime } },
                    ]
                },
            ],
        });

        const bookedCarIds = bookedCars.map(booking => booking.car);

        const availableCars = await Car.find({
            _id: { $nin: bookedCarIds },
            isOnTrip: false,
            isAvailable: true,
            nextAvailableDateTime: { $gte: startDateTime, $lte: endDateTime },
        });

        return res.status(200).json({ status: 200, data: availableCars });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'An error occurred while checking Car availability' });
    }
};

exports.checkCarAvailability = async (req, res) => {
    try {
        const { pickupLocation, destinationLocation, pickupDate, dropOffDate, pickupTime, dropOffTime } = req.query;

        let pickupCoordinates = pickupLocation.split(',').map(Number);
        console.log("pickupCoordinates", pickupCoordinates);

        const startDateTime = new Date(`${pickupDate}T${pickupTime}`);
        const endDateTime = new Date(`${dropOffDate}T${dropOffTime}`);

        const pickupLocationObj = await Location.findOne({ type: 'pickup' });
        console.log("pickupLocationObj", pickupLocationObj);

        if (!pickupLocationObj) {
            return res.status(404).json({ status: 404, message: 'Pickup location not found' });
        }

        pickupCoordinates = pickupLocationObj.coordinates;
        console.log("pickupCoordinates", pickupCoordinates);

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
        console.log("bookedCarIds", bookedCarIds);

        const availableCars = await Car.find({
            _id: { $nin: bookedCarIds },
            isOnTrip: false,
            isAvailable: true,
            nextAvailableDateTime: { $gte: startDateTime, $lte: endDateTime },
            pickup: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [pickupCoordinates[0], pickupCoordinates[1]],
                    },
                    $maxDistance: 10000,
                },
            },
        });

        console.log("availableCars", availableCars);

        return res.status(200).json({ status: 200, data: availableCars });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'An error occurred while checking Car availability' });
    }
};

