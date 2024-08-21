const User = require('../models/userModel');
const authConfig = require("../configs/auth.config");
const jwt = require("jsonwebtoken");
const newOTP = require("otp-generators");
const mongoose = require('mongoose');
const Notification = require('../models/notificationModel');
const bcrypt = require("bcryptjs");
const Car = require('../models/carModel');
const City = require('../models/cityModel');
const Brand = require('../models/brandModel');
const CarImage = require('../models/carImageTipsModel');
const Location = require("../models/carLocationModel");
const FulfilmentPolicy = require('../models/fulfilmentPolicyModel');
const CancellationPolicy = require('../models/cancellationPolicyModel');
const HostOffer = require('../models/hostOfferModel');
const CarFeatures = require('../models/carFeaturesModel');
const ContactUs = require('../models/contactusModel');
const TermAndCondition = require('../models/term&conditionModel');
const FAQ = require('../models/faqModel');
const AboutApps = require('../models/aboutAppModel');
const Policy = require('../models/policiesModel');
const AdminCarPrice = require('../models/adminCarPriceModel');
const Booking = require('../models/bookingModel');
const subscriptionCategoryModel = require('../models/subscription/subscriptionCategoryModel');
const MainCategory = require('../models/rental/mainCategoryModel');
const Category = require('../models/rental/categoryModel');
const SubscriptionCategory = require('../models/subscription/subscriptionCategoryModel');
const SharedCar = require('../models/shareCarModel');
const Review = require('../models/ratingModel');
const Transaction = require('../models/transctionModel');
const ReferralBonus = require('../models/referralBonusAmountModel');
const UserReview = require('../models/userRatingModel');
const TenderApplication = require('../models/govtTendorModel');
const Tds = require('../models/tdsModel');
const GPSData = require('../models/gpsModel');
const ReferralLevel = require('../models/referralLevelModel');
const AccessoryCategory = require('../models/accessory/accessoryCategoryModel')
const Accessory = require('../models/accessory/accessoryModel')
const Order = require('../models/orderModel');
const Address = require("../models/userAddressModel");
const UserDetails = require('../models/userRefundModel');
const Refund = require('../models/refundModel');





const reffralCode = async () => {
    var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let OTP = '';
    for (let i = 0; i < 9; i++) {
        OTP += digits[Math.floor(Math.random() * 36)];
    }
    return OTP;
}

const generateBookingCode = async () => {
    const digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = '';
    for (let i = 0; i < 7; i++) {
        code += digits[Math.floor(Math.random() * digits.length)];
    }
    return code;
}

exports.signup = async (req, res) => {
    try {
        const { fullName, mobileNumber, email, password, confirmPassword } = req.body;

        const lastUser = await User.findOne().sort({ userId: -1 });
        let newUserId = 1000000;

        if (lastUser) {
            newUserId = parseInt(lastUser.userId) + 1;
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ status: 400, message: 'Passwords and ConfirmPassword do not match' });
        }

        const existingUser = await User.findOne({ mobileNumber: mobileNumber, userType: { $in: ["PARTNER", "USER"] } });
        if (existingUser) {
            return res.status(409).json({ status: 409, message: 'User Already Registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            userId: newUserId.toString(),
            fullName,
            mobileNumber,
            email,
            password: hashedPassword,
            userType: "PARTNER",
            refferalCode: await reffralCode(),
            role: ["PARTNER", "USER"],
            currentRole: "PARTNER"
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
        const { mobileNumber, email } = req.body;

        if (!mobileNumber && !email) {
            return res.status(400).json({ status: 400, message: "Mobile number or email is required" });
        }

        let query = { userType: { $in: ["PARTNER", "USER"] } };

        if (mobileNumber) {
            if (mobileNumber.replace(/\D/g, '').length !== 10) {
                return res.status(400).json({ status: 400, message: "Invalid mobile number length" });
            }
            query.mobileNumber = mobileNumber;
        }

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ status: 400, message: "Invalid email format" });
            }
            query.email = email;
        }

        const user = await User.findOne(query);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false });
        const otpExpiration = new Date(Date.now() + 60 * 1000);
        const userObj = {
            otp: otp,
            otpExpiration: otpExpiration,
            accountVerification: false,
            role: ["PARTNER", "USER"],
            currentRole: "PARTNER"
        };

        const updatedUser = await User.findOneAndUpdate(
            query,
            userObj,
            { new: true }
        );

        const responseObj = {
            id: updatedUser._id,
            otp: updatedUser.otp,
            mobileNumber: updatedUser.mobileNumber,
            email: updatedUser.email,
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
            completeProfile: updated.completeProfile,
            role: updated.role = "PARTNER" || "PARTNER"
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
        const user = await User.findOne({ _id: id, userType: { $in: ["PARTNER", "USER"] } });
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
            const user = await userModel.create({ firstname, lastname, email, socialType, userType: { $in: ["PARTNER", "USER"] } });

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

        const { fullName, email, password, confirmPassword, mobileNumber, occupation, bio } = req.body;

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
        if (occupation) updateObject.occupation = occupation;
        if (bio) updateObject.bio = bio;

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

exports.createCar = async (req, res) => {
    try {
        const { licenseNumber, brand, model, variant, color, bodyType, city, yearOfRegistration, fuelType, transmissionType, kmDriven, chassisNumber, sharingFrequency, status, seat } = req.body;
        const userId = req.user._id;

        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).send({ status: 404, message: "User not found" });
        }

        const chassisNumberRegex = /^[A-Za-z0-9]{17}$/;
        if (!chassisNumberRegex.test(chassisNumber)) {
            return res.status(400).json({ message: 'Invalid chassisNumber format' });
        }

        const existingCarWithLicenseNumber = await Car.findOne({ licenseNumber });
        if (existingCarWithLicenseNumber) {
            return res.status(400).json({ message: 'License number already in use' });
        }

        const existingCarWithChassisNumber = await Car.findOne({ chassisNumber });
        if (existingCarWithChassisNumber) {
            return res.status(400).json({ message: 'ChassisNumber number already in use' });
        }

        const checkBody = await subscriptionCategoryModel.findById(bodyType);
        if (!checkBody) {
            return res.status(404).json({ message: 'Car Body Type not found' });
        }

        const checkCity = await City.findById(city);
        if (!checkCity) {
            return res.status(404).json({ message: 'City not found' });
        }

        const carBrand = await Brand.findById(brand);
        if (!carBrand) {
            return res.status(404).json({ status: 404, message: 'CarBrand not found' });
        }

        const newCar = new Car({
            owner: user._id,
            licenseNumber,
            brand,
            model,
            variant,
            color,
            bodyType,
            city,
            yearOfRegistration,
            fuelType,
            transmissionType,
            kmDriven,
            chassisNumber,
            sharingFrequency,
            status,
            seat
        });

        const savedCar = await newCar.save();

        user.cars.push({ car: savedCar._id, licenseNumber });
        await user.save();

        return res.status(201).json({ status: 201, data: savedCar });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllCars = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const partnerCars = await Car.find({ owner: userId });

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

exports.updateCarById = async (req, res) => {
    try {
        const { carId } = req.params;

        const userId = req.user._id;

        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).send({ status: 404, message: "User not found" });
        }

        const existingCar = await Car.findOne({ _id: carId, owner: userId });

        if (!existingCar) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (req.body.chassisNumber) {
            const chassisNumberRegex = /^[A-Za-z0-9]{17}$/;
            if (!chassisNumberRegex.test(req.body.chassisNumber)) {
                return res.status(400).json({ message: 'Invalid chassisNumber format' });
            }

            const existingCarWithChassisNumber = await Car.findOne({ chassisNumber: req.body.chassisNumber });
            if (existingCarWithChassisNumber) {
                return res.status(400).json({ message: 'ChassisNumber already in use' });
            }
        }

        if (req.body.licenseNumber) {
            const existingCarWithLicenseNumber = await Car.findOne({ licenseNumber: req.body.licenseNumber });
            if (existingCarWithLicenseNumber) {
                return res.status(400).json({ message: 'License number already in use' });
            }
        }

        if (req.body.city) {
            const checkCity = await City.findById(req.body.city);
            if (!checkCity) {
                return res.status(404).json({ message: 'City not found' });
            }
        }

        if (req.body.brand) {
            const carBrand = await Brand.findById(req.body.brand);
            if (!carBrand) {
                return res.status(404).json({ status: 404, message: 'CarBrand not found' });
            }
        }

        for (const key in req.body) {
            if (key in existingCar._doc) {
                existingCar[key] = req.body[key];
            }
        }

        const updatedCar = await existingCar.save();

        return res.status(200).json({ status: 200, data: updatedCar });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteCarById = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).send({ status: 404, message: "User not found" });
        }

        const deletedCar = await Car.findByIdAndDelete(req.params.carId);
        if (!deletedCar) {
            return res.status(404).json({ message: 'Car not found' });
        }

        user.cars = user.cars.filter(car => car.car.toString() !== req.params.carId,);
        await user.save();

        return res.status(200).json({ status: 200, message: 'Car deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateCarDocuments = async (req, res) => {
    try {
        const { carId } = req.params;
        const { carDocumentsText } = req.body;

        const existingCar = await Car.findById(carId);

        if (!existingCar) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (req.file) {
            existingCar.carDocuments = req.file.path;
            existingCar.isCarDocumentsUpload = true;
        }

        existingCar.carDocumentsText = carDocumentsText;

        const updatedCar = await existingCar.save();

        return res.status(200).json({ status: 200, message: 'Car documents updated successfully', data: updatedCar });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateDLDetails = async (req, res) => {
    try {
        const { carId } = req.params;
        const { dlNumber } = req.body;

        const existingCar = await Car.findById(carId);
        if (!existingCar) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (req.files['dlFront']) {
            let dlFront = req.files['dlFront'];
            existingCar.dlFront = dlFront[0].path;
            existingCar.isDlUpload = true;
        }
        if (req.files['dlBack']) {
            let dlBack = req.files['dlBack'];
            existingCar.dlBack = dlBack[0].path;
            existingCar.isDlUpload = true;
        }

        existingCar.dlNumber = dlNumber;

        const updatedCar = await existingCar.save();

        return res.status(200).json({ status: 200, message: 'DL details updated successfully', data: updatedCar });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.updateAddressProof = async (req, res) => {
    try {
        const { carId } = req.params;
        const { name, email, yourAddress, mobileNumber, pincode, city, state, district, alternateMobileNumber } = req.body;

        const existingCar = await Car.findById(carId);

        if (!existingCar) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (req.file) {
            existingCar.addressProof.officeAddressProof = req.file.path;
        }
        console.log("existingCar.addressProof.officeAddressProof", existingCar.addressProof.officeAddressProof);
        if (name) existingCar.addressProof.name = name;
        if (email) existingCar.addressProof.email = email;
        if (yourAddress) existingCar.addressProof.yourAddress = yourAddress;
        if (mobileNumber) existingCar.addressProof.mobileNumber = mobileNumber;
        if (pincode) existingCar.addressProof.pincode = pincode;
        if (city) existingCar.addressProof.city = city;
        if (state) existingCar.addressProof.state = state;
        if (district) existingCar.addressProof.district = district;
        if (alternateMobileNumber) existingCar.addressProof.alternateMobileNumber = alternateMobileNumber;

        existingCar.addressProof.isUploadAddress = true;

        const updatedCar = await existingCar.save();

        return res.status(200).json({ status: 200, message: 'Address proof details updated successfully', data: updatedCar });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.uploadCarImages = async (req, res) => {
    try {
        const { carId } = req.params;

        const existingCar = await Car.findById(carId);

        if (!existingCar) {
            return res.status(404).json({ message: 'Car not found' });
        }

        const maxImages = 14;

        const totalImages = existingCar.images.length + req.files.length;

        if (totalImages > maxImages) {
            return res.status(400).json({ status: 400, message: 'Exceeded maximum limit of images' });
        }

        req.files.forEach(file => {
            existingCar.images.push({ img: file.path });
        });

        const updatedCar = await existingCar.save();

        return res.status(200).json({ status: 200, message: 'Images uploaded successfully', data: updatedCar });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.updateCarImageById = async (req, res) => {
    try {
        const { carId, imageId } = req.params;

        const existingCar = await Car.findById(carId);

        if (!existingCar) {
            return res.status(404).json({ message: 'Car not found' });
        }

        const imageIndex = existingCar.images.findIndex(image => image._id.toString() === imageId);

        if (imageIndex === -1) {
            return res.status(404).json({ status: 404, message: 'Image not found' });
        }

        if (req.file) {
            existingCar.images[imageIndex].img = req.file.path;
        }

        const updatedCar = await existingCar.save();

        return res.status(200).json({ status: 200, message: 'Image updated successfully', data: updatedCar });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getAllCarImages = async (req, res) => {
    try {
        const carImages = await CarImage.find();

        return res.status(200).json({ status: 200, data: carImages });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getCarImageById = async (req, res) => {
    try {
        const { carImageId } = req.params;
        const carImage = await CarImage.findById(carImageId);

        if (!carImage) {
            return res.status(404).json({ status: 404, message: 'Car Image not found' });
        }

        return res.status(200).json({ status: 200, data: carImage });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getCarsForPartner = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const partnerCars = await Car.find({ owner: userId });

        return res.status(200).json({ status: 200, data: partnerCars });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.updateIsFastTag = async (req, res) => {
    try {
        const userId = req.user._id;
        const carId = req.params.carId;
        const { isFastTag } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const car = await Car.findOne({ _id: carId, owner: userId });
        if (!car) {
            return res.status(404).json({ status: 404, message: 'Car not found for the user' });
        }

        car.isFastTag = isFastTag;
        await car.save();

        return res.status(200).json({ status: 200, message: 'isFastTag updated successfully', data: car });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getNewlyListedCarsForPartner = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const partnerCars = await Car.find({ owner: userId })
            .sort({ createdAt: -1 })
            .limit(50);

        return res.status(200).json({ status: 200, data: partnerCars });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.createLocation = async (req, res) => {
    try {
        const userId = req.user._id;
        const { carId, name, coordinates, type } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const existingCar = await Car.findOne({ _id: carId, owner: userId });

        if (!existingCar) {
            return res.status(404).json({ message: 'Car not found' });
        }

        const existingLocation = await Location.findOne({ car: carId, user: userId, type: type });

        if (existingLocation) {
            return res.status(404).json({ message: 'Location Already found With This Car ' });
        }

        const location = new Location({
            user: userId,
            car: carId,
            name,
            coordinates,
            type,
        });

        const savedLocation = await location.save();

        if (type === 'pickup') {
            existingCar.pickup = location._id;
        } else {
            existingCar.drop = location._id;
        }

        await existingCar.save();

        res.status(201).json({
            status: 201,
            message: 'Location created successfully',
            data: savedLocation,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getAllLocations = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const locations = await Location.find({ user: userId });

        res.status(200).json({ status: 200, data: locations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getAllLocationsByCar = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const existingCar = await Car.findOne({ owner: userId });

        if (!existingCar) {
            return res.status(404).json({ message: 'Car not found' });
        }

        const locations = await Location.find({ user: userId, car: existingCar._id });

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

exports.updateLocationById = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const { locationId } = req.params;
        const { name, coordinates, type } = req.body;

        const location = await Location.findByIdAndUpdate(
            locationId,
            { $set: { name, coordinates, type } },
            { new: true }
        );

        if (!location) {
            return res.status(404).json({ status: 404, message: 'Location not found' });
        }

        const existingCar = await Car.findOne({ _id: location.car });

        if (!existingCar) {
            return res.status(404).json({ status: 404, message: 'Car not found' });
        }


        await existingCar.save();

        res.status(200).json({ status: 200, message: 'Location updated successfully', data: location });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.deleteLocationById = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const { locationId } = req.params;

        const location = await Location.findByIdAndDelete(locationId);

        if (!location) {
            return res.status(404).json({ status: 404, message: 'Location not found' });
        }

        res.status(200).json({ status: 200, message: 'Location deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getLocationsByType = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const { type } = req.params;

        const locations = await Location.find({ type: type, user: userId });

        if (locations && locations.length > 0) {
            return res.json(locations);
        } else {
            return res.status(404).json({ message: `No locations found for type: ${type}` });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: `Failed to retrieve locations for type: ${type}` });
    }
};

exports.getAllPolicies = async (req, res) => {
    try {
        const policies = await FulfilmentPolicy.find();
        return res.status(200).json({ status: 200, data: policies });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getPolicyById = async (req, res) => {
    try {
        const policy = await FulfilmentPolicy.findById(req.params.id);
        if (!policy) {
            return res.status(404).json({ status: 404, message: 'Policy not found' });
        }
        return res.status(200).json({ status: 200, data: policy });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getAllCancellationPolicy = async (req, res) => {
    try {
        const policies = await CancellationPolicy.find();
        return res.status(200).json({ status: 200, data: policies });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getCancellationPolicyById = async (req, res) => {
    try {
        const policy = await CancellationPolicy.findById(req.params.id);
        if (!policy) {
            return res.status(404).json({ status: 404, message: 'Policy not found' });
        }
        return res.status(200).json({ status: 200, data: policy });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.createOffer = async (req, res) => {
    try {
        const userId = req.user._id;
        const { car, title, description, type, duration, discount, isPercent, isLongDurationOffer, isEarlyBirdOffer, isRaiseTheCost, } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const CheckCar = await Car.findOne({ _id: car, owner: userId });
        if (!CheckCar) {
            return res.status(404).json({ status: 404, message: 'Car not found for the user' });
        }

        const existingOffer = await HostOffer.findOne({ car, type });
        if (existingOffer) {
            return res.status(400).json({ status: 400, message: 'An offer with the same car and type already exists' });
        }

        const newOffer = await HostOffer.create({
            car,
            title,
            description,
            type,
            duration,
            discount,
            isPercent,
            isLongDurationOffer,
            isEarlyBirdOffer,
            isRaiseTheCost,
        });
        return res.status(201).json({ status: 201, data: newOffer });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getAllOffers = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const offers = await HostOffer.find();
        return res.status(200).json({ status: 200, data: offers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getAllOffersForPartner = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const userCars = await Car.find({ owner: userId });
        if (!userCars || userCars.length === 0) {
            return res.status(404).json({ status: 404, message: 'No cars found for the user' });
        }

        const carIds = userCars.map(car => car._id);

        const offers = await HostOffer.find({ car: { $in: carIds } });
        return res.status(200).json({ status: 200, data: offers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getOffersByCarId = async (req, res) => {
    try {
        const userId = req.user._id;
        const carId = req.params.carId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const userCar = await Car.findOne({ _id: carId, owner: userId });
        if (!userCar) {
            return res.status(404).json({ status: 404, message: 'Car not found for the user' });
        }

        const offers = await HostOffer.find({ car: carId });
        return res.status(200).json({ status: 200, data: offers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getOfferById = async (req, res) => {
    try {
        const offer = await HostOffer.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({ status: 404, message: 'Offer not found' });
        }
        return res.status(200).json({ status: 200, data: offer });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.updateOffer = async (req, res) => {
    try {
        const userId = req.user._id;
        const offerId = req.params.id;
        const { car, title, description, type, duration, discount, isPercent, isLongDurationOffer, isEarlyBirdOffer, isRaiseTheCost } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        if (car) {
            const CheckCar = await Car.findOne({ _id: car, owner: userId });
            if (!CheckCar) {
                return res.status(404).json({ status: 404, message: 'Car not found for the user' });
            }
        }

        const updatedOffer = await HostOffer.findOneAndUpdate(
            { _id: offerId, car, },
            { car, title, description, type, duration, discount, isPercent, isLongDurationOffer, isEarlyBirdOffer, isRaiseTheCost },
            { new: true }
        );

        if (!updatedOffer) {
            return res.status(404).json({ status: 404, message: 'Offer not found for the user' });
        }

        return res.status(200).json({ status: 200, data: updatedOffer });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.updateOfferFlags = async (req, res) => {
    try {
        const userId = req.user._id;
        const { isLongDurationOffer, isEarlyBirdOffer, isRaiseTheCost } = req.body;
        const offerId = req.params.offerId;
        const carId = req.params.carId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const userCar = await Car.findOne({ _id: carId, owner: userId });
        if (!userCar) {
            return res.status(404).json({ status: 404, message: 'Car not found for the user' });
        }

        const existingOffer = await HostOffer.findOne({ _id: offerId, car: carId });
        if (!existingOffer) {
            return res.status(404).json({ status: 404, message: 'Offer not found for the specified car' });
        }

        existingOffer.isLongDurationOffer = isLongDurationOffer;
        existingOffer.isEarlyBirdOffer = isEarlyBirdOffer;
        existingOffer.isRaiseTheCost = isRaiseTheCost;

        const updatedOffer = await existingOffer.save();

        return res.status(200).json({ status: 200, data: updatedOffer });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.deleteOffer = async (req, res) => {
    try {
        const deletedOffer = await HostOffer.findByIdAndDelete(req.params.id);
        if (!deletedOffer) {
            return res.status(404).json({ status: 404, message: 'Offer not found' });
        }
        return res.status(200).json({ status: 200, data: {} });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.createCarFeature = async (req, res) => {
    try {
        const userId = req.user._id;
        const carId = req.params.carId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ status: 404, message: 'Car not found' });
        }

        const existingCarFeature = await CarFeatures.findOne({ car: carId });
        if (existingCarFeature) {
            return res.status(400).json({ status: 400, message: 'Car feature for the specified car already exists' });
        }

        const newCarFeature = await CarFeatures.create({ ...req.body, car: carId });
        return res.status(201).json({ status: 201, data: newCarFeature });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getAllCarFeatures = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const userCars = await Car.find({ owner: userId });
        if (!userCars || userCars.length === 0) {
            return res.status(404).json({ status: 404, message: 'No cars found for the user' });
        }

        const carIds = userCars.map(car => car._id);
        const carFeatures = await CarFeatures.find({ car: { $in: carIds } });

        return res.status(200).json({ status: 200, data: carFeatures });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getCarFeatureById = async (req, res) => {
    try {
        const carFeatureId = req.params.id;
        const carFeature = await CarFeatures.findById(carFeatureId);

        if (!carFeature) {
            return res.status(404).json({ status: 404, message: 'Car feature not found' });
        }

        return res.status(200).json({ status: 200, data: carFeature });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.updateCarFeature = async (req, res) => {
    try {
        const carId = req.params.carId;
        const carFeatureId = req.params.id;

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ status: 404, message: 'Car not found' });
        }

        const carFeature = await CarFeatures.findOne({ _id: carFeatureId, car: carId });
        if (!carFeature) {
            return res.status(404).json({ status: 404, message: 'Car feature not found for the specified car' });
        }

        const updatedCarFeature = await CarFeatures.findByIdAndUpdate(
            carFeatureId,
            { $set: req.body },
            { new: true }
        );

        return res.status(200).json({ status: 200, data: updatedCarFeature });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.deleteCarFeature = async (req, res) => {
    try {
        const carFeatureId = req.params.id;
        const deletedCarFeature = await CarFeatures.findByIdAndDelete(carFeatureId);

        if (!deletedCarFeature) {
            return res.status(404).json({ status: 404, message: 'Car feature not found' });
        }

        return res.status(200).json({ status: 200, message: 'Car feature deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.createContactUs = async (req, res) => {
    try {
        const { mobileNumber, email, message, image } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        let attachmentPath = null;

        if (req.file) {
            attachmentPath = req.file.path;
        } else if (image) {
            attachmentPath = image;
        }

        const newContactUs = await ContactUs.create({
            user: user._id,
            attachment: attachmentPath,
            mobileNumber,
            email,
            message,
        });

        return res.status(201).json({ status: 201, data: newContactUs });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getAllContactUsEntries = async (req, res) => {
    try {
        const contactUsEntries = await ContactUs.find();
        return res.status(200).json({ status: 200, data: contactUsEntries });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getContactUsEntryById = async (req, res) => {
    try {
        const contactUsId = req.params.id;
        const contactUsEntry = await ContactUs.findById(contactUsId);

        if (!contactUsEntry) {
            return res.status(404).json({ status: 404, message: 'Contact us entry not found' });
        }

        return res.status(200).json({ status: 200, data: contactUsEntry });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.updateContactUsEntry = async (req, res) => {
    try {
        const contactUsId = req.params.id;

        if (req.file) {
            const updatedContactUsEntry = await ContactUs.findByIdAndUpdate(
                contactUsId,
                {
                    $set: {
                        attachment: req.file.path,
                        ...req.body,
                    },
                },
                { new: true }
            );

            if (!updatedContactUsEntry) {
                return res.status(404).json({ status: 404, message: 'Contact Us entry not found' });
            }

            return res.status(200).json({ status: 200, data: updatedContactUsEntry });
        } else {
            const updatedContactUsEntry = await ContactUs.findByIdAndUpdate(
                contactUsId,
                { $set: req.body },
                { new: true }
            );

            if (!updatedContactUsEntry) {
                return res.status(404).json({ status: 404, message: 'Contact Us entry not found' });
            }

            return res.status(200).json({ status: 200, data: updatedContactUsEntry });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.deleteContactUsEntry = async (req, res) => {
    try {
        const contactUsId = req.params.id;
        const deletedContactUsEntry = await ContactUs.findByIdAndDelete(contactUsId);

        if (!deletedContactUsEntry) {
            return res.status(404).json({ status: 404, message: 'Contact us entry not found' });
        }

        return res.status(200).json({ status: 200, message: 'Contact us entry deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getAllTermAndCondition = async (req, res) => {
    try {
        const termAndCondition = await TermAndCondition.find();

        if (!termAndCondition) {
            return res.status(404).json({ status: 404, message: 'Terms and Conditions not found' });
        }

        return res.status(200).json({ status: 200, message: "Sucessfully", data: termAndCondition });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

exports.getTermAndConditionById = async (req, res) => {
    try {
        const termAndConditionId = req.params.id;
        const termAndCondition = await TermAndCondition.findById(termAndConditionId);

        if (!termAndCondition) {
            return res.status(404).json({ status: 404, message: 'Terms and Conditions not found' });
        }

        return res.status(200).json({ status: 200, message: 'Sucessfully', data: termAndCondition });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
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

exports.getAllAboutApps = async (req, res) => {
    try {
        const termAndCondition = await AboutApps.find();

        if (!termAndCondition) {
            return res.status(404).json({ status: 404, message: 'About Apps not found' });
        }

        return res.status(200).json({ status: 200, message: "Sucessfully", data: termAndCondition });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

exports.getAboutAppsById = async (req, res) => {
    try {
        const termAndConditionId = req.params.id;
        const termAndCondition = await AboutApps.findById(termAndConditionId);

        if (!termAndCondition) {
            return res.status(404).json({ status: 404, message: 'About Apps not found' });
        }

        return res.status(200).json({ status: 200, message: 'Sucessfully', data: termAndCondition });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
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

exports.updateHostCarPricing = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const userCars = await Car.find({ owner: userId });
        if (!userCars || userCars.length === 0) {
            return res.status(404).json({ status: 404, message: 'No cars found for the user' });
        }

        const carIds = userCars.map(car => car._id);

        const partnerCar = await AdminCarPrice.findOne({ car: { $in: carIds } });

        if (!partnerCar) {
            return res.status(404).json({ status: 404, message: 'Host car pricing not found or does not belong to the partner' });
        }

        const isUserCar = carIds.some(id => id.equals(partnerCar.car));
        if (!isUserCar) {
            return res.status(403).json({ status: 403, message: 'User does not own the specified car' });
        }

        partnerCar.hostHourlyRate = req.body.hostHourlyRate || partnerCar.hostHourlyRate;
        partnerCar.isHostPricing = req.body.isHostPricing || partnerCar.isHostPricing;
        partnerCar.hostMinPricePerHour = req.body.hostMinPricePerHour || partnerCar.hostMinPricePerHour;
        partnerCar.hostMaxPricePerHour = req.body.hostMaxPricePerHour || partnerCar.hostMaxPricePerHour;

        if (req.body.autoPricing) {
            partnerCar.autoPricing = true;
            partnerCar.hostHourlyRate = 0;
            partnerCar.isHostPricing = false;
            partnerCar.hostMinPricePerHour = 0;
            partnerCar.hostMaxPricePerHour = 0;
        } else {
            partnerCar.autoPricing = false;
        }

        await partnerCar.save();

        return res.status(200).json({ status: 200, message: 'Host car pricing updated successfully', data: partnerCar });
    } catch (error) {
        console.error('Error updating host car pricing:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.updateHostCarPricingByCarId = async (req, res) => {
    try {
        const userId = req.user._id;
        const carId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const userCars = await Car.find({ owner: userId, _id: carId });
        if (!userCars || userCars.length === 0) {
            return res.status(404).json({ status: 404, message: 'No cars found for the user' });
        }

        const partnerCar = await AdminCarPrice.findOne({ car: carId });

        if (!partnerCar) {
            return res.status(404).json({ status: 404, message: 'Host car pricing not found or does not belong to the partner' });
        }

        partnerCar.hostHourlyRate = req.body.hostHourlyRate || partnerCar.hostHourlyRate;
        partnerCar.isHostPricing = req.body.isHostPricing || partnerCar.isHostPricing;
        partnerCar.hostMinPricePerHour = req.body.hostMinPricePerHour || partnerCar.hostMinPricePerHour;
        partnerCar.hostMaxPricePerHour = req.body.hostMaxPricePerHour || partnerCar.hostMaxPricePerHour;

        if (req.body.autoPricing) {
            partnerCar.autoPricing = true;
            partnerCar.hostHourlyRate = 0;
            partnerCar.isHostPricing = false;
            partnerCar.hostMinPricePerHour = 0;
            partnerCar.hostMaxPricePerHour = 0;
        } else {
            partnerCar.autoPricing = false;
        }

        await partnerCar.save();

        return res.status(200).json({ status: 200, message: 'Host car pricing updated successfully', data: partnerCar });
    } catch (error) {
        console.error('Error updating host car pricing:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getHostCarPricing = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const userCars = await Car.find({ owner: userId });
        if (!userCars || userCars.length === 0) {
            return res.status(404).json({ status: 404, message: 'No cars found for the user' });
        }

        const carIds = userCars.map(car => car._id);

        const partnerCar = await AdminCarPrice.findOne({ car: { $in: carIds } });

        if (!partnerCar) {
            return res.status(404).json({ status: 404, message: 'Host car pricing not found or does not belong to the partner' });
        }

        const isUserCar = carIds.some(id => id.equals(partnerCar.car));
        if (!isUserCar) {
            return res.status(403).json({ status: 403, message: 'User does not own the specified car' });
        }

        return res.status(200).json({ status: 200, message: 'Host car pricing fetched successfully', data: partnerCar });
    } catch (error) {
        console.error('Error fetching host car pricing:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

async function sendNotificationToPartner(booking, partnerId) {
    const partner = await User.findById(partnerId);

    if (partner && partner._id) {
        const notificationMessage = `You have a new booking scheduled for ${booking.pickupDate}.`;

        const notification = new Notification({
            recipient: partner._id,
            content: notificationMessage,
        });

        try {
            await notification.save();
        } catch (error) {
            console.error('Error saving partner notification:', error);
        }
    }
}

exports.getUpcomingBookingsForPartner = async (req, res) => {
    try {
        const partnerId = req.user._id;
        console.log(partnerId);
        const currentDate = new Date();
        console.log("currentDate", currentDate);
        console.log("currentDate", currentDate.toISOString().split('T')[0]);

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const cars = await Car.find({ owner: partnerId }).populate('owner pickup drop');

        const bikeObjectIds = cars.map(car => car._id);

        const upcomingBookings = await Booking.find({
            car: { $in: bikeObjectIds },
            paymentStatus: 'PAID',
            isTripCompleted: false,
            $or: [
                {
                    $and: [
                        { pickupDate: { $gte: currentDate.toISOString().split('T')[0] } },
                        { pickupTime: { $gte: currentDate.toISOString().split('T')[1].split('.')[0] } }
                    ]
                },
                {
                    dropOffDate: { $gt: currentDate.toISOString().split('T')[0] }
                }
            ]
        }).populate('user car');

        for (const booking of upcomingBookings) {
            await sendNotificationToPartner(booking, partnerId);
        }

        return res.status(200).json({
            status: 200,
            message: 'Upcoming bookings retrieved successfully for the partner',
            data: upcomingBookings,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getBookingByIdForPartner = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const bookingId = req.params.bookingId;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const booking = await Booking.findById(bookingId).populate({
            path: 'car',
            populate: { path: 'owner pickup drop' }
        }).populate('user');

        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        return res.status(200).json({
            status: 200,
            message: 'Booking retrieved successfully for the partner',
            data: booking,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getCompletedBookingsForPartner = async (req, res) => {
    try {
        const partnerId = req.user._id;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const cars = await Car.find({ owner: partnerId }).populate('owner pickup drop');

        const bikeObjectIds = cars.map(car => car._id);


        const completedBookings = await Booking.find({
            car: { $in: bikeObjectIds },
            status: 'COMPLETED',
            paymentStatus: 'PAID',
            isTripCompleted: true,
        }).populate('user car');

        return res.status(200).json({
            status: 200,
            message: 'Completed bookings retrieved successfully for the partner',
            data: completedBookings,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getCanceledBookingsForPartner = async (req, res) => {
    try {
        const partnerId = req.user._id;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const cars = await Car.find({ owner: partnerId }).populate('owner pickup drop');

        const bikeObjectIds = cars.map(car => car._id);

        const canceledBookings = await Booking.find({
            car: { $in: bikeObjectIds },
            status: 'CANCELLED',
            isTripCompleted: false,
        }).populate('user car');

        return res.status(200).json({
            status: 200,
            message: 'Canceled bookings retrieved successfully for the partner',
            data: canceledBookings,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getPaymentFaliedBookingsForPartner = async (req, res) => {
    try {
        const partnerId = req.user._id;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const cars = await Car.find({ owner: partnerId }).populate('owner pickup drop');

        const bikeObjectIds = cars.map(car => car._id);

        const canceledBookings = await Booking.find({
            car: { $in: bikeObjectIds },
            status: 'PENDING',
            paymentStatus: 'FAILED',
            isTripCompleted: false,
        }).populate('user car');

        return res.status(200).json({
            status: 200,
            message: 'Canceled bookings retrieved successfully for the partner',
            data: canceledBookings,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.approveBookingStatus = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const bookingId = req.params.bookingId;

        if (!bookingId) {
            return res.status(400).json({ status: 400, message: 'Booking ID is required', data: null });
        }

        const {
            tripStartKm,
        } = req.body;

        const booking = await Booking.findById(bookingId).populate('car');

        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        if (booking.paymentStatus !== "PAID") {
            return res.status(403).json({ status: 403, message: 'Cannot approve booking because payment is not complete', data: null });
        }

        if (tripStartKm) {
            booking.tripStartKm = req.body.tripStartKm;
        }

        let otp = newOTP.generate(6, { alphabets: false, upperCase: false, specialChar: false });

        booking.tripStartKm = req.body.tripStartKm || tripStartKm;
        booking.approvedOtp = otp;

        booking.status = 'APPROVED';

        const partnerWallet = await User.findOne({ _id: partnerId });
        if (!partnerWallet) {
            return res.status(404).json({ status: 404, message: 'Partner wallet not found' });
        }

        partnerWallet.wallet += booking.totalPrice;

        await partnerWallet.save();

        await booking.save();

        const newTransaction = new Transaction({
            user: partnerId,
            amount: booking.totalPrice,
            type: 'Wallet',
            details: 'Booking creation',
            cr: true
        });

        await newTransaction.save();

        return res.status(200).json({
            status: 200,
            message: 'Booking status approved successfully',
            data: booking,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.approveBookingVerifyOtp = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const bookingId = req.params.bookingId;
        const { otp } = req.body;

        const findPartner = await User.findById(partnerId);
        if (!findPartner) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        const userId = booking.user;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        if (booking.approvedOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                isApprovedOtp: true,
                tripStartTime: new Date
            },
            { new: true }
        );

        if (updatedBooking) {
            await Car.findByIdAndUpdate(
                updatedBooking.car,
                { isOnTrip: true },
                { new: true }
            );
        }

        return res.status(200).send({ status: 200, message: "OTP verified successfully", data: updatedBooking });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send({ error: "Internal server error" + err.message });
    }
};

exports.approveBookingResendOTP = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const { id } = req.params;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const otp = newOTP.generate(6, { alphabets: false, upperCase: false, specialChar: false });

        const updated = await Booking.findOneAndUpdate(
            { _id: id },
            { approvedOtp: otp, isApprovedOtp: false },
            { new: true }
        );

        return res.status(200).send({ status: 200, message: "OTP resent", data: updated });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 500, message: "Server error" + error.message });
    }
};

exports.getApprovedBookingsForPartner = async (req, res) => {
    try {
        const partnerId = req.user._id;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const cars = await Car.find({ owner: partnerId }).populate('owner pickup drop');

        const bikeObjectIds = cars.map(car => car._id);


        const approvedBookings = await Booking.find({
            car: { $in: bikeObjectIds },
            status: 'APPROVED',
            paymentStatus: 'PAID'
        }).populate('car');

        return res.status(200).json({
            status: 200,
            message: 'Approved bookings for partner retrieved successfully',
            data: approvedBookings,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.updateCarDeliveredUser = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const { bookingId } = req.params;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const approvedBookings = await Booking.findOne({
            _id: bookingId,
            status: 'APPROVED',
            paymentStatus: 'PAID'
        }).populate('car');
        console.log("approvedBookings", approvedBookings);

        if (!approvedBookings) {
            return res.status(404).json({ status: 404, message: 'Booking not found or payment not paid' });
        }

        approvedBookings.isCarDeliveredUser = true;
        await approvedBookings.save();

        return res.status(200).json({
            status: 200,
            message: 'Car delivered to User location successfully',
            data: approvedBookings,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.rejectBookingStatus = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const bookingId = req.params.bookingId;

        const {
            rejectRemarks,
        } = req.body;

        if (!bookingId) {
            return res.status(400).json({ status: 400, message: 'Booking ID is required', data: null });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(400).json({ status: 400, message: 'Booking is not found', data: null });
        }

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        if (booking.paymentStatus !== "PAID") {
            return res.status(403).json({ status: 403, message: 'Cannot canclelled booking because payment is not complete', data: null });
        }

        let otp = newOTP.generate(6, { alphabets: false, upperCase: false, specialChar: false });


        booking.status = 'REJECT';
        booking.rejectRemarks = req.body.rejectRemarks || rejectRemarks;
        booking.rejectOtp = otp

        const partnerWallet = await User.findOne({ _id: partnerId });
        if (!partnerWallet) {
            return res.status(404).json({ status: 404, message: 'Partner wallet not found' });
        }

        partnerWallet.wallet -= booking.totalPrice;

        await partnerWallet.save();

        await booking.save();

        const newTransaction = new Transaction({
            user: partnerId,
            amount: booking.totalPrice,
            type: 'Wallet',
            details: 'Booking Refund',
            dr: true
        });

        await newTransaction.save();

        if (booking.status = 'REJECT') {
            const userCheck = await User.findById(booking.user);
            const carExist = await Car.findById(booking.car);

            userCheck.coin -= carExist.quackCoin;
            await userCheck.save();
        }

        return res.status(200).json({
            status: 200,
            message: 'Booking status CANCELLED successfully',
            data: booking,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.rejectBookingVerifyOtp = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const bookingId = req.params.bookingId;
        const { otp } = req.body;

        const findUser = await User.findById(partnerId);
        if (!findUser) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        const userId = booking.user;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        if (booking.rejectOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const updated = await Booking.findByIdAndUpdate(
            bookingId,
            { isRejectOtp: true },
            { new: true }
        );

        return res.status(200).send({ status: 200, message: "OTP verified successfully", data: updated });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send({ error: "Internal server error" + err.message });
    }
};

exports.rejectBookingResendOTP = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const { id } = req.params;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const otp = newOTP.generate(6, { alphabets: false, upperCase: false, specialChar: false });

        const updated = await Booking.findOneAndUpdate(
            { _id: id },
            { rejectOtp: otp, isRejectOtp: false },
            { new: true }
        );

        return res.status(200).send({ status: 200, message: "OTP resent", data: updated });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 500, message: "Server error" + error.message });
    }
};

exports.getRejectedBookingsForPartner = async (req, res) => {
    try {
        const partnerId = req.user._id;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const cars = await Car.find({ owner: partnerId }).populate('owner pickup drop');

        const bikeObjectIds = cars.map(car => car._id);


        const rejectBookings = await Booking.find({
            car: { $in: bikeObjectIds },
            status: 'CANCELLED',
        }).populate('car');

        return res.status(200).json({
            status: 200,
            message: 'Reject bookings for partner retrieved successfully',
            data: rejectBookings,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.updateTripEndDetails1 = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;

        if (!bookingId) {
            return res.status(400).json({ status: 400, message: 'Booking ID is required', data: null });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        if (booking.isTripCompleted) {
            return res.status(400).json({ status: 400, message: 'Trip is already marked as completed', data: null });
        }

        booking.tripEndKm = req.query.tripEndKm !== undefined ? req.query.tripEndKm : booking.tripEndKm;

        booking.remarks = req.query.remarks !== undefined ? req.query.remarks : booking.remarks;

        const car = await Car.findById(booking.car);
        if (car) {
            car.kmDriven += booking.tripEndKm;
            await car.save();
        }

        let otp = newOTP.generate(6, { alphabets: false, upperCase: false, specialChar: false });

        booking.tripEndTime = new Date();
        booking.tripEndOtp = otp;
        booking.isTripCompleted = true;
        booking.status = "COMPLETED";

        const updatedBooking = await booking.save();

        return res.status(200).json({ status: 200, message: 'Trip end details updated successfully', data: updatedBooking });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.updateTripEndDetails = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;

        if (!bookingId) {
            return res.status(400).json({ status: 400, message: 'Booking ID is required', data: null });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        if (booking.paymentStatus === 'PENDING') {
            return res.status(400).json({ status: 400, message: 'Payment is not paid', data: null });
        }

        if (booking.isTripCompleted) {
            return res.status(400).json({ status: 400, message: 'Trip is already marked as completed', data: null });
        }

        booking.tripEndKm = req.query.tripEndKm !== undefined ? req.query.tripEndKm : booking.tripEndKm;
        booking.remarks = req.query.remarks !== undefined ? req.query.remarks : booking.remarks;

        const totalPrice = booking.totalPrice;
        console.log("totalPrice", totalPrice);
        const depositedMoney = booking.depositedMoney;
        const amountToOwner = Math.round((totalPrice - depositedMoney) * 0.7);
        const amountToAdmin = Math.round((totalPrice - depositedMoney) * 0.15);
        const amountToAdminReferral = Math.round((totalPrice - depositedMoney) * 0.15);
        console.log("amountToOwner", amountToOwner);
        console.log("amountToAdmin", amountToAdmin);
        console.log("amountToAdminReferral", amountToAdminReferral);
        const car = await Car.findById(booking.car);
        if (car) {
            car.kmDriven += booking.tripEndKm;
            await car.save();
        }

        let otp = newOTP.generate(6, { alphabets: false, upperCase: false, specialChar: false });

        booking.tripEndTime = new Date();
        booking.tripEndOtp = otp;
        booking.isTripCompleted = true;
        booking.status = "COMPLETED";

        const carOwner = await User.findById(car.owner);
        const admin = await User.findOne({ userType: 'ADMIN' });

        const TdsFind = await Tds.findOne({ status: false });
        console.log("TdsFind", TdsFind);

        let TdsAmount = 0;
        if (TdsFind) {
            const tdsAmountPercentage = TdsFind.percentage;

            TdsAmount = Math.round(amountToOwner * (tdsAmountPercentage / 100));
        }
        console.log("TdsAmount", TdsAmount);
        console.log("amountToOwner", amountToOwner);


        if (carOwner) {
            carOwner.wallet += amountToOwner - TdsAmount;
            await carOwner.save();
            const newTransaction = new Transaction({
                user: carOwner._id,
                amount: amountToOwner,
                type: 'Booking',
                details: 'Booking creation',
                cr: true
            });

            await newTransaction.save();
        }

        if (admin) {
            admin.wallet += amountToAdmin;
            await admin.save();
            const newTransaction = new Transaction({
                user: admin._id,
                amount: amountToAdmin,
                type: 'Booking',
                details: 'Booking creation',
                cr: true
            });

            await newTransaction.save();

            const userReferralBonus = await ReferralBonus.findOne({ type: 'UserReferral' });
            const userCarReferralBonus = await ReferralBonus.findOne({ type: 'CarReferral' });
            const userRoyalityReferralBonus = await ReferralBonus.findOne({ type: 'RoyalityReward' });

            const carReferralAmount = Math.round(amountToAdminReferral * (userCarReferralBonus.percentage / 100));
            const userReferralAmount = Math.round(amountToAdminReferral * (userReferralBonus.percentage / 100));
            const royaltyRewardAmount = Math.round(amountToAdminReferral * (userRoyalityReferralBonus.percentage / 100));
            console.log("carReferralAmount", carReferralAmount);
            console.log("userReferralAmount", userReferralAmount);
            console.log("royaltyRewardAmount", royaltyRewardAmount);

            admin.carReferral += carReferralAmount;
            admin.userReferral += userReferralAmount;
            admin.royaltyReward += royaltyRewardAmount;
            await admin.save();

            const carReferralTransaction = new Transaction({
                user: admin._id,
                amount: carReferralAmount,
                type: 'Booking',
                details: 'Car referral reward',
                cr: true
            });
            await carReferralTransaction.save();

            const userReferralTransaction = new Transaction({
                user: admin._id,
                amount: userReferralAmount,
                type: 'Booking',
                details: 'User referral reward',
                cr: true
            });
            await userReferralTransaction.save();

            const royaltyRewardTransaction = new Transaction({
                user: admin._id,
                amount: royaltyRewardAmount,
                type: 'Booking',
                details: 'Royalty reward',
                cr: true
            });
            await royaltyRewardTransaction.save();
        }

        const updatedBooking = await booking.save();

        return res.status(200).json({ status: 200, message: 'Trip end details updated successfully', data: updatedBooking });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.approveTripEndDetailsVerifyOtp1 = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const bookingId = req.params.bookingId;
        const { otp } = req.body;

        const findUser = await User.findById(partnerId);
        if (!findUser) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        const userId = booking.user;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        if (booking.tripEndOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                isTripEndOtp: true,
            },
            { new: true }
        );


        return res.status(200).send({ status: 200, message: "OTP verified successfully", data: updatedBooking });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send({ error: "Internal server error" + err.message });
    }
};

const distributeReferralRewards = async (userId, bookingId, referralAmount) => {
    try {
        const bookingUser = await User.findById(userId);
        if (!bookingUser) {
            console.error('Booking user not found');
            return;
        }

        const bookingUserReferralLevels = bookingUser.referralLevels;

        const bookingUserRewards = await calculateReferralRewards(bookingUserReferralLevels, referralAmount);

        if (!Array.isArray(bookingUserRewards)) {
            console.error('Invalid rewards for booking user:', bookingUserRewards);
            return;
        }

        await distributeRewards(bookingUser._id, bookingUserRewards, bookingId);

        for (const referralLevel of bookingUserReferralLevels) {
            for (const referralId of referralLevel.users) {
                const referralUser = await User.findById(referralId);
                if (!referralUser) {
                    console.error(`User ${referralId} not found`);
                    continue;
                }

                const referralUserReferralLevels = referralUser.referralLevels;
                const referralUserRewards = await calculateReferralRewards(referralUserReferralLevels, referralAmount);

                if (!Array.isArray(referralUserRewards)) {
                    console.error(`Invalid rewards for referral user ${referralId}:`, referralUserRewards);
                    continue;
                }

                await distributeRewards(referralUser._id, referralUserRewards, bookingId);
            }
        }

        console.log('Referral rewards distributed successfully');
    } catch (error) {
        console.error('Error distributing referral rewards:', error);
    }
};

const calculateReferralRewards = async (referralLevels, referralAmount) => {
    const rewards = [];
    for (const level of referralLevels) {

        const levelBonus = await getLevelBonus(level.level, type = 'CarReferral');

        if (typeof levelBonus !== 'undefined') {
            const reward = {
                level: level.level,
                type: 'CarReferral',
                amount: Math.round(referralAmount * (level.users.length) * (levelBonus / 100)),
            };
            rewards.push(reward);
        } else {
            console.error(`Level bonus not found for level ${level.level} and type ${level.type}`);
        }
    }
    console.log('rewards', rewards);

    return rewards;
};

const getLevelBonus = async (level, type = 'CarReferral') => {
    try {
        console.log('level***', level);
        console.log('type***', type);

        const referralLevel = await ReferralLevel.findOne({ level: level.toString(), type });

        if (referralLevel) {
            const levelInfo = referralLevel.allLevels.find(info => info.level === level.toString());

            if (levelInfo) {
                const levelPercentage = parseFloat(levelInfo.percentage);
                console.log('levelPercentage', levelPercentage);

                return isNaN(levelPercentage) ? 0 : levelPercentage;
            } else {
                console.error(`Percentage not found for level ${level}`);
                return 0;
            }
        } else {
            return 0;
        }
    } catch (error) {
        console.error('Error fetching level bonus:', error);
        return 0;
    }
};

const distributeRewards = async (userId, rewards, bookingId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.error(`User with ID ${userId} not found`);
            return;
        }

        for (const reward of rewards) {
            if (isNaN(reward.amount)) {
                console.error(`Invalid amount for reward: ${reward.amount}`);
                continue;
            }

            user.wallet += reward.amount;
            console.log('user.wallet', user.wallet);
            console.log('user._id', user._id);

            const transaction = new Transaction({
                user: userId,
                amount: reward.amount,
                type: 'Referral',
                details: `Referral bonus for level ${reward.level} for booking ${bookingId}`,
                cr: true,
            });

            await transaction.save();
        }

        await user.save();
        console.log('Rewards distributed successfully for user', userId);
    } catch (error) {
        console.error('Error distributing rewards:', error);
    }
};

exports.approveTripEndDetailsVerifyOtp = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const bookingId = req.params.bookingId;
        const { otp } = req.body;

        const findUser = await User.findById(partnerId);
        if (!findUser) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const adminUser = await User.findOne({ userType: 'ADMIN' });
        const referralAmount = adminUser.userReferral || 0;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        const userId = booking.user;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        if (booking.tripEndOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { isTripEndOtp: true },
            { new: true }
        );

        await distributeReferralRewards(userId, bookingId, referralAmount);

        return res.status(200).send({ status: 200, message: "OTP verified successfully", data: updatedBooking });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send({ error: "Internal server error" + err.message });
    }
};

exports.approveTripEndDetailsResendOTP = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const { id } = req.params;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const otp = newOTP.generate(6, { alphabets: false, upperCase: false, specialChar: false });

        const updated = await Booking.findOneAndUpdate(
            { _id: id },
            { tripEndOtp: otp, isTripEndOtp: false },
            { new: true }
        );

        return res.status(200).send({ status: 200, message: "OTP resent", data: updated });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 500, message: "Server error" + error.message });
    }
};

exports.updateBookingPrices = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const { bookingId } = req.params;
        const { extraPrice, damagePrice } = req.body;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        if (extraPrice !== undefined) {
            booking.extraPrice = extraPrice;
        }
        if (damagePrice !== undefined) {
            booking.damagePrice = damagePrice;
        }

        booking.totalPrice = booking.totalPrice + (booking.extraPrice || 0) + (booking.damagePrice || 0);

        await booking.save();

        return res.status(200).json({ status: 200, message: 'Booking prices updated successfully', data: booking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.removeBookingPrices = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const { bookingId } = req.params;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }


        booking.totalPrice = booking.totalPrice - (booking.extraPrice || 0) - (booking.damagePrice || 0);
        booking.extraPrice = 0;
        booking.damagePrice = 0;

        await booking.save();

        return res.status(200).json({ status: 200, message: 'Booking prices removed successfully', data: booking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
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

exports.createRentalSharedCar = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const { mainCategory, availableFrom, availableTo, startTime, endTime } = req.body;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const category = await MainCategory.findById(mainCategory);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Main Category not found' });
        }

        const sharedCar = await SharedCar.create({
            owner: partnerId,
            mainCategory,
            availableFrom,
            availableTo,
            startTime,
            endTime,
            type: "Rental",
            uniqueBookinId: await generateBookingCode()
        });
        return res.status(201).json({ status: 201, data: sharedCar });
    } catch (error) {
        console.error('Error creating shared car:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.createSubscriptionSharedCar = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const { mainCategory, availableFrom, availableTo, startTime, endTime } = req.body;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const category = await MainCategory.findById(mainCategory);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Main Category not found' });
        }

        const sharedCar = await SharedCar.create({
            owner: partnerId,
            mainCategory,
            availableFrom,
            availableTo,
            startTime,
            endTime,
            type: "Subscription",
            uniqueBookinId: await generateBookingCode()
        });
        return res.status(201).json({ status: 201, data: sharedCar });
    } catch (error) {
        console.error('Error creating shared car:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.createGovernmentTenderSharedCar = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const { mainCategory, availableFrom, availableTo, startTime, endTime } = req.body;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const category = await MainCategory.findById(mainCategory);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Main Category not found' });
        }

        const sharedCar = await SharedCar.create({
            owner: partnerId,
            mainCategory,
            availableFrom,
            availableTo,
            startTime,
            endTime,
            type: "GovernmentTendor",
            uniqueBookinId: await generateBookingCode()
        });
        return res.status(201).json({ status: 201, data: sharedCar });
    } catch (error) {
        console.error('Error creating shared car:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.createSharingSharedCar = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const { mainCategory, car, pickupLocation, dropOffLocation, pickupCoordinates, dropCoordinates, stopCity, availableFrom, availableTo, passengerPickupTime, noOfPassenger, seatprice, route } = req.body;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const category = await MainCategory.findById(mainCategory);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Main Category not found' });
        }

        const checkCar = await Car.findById(car);
        if (!checkCar) {
            return res.status(404).json({ status: 404, message: 'car not found' });
        }

        if (((checkCar.owner).toString() == partnerId) == false) {
            return res.status(403).json({ status: 403, message: 'Forbidden: Your Car Not exist' });
        }

        const checkPickupLocation = await City.findById(pickupLocation);
        if (!checkPickupLocation) {
            return res.status(404).json({ status: 404, message: 'location not found' });
        }

        // if (((checkLocation.user).toString() == partnerId) == false) {
        //     return res.status(403).json({ status: 403, message: 'Forbidden: Your Location Not exist' });
        // }

        const checkDropLocation = await City.findById(dropOffLocation);
        if (!checkDropLocation) {
            return res.status(404).json({ status: 404, message: 'location not found' });
        }

        // if (((checkLocation.user).toString() == partnerId) == false) {
        //     return res.status(403).json({ status: 403, message: 'Forbidden: Your Location Not exist' });
        // }


        const sharedCar = await SharedCar.create({
            owner: partnerId,
            mainCategory,
            car,
            pickupLocation,
            dropOffLocation,
            pickupCoordinates,
            dropCoordinates,
            stopCity,
            availableFrom,
            availableTo,
            passengerPickupTime,
            seatprice,
            route,
            noOfPassenger,
            type: "Sharing",
            uniqueBookinId: await generateBookingCode()
        });

        checkCar.isSharing = true;
        await checkCar.save();

        return res.status(201).json({ status: 201, data: sharedCar });
    } catch (error) {
        console.error('Error creating shared car:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.getAllSharedCars = async (req, res) => {
    try {
        const partnerId = req.user._id;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const sharedCars = await SharedCar.find({ owner: partnerId }).populate('mainCategory car owner location pickupLocation dropOffLocation');
        return res.status(200).json({ status: 200, data: sharedCars });
    } catch (error) {
        console.error('Error fetching shared cars:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.getSharedCarById = async (req, res) => {
    try {
        const { id } = req.params;
        const sharedCar = await SharedCar.findById(id).populate('mainCategory car owner location pickupLocation dropOffLocation');
        if (!sharedCar) {
            return res.status(404).json({ status: 404, message: 'Shared car not found' });
        }
        return res.status(200).json({ status: 200, data: sharedCar });
    } catch (error) {
        console.error('Error fetching shared car:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.updateSharedCarById = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const { id } = req.params;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const sharedCar = await SharedCar.findById(id);
        if (!sharedCar) {
            return res.status(404).json({ status: 404, message: 'Shared car not found' });
        }

        if (sharedCar.owner.toString() !== partnerId) {
            return res.status(403).json({ status: 403, message: 'Forbidden: You are not allowed to update this shared car' });
        }

        const updatedSharedCar = await SharedCar.findByIdAndUpdate(id, req.body, { new: true });

        return res.status(200).json({ status: 200, data: updatedSharedCar });
    } catch (error) {
        console.error('Error updating shared car:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.deleteSharedCarById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSharedCar = await SharedCar.findByIdAndDelete(id);
        if (!deletedSharedCar) {
            return res.status(404).json({ status: 404, message: 'Shared car not found' });
        }
        return res.status(200).json({ status: 200, message: 'Shared car deleted successfully' });
    } catch (error) {
        console.error('Error deleting shared car:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.addRetntalLocationAndCar = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const { id } = req.params;
        const { car, location } = req.body;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const checkCar = await Car.findById(car);
        if (!checkCar) {
            return res.status(404).json({ status: 404, message: 'car not found' });
        }

        if (((checkCar.owner).toString() == partnerId) == false) {
            return res.status(403).json({ status: 403, message: 'Forbidden: Your Car Not exist' });
        }

        const checkLocation = await Location.findById(location);
        if (!checkLocation) {
            return res.status(404).json({ status: 404, message: 'location not found' });
        }

        if (((checkLocation.user).toString() == partnerId) == false) {
            return res.status(403).json({ status: 403, message: 'Forbidden: Your Location Not exist' });
        }

        const sharedCar = await SharedCar.findById(id);
        if (!sharedCar) {
            return res.status(404).json({ status: 404, message: 'Shared car not found' });
        }

        if (((sharedCar.owner).toString() == partnerId) == false) {
            return res.status(403).json({ status: 403, message: 'Forbidden: You are not allowed to update this shared car' });
        }

        const updatedSharedCar = await SharedCar.findByIdAndUpdate(id, { car: car, location: location, }, { new: true });

        checkCar.isRental = true;
        await checkCar.save();

        res.status(200).json({ status: 200, message: 'Shared car updated successfully', data: updatedSharedCar });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.addSubscriptionLocationAndCar = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const { id } = req.params;
        const { car, location } = req.body;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const checkCar = await Car.findById(car);
        if (!checkCar) {
            return res.status(404).json({ status: 404, message: 'car not found' });
        }

        if (((checkCar.owner).toString() == partnerId) == false) {
            return res.status(403).json({ status: 403, message: 'Forbidden: Your Car Not exist' });
        }

        const checkLocation = await Location.findById(location);
        if (!checkLocation) {
            return res.status(404).json({ status: 404, message: 'location not found' });
        }

        if (((checkLocation.user).toString() == partnerId) == false) {
            return res.status(403).json({ status: 403, message: 'Forbidden: Your Location Not exist' });
        }

        const sharedCar = await SharedCar.findById(id);
        if (!sharedCar) {
            return res.status(404).json({ status: 404, message: 'Shared car not found' });
        }

        if (((sharedCar.owner).toString() == partnerId) == false) {
            return res.status(403).json({ status: 403, message: 'Forbidden: You are not allowed to update this shared car' });
        }

        const updatedSharedCar = await SharedCar.findByIdAndUpdate(id, { car: car, location: location, }, { new: true });

        checkCar.isSubscription = true;
        await checkCar.save();

        res.status(200).json({ status: 200, message: 'Shared car updated successfully', data: updatedSharedCar });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.addGovernmentTendorLocationAndCar = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const { id } = req.params;
        const { car, location } = req.body;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const checkCar = await Car.findById(car);
        if (!checkCar) {
            return res.status(404).json({ status: 404, message: 'car not found' });
        }

        if (((checkCar.owner).toString() == partnerId) == false) {
            return res.status(403).json({ status: 403, message: 'Forbidden: Your Car Not exist' });
        }

        const checkLocation = await Location.findById(location);
        if (!checkLocation) {
            return res.status(404).json({ status: 404, message: 'location not found' });
        }

        if (((checkLocation.user).toString() == partnerId) == false) {
            return res.status(403).json({ status: 403, message: 'Forbidden: Your Location Not exist' });
        }

        const sharedCar = await SharedCar.findById(id);
        if (!sharedCar) {
            return res.status(404).json({ status: 404, message: 'Shared car not found' });
        }

        if (((sharedCar.owner).toString() == partnerId) == false) {
            return res.status(403).json({ status: 403, message: 'Forbidden: You are not allowed to update this shared car' });
        }

        const updatedSharedCar = await SharedCar.findByIdAndUpdate(id, { car: car, location: location, }, { new: true });

        checkCar.isGovernmentTendor = true;
        await checkCar.save();

        res.status(200).json({ status: 200, message: 'Shared car updated successfully', data: updatedSharedCar });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.updateCarFlags = async (req, res) => {
    try {
        const { carId } = req.params;
        const { isRental, isSubscription, isGovernmentTendor, isSharing } = req.body;

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ status: 404, message: 'Car not found' });
        }

        car.isRental = isRental !== undefined ? isRental : car.isRental;
        car.isSubscription = isSubscription !== undefined ? isSubscription : car.isSubscription;
        car.isGovernmentTendor = isGovernmentTendor !== undefined ? isGovernmentTendor : car.isGovernmentTendor;
        car.isSharing = isSharing !== undefined ? isSharing : car.isSharing;

        await car.save();

        return res.status(200).json({ status: 200, message: 'Car flags updated successfully', data: car });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getAllRatingsByCarId = async (req, res) => {
    try {
        const userId = req.user._id;
        const { carId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const car = await Car.findOne({ _id: carId, owner: userId });
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        const ratings = await Review.find({ car: carId }).populate('user', 'fullName mobileNumber email image')
            .populate('car');

        return res.status(200).json({ status: 200, data: ratings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getRatingsByCarIdAndRating = async (req, res) => {
    try {
        const userId = req.user._id;
        const { carId, rating } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const car = await Car.findOne({ _id: carId, owner: userId });
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        const ratings = await Review.find({ car: carId, rating: rating })
            .populate('user', 'fullName mobileNumber email image')
            .populate('car');

        return res.status(200).json({ status: 200, data: ratings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
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

        let query = {};

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

        const cars = await Car.find({ owner: user._id });

        const carIds = cars.map(car => car._id);

        query.car = { $in: carIds };

        const bookings = await Booking.find(query)
            .populate('car user pickupLocation dropOffLocation');

        return res.status(200).json({ status: 200, message: 'Bookings retrieved successfully', data: bookings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getTopBookedCarsForPartner = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const partnerCars = await Car.find({ owner: userId });

        if (partnerCars.length === 0) {
            return res.status(404).json({ status: 404, message: 'No cars found for the partner' });
        }

        const partnerCarIds = partnerCars.map(car => car._id);

        const bookings = await Booking.aggregate([
            { $match: { car: { $in: partnerCarIds } } },
            { $group: { _id: '$car', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        if (bookings.length === 0) {
            return res.status(404).json({ status: 404, message: 'No bookings found for the partner' });
        }

        const topBookedCarIds = bookings.map(booking => booking._id);

        const topBookedCars = await Car.find({ _id: { $in: topBookedCarIds } }).populate('owner');

        return res.status(200).json({ status: 200, data: topBookedCars });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

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

        const transactions = await Transaction.find({ user: userId, type: { $in: ['Wallet', 'Qc', 'Booking'] } });

        let totalWalletCredit = 0;
        let totalWalletDebit = 0;
        let totalQcCredit = 0;
        let totalQcDebit = 0;
        let totalBookingCredit = 0;
        let totalBookingDebit = 0;

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
            } else if (transaction.type === 'Booking') {
                if (transaction.cr) {
                    totalBookingCredit += transaction.amount;
                }
                if (transaction.dr) {
                    totalBookingDebit += transaction.amount;
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
                totalBookingDebit: totalBookingDebit,
                totalBookingCredit: totalBookingCredit,
                totalQcCoinBalance: user.coin,
                totalWalletBalance: user.wallet,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
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

exports.getDirectReferralUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate({
            path: 'referralLevels.users.user',
            match: { 'referralLevels.level': 1 }
        });

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const level1Referrals = user.referralLevels.find(level => level.level === 1);

        if (!level1Referrals || level1Referrals.users.length === 0) {
            return res.status(200).json({
                status: 200,
                message: 'No direct referral users found',
                data: [],
            });
        }

        const referralIds = level1Referrals.users.map(userObj => userObj.user);
        const directReferralUsers = await User.find({ _id: { $in: referralIds } }).populate('referredBy').populate('referralLevels.users.user');

        return res.status(200).json({
            status: 200,
            message: 'Direct referral users found',
            data: directReferralUsers,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getReferralDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate('referralLevels.users.user');

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        if (!user.referralLevels || user.referralLevels.length === 0) {
            return res.status(200).json({
                status: 200,
                message: 'No referral users found',
                data: [],
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Referral users details populated',
            data: user,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getReferralIncome = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate('referralLevels.users.user');;
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        if (!user.referralLevels || user.referralLevels.length === 0) {
            return res.status(200).json({
                status: 200,
                message: 'No referral users found',
                data: [],
            });
        }

        let overAllIncome = 0;
        const levelWiseIncome = [];

        for (const level of user.referralLevels) {
            const levelUsers = await User.find({ _id: { $in: level.users.map(u => u.user) } });
            const levelUserIds = levelUsers.map(u => u._id);
            const levelTransactions = await Transaction.find({
                user: userId,
                cr: true,
                type: { $in: ['Referral', 'Qc'] }
            }).populate('user');
            let levelIncome = 0;
            let qcPointIncome = 0;
            levelTransactions.forEach(transaction => {
                if (transaction.type === 'Referral' && transaction.details.includes(`level ${level.level} for booking`)) {
                    levelIncome += transaction.amount;
                } else if (transaction.type === 'Qc' && transaction.details.includes(`Direct Referral bonus credited to user wallet at level ${level.level}`)) {
                    qcPointIncome += transaction.amount;
                }
            });
            console.log(levelIncome, qcPointIncome)
            levelWiseIncome.push({
                level: { ...level._doc, users: levelUsers },
                levelIncome: levelIncome + qcPointIncome
            });
            overAllIncome += parseFloat((levelIncome + qcPointIncome).toFixed(2))
        }
        return res.status(200).json({
            status: 200,
            message: 'Level-wise income calculated',
            data: levelWiseIncome, overAllIncome
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getRoyaltyReferralIncome1 = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate('referralLevels.users.user');;
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        if (!user.referralLevels || user.referralLevels.length === 0) {
            return res.status(200).json({
                status: 200,
                message: 'No referral users found',
                data: [],
            });
        }

        const levelWiseIncome = [];

        for (const level of user.referralLevels) {
            const levelUsers = await User.find({ _id: { $in: level.users.map(u => u.user) }, documentVerification: "APPROVED" });

            const levelUserIds = levelUsers.map(u => u._id);

            const levelTransactions = await Transaction.find({
                user: userId,
                cr: true,
                type: { $in: ['Referral', 'Qc'] }
            }).populate('user');
            console.log("levelTransactions", levelTransactions);
            console.log("level", level);
            const totalIncome1 = levelTransactions.reduce((acc, curr) => acc + curr.amount, 0);
            let totalIncome = parseFloat(totalIncome1.toFixed(2))
            levelWiseIncome.push({
                level: { ...level._doc, users: levelUsers },
                totalIncome
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Level-wise income calculated',
            data: levelWiseIncome,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getRoyaltyReferralIncome = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate('referralLevels.users.user');

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        if (!user.referralLevels || user.referralLevels.length === 0) {
            return res.status(200).json({
                status: 200,
                message: 'No referral users found',
                data: [],
            });
        }

        const requiredActiveMembers = [3, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
        const royaltyRewardReport = [];

        for (const level of user.referralLevels) {
            const levelUsers = await User.find({
                _id: { $in: level.users.map(u => u.user) }
            });

            const activeMembers = levelUsers.filter(u => u.documentVerification === 'APPROVED').length;

            const levelTransactions = await Transaction.find({
                user: userId,
                cr: true,
                type: { $in: ['Referral', 'Qc'] }
            });

            let qcPointIncome = 0;
            let levelIncome = 0;

            levelTransactions.forEach(transaction => {
                // if (transaction.type === 'Qc') {
                //     qcPointIncome += transaction.amount;
                // }
                if (transaction.type === 'Referral' && transaction.details.includes(`level ${level.level} for booking`)) {
                    levelIncome += transaction.amount;
                } else if (transaction.type === 'Qc' && transaction.details.includes(`Direct Referral bonus credited to user wallet at level ${level.level}`)) {
                    qcPointIncome += transaction.amount;
                }
            });

            const totalBusiness = qcPointIncome + levelIncome;
            const eligibilityStatus = activeMembers >= requiredActiveMembers[level.level - 1] ? 'Eligible' : 'Not Eligible';

            royaltyRewardReport.push({
                level: level.level,
                activeMembers,
                requiredActiveMembers: requiredActiveMembers[level.level - 1],
                eligibilityStatus,
                totalBusiness: totalBusiness.toFixed(2),
                qcPointIncome: qcPointIncome.toFixed(2),
                levelIncome: levelIncome.toFixed(2)
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Royalty reward eligibility report generated',
            data: royaltyRewardReport,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getMyTeamBussinessIncome = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate('referralLevels.users.user');

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        if (!user.referralLevels || user.referralLevels.length === 0) {
            return res.status(200).json({
                status: 200,
                message: 'No referral users found',
                data: [],
            });
        }

        const teamBusinessReport = [];

        for (const level of user.referralLevels) {
            const levelUsers = await User.find({
                _id: { $in: level.users.map(u => u.user) },
                // documentVerification: 'APPROVED',
            });

            const totalMembers = levelUsers.length;
            const activeMembers = levelUsers.filter(u => u.documentVerification === 'APPROVED').length;
            const inActiveMembers = levelUsers.filter(u => ['HOLD', 'CANCELLED', 'PENDING'].includes(u.documentVerification)).length;


            const levelTransactions = await Transaction.find({
                user: userId,
                cr: true,
                type: { $in: ['Referral', 'Qc'] }
            });

            // const qcPointIncome = levelTransactions.reduce((acc, curr) => acc + curr.amount, 0);
            // const levelIncomeTransactions = levelTransactions.filter(transaction => 
            //     transaction.type === 'Referral' && transaction.details.includes(`level ${level.level} for booking`)
            // );
            // const levelIncome = levelIncomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);

            let qcPointIncome = 0;
            let levelIncome = 0;

            levelTransactions.forEach(transaction => {
                // if (transaction.type === 'Qc') {
                //     qcPointIncome += transaction.amount;
                // }
                if (transaction.type === 'Referral' && transaction.details.includes(`level ${level.level} for booking`)) {
                    levelIncome += transaction.amount;
                } else if (transaction.type === 'Qc' && transaction.details.includes(`Direct Referral bonus credited to user wallet at level ${level.level}`)) {
                    qcPointIncome += transaction.amount;
                }
            });

            teamBusinessReport.push({
                level: level.level,
                totalMembers,
                inActiveMembers,
                activeMembers,
                qcPointIncome: parseFloat(qcPointIncome.toFixed(2)),
                levelIncome: parseFloat(levelIncome.toFixed(2))
            });
        }

        const totals = {
            totalMembers: teamBusinessReport.reduce((sum, item) => sum + item.totalMembers, 0),
            inActiveMembers: teamBusinessReport.reduce((sum, item) => sum + item.inActiveMembers, 0),
            activeMembers: teamBusinessReport.reduce((sum, item) => sum + item.activeMembers, 0),
            qcPointIncome: teamBusinessReport.reduce((sum, item) => sum + item.qcPointIncome, 0),
            levelIncome: teamBusinessReport.reduce((sum, item) => sum + item.levelIncome, 0)
        };

        res.status(200).json({
            status: 200,
            message: 'Team business report generated',
            data: teamBusinessReport,
            totals: {
                ...totals,
                levelIncome: `${totals.levelIncome.toFixed(2)}`
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

exports.createUserReview = async (req, res) => {
    try {
        const { bookingId, carId, userRating, userComment } = req.body;

        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const bookings = await Booking.findOne({ _id: bookingId })/*.populate('car user pickupLocation dropOffLocation')*/;
        if (!bookings) {
            return res.status(404).json({ status: 404, message: 'Bookings not found', data: null });
        }

        if (userRating < 0 || userRating > 5) {
            return res.status(400).json({ status: 400, message: 'Invalid userRating. UserRating should be between 0 and 5.', data: {} });
        }

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        const existingReview = await UserReview.findOne({ host: userId, car: carId });
        if (existingReview) {
            return res.status(400).json({ status: 400, message: 'You have already reviewed this host' });
        }

        const review = new UserReview({
            user: bookings.user,
            car: carId,
            host: userId,
            booking: bookingId,
            userRating,
            userComment,
        });

        await review.save();

        const reviewsForCar = await UserReview.find({ host: userId });
        const numOfUserReviews = reviewsForCar.length;

        let totalRating = 0;
        reviewsForCar.forEach(review => {
            totalRating += review.userRating;
        });

        const averageRating = totalRating / numOfUserReviews;

        review.numOfUserReviews = numOfUserReviews;
        review.averageuserRating = Math.round(averageRating);

        await review.save();

        return res.status(201).json({ status: 201, message: 'Host review created successfully', data: review });
    } catch (error) {
        console.error('Error creating host review:', error);
        return res.status(500).json({ status: 500, message: 'Server error', error: error.message });
    }
};

exports.getUserReviewById = async (req, res) => {
    try {
        const { hostId } = req.params;

        const user = await User.findById(hostId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        // const car = await Car.findOne({ owner: hostId });
        // if (!car) {
        //     return res.status(404).json({ status: 404, message: 'Car not found' });
        // }

        const reviews = await UserReview.find({ user: hostId });

        let totalRating = 0;
        reviews.forEach(review => {
            totalRating += review.userRating;
        });
        const averageUserRating = reviews.length > 0 ? totalRating / reviews.length : 0;

        res.status(200).json({ status: 200, data: { reviews, numOfUserReviews: reviews.length, averageUserRating } });
    } catch (error) {
        console.error('Error fetching host review by ID:', error);
        return res.status(500).json({ status: 500, message: 'Server error', error: error.message });
    }
};

exports.createTenderApplication = async (req, res) => {
    try {
        const userId = req.user._id;
        const { apply } = req.body;
        console.log(userId);
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const cars = await Car.findOne({ owner: userId });

        const tenderApplication = new TenderApplication({
            car: cars._id || null,
            user: userId,
            apply
        });

        await tenderApplication.save();

        return res.status(201).json({
            status: 201,
            message: 'Tender application created successfully',
            data: tenderApplication
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Failed to create tender application',
            error: error.message
        });
    }
};

exports.getAllTenderApplications = async (req, res) => {
    try {
        const tenderApplications = await TenderApplication.find();

        return res.status(200).json({
            status: 200,
            message: 'Tender applications retrieved successfully',
            data: tenderApplications
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Failed to retrieve tender applications',
            error: error.message
        });
    }
};

exports.getTenderApplicationById = async (req, res) => {
    try {
        const tenderApplication = await TenderApplication.findById(req.params.id);

        if (!tenderApplication) {
            return res.status(404).json({
                status: 404,
                message: 'Tender application not found'
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Tender application retrieved successfully',
            data: tenderApplication
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Failed to retrieve tender application',
            error: error.message
        });
    }
};

exports.updateTenderApplication = async (req, res) => {
    try {
        const { carId, userId, apply } = req.body;

        const tenderApplication = await TenderApplication.findByIdAndUpdate(
            req.params.id,
            { car: carId, user: userId, apply },
            { new: true }
        );

        if (!tenderApplication) {
            return res.status(404).json({
                status: 404,
                message: 'Tender application not found'
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Tender application updated successfully',
            data: tenderApplication
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Failed to update tender application',
            error: error.message
        });
    }
};

exports.deleteTenderApplication = async (req, res) => {
    try {
        const tenderApplication = await TenderApplication.findByIdAndDelete(req.params.id);

        if (!tenderApplication) {
            return res.status(404).json({
                status: 404,
                message: 'Tender application not found'
            });
        }

        return res.status(200).json({ status: 200, message: "Delete sucessfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Failed to delete tender application',
            error: error.message
        });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { status: 'read' },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ status: 404, message: 'Notification not found' });
        }

        return res.status(200).json({ status: 200, message: 'Notification marked as read', data: notification });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error marking notification as read', error: error.message });
    }
};

exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const notifications = await Notification.updateMany(
            { recipient: userId, },
            { status: 'read' }
        );

        if (!notifications) {
            return res.status(404).json({ status: 404, message: 'No notifications found for the user' });
        }

        return res.status(200).json({ status: 200, message: 'All notifications marked as read for the user', data: notifications });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error marking notifications as read', error: error.message });
    }
};

exports.getNotificationsById = async (req, res) => {
    try {
        const userId = req.user._id;
        const notificationId = req.params.notificationId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const notifications = await Notification.find({ recipient: userId, _id: notificationId });

        return res.status(200).json({ status: 200, message: 'Notifications retrieved successfully', data: notifications });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error retrieving notifications', error: error.message });
    }
};

exports.getAllNotificationsForUser = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log(userId);
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }
        const notifications = await Notification.find({ recipient: userId });

        return res.status(200).json({ status: 200, message: 'Notifications retrieved successfully', data: notifications });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error retrieving notifications', error: error.message });
    }
};

exports.createGPSData = async (req, res) => {
    try {
        const { carId, longitude, latitude } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        if (!mongoose.Types.ObjectId.isValid(carId)) {
            return res.status(400).json({ status: 400, message: 'Invalid carId' });
        }

        const car = await Car.findOne({ _id: carId, owner: userId });
        if (!car) {
            return res.status(404).json({ status: 404, message: 'Car not found' });
        }

        const gpsData = new GPSData({
            carId,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            }
        });

        await gpsData.save();

        return res.status(201).json({ status: 201, message: 'GPS data created successfully', data: gpsData });
    } catch (error) {
        console.error('Error creating GPS data:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.getAllCarGPSLocations1 = async (req, res) => {
    try {
        const allGPSLocations = await GPSData.find().populate('carId');

        return res.status(200).json({ status: 200, data: allGPSLocations });
    } catch (error) {
        console.error('Error fetching GPS data:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.getAllCarGPSLocations = async (req, res) => {
    try {
        const gpsDataByCar = await GPSData.aggregate([
            {
                $group: {
                    _id: '$carId',
                    locations: { $push: '$location' }
                }
            }
        ]);

        const formattedGPSData = await Promise.all(gpsDataByCar.map(async (carData) => {
            const car = await Car.findById(carData._id);
            return {
                carId: carData._id,
                carDetails: car,
                locations: carData.locations
            };
        }));

        return res.status(200).json({ status: 200, data: formattedGPSData });
    } catch (error) {
        console.error('Error retrieving GPS data:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.getGPSDataForCar = async (req, res) => {
    try {
        const { carId } = req.params;

        const gpsData = await GPSData.find({ carId });

        return res.status(200).json({ status: 200, data: gpsData });
    } catch (error) {
        console.error('Error retrieving GPS data:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.deleteGPSDataForCar = async (req, res) => {
    try {
        const { carId } = req.params;

        await GPSData.deleteMany({ carId });

        return res.status(200).json({ status: 200, message: 'GPS data deleted successfully' });
    } catch (error) {
        console.error('Error deleting GPS data:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.switchRole = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const roleId = req.params.roleId;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        let roleIndex = -1;
        for (let i = 0; i < user.role.length; i++) {
            if (user.role[i] === roleId) {
                roleIndex = i;
                break;
            }
        }

        if (roleIndex === -1) {
            return res.status(404).json({ status: 404, message: 'Role not found for this user' });
        }

        user.currentRole = roleId;
        await user.save();

        return res.status(200).json({ status: 200, message: 'User role switched successfully', data: user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getCurrentRole = async (req, res) => {
    try {
        const partnerId = req.user._id;
        console.log(partnerId);
        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const currentRoleId = user.currentRole;

        return res.status(200).json({ status: 200, message: 'Current role retrieved successfully', currentRoleId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getAllAccessoryCategories = async (req, res) => {
    try {
        const categories = await AccessoryCategory.find();

        return res.status(200).json({
            status: 200,
            message: 'Accessory categories retrieved successfully',
            data: categories,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getAccessoryCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const category = await AccessoryCategory.findById(categoryId);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Accessory category not found', data: null });
        }

        return res.status(200).json({ status: 200, message: 'Accessory category retrieved successfully', data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getAllAccessories = async (req, res) => {
    try {

        const accessories = await Accessory.find().populate('category');

        return res.status(200).json({
            status: 200,
            message: 'Accessories retrieved successfully',
            data: accessories,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getAccessoryById = async (req, res) => {
    try {
        const accessoryId = req.params.accessoryId;

        const accessory = await Accessory.findById(accessoryId).populate('category');

        if (!accessory) {
            return res.status(404).json({ status: 404, message: 'Accessory not found', data: null });
        }

        return res.status(200).json({ status: 200, message: 'Accessory retrieved successfully', data: accessory });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getAllAccessoriesByCategoryId = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        const category = await AccessoryCategory.findById(categoryId);
        if (!category) {
            return res.status(400).json({ status: 400, message: 'Invalid accessory category ID', data: null });
        }

        const accessories = await Accessory.find({ category: categoryId });

        return res.status(200).json({
            status: 200,
            message: 'Accessories retrieved successfully by category ID',
            data: accessories,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const { items, shippingAddress, paymentMethod } = req.body;

        const address = await Address.findById({ _id: shippingAddress, user: userId });
        if (!address) {
            return res.status(404).json({
                status: 404,
                message: 'Address not found for this User',
                data: null,
            });
        }

        let totalPrice = 0;
        for (const item of items) {
            const accessory = await Accessory.findById(item.accessory);
            if (!accessory) {
                return res.status(404).json({
                    status: 404,
                    message: `Accessory not found for ID: ${item.accessory}`,
                    data: null,
                });
            }
            item.price = accessory.price || 0;
            totalPrice += item.price * item.quantity;
        }

        const newOrder = await Order.create({
            user: userId,
            items,
            totalPrice,
            shippingAddress,
            paymentMethod,
        });

        // const welcomeMessage = `Welcome, ${user.mobileNumber}! Thank you for Order your order amount is ${newOrder.totalPrice} and your payment method ${newOrder.paymentMethod}`;
        // const welcomeNotification = new Notification({
        //     recipient: newOrder.user._id,
        //     content: welcomeMessage,
        //     type: 'welcome',
        // });
        // await welcomeNotification.save();

        return res.status(201).json({
            status: 201,
            message: 'Order created successfully',
            data: newOrder,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Server error',
            data: null,
        });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const orders = await Order.find({ user: userId }).populate('user').populate('items.accessory').populate('shippingAddress');

        return res.status(200).json({
            status: 200,
            message: 'Orders retrieved successfully',
            data: orders,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Server error',
            data: null,
        });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId).populate('user').populate('items.accessory').populate('shippingAddress');

        if (!order) {
            return res.status(404).json({
                status: 404,
                message: 'Order not found',
                data: null,
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Order retrieved successfully',
            data: order,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Server error',
            data: null,
        });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentStatus } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { paymentStatus },
            { new: true }
        ).populate('user').populate('items.accessory').populate('shippingAddress');

        if (!updatedOrder) {
            return res.status(404).json({
                status: 404,
                message: 'Order not found',
                data: null,
            });
        }

        for (const item of updatedOrder.items) {
            if (item.accessory) {
                await Accessory.findByIdAndUpdate(item.accessory._id, { $inc: { stock: -1 } });
            }
        }

        const welcomeMessage = `your order is successfully.`;
        const welcomeNotification = new Notification({
            recipient: updatedOrder.user._id,
            content: welcomeMessage,
            type: 'welcome',
        });
        await welcomeNotification.save();

        return res.status(200).json({
            status: 200,
            message: 'Order updated successfully',
            data: updatedOrder,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Server error',
            data: null,
        });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const deletedOrder = await Order.findByIdAndDelete(orderId).populate('user').populate('items.accessory').populate('shippingAddress');

        if (!deletedOrder) {
            return res.status(404).json({
                status: 404,
                message: 'Order not found',
                data: null,
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Order deleted successfully',
            data: deletedOrder,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Server error',
            data: null,
        });
    }
};

exports.addMoney = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        if (user.isWalletRecharge === false) {
            return res.status(404).json({ status: 404, message: 'You have no access to recharge', data: null });
        }

        const updatedUser = await User.findByIdAndUpdate(
            { _id: req.user._id },
            { $inc: { wallet: parseInt(req.body.balance) } },
            { new: true }
        );
        if (updatedUser) {
            const transactionData = {
                user: req.user._id,
                date: Date.now(),
                amount: req.body.balance,
                type: "Wallet",
                cr: true,
                details: "Money has been added from your wallet."

            };
            const createdTransaction = await Transaction.create(transactionData);
            const welcomeMessage = `Welcome, ${updatedUser.fullName}! Thank you for adding money to your wallet.`;
            const welcomeNotification = new Notification({
                userId: updatedUser._id,
                title: "Notification",
                body: welcomeMessage,
            });
            await welcomeNotification.save();
            return res.status(200).json({
                status: 200,
                message: "Money has been added.",
                data: updatedUser,
            });
        } else {
            return res.status(404).json({
                status: 404,
                message: "No data found",
                data: {},
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: 500,
            message: "Server error.",
            data: {},
        });
    }
};

exports.removeMoney = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        if (user.isWalletWithdraw === false) {
            return res.status(404).json({ status: 404, message: 'You have no access to withdraw', data: null });
        }

        const updatedUser = await User.findByIdAndUpdate({ _id: req.user._id }, { $inc: { wallet: -parseInt(req.body.balance) } }, { new: true });
        if (updatedUser) {
            const transactionData = {
                user: req.user._id,
                date: Date.now(),
                amount: req.body.balance,
                type: "Wallet",
                dr: true,
                details: "Money has been deducted from your wallet."
            };
            const createdTransaction = await Transaction.create(transactionData);
            const welcomeMessage = `Welcome, ${updatedUser.fullName}! Money has been deducted from your wallet.`;
            const welcomeNotification = new Notification({
                userId: updatedUser._id,
                title: "Notification",
                body: welcomeMessage,
            });
            await welcomeNotification.save();
            return res.status(200).json({
                status: 200,
                message: "Money has been deducted.",
                data: updatedUser,
            });
        } else {
            return res.status(404).json({
                status: 404,
                message: "No data found",
                data: {},
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: 500,
            message: "Server error.",
            data: {},
        });
    }
};

exports.addWithdrawMoney = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }
        const { refundPreference, upiId, accountNo, branchName, ifscCode, amount } = req.body;


        const newRefund = new Refund({
            user: userId,
            refundAmount: amount,
            totalRefundAmount: amount || 0,
            type: refundPreference,
            refundStatus: 'PENDING',
            refundDetails: refundPreference,
            upiId: upiId || null,
            accountNo: accountNo || null,
            branchName: branchName || null,
            ifscCode: ifscCode || null,
            refundTransactionId: '',
            refundType: "WITHDRAW",

        });

        const savedRefund = await newRefund.save();

        const welcomeMessage = `Withdraw initiated.`;
        const welcomeNotification = new Notification({
            recipient: userId,
            content: welcomeMessage,
            title: 'Withdraw Amount',
        });
        await welcomeNotification.save();

        return res.status(200).json({ status: 200, message: 'Withdraw Amount added successfully', data: savedRefund });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.updateWithdrawMoneyId = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const { refundId } = req.params;
        console.log(refundId);
        const { refundPreference, upiId, accountNo, branchName, ifscCode } = req.body;

        let refund;
        if (refundId) {
            refund = await Refund.findOne({ _id: refundId });
            console.log("refund", refund);
            console.log("refundId", refundId);
            if (!refund) {
                return res.status(404).json({ status: 404, message: 'Refund not found', data: null });
            }
        } else {
            return res.status(400).json({ status: 400, message: 'Invalid parameters', data: null });
        }

        console.log(refund);
        if (refund) {
            refund.type = refundPreference;
            refund.refundStatus = 'PROCESSING';
            refund.refundDetails = refundPreference;
            refund.upiId = upiId || null;
            refund.accountNo = accountNo || null;
            refund.branchName = branchName || null;
            refund.ifscCode = ifscCode || null;
            refund.refundTransactionId = '';
            refund.refundType = "WITHDRAW",
                await refund.save();
        }
        return res.status(200).json({ status: 200, message: 'Withdraw Amount updated successfully', data: refund });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getRefundStatusAndAmount = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const refund = await Refund.find({ user: userId, refundType: "WITHDRAW", }).sort({ createdAt: -1 });
        if (!refund) {
            return res.status(404).json({ status: 404, message: 'Refund not found', data: null });
        }

        return res.status(200).json({ status: 200, message: 'Refund status and amount retrieved successfully', data: refund });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error while retrieving refund status and amount', data: null, });
    }
};

exports.getRefundStatusAndAmountById = async (req, res) => {
    try {
        const { refundId } = req.params;
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const refund = await Refund.findById({ _id: refundId })
        if (!refund) {
            return res.status(404).json({ status: 404, message: 'Refund not found', data: null });
        }

        return res.status(200).json({ status: 200, message: 'Refund status and amount retrieved successfully', data: refund });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error while retrieving refund status and amount', data: null, });
    }
};

exports.transferMoneySendOtp = async (req, res) => {
    try {
        const { recipientId, fullName, amount } = req.body;
        const senderId = req.user._id;

        const sender = await User.findById(senderId);
        const recipient = await User.findById(recipientId);

        if (!sender || !recipient) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        if (sender.isWalletTransfer === false) {
            return res.status(404).json({ status: 404, message: 'You have no access to Transfer money', data: null });
        }

        const transferAmount = parseInt(amount);

        if (sender.wallet < transferAmount) {
            return res.status(400).json({ status: 400, message: 'Insufficient balance', data: null });
        }

        const otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false });
        const otpExpiration = new Date(Date.now() + 60 * 1000);

        sender.otp = otp

        await sender.save();

        return res.status(200).json({
            status: 200,
            message: 'Money transferred otp',
            data: sender.otp
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: 500,
            message: 'Server error.',
            data: {}
        });
    }
};

exports.transferMoneyReSendOtp = async (req, res) => {
    try {
        const senderId = req.user._id;

        const sender = await User.findById(senderId);

        if (!sender) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const otp = newOTP.generate(4, { alphabets: false, upperCase: false, specialChar: false });
        const otpExpiration = new Date(Date.now() + 60 * 1000);

        sender.otp = otp

        await sender.save();

        return res.status(200).json({
            status: 200,
            message: 'Money transferred resend otp',
            data: sender.otp
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: 500,
            message: 'Server error.',
            data: {}
        });
    }
};

exports.transferMoney = async (req, res) => {
    try {
        const { recipientId, fullName, amount, otp } = req.body;
        const senderId = req.user._id;


        const sender = await User.findById(senderId);
        const recipient = await User.findById(recipientId);

        if (!sender || !recipient) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        if (sender.isWalletTransfer === false) {
            return res.status(404).json({ status: 404, message: 'You have no access to Transfer money', data: null });
        }

        if (sender.otp !== otp) {
            console.log("Invalid or expired OTP");
            return res.status(400).json({ status: 400, message: "Invalid or expired OTP" });
        }

        const transferAmount = parseInt(amount);

        if (sender.wallet < transferAmount) {
            return res.status(400).json({ status: 400, message: 'Insufficient balance', data: null });
        }

        sender.wallet -= transferAmount;
        recipient.wallet += transferAmount;

        await sender.save();
        await recipient.save();

        const senderTransactionData = {
            user: senderId,
            date: Date.now(),
            amount: transferAmount,
            type: "Transfer",
            cr: false,
            dr: true,
            details: `Transferred to ${recipient.fullName}`
        };
        const recipientTransactionData = {
            user: recipientId,
            date: Date.now(),
            amount: transferAmount,
            type: "Transfer",
            dr: false,
            cr: true,
            details: `Received from ${sender.fullName}`
        };

        await Transaction.create(senderTransactionData);
        await Transaction.create(recipientTransactionData);

        const senderNotification = new Notification({
            userId: senderId,
            title: "Transfer Successful",
            body: `You have successfully transferred ${amount} to ${recipient.fullName}.`
        });
        const recipientNotification = new Notification({
            userId: recipientId,
            title: "Money Received",
            body: `You have received ${amount} from ${sender.fullName}.`
        });

        await senderNotification.save();
        await recipientNotification.save();

        return res.status(200).json({
            status: 200,
            message: 'Money transferred successfully',
            data: { sender, recipient }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: 500,
            message: 'Server error.',
            data: {}
        });
    }
};

exports.getWallet = async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.user._id, });
        if (data) {
            return res.status(200).json({ status: 200, message: "get wallet", data: data.wallet });
        } else {
            return res.status(404).json({ status: 404, message: "No data found", data: {} });
        }
    } catch (error) {
        console.log(error);
        return res.status(501).send({ status: 501, message: "server error.", data: {}, });
    }
};

exports.allTransactionUser = async (req, res) => {
    try {
        const data = await Transaction.find({ user: req.user._id }).populate("user");
        return res.status(200).json({ status: 200, data: data });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

exports.allTransactionByType = async (req, res) => {
    try {
        const data = await Transaction.find({ user: req.user._id, type: req.params.type }).populate("user");
        return res.status(200).json({ status: 200, data: data });
    } catch (err) {
        return res.status(400).json({ status: 500, message: err.message });
    }
};

exports.allcreditTransactionUser = async (req, res) => {
    try {
        const data = await Transaction.find({ user: req.user._id, type: "Wallet", cr: true });
        return res.status(200).json({ status: 200, data: data });
    } catch (err) {
        return res.status.status(400).json({ message: err.message });
    }
};

exports.allDebitTransactionUser = async (req, res) => {
    try {
        const data = await Transaction.find({ user: req.user._id, type: "Wallet", dr: true });
        return res.status(200).json({ status: 200, data: data });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

exports.createUserDetails = async (req, res) => {
    try {
        const { upiId, accountNumber, confirmAccountNumber, ifscCode, branchName } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        if (accountNumber !== confirmAccountNumber) {
            return res.status(400).json({ status: 400, message: 'Both Account Number and Confirm Account Number should be same', data: null });
        }
        const userDetails = new UserDetails({
            userId,
            upiId,
            accountNumber,
            ifscCode,
            branchName
        });

        await userDetails.save();

        return res.status(201).json({ status: 201, message: 'User details created successfully', data: userDetails });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error while creating user details', data: null });
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const userDetails = await UserDetails.find({ userId });

        if (!userDetails) {
            return res.status(404).json({ status: 404, message: 'User details not found', data: null });
        }

        return res.status(200).json({ status: 200, message: 'User details retrieved successfully', data: userDetails });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error while retrieving user details', data: null });
    }
};

exports.getUserDetailsById = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const userDetails = await UserDetails.findOne({ _id: req.params.id });

        if (!userDetails) {
            return res.status(404).json({ status: 404, message: 'User details not found', data: null });
        }

        return res.status(200).json({ status: 200, message: 'User details retrieved successfully', data: userDetails });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error while retrieving user details', data: null });
    }
};

exports.updateUserDetails = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }
        const updateFields = req.body;

        if (updateFields.accountNumber !== updateFields.confirmAccountNumber) {
            return res.status(400).json({ status: 400, message: 'Account number and confirm account number do not match', data: null });
        }

        const userDetails = await UserDetails.findOneAndUpdate({ _id: req.params.id }, updateFields, { new: true });

        if (!userDetails) {
            return res.status(404).json({ status: 404, message: 'User details not found', data: null });
        }

        return res.status(200).json({ status: 200, message: 'User details updated successfully', data: userDetails });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error while updating user details', data: null });
    }
};

exports.deleteUserDetails = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const userDetails = await UserDetails.findOneAndDelete({ userId });

        if (!userDetails) {
            return res.status(404).json({ status: 404, message: 'User details not found', data: null });
        }

        return res.status(200).json({ status: 200, message: 'User details deleted successfully', data: null });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error while deleting user details', data: null });
    }
};

exports.addSecurityDepositPreferenceInBooking = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const bookingId = req.params.bookingId;
        const { refundPreference, upiId, accountNo, branchName, ifscCode } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        if (booking.status !== 'COMPLETED') {
            return res.status(403).json({ status: 403, message: 'Booking is not eligible for a refund', data: null });
        }

        if (booking.paymentStatus !== 'PAID') {
            return res.status(403).json({ status: 403, message: 'Booking payment is not completed', data: null });
        }

        let refundAmount = booking.isWalletUsed ? booking.walletAmount : booking.totalPrice;

        const checkRefundBooking = await Refund.findOne({ booking: booking._id });
        if (checkRefundBooking) {
            checkRefundBooking.refundStatus = 'PROCESSING'
            checkRefundBooking.save();
            return res.status(422).json({ status: 422, message: 'Refund has already been initiated for this booking', data: checkRefundBooking });
        }

        const newRefund = new Refund({
            booking: booking._id,
            refundAmount: refundAmount,
            totalRefundAmount: refundAmount || 0,
            totalBookingAmount: booking.totalPrice,
            type: refundPreference,
            refundStatus: 'PENDING',
            refundDetails: refundPreference,
            upiId: upiId || null,
            accountNo: accountNo || null,
            branchName: branchName || null,
            ifscCode: ifscCode || null,
            refundTransactionId: '',
            refundType: "SECURITY-DEPOSITE",

        });

        const savedRefund = await newRefund.save();

        booking.status = 'COMPLETED';
        booking.refundPreference = refundPreference;
        booking.upiId = upiId;
        booking.accountNo = accountNo;
        booking.branchName = branchName;
        booking.ifscCode = ifscCode;
        booking.refund = savedRefund._id;
        await booking.save();

        const welcomeMessage = `Refund initiated.`;
        const welcomeNotification = new Notification({
            recipient: booking.user._id,
            content: welcomeMessage,
            title: 'Security deposit refund payment',
        });
        await welcomeNotification.save();

        return res.status(200).json({ status: 200, message: 'Booking preference added successfully', data: booking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.updateSecurityDepositPreferenceByRefundId = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const { bookingId, refundId } = req.params;
        console.log(bookingId, refundId);
        const { refundPreference, upiId, accountNo, branchName, ifscCode } = req.body;

        let booking;
        let refund;

        if (bookingId) {
            booking = await Booking.findById(bookingId);
        }
        if (refundId) {
            refund = await Refund.findOne({ _id: refundId });
            console.log("refund", refund);
            console.log("refundId", refundId);

            if (!refund) {
                return res.status(404).json({ status: 404, message: 'Refund not found', data: null });
            }
            booking = await Booking.findById(refund.booking);
        } else {
            return res.status(400).json({ status: 400, message: 'Invalid parameters', data: null });
        }

        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        if (booking.status !== 'COMPLETED') {
            return res.status(403).json({ status: 403, message: 'Booking is not eligible for a refund', data: null });
        }

        if (booking.paymentStatus !== 'PAID') {
            return res.status(403).json({ status: 403, message: 'Booking payment is not completed', data: null });
        }

        booking.refundPreference = refundPreference;
        booking.upiId = upiId;
        booking.accountNo = accountNo;
        booking.branchName = branchName;
        booking.ifscCode = ifscCode;
        await booking.save();

        console.log(refund);
        if (refund) {
            refund.type = refundPreference;
            refund.refundStatus = 'PROCESSING';
            refund.refundDetails = refundPreference;
            refund.upiId = upiId || null;
            refund.accountNo = accountNo || null;
            refund.branchName = branchName || null;
            refund.ifscCode = ifscCode || null;
            refund.refundTransactionId = '';
            refund.refundType = "SECURITY-DEPOSITE",
                await refund.save();
        }

        return res.status(200).json({ status: 200, message: 'Booking preference updated successfully', data: booking });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.updateBankDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bankName, accountNumber, reAccountNumber, accountHolderName, ifscCode } = req.body;

        const userData = await User.findOne({ _id: userId });
        if (!userData) {
            return res.status(404).send({ status: 404, message: "User not found" });
        }

        let existingDetails = await User.findOne({ _id: userId });

        if (existingDetails) {
            if (req.file) {
                existingDetails.bankDetails.cheque = req.file.path;
                existingDetails.bankDetails.isUploadbankDetails = true;
            }

            if (bankName) existingDetails.bankDetails.bankName = bankName;
            if (accountNumber) existingDetails.bankDetails.accountNumber = accountNumber;
            if (reAccountNumber) existingDetails.bankDetails.reAccountNumber = reAccountNumber;
            if (accountHolderName) existingDetails.bankDetails.accountHolderName = accountHolderName;
            if (ifscCode) existingDetails.bankDetails.ifscCode = ifscCode;

            existingDetails.bankDetails.isUploadbankDetails = true;

        }
        const updatedCar = await existingDetails.save();

        return res.status(200).json({ status: 200, message: 'Address proof details updated successfully', data: updatedCar });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};