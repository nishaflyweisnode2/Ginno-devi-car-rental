const User = require('../models/userModel');
const authConfig = require("../configs/auth.config");
const jwt = require("jsonwebtoken");
const newOTP = require("otp-generators");
const mongoose = require('mongoose');
const Notification = require('../models/notificationModel');
const bcrypt = require("bcryptjs");
const City = require('../models/cityModel');
const Brand = require('../models/brandModel');
const Coupon = require('../models/couponModel');
const CarImage = require('../models/carImageTipsModel');
const Car = require('../models/carModel');
const Location = require("../models/carLocationModel");
const FulfilmentPolicy = require('../models/fulfilmentPolicyModel');
const CancellationPolicy = require('../models/cancellationPolicyModel');
const HostOffer = require('../models/hostOfferModel');
const TermAndCondition = require('../models/term&conditionModel');
const FAQ = require('../models/faqModel');
const AboutApps = require('../models/aboutAppModel');
const Policy = require('../models/policiesModel');
const MainCategory = require('../models/rental/mainCategoryModel');
const Category = require('../models/rental/categoryModel');
const SubscriptionCategory = require('../models/subscription/subscriptionCategoryModel');
const Offer = require('../models/offerModel');
const AdminCarPrice = require('../models/adminCarPriceModel');
const Plan = require('../models/kmPlanModel');
const AdminPackage = require('../models/adminPackageModel');
const DoorstepDeliveryPrice = require('../models/doorstepPriceModel');
const DriverPrice = require('../models/driverPriceModel');
const CancelReason = require('../models/cancelReasonModel');
const RefundCharge = require('../models/refunfChargeModel');
const Refund = require('../models/refundModel');
const Booking = require('../models/bookingModel');
const Subscription = require('../models/subscription/subscriptionTenureModel');
const SubscriptionVsBuying = require('../models/subscription/subscriptionBuyingModel');
const SubScriptionFAQ = require('../models/subscription/subscriptionFaqModel');
const CallUs = require('../models/callUsModel');
const Feedback = require('../models/feedbackModel');
const Transaction = require('../models/transctionModel');
const ReferralBonus = require('../models/referralBonusAmountModel');
const Tax = require('../models/taxModel');
const ReferralLevel = require('../models/referralLevelModel');
const TenderApplication = require('../models/govtTendorModel');
const Tds = require('../models/tdsModel');
const GPSData = require('../models/gpsModel');
const Review = require('../models/ratingModel');
const UserReview = require('../models/userRatingModel');
const AccessoryCategory = require('../models/accessory/accessoryCategoryModel')
const Accessory = require('../models/accessory/accessoryModel')
const Order = require('../models/orderModel');
const Address = require("../models/userAddressModel");





exports.registration = async (req, res) => {
    try {
        const lastUser = await User.findOne().sort({ userId: -1 });
        let newUserId = 1000000;

        if (lastUser) {
            newUserId = parseInt(lastUser.userId) + 1;
        }

        const { phone, email } = req.body;
        req.body.email = email.split(" ").join("").toLowerCase();
        let user = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: phone }] }], userType: "ADMIN" });
        if (!user) {
            req.body.password = bcrypt.hashSync(req.body.password, 8);
            req.body.userType = "ADMIN";
            req.body.accountVerification = true;
            req.body.userID = newUserId.toString();
            const userCreate = await User.create(req.body);
            return res.status(200).send({ message: "registered successfully ", data: userCreate, });
        } else {
            return res.status(409).send({ message: "Already Exist", data: [] });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email, userType: "ADMIN" });
        if (!user) {
            return res
                .status(404)
                .send({ message: "user not found ! not registered" });
        }
        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
            return res.status(401).send({ message: "Wrong password" });
        }
        const accessToken = jwt.sign({ id: user._id }, authConfig.secret, {
            expiresIn: authConfig.accessTokenTime,
        });
        let obj = {
            firstName: user.firstName,
            lastName: user.lastName,
            mobileNumber: user.mobileNumber,
            email: user.email,
            userType: user.userType,
        }
        return res.status(201).send({ data: obj, accessToken: accessToken });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Server error" + error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { fullName, email, mobileNumber, password } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send({ message: "not found" });
        }
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.mobileNumber = mobileNumber || user.mobileNumber;
        if (req.body.password) {
            user.password = bcrypt.hashSync(password, 8) || user.password;
        }
        const updated = await user.save();
        return res.status(200).send({ message: "updated", data: updated });
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            message: "internal server error " + err.message,
        });
    }
};

exports.getAllUser1 = async (req, res) => {
    try {
        const users = await User.find().populate('city');
        if (!users || users.length === 0) {
            return res.status(404).json({ status: 404, message: 'Users not found' });
        }

        const formattedUsers = users.map(user => ({
            _id: user._id,
            user: user,
            memberSince: user.createdAt.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
            }),
        }));

        return res.status(200).json({
            status: 200,
            data: formattedUsers,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};
exports.getAllUser = async (req, res) => {
    try {
        const { date, kyc, vehicleNo, location, userName, sort } = req.query;
        let filter = {};

        if (date) {
            const dateObj = new Date(date);
            filter.createdAt = {
                $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
                $lt: new Date(dateObj.setHours(23, 59, 59, 999))
            };
        }

        if (kyc) {
            filter.documentVerification = kyc;
        }

        if (vehicleNo) {
            filter['cars.licenseNumber'] = vehicleNo;
        }

        // if (location) {
        //     filter['city.name'] = location;
        // }
        if (location) {
            filter.city = location;
        }

        if (userName) {
            filter.fullName = { $regex: userName, $options: 'i' };
        }

        let sortOptions = {};

        if (sort) {
            switch (sort) {
                case 'carNameAsc':
                    sortOptions['cars.car.model'] = 1;
                    break;
                case 'carNameDesc':
                    sortOptions['cars.car.model'] = -1;
                    break;
                case 'hostNameAsc':
                    sortOptions['fullName'] = 1;
                    break;
                case 'hostNameDesc':
                    sortOptions['fullName'] = -1;
                    break;
                case 'ratingHighToLow':
                    sortOptions['rating'] = -1;
                    break;
                case 'ratingLowToHigh':
                    sortOptions['rating'] = 1;
                    break;
                default:
                    break;
            }
        }

        const users = await User.find(filter).populate('cars.car').sort(sortOptions);
        if (!users || users.length === 0) {
            return res.status(404).json({ status: 404, message: 'Users not found' });
        }

        const formattedUsers = users.map(user => ({
            _id: user._id,
            user: user,
            memberSince: user.createdAt.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
            }),
        }));

        return res.status(200).json({
            status: 200,
            data: formattedUsers,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getAllUserByType = async (req, res) => {
    try {
        const { userType, currentRole } = req.query;

        let users;
        if (userType) {
            users = await User.find({ userType: userType }).populate('city');
        } else {
            users = await User.find({ currentRole: currentRole }).populate('city');
        }
        if (!users || users.length === 0) {
            return res.status(404).json({ status: 404, message: 'Users not found' });
        }

        const formattedUsers = users.map(user => ({
            _id: user._id,
            user: user,
            memberSince: user.createdAt.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
            }),
        }));

        return res.status(200).json({
            status: 200,
            data: formattedUsers,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).populate('city');
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

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        await User.findByIdAndDelete(userId);

        return res.status(200).json({ status: 200, message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.updateUserById = async (req, res) => {
    try {
        const { fullName, email, mobileNumber, password, documentVerification, documentRemarks } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: "not found" });
        }
        user.documentVerification = documentVerification || user.documentVerification;
        user.documentRemarks = documentRemarks || user.documentRemarks;
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.mobileNumber = mobileNumber || user.mobileNumber;
        if (req.body.password) {
            user.password = bcrypt.hashSync(password, 8) || user.password;
        }
        const updated = await user.save();
        return res.status(200).send({ message: "updated", data: updated });
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            message: "internal server error " + err.message,
        });
    }
};

exports.uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.params.id

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

exports.uploadIdPicture = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { 'uploadId.frontImage': req.file.path } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        return res.status(200).json({ status: 200, message: 'Uploaded successfully', data: updatedUser.uploadId.frontImage });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to upload profile picture', error: error.message });
    }
};

exports.updateDocuments = async (req, res) => {
    try {
        const userId = req.params.id;
        const { uploadId, drivingLicense, bankDetails } = req.body;

        const isPanCardUpload = !!(uploadId.panNumber && uploadId.panImage && uploadId.panName);
        const isAadharCardUpload = !!(uploadId.aadharCardNo && uploadId.frontImage && uploadId.backImage);
        const isDrivingLicenseUpload = !!(drivingLicense.frontImage && drivingLicense.backImage && drivingLicense.drivingLicenseNo);
        const isUploadbankDetails = !!(bankDetails.bankName && bankDetails.accountNo && bankDetails.reAccountNumber && bankDetails.ifscCode && bankDetails.accountHolderName && bankDetails.cheque);

        const updateFields = {
            'uploadId.frontImage': uploadId.frontImage || null,
            'uploadId.backImage': uploadId.backImage || null,
            'uploadId.aadharCardNo': uploadId.aadharCardNo || null,
            'uploadId.panNumber': uploadId.panNumber || null,
            'uploadId.panImage': uploadId.panImage || null,
            'uploadId.panName': uploadId.panName || null,
            'uploadId.isPanCardUpload': isPanCardUpload,
            'uploadId.isAadharCardUpload': isAadharCardUpload,
            'drivingLicense.frontImage': drivingLicense.frontImage || null,
            'drivingLicense.backImage': drivingLicense.backImage || null,
            'drivingLicense.drivingLicenseNo': drivingLicense.drivingLicenseNo || null,
            'drivingLicense.isDrivingLicenseUpload': isDrivingLicenseUpload,
            'bankDetails.bankName': bankDetails.bankName || null,
            'bankDetails.accountNo': bankDetails.accountNo || null,
            'bankDetails.reAccountNumber': bankDetails.reAccountNumber || null,
            'bankDetails.ifscCode': bankDetails.ifscCode || null,
            'bankDetails.accountHolderName': bankDetails.accountHolderName || null,
            'bankDetails.cheque': bankDetails.cheque || null,
            'bankDetails.isUploadbankDetails': isUploadbankDetails,


        };

        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (updatedUser) {
            return res.status(200).json({ status: 200, message: 'Documents updated successfully', data: updatedUser });
        } else {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
    } catch (error) {
        console.error("Error updating documents:", error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.updateBankDetails = async (req, res) => {
    try {
        const userId = req.params.id;
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

exports.getPendingVerificationUsers = async (req, res) => {
    try {
        const pendingVerificationUsers = await User.find({ isVerified: false });

        return res.status(200).json({
            status: 200,
            data: pendingVerificationUsers,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.updateVerificationStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const { isVerified } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        user.isVerified = isVerified;
        await user.save();

        return res.status(200).json({
            status: 200,
            message: 'Verification status updated successfully',
            data: user,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getVerifiedUsers = async (req, res) => {
    try {
        const verifiedUsers = await User.find({ isVerified: true });

        if (!verifiedUsers || verifiedUsers.length === 0) {
            return res.status(404).json({ status: 404, message: 'No verified users found' });
        }

        return res.status(200).json({ status: 200, data: verifiedUsers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Failed to retrieve verified users', error: error.message });
    }
};

exports.registrationPartnerByAdmin = async (req, res) => {
    try {
        const lastUser = await User.findOne().sort({ userId: -1 });
        let newUserId = 1000000;

        if (lastUser) {
            newUserId = parseInt(lastUser.userId) + 1;
        }

        const { mobileNumber, email, userType } = req.body;
        req.body.email = email.split(" ").join("").toLowerCase();
        let user = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { mobileNumber: mobileNumber }] }], userType: userType });
        console.log(user);
        if (!user) {
            req.body.password = bcrypt.hashSync(req.body.password, 8);
            req.body.userType = userType;
            req.body.accountVerification = true;
            req.body.status = true;
            req.body.userID = newUserId.toString();
            const userCreate = await User.create(req.body);
            return res.status(200).send({ message: "registered successfully ", data: userCreate, });
        } else {
            return res.status(409).send({ message: "Already Exist", data: [] });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.createCity = async (req, res) => {
    try {
        const { name, status } = req.body;

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const existingCity = await City.findOne({ name });

        if (existingCity) {
            return res.status(400).json({
                status: 400,
                message: 'City with the same name already exists',
            });
        }

        const newCity = new City({ name, image: req.file.path, status });

        const savedCity = await newCity.save();

        res.status(201).json({
            status: 201,
            message: 'City created successfully',
            data: savedCity,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllCities = async (req, res) => {
    try {
        const cities = await City.find();

        res.status(200).json({
            status: 200,
            message: 'Cities retrieved successfully',
            data: cities,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCityById = async (req, res) => {
    try {
        const city = await City.findById(req.params.id);

        if (!city) {
            return res.status(404).json({ message: 'City not found' });
        }

        res.status(200).json({
            status: 200,
            message: 'City retrieved successfully',
            data: city,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCityById = async (req, res) => {
    try {
        const { name, status } = req.body;
        const cityId = req.params.id;

        const existingCity = await City.findById(cityId);

        if (!existingCity) {
            return res.status(404).json({
                status: 404,
                message: 'City not found',
            });
        }

        if (name && name !== existingCity.name) {
            const duplicateCity = await City.findOne({ name });

            if (duplicateCity) {
                return res.status(400).json({
                    status: 400,
                    message: 'City with the updated name already exists',
                });
            }

            existingCity.name = name;
        }

        if (req.file) {
            existingCity.image = req.file.path;
        }

        if (req.body.status !== undefined) {
            existingCity.status = status;
        }

        const updatedCity = await existingCity.save();

        res.status(200).json({
            status: 200,
            message: 'City updated successfully',
            data: updatedCity,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Server error' });
    }
};

exports.deleteCityById = async (req, res) => {
    try {
        const deletedCity = await City.findByIdAndDelete(req.params.id);

        if (!deletedCity) {
            return res.status(404).json({ message: 'City not found' });
        }

        res.status(200).json({
            status: 200,
            message: 'City deleted successfully',
            data: deletedCity,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createCarBrand = async (req, res) => {
    try {
        const { name, status } = req.body;

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const existingBrand = await Brand.findOne({ name });

        if (existingBrand) {
            return res.status(400).json({
                status: 400,
                message: 'Brand with the same name already exists',
            });
        }

        const newCarBrand = new Brand({
            name,
            image: req.file.path,
            status,
        });

        const savedCarBrand = await newCarBrand.save();

        res.status(201).json({ status: 201, message: 'CarBrand created successfully', data: savedCarBrand });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
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

exports.updateCarBrand = async (req, res) => {
    try {
        const { carBrandId } = req.params;
        const { name, status } = req.body;

        const updateFields = {};

        if (req.file) {
            updateFields.image = req.file.path;
        }

        if (name) {
            const existingBrand = await Brand.findOne({ name });

            if (existingBrand) {
                return res.status(400).json({
                    status: 400,
                    message: 'Brand with the same name already exists',
                });
            }

            updateFields.name = name;
        }

        if (status !== undefined) {
            updateFields.status = status;
        }

        const updatedCarBrand = await Brand.findByIdAndUpdate(
            carBrandId,
            { $set: updateFields },
            { new: true }
        );

        if (!updatedCarBrand) {
            return res.status(404).json({ status: 404, message: 'CarBrand not found' });
        }

        res.status(200).json({ status: 200, message: 'CarBrand updated successfully', data: updatedCarBrand });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

exports.deleteCarBrand = async (req, res) => {
    try {
        const { carBrandId } = req.params;

        const deletedCarBrand = await Brand.findByIdAndDelete(carBrandId);

        if (!deletedCarBrand) {
            return res.status(404).json({ status: 404, message: 'CarBrand not found' });
        }

        res.status(200).json({ status: 200, message: 'CarBrand deleted successfully', data: deletedCarBrand });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

exports.createCoupon = async (req, res) => {
    try {
        const { title, desc, code, discount, isPercent, expirationDate, isActive } = req.body;

        const existingCoupon = await Coupon.findOne({ code });

        if (existingCoupon) {
            return res.status(400).json({ status: 400, error: 'Coupon code already exists' });
        }

        const newCoupon = await Coupon.create({
            title,
            desc,
            code,
            discount,
            isPercent,
            expirationDate,
            isActive,
        });

        res.status(201).json({ status: 201, message: 'Coupon created successfully', data: newCoupon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Server error' });
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

exports.updateCouponById = async (req, res) => {
    try {
        const couponId = req.params.id;
        const updateFields = req.body;

        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, updateFields, { new: true });

        if (!updatedCoupon) {
            return res.status(404).json({ status: 404, message: 'Coupon not found' });
        }

        res.status(200).json({ status: 200, message: 'Coupon updated successfully', data: updatedCoupon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Server error' });
    }
};

exports.deleteCouponById = async (req, res) => {
    try {
        const couponId = req.params.id;
        const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

        if (!deletedCoupon) {
            return res.status(404).json({ status: 404, message: 'Coupon not found' });
        }

        res.status(200).json({ status: 200, message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Server error' });
    }
};

exports.createCarImage = async (req, res) => {
    try {
        const { tips, url } = req.body;

        let images = [];
        if (req.files) {
            for (let j = 0; j < req.files.length; j++) {
                let obj = {
                    img: req.files[j].path,
                };
                images.push(obj);
            }
        }
        const newCarImage = new CarImage({
            tips,
            images,
            url,
        });

        const savedCarImage = await newCarImage.save();

        return res.status(201).json({ status: 201, data: savedCarImage });
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

exports.updateCarImageById = async (req, res) => {
    try {
        const { carImageId } = req.params;
        const { tips, referenceImg, url } = req.body;

        const existingCarImage = await CarImage.findById(carImageId);

        if (!existingCarImage) {
            return res.status(404).json({ status: 404, message: 'Car Image not found' });
        }

        existingCarImage.tips = tips;
        existingCarImage.referenceImg = referenceImg;
        existingCarImage.url = url;

        const updatedCarImage = await existingCarImage.save();

        return res.status(200).json({ status: 200, data: updatedCarImage });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.deleteCarImageById = async (req, res) => {
    try {
        const { carImageId } = req.params;
        const deletedCarImage = await CarImage.findByIdAndDelete(carImageId);

        if (!deletedCarImage) {
            return res.status(404).json({ status: 404, message: 'Car Image not found' });
        }

        return res.status(200).json({ status: 200, message: 'Car Image deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.createCar = async (req, res) => {
    try {
        const { licenseNumber, brand, model, variant, city, yearOfRegistration, fuelType, transmissionType, kmDriven, chassisNumber, sharingFrequency, status } = req.body;
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
            city,
            yearOfRegistration,
            fuelType,
            transmissionType,
            kmDriven,
            chassisNumber,
            sharingFrequency,
            status
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

exports.getAllAddedCars = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const partnerCars = await Car.find({ owner: userId }).populate('city owner brand');

        return res.status(200).json({ status: 200, data: partnerCars });
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

        const partnerCars = await Car.find().populate('city owner brand');

        return res.status(200).json({ status: 200, data: partnerCars });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.carId).populate('city owner brand');
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

        const existingCar = await Car.findById(carId);

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

        // user.cars = user.cars.filter(car => car.car.toString() !== req.params.carId);
        // await user.save();

        return res.status(200).json({ status: 200, message: 'Car deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateCarDocuments = async (req, res) => {
    try {
        const { carId } = req.params;

        const existingCar = await Car.findById(carId);

        if (!existingCar) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (req.file) {
            existingCar.carDocuments = req.file.path;
            existingCar.isCarDocumentsUpload = true;
        }

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

exports.getCarsForPartner = async (req, res) => {
    try {
        const userId = req.user._id;
        const partnerId = req.params.partnerId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const partnerCars = await Car.find({ owner: partnerId });

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

        const location = new Location({
            user: userId,
            car: carId,
            name,
            coordinates,
            type,
        });

        const savedLocation = await location.save();

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

exports.createPolicy = async (req, res) => {
    try {
        const { question, answer } = req.body;

        const newPolicy = await FulfilmentPolicy.create({ question, answer });

        return res.status(201).json({ status: 201, data: newPolicy });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
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

exports.updatePolicy = async (req, res) => {
    try {
        const updatedPolicy = await FulfilmentPolicy.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!updatedPolicy) {
            return res.status(404).json({ status: 404, message: 'Policy not found' });
        }
        return res.status(200).json({ status: 200, data: updatedPolicy });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.deletePolicy = async (req, res) => {
    try {
        const deletedPolicy = await FulfilmentPolicy.findByIdAndDelete(req.params.id);
        if (!deletedPolicy) {
            return res.status(404).json({ status: 404, message: 'Policy not found' });
        }
        return res.status(200).json({ status: 200, data: {} });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.createCancellationPolicy = async (req, res) => {
    try {
        const { title, description } = req.body;

        const newPolicy = await CancellationPolicy.create({ title, description });

        return res.status(201).json({ status: 201, data: newPolicy });
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

exports.updateCancellationPolicy = async (req, res) => {
    try {
        const updatedPolicy = await CancellationPolicy.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!updatedPolicy) {
            return res.status(404).json({ status: 404, message: 'Policy not found' });
        }
        return res.status(200).json({ status: 200, data: updatedPolicy });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.deleteCancellationPolicy = async (req, res) => {
    try {
        const deletedPolicy = await CancellationPolicy.findByIdAndDelete(req.params.id);
        if (!deletedPolicy) {
            return res.status(404).json({ status: 404, message: 'Policy not found' });
        }
        return res.status(200).json({ status: 200, data: {} });
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
        const userId = req.params.userId;

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

        const userCar = await Car.findOne({ _id: carId });
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

exports.createTermAndCondition = async (req, res) => {
    try {
        const { content } = req.body;

        const termAndCondition = new TermAndCondition({ content });
        await termAndCondition.save();

        return res.status(201).json({ status: 201, message: 'Terms and Conditions created successfully', data: termAndCondition });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
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

exports.updateTermAndConditionById = async (req, res) => {
    try {
        const termAndConditionId = req.params.id;
        const { content } = req.body;

        const updatedTermAndCondition = await TermAndCondition.findByIdAndUpdate(
            termAndConditionId,
            { content },
            { new: true }
        );

        if (!updatedTermAndCondition) {
            return res.status(404).json({ status: 404, message: 'Terms and Conditions not found' });
        }

        return res.status(200).json({ status: 200, message: 'Terms and Conditions updated successfully', data: updatedTermAndCondition });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

exports.deleteTermAndConditionById = async (req, res) => {
    try {
        const termAndConditionId = req.params.id;
        const deletedTermAndCondition = await TermAndCondition.findByIdAndDelete(termAndConditionId);

        if (!deletedTermAndCondition) {
            return res.status(404).json({ status: 404, message: 'Terms and Conditions not found' });
        }

        return res.status(200).json({ status: 200, message: 'Terms and Conditions deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

exports.createFAQ = async (req, res) => {
    try {
        const { question, answer, userType } = req.body;
        const newFAQ = await FAQ.create({ question, answer, userType });
        return res.status(201).json({ status: 201, data: newFAQ });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
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

exports.updateFAQById = async (req, res) => {
    try {
        const faqId = req.params.id;
        const updatedFAQ = await FAQ.findByIdAndUpdate(faqId, { $set: req.body }, { new: true });

        if (!updatedFAQ) {
            return res.status(404).json({ status: 404, message: 'FAQ not found' });
        }

        return res.status(200).json({ status: 200, data: updatedFAQ });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.deleteFAQById = async (req, res) => {
    try {
        const faqId = req.params.id;
        const deletedFAQ = await FAQ.findByIdAndDelete(faqId);

        if (!deletedFAQ) {
            return res.status(404).json({ status: 404, message: 'FAQ not found' });
        }

        return res.status(200).json({ status: 200, data: deletedFAQ });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.createAboutApps = async (req, res) => {
    try {
        const { content } = req.body;

        const termAndCondition = new AboutApps({ content });
        await termAndCondition.save();

        return res.status(201).json({ status: 201, message: 'About Apps created successfully', data: termAndCondition });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
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

exports.updateAboutAppsById = async (req, res) => {
    try {
        const termAndConditionId = req.params.id;
        const { content } = req.body;

        const updatedTermAndCondition = await AboutApps.findByIdAndUpdate(
            termAndConditionId,
            { content },
            { new: true }
        );

        if (!updatedTermAndCondition) {
            return res.status(404).json({ status: 404, message: 'About Apps not found' });
        }

        return res.status(200).json({ status: 200, message: 'About Apps updated successfully', data: updatedTermAndCondition });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

exports.deleteAboutAppsById = async (req, res) => {
    try {
        const termAndConditionId = req.params.id;
        const deletedTermAndCondition = await AboutApps.findByIdAndDelete(termAndConditionId);

        if (!deletedTermAndCondition) {
            return res.status(404).json({ status: 404, message: 'About Apps not found' });
        }

        return res.status(200).json({ status: 200, message: 'About Apps deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

exports.createPolicies = async (req, res) => {
    try {
        const { content } = req.body;

        const termAndCondition = new Policy({ content });
        await termAndCondition.save();

        return res.status(201).json({ status: 201, message: 'Policy created successfully', data: termAndCondition });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

exports.getAllPolicies = async (req, res) => {
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

exports.getPoliciesById = async (req, res) => {
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

exports.updatePoliciesById = async (req, res) => {
    try {
        const termAndConditionId = req.params.id;
        const { content } = req.body;

        const updatedTermAndCondition = await Policy.findByIdAndUpdate(
            termAndConditionId,
            { content },
            { new: true }
        );

        if (!updatedTermAndCondition) {
            return res.status(404).json({ status: 404, message: 'Policy not found' });
        }

        return res.status(200).json({ status: 200, message: 'Policy updated successfully', data: updatedTermAndCondition });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

exports.deletePoliciesById = async (req, res) => {
    try {
        const termAndConditionId = req.params.id;
        const deletedTermAndCondition = await Policy.findByIdAndDelete(termAndConditionId);

        if (!deletedTermAndCondition) {
            return res.status(404).json({ status: 404, message: 'Policy not found' });
        }

        return res.status(200).json({ status: 200, message: 'Policy deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

exports.createMainCategory = async (req, res) => {
    try {
        const { name, status } = req.body;

        const category = new MainCategory({
            name,
            status,
        });

        await category.save();

        return res.status(201).json({ status: 201, message: 'Main Category created successfully', data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Main Category creation failed', error: error.message });
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

exports.updateMainCategory = async (req, res) => {
    try {
        const mainCategoryId = req.params.mainCategoryId;
        const { name, status } = req.body;

        const updateFields = {};

        if (name) {
            updateFields.name = name;
        }

        if (status !== undefined) {
            updateFields.status = status;
        }

        const category = await MainCategory.findByIdAndUpdate(mainCategoryId, updateFields, { new: true });

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Main Category not found' });
        }

        return res.status(200).json({ status: 200, message: 'Main Category updated successfully', data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Main Category update failed', error: error.message });
    }
};

exports.deleteMainCategory = async (req, res) => {
    try {
        const mainCategoryId = req.params.mainCategoryId;

        const category = await MainCategory.findByIdAndDelete(mainCategoryId);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Main Category not found' });
        }

        return res.status(200).json({ status: 200, message: 'Main Category deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Main Category deletion failed', error: error.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { mainCategory, name, status } = req.body;

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }
        const mainCategories = await MainCategory.findById(mainCategory);
        if (!mainCategories) {
            return res.status(404).json({ status: 404, message: 'Main Category not found' });
        }

        const category = new Category({
            mainCategory,
            name,
            status,
            image: req.file.path,
        });

        await category.save();

        return res.status(201).json({ status: 201, message: 'Category created successfully', data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Category creation failed', error: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        const count = categories.length;

        return res.status(200).json({ status: 200, data: count, categories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching categories', error: error.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }

        return res.status(200).json({ status: 200, data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching category', error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const { mainCategory, name, status } = req.body;

        const updateFields = {};

        if (mainCategory) {
            const mainCategories = await MainCategory.findById(mainCategory);
            if (!mainCategories) {
                return res.status(404).json({ status: 404, message: 'Main Category not found' });
            }
            updateFields.mainCategory = mainCategory;
        }

        if (name) {
            updateFields.name = name;
        }

        if (status !== undefined) {
            updateFields.status = status;
        }

        if (req.file) {
            updateFields.image = req.file.path;
        }

        const category = await Category.findByIdAndUpdate(categoryId, updateFields, { new: true });

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }

        return res.status(200).json({ status: 200, message: 'Category updated successfully', data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Category update failed', error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        const category = await Category.findByIdAndDelete(categoryId);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }

        return res.status(200).json({ status: 200, message: 'Category deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Category deletion failed', error: error.message });
    }
};

exports.createSubscriptionCategory = async (req, res) => {
    try {
        const { mainCategory, name, status } = req.body;

        const mainCategories = await MainCategory.findById(mainCategory);
        if (!mainCategories) {
            return res.status(404).json({ status: 404, message: 'Main Category not found' });
        }

        const category = new SubscriptionCategory({
            mainCategory,
            name,
            status,
        });

        await category.save();

        return res.status(201).json({ status: 201, message: 'Subscription Category created successfully', data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Subscription Category creation failed', error: error.message });
    }
};

exports.getAllSubscriptionCategories = async (req, res) => {
    try {
        const categories = await SubscriptionCategory.find();

        const count = categories.length;

        return res.status(200).json({ status: 200, data: count, categories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching Subscription Category', error: error.message });
    }
};

exports.getSubscriptionCategoryById = async (req, res) => {
    try {
        const subscriptioncategoryId = req.params.subscriptioncategoryId;

        const category = await SubscriptionCategory.findById(subscriptioncategoryId);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Subscription not found' });
        }

        return res.status(200).json({ status: 200, data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Error fetching Subscription Category', error: error.message });
    }
};

exports.updateSubscriptionCategory = async (req, res) => {
    try {
        const subscriptioncategoryId = req.params.subscriptioncategoryId;
        const { mainCategory, name, status } = req.body;

        const updateFields = {};

        if (mainCategory) {
            const mainCategories = await MainCategory.findById(mainCategory);
            if (!mainCategories) {
                return res.status(404).json({ status: 404, message: 'Subscription Category not found' });
            }
            updateFields.mainCategory = mainCategory;
        }

        if (name) {
            updateFields.name = name;
        }

        if (status !== undefined) {
            updateFields.status = status;
        }

        const category = await SubscriptionCategory.findByIdAndUpdate(subscriptioncategoryId, updateFields, { new: true });

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Subscription not found' });
        }

        return res.status(200).json({ status: 200, message: 'Subscription updated successfully', data: category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Category update failed', error: error.message });
    }
};

exports.deleteSubscriptionCategory = async (req, res) => {
    try {
        const subscriptioncategoryId = req.params.subscriptioncategoryId;

        const category = await SubscriptionCategory.findByIdAndDelete(subscriptioncategoryId);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Subscription Category not found' });
        }

        return res.status(200).json({ status: 200, message: 'Subscription Category deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Subscription Category deletion failed', error: error.message });
    }
};

exports.createOffer = async (req, res) => {
    try {
        const { title, description, discountPercentage, targetUsers, validUntil } = req.body;

        const newOffer = new Offer({
            title,
            description,
            discountPercentage,
            targetUsers,
            validUntil,
        });

        const savedOffer = await newOffer.save();

        return res.status(201).json({ status: 201, data: savedOffer });
    } catch (error) {
        console.error('Error creating offer:', error);
        return res.status(500).json({ status: 500, error: error.message });
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

exports.updateOfferById = async (req, res) => {
    try {
        const { title, description, discountPercentage, targetUsers, validUntil } = req.body;

        const updatedOffer = await Offer.findByIdAndUpdate(
            req.params.id,
            { title, description, discountPercentage, targetUsers, validUntil },
            { new: true }
        );

        if (!updatedOffer) {
            return res.status(404).json({ status: 404, message: 'Offer not found' });
        }

        return res.status(200).json({ status: 200, data: updatedOffer });
    } catch (error) {
        console.error('Error updating offer by ID:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.deleteOfferById = async (req, res) => {
    try {
        const deletedOffer = await Offer.findByIdAndDelete(req.params.id);

        if (!deletedOffer) {
            return res.status(404).json({ status: 404, message: 'Offer not found' });
        }

        return res.status(200).json({ status: 200, message: 'Offer deleted successfully' });
    } catch (error) {
        console.error('Error deleting offer by ID:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.createAdminCarPrice = async (req, res) => {
    try {
        const { mainCategory, car, adminHourlyRate, adminMinPricePerHour, adminMaxPricePerHour, autoPricing, depositedMoney, extendPrice } = req.body;

        const mainCategoryObjects = await MainCategory.find({ _id: { $in: mainCategory } });

        if (mainCategoryObjects.length !== mainCategory.length) {
            return res.status(404).json({ status: 404, message: 'One or more MainCategories not found' });
        }

        const adminCarPrice = new AdminCarPrice({
            mainCategory,
            car,
            adminHourlyRate,
            adminMinPricePerHour,
            adminMaxPricePerHour,
            price: adminHourlyRate,
            autoPricing,
            depositedMoney,
            extendPrice
        });
        await adminCarPrice.save();
        return res.status(201).json({ status: 201, message: 'AdminCarPrice created successfully', data: adminCarPrice });
    } catch (error) {
        return res.status(400).json({ status: 400, error: error.message });
    }
};

exports.getAllAdminCarPrices = async (req, res) => {
    try {
        const adminCarPrices = await AdminCarPrice.find();
        return res.json({ status: 200, data: adminCarPrices });
    } catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.getAdminCarPriceById = async (req, res) => {
    try {
        const adminCarPrice = await AdminCarPrice.findById(req.params.id);
        if (!adminCarPrice) {
            return res.status(404).json({ status: 404, message: 'AdminCarPrice not found' });
        }
        return res.json({ status: 200, data: adminCarPrice });
    } catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.updateAdminCarPriceById = async (req, res) => {
    try {
        const { mainCategory, ...updateData } = req.body;

        let mainCategoryObjects;
        if (mainCategory) {
            mainCategoryObjects = await MainCategory.find({ _id: { $in: mainCategory } });

            if (mainCategoryObjects.length !== mainCategory.length) {
                return res.status(404).json({ status: 404, message: 'One or more MainCategories not found' });
            }
        }

        const adminCarPrice = await AdminCarPrice.findByIdAndUpdate(
            req.params.id,
            { mainCategory, ...updateData },
            { new: true }
        );

        if (!adminCarPrice) {
            return res.status(404).json({ status: 404, message: 'AdminCarPrice not found' });
        }

        return res.json({ status: 200, message: 'AdminCarPrice updated successfully', data: adminCarPrice });
    } catch (error) {
        return res.status(400).json({ status: 400, error: error.message });
    }
};

exports.deleteAdminCarPriceById = async (req, res) => {
    try {
        const deletedAdminCarPrice = await AdminCarPrice.findByIdAndDelete(req.params.id);

        if (!deletedAdminCarPrice) {
            return res.status(404).json({ status: 404, message: 'AdminCarPrice not found' });
        }

        return res.status(200).json({ status: 200, message: 'AdminCarPrice deleted successfully' });
    } catch (error) {
        console.error('Error deleting admin car price by ID:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.createPlan = async (req, res) => {
    try {
        const { mainCategory, name, description, klLimit, extendPrice } = req.body;

        const category = await MainCategory.findById(mainCategory);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Main Category not found' });
        }

        const existingCoupon = await Plan.findOne({ name });

        if (existingCoupon) {
            return res.status(400).json({ status: 400, error: 'Plan Name already exists' });
        }

        const adminCarPrice = await AdminCarPrice.findOne({ mainCategories: mainCategory });

        if (!adminCarPrice || adminCarPrice.length === 0) {
            return res.status(404).json({ status: 404, message: 'AdminCarPrices not found for the Main Category' });
        }


        let price;
        if (!req.body.price) {
            if (adminCarPrice.autoPricing) {
                price = adminCarPrice.adminHourlyRate;
            } else if (adminCarPrice.isHostPricing) {
                price = adminCarPrice.hostHourlyRate;
            } else {
                price = adminCarPrice.price;
            }
        }

        const newPlan = new Plan({
            mainCategory,
            name,
            description,
            klLimit,
            price: price * 24 || req.body.price,
            extendPrice
        });

        await newPlan.save();

        return res.status(201).json({ status: 201, message: 'Plan created successfully', data: newPlan });
    } catch (error) {
        console.error('Error creating plan:', error);
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

exports.updatePlan = async (req, res) => {
    try {
        const planId = req.params.id;
        const { mainCategory, name, description, klLimit, price, extendPrice } = req.body;

        const updatedPlan = await Plan.findByIdAndUpdate(planId, {
            mainCategory,
            name,
            description,
            klLimit,
            price,
            extendPrice,
        }, { new: true });

        if (!updatedPlan) {
            return res.status(404).json({ status: 404, message: 'Plan not found' });
        }

        return res.status(200).json({ status: 200, message: 'Plan updated successfully', data: updatedPlan });
    } catch (error) {
        console.error('Error updating plan:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.deletePlanById = async (req, res) => {
    try {
        const deleteplan = await Plan.findByIdAndDelete(req.params.id);
        if (!deleteplan) {
            return res.status(404).json({ status: 404, message: 'plan not found' });
        }

        return res.status(200).json({ status: 200, message: 'plan deleted successfully' });
    } catch (error) {
        console.error('Error deleting admin car price by ID:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.createAdminPackage = async (req, res) => {
    try {
        const { title, description, price } = req.body;

        const newAdminPackage = new AdminPackage({
            title,
            description,
            price,
        });

        await newAdminPackage.save();

        return res.status(201).json({ status: 201, message: 'Admin package created successfully', data: newAdminPackage });
    } catch (error) {
        console.error('Error creating admin package:', error);
        return res.status(500).json({ status: 500, error: error.message });
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

exports.updateAdminPackage = async (req, res) => {
    try {
        const { title, description, price } = req.body;

        const updatedAdminPackage = await AdminPackage.findByIdAndUpdate(
            req.params.id,
            { title, description, price },
            { new: true }
        );

        if (!updatedAdminPackage) {
            return res.status(404).json({ status: 404, message: 'Admin package not found' });
        }

        return res.status(200).json({ status: 200, message: 'Admin package updated successfully', data: updatedAdminPackage });
    } catch (error) {
        console.error('Error updating admin package:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.deleteAdminPackage = async (req, res) => {
    try {
        const deletedAdminPackage = await AdminPackage.findByIdAndDelete(req.params.id);

        if (!deletedAdminPackage) {
            return res.status(404).json({ status: 404, message: 'Admin package not found' });
        }

        return res.status(200).json({ status: 200, message: 'Admin package deleted successfully', data: deletedAdminPackage });
    } catch (error) {
        console.error('Error deleting admin package:', error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.createPrice = async (req, res) => {
    try {
        const { categoryId, description, distance, extendPrice, price } = req.body;

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }

        const newPrice = new DoorstepDeliveryPrice({
            category: categoryId,
            description,
            distance,
            extendPrice,
            price,
        });

        const savedPrice = await newPrice.save();

        return res.status(201).json({ status: 201, message: 'Price created successfully', data: savedPrice });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getAllPrices = async (req, res) => {
    try {
        const prices = await DoorstepDeliveryPrice.find();

        return res.status(200).json({ status: 200, data: prices });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getPriceById = async (req, res) => {
    try {
        const priceId = req.params.id;

        const price = await DoorstepDeliveryPrice.findById(priceId);

        if (!price) {
            return res.status(404).json({ status: 404, message: 'Price not found' });
        }

        return res.status(200).json({ status: 200, data: price });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.updatePriceById = async (req, res) => {
    try {
        const priceId = req.params.id;
        const { categoryId, description, distance, extendPrice, price } = req.body;

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }

        const updatedPrice = await DoorstepDeliveryPrice.findByIdAndUpdate(
            priceId,
            { category: categoryId, description, distance, extendPrice, price },
            { new: true }
        );

        if (!updatedPrice) {
            return res.status(404).json({ status: 404, message: 'Price not found' });
        }

        return res.status(200).json({ status: 200, message: 'Price updated successfully', data: updatedPrice });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.deletePriceById = async (req, res) => {
    try {
        const priceId = req.params.id;

        const deletedPrice = await DoorstepDeliveryPrice.findByIdAndDelete(priceId);

        if (!deletedPrice) {
            return res.status(404).json({ status: 404, message: 'Price not found' });
        }

        return res.status(200).json({ status: 200, message: 'Price deleted successfully', data: deletedPrice });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.createDriverPrice = async (req, res) => {
    try {
        const { categoryId, description, price } = req.body;

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }

        const newPrice = new DriverPrice({
            category: categoryId,
            description,
            price,
        });

        const savedPrice = await newPrice.save();

        return res.status(201).json({ status: 201, message: 'Price created successfully', data: savedPrice });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getAllDriverPrice = async (req, res) => {
    try {
        const prices = await DriverPrice.find();

        return res.status(200).json({ status: 200, data: prices });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getDriverPriceById = async (req, res) => {
    try {
        const priceId = req.params.id;

        const price = await DriverPrice.findById(priceId);

        if (!price) {
            return res.status(404).json({ status: 404, message: 'Price not found' });
        }

        return res.status(200).json({ status: 200, data: price });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.updateDriverPriceById = async (req, res) => {
    try {
        const priceId = req.params.id;
        const { categoryId, description, price } = req.body;

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ status: 404, message: 'Category not found' });
        }

        const updatedPrice = await DriverPrice.findByIdAndUpdate(
            priceId,
            { category: categoryId, description, price },
            { new: true }
        );

        if (!updatedPrice) {
            return res.status(404).json({ status: 404, message: 'Price not found' });
        }

        return res.status(200).json({ status: 200, message: 'Price updated successfully', data: updatedPrice });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.deleteDriverPriceById = async (req, res) => {
    try {
        const priceId = req.params.id;

        const deletedPrice = await DriverPrice.findByIdAndDelete(priceId);

        if (!deletedPrice) {
            return res.status(404).json({ status: 404, message: 'Price not found' });
        }

        return res.status(200).json({ status: 200, message: 'Price deleted successfully', data: deletedPrice });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.createCancelReason = async (req, res) => {
    try {
        const { reason, description } = req.body;

        const existingReason = await CancelReason.findOne({ reason });
        if (existingReason) {
            return res.status(400).json({ status: 400, message: 'Cancel reason already exists', data: null });
        }

        const newCancelReason = await CancelReason.create({ reason, description });

        return res.status(201).json({ status: 201, message: 'Cancel reason created successfully', data: newCancelReason });
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

exports.updateCancelReasonById = async (req, res) => {
    try {
        const { reason, description } = req.body;

        const updatedCancelReason = await CancelReason.findByIdAndUpdate(
            req.params.id,
            { reason, description },
            { new: true }
        );

        if (!updatedCancelReason) {
            return res.status(404).json({ status: 404, message: 'Cancel reason not found', data: null });
        }

        return res.status(200).json({ status: 200, message: 'Cancel reason updated successfully', data: updatedCancelReason });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.deleteCancelReasonById = async (req, res) => {
    try {
        const deletedCancelReason = await CancelReason.findByIdAndDelete(req.params.id);

        if (!deletedCancelReason) {
            return res.status(404).json({ status: 404, message: 'Cancel reason not found', data: null });
        }

        return res.status(200).json({ status: 200, message: 'Cancel reason deleted successfully', data: deletedCancelReason });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.createRefundCharge = async (req, res) => {
    try {
        const { refundAmount } = req.body;

        const newRefundCharge = new RefundCharge({ refundAmount });

        const savedRefundCharge = await newRefundCharge.save();

        return res.status(201).json({
            status: 201,
            message: 'Refund charge created successfully',
            data: savedRefundCharge,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllRefundCharges = async (req, res) => {
    try {
        const refundCharges = await RefundCharge.find();
        return res.status(200).json({ status: 200, data: refundCharges });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getRefundChargeById = async (req, res) => {
    try {
        const refundCharge = await RefundCharge.findById(req.params.id);
        if (!refundCharge) {
            return res.status(404).json({ status: 404, message: 'Refund charge not found' });
        }
        return res.status(200).json({ status: 200, data: refundCharge });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.updateRefundChargeById = async (req, res) => {
    try {
        const refundCharge = await RefundCharge.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!refundCharge) {
            return res.status(404).json({ status: 404, message: 'Refund charge not found' });
        }
        return res.status(200).json({ sataus: 200, message: 'Refund charge updated sucessfully', data: refundCharge });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteRefundChargeById = async (req, res) => {
    try {
        const refundCharge = await RefundCharge.findByIdAndDelete(req.params.id);
        if (!refundCharge) {
            return res.status(404).json({ status: 404, message: 'Refund charge not found' });
        }
        return res.status(200).json({
            status: 200,
            message: 'Refund  deleted successfully',
            data: refundCharge,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.updateRefundPaymentStatus = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const { refundStatus, refundTransactionId } = req.body;

        const updatedBooking = await Booking.findOne({ _id: bookingId });

        if (!updatedBooking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        const refundId = await Refund.findOne({ booking: bookingId });

        if (!refundId) {
            return res.status(404).json({ status: 404, message: 'RefundId not found', data: null });
        }

        const validStatusValues = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'];
        if (!validStatusValues.includes(refundStatus)) {
            return res.status(400).json({ error: "Invalid RefundStatus status value" });
        }

        refundId.refundStatus = refundStatus;
        refundId.refundTransactionId = refundTransactionId;
        refundId.refundTransactionDate = new Date;

        await refundId.save();

        const newTransaction = new Transaction({
            user: booking.user,
            amount: refund.totalRefundAmount,
            type: 'Wallet',
            details: 'Wallet add money for Booking',
            cr: true
        });

        await newTransaction.save();

        return res.status(200).json({
            status: 200,
            message: 'Payment status updated successfully',
            data: refundId,
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

exports.getRefundStatusAndAmount = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;

        const booking = await Booking.findOne({ _id: bookingId });

        if (!booking) {
            return res.status(404).json({ status: 404, message: 'Booking not found', data: null });
        }

        const refund = await Refund.findOne({ booking: bookingId });

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

exports.createSubscription = async (req, res) => {
    try {
        const { tenure, duration, status } = req.body;
        const subscription = new Subscription({
            tenure,
            duration,
            status
        });
        const savedSubscription = await subscription.save();
        res.status(201).json(savedSubscription);
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find();
        return res.json({ status: 201, data: subscriptions });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.getSubscriptionById = async (req, res) => {
    try {
        const subscriptionId = req.params.id;
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            return res.status(404).json({ status: 404, message: 'Subscription not found' });
        }
        return res.json({ status: 200, data: subscription });
    } catch (error) {
        console.error('Error fetching subscription by ID:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.updateSubscriptionById = async (req, res) => {
    try {
        const subscriptionId = req.params.id;
        const { tenure, duration, status } = req.body;
        const updatedSubscription = await Subscription.findByIdAndUpdate(
            subscriptionId,
            { tenure, duration, status },
            { new: true }
        );

        if (!updatedSubscription) {
            return res.status(404).json({ status: 404, message: 'Subscription not found' });
        }
        return res.json({ status: 200, data: updatedSubscription });
    } catch (error) {
        console.error('Error updating subscription by ID:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteSubscriptionById = async (req, res) => {
    try {
        const subscriptionId = req.params.id;

        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            return res.status(404).json({ status: 404, message: 'Subscription not found' });
        }
        await Subscription.findByIdAndDelete(subscriptionId);
        return res.json({ status: 200, message: 'Subscription deleted successfully' });
    } catch (error) {
        console.error('Error deleting subscription by ID:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.createOption = async (req, res) => {
    try {
        const option = new SubscriptionVsBuying(req.body);
        await option.save();
        return res.status(201).json({ status: 201, message: 'Option created successfully', data: option });
    } catch (error) {
        console.error('Error creating subscription vs buying option:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
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

exports.updateOption = async (req, res) => {
    try {
        const optionId = req.params.id;
        const updates = req.body;
        const option = await SubscriptionVsBuying.findByIdAndUpdate(optionId, updates, { new: true });
        if (!option) {
            return res.status(404).json({ status: 404, message: 'Option not found' });
        }
        return res.status(200).json({ status: 200, message: 'Option updated successfully', data: option });
    } catch (error) {
        console.error('Error updating subscription vs buying option:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.deleteOption = async (req, res) => {
    try {
        const optionId = req.params.id;
        const option = await SubscriptionVsBuying.findByIdAndDelete(optionId);
        if (!option) {
            return res.status(404).json({ status: 404, message: 'Option not found' });
        }
        return res.status(200).json({ status: 200, message: 'Option deleted successfully' });
    } catch (error) {
        console.error('Error deleting subscription vs buying option:', error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};

exports.createSubScriptionFAQ = async (req, res) => {
    try {
        const { question, answer } = req.body;
        const newFAQ = await SubScriptionFAQ.create({ question, answer });
        return res.status(201).json({ status: 201, data: newFAQ });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
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

exports.updateSubScriptionFAQById = async (req, res) => {
    try {
        const faqId = req.params.id;
        const updatedFAQ = await SubScriptionFAQ.findByIdAndUpdate(faqId, { $set: req.body }, { new: true });

        if (!updatedFAQ) {
            return res.status(404).json({ status: 404, message: 'SubScription FAQ not found' });
        }

        return res.status(200).json({ status: 200, data: updatedFAQ });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.deleteSubScriptionFAQById = async (req, res) => {
    try {
        const faqId = req.params.id;
        const deletedFAQ = await SubScriptionFAQ.findByIdAndDelete(faqId);

        if (!deletedFAQ) {
            return res.status(404).json({ status: 404, message: 'SubScription FAQ not found' });
        }

        return res.status(200).json({ status: 200, data: deletedFAQ });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.addQuackCoinByCarId = async (req, res) => {
    try {
        const { carId } = req.params;
        const { quackCoin } = req.body;

        const car = await Car.findById(carId);

        if (!car) {
            return res.status(404).json({ status: 404, message: 'Car not found' });
        }

        car.quackCoin += quackCoin;

        await car.save();

        return res.status(200).json({ status: 200, message: 'QuackCoin added successfully', data: car });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.createCallUs = async (req, res) => {
    try {
        const { mobileNumber, email } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const newContactUs = await CallUs.create({
            mobileNumber,
            email,
        });

        return res.status(201).json({ status: 201, data: newContactUs });
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

exports.updateCallUs = async (req, res) => {
    try {
        const contactUsId = req.params.id;

        const updatedContactUsEntry = await CallUs.findByIdAndUpdate(
            contactUsId,
            { $set: req.body },
            { new: true }
        );

        if (!updatedContactUsEntry) {
            return res.status(404).json({ status: 404, message: 'Contact Us entry not found' });
        }

        return res.status(200).json({ status: 200, data: updatedContactUsEntry });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
    }
};

exports.deleteCallUs = async (req, res) => {
    try {
        const contactUsId = req.params.id;
        const deletedContactUsEntry = await CallUs.findByIdAndDelete(contactUsId);

        if (!deletedContactUsEntry) {
            return res.status(404).json({ status: 404, message: 'Contact us entry not found' });
        }

        return res.status(200).json({ status: 200, message: 'Contact us entry deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: error.message });
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

exports.createReferralBonus = async (req, res) => {
    try {
        const { name, type, percentage } = req.body;

        const newReferralBonus = await ReferralBonus.create({
            name,
            type,
            percentage
        });

        return res.status(201).json({ status: 201, data: newReferralBonus });
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

exports.updateReferralBonus = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, percentage } = req.body;

        const updatedReferralBonus = await ReferralBonus.findByIdAndUpdate(id, { name, type, percentage }, { new: true });

        if (!updatedReferralBonus) {
            return res.status(404).json({ status: 404, message: 'Referral bonus configuration not found' });
        }

        return res.status(200).json({ status: 200, data: updatedReferralBonus });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.deleteReferralBonus = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedReferralBonus = await ReferralBonus.findByIdAndDelete(id);

        if (!deletedReferralBonus) {
            return res.status(404).json({ status: 404, message: 'Referral bonus configuration not found' });
        }

        return res.status(200).json({ status: 200, message: 'Referral bonus configuration deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.createTaxAmount = async (req, res) => {
    try {
        const { percentage, status } = req.body;

        const TaxAmount = await Tax.create({ percentage, status });

        return res.status(201).json({ status: 201, data: TaxAmount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getAllTaxAmount = async (req, res) => {
    try {
        const TaxAmount = await Tax.find();

        return res.status(200).json({ status: 200, data: TaxAmount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.updateTaxAmount = async (req, res) => {
    try {
        const { id } = req.params;
        const { percentage, status } = req.body;

        const updatedTaxAmount = await Tax.findByIdAndUpdate(id, { percentage, status }, { new: true });

        if (!updatedTaxAmount) {
            return res.status(404).json({ status: 404, message: 'Tax Amount configuration not found' });
        }

        return res.status(200).json({ status: 200, data: updatedTaxAmount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.deleteTaxAmount = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTaxAmount = await Tax.findByIdAndDelete(id);

        if (!deletedTaxAmount) {
            return res.status(404).json({ status: 404, message: 'Tax Amount configuration not found' });
        }

        return res.status(200).json({ status: 200, message: 'Tax Amount configuration deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.createReferralLevel = async (req, res) => {
    try {
        const { referralBonus, allLevels } = req.body;

        const checkReferralBonus = await ReferralBonus.findById(referralBonus);
        if (!checkReferralBonus) {
            return res.status(404).json({ status: 404, message: 'Referral bonus configuration not found' });
        }

        const checkReferralLevel = await ReferralLevel.findOne({ referralBonus });
        if (checkReferralLevel) {
            return res.status(400).json({ status: 400, message: 'Referral level configuration already exists for this referral bonus' });
        }

        const newReferralLevel = new ReferralLevel({
            referralBonus,
            allLevels,
            type: checkReferralBonus.type
        });

        const savedReferralLevel = await newReferralLevel.save();

        return res.status(201).json({ status: 201, data: savedReferralLevel });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getAllReferralLevels = async (req, res) => {
    try {
        const referralLevels = await ReferralLevel.find();

        return res.status(200).json({ status: 200, data: referralLevels });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getReferralLevelById = async (req, res) => {
    try {
        const referralLevelId = req.params.referralLevelId;

        const referralLevel = await ReferralLevel.findById(referralLevelId);

        if (!referralLevel) {
            return res.status(404).json({ status: 404, message: 'Referral level not found' });
        }

        return res.status(200).json({ status: 200, data: referralLevel });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.updateReferralLevelById = async (req, res) => {
    try {
        const referralLevelId = req.params.referralLevelId;
        const updateData = req.body;

        if (updateData.referralBonus) {
            const checkReferralBonus = await ReferralBonus.findById(referralBonus);
            if (!checkReferralBonus) {
                return res.status(404).json({ status: 404, message: 'Referral bonus configuration not found' });
            }
        }

        const updatedReferralLevel = await ReferralLevel.findByIdAndUpdate(referralLevelId, updateData, { new: true });

        if (!updatedReferralLevel) {
            return res.status(404).json({ status: 404, message: 'Referral level not found' });
        }

        return res.status(200).json({ status: 200, data: updatedReferralLevel });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.deleteReferralLevelById = async (req, res) => {
    try {
        const referralLevelId = req.params.referralLevelId;

        const deletedReferralLevel = await ReferralLevel.findByIdAndDelete(referralLevelId);

        if (!deletedReferralLevel) {
            return res.status(404).json({ status: 404, message: 'Referral level not found' });
        }

        return res.status(200).json({ status: 200, message: 'Referral level deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const bookings = await Booking.find().populate('car user pickupLocation dropOffLocation');

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

exports.getBookingsByUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', data: null });
        }

        const bookings = await Booking.find({ user: userId }).populate('car user pickupLocation dropOffLocation')
            .populate({
                path: 'car',
                populate: {
                    path: 'owner', model: 'User'
                }
            });

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

        const bookings = await Booking.find({ _id: bookingId }).populate('car user pickupLocation dropOffLocation');

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

exports.getCompletedBookingsByUser = async (req, res) => {
    try {
        const userId = req.params.id;

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
        const userId = req.params.id;

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

exports.getBookingByPartnerId = async (req, res) => {
    try {
        const partnerId = req.params.id;

        const user = await User.findById(partnerId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const cars = await Car.find({ owner: { $in: [partnerId] } });
        if (cars.length === 0) {
            return res.status(404).json({ message: 'No cars found for the partner' });
        }

        const bookingPromises = cars.map(async (car) => {
            const bookings = await Booking.find({ partner: partnerId, car: car._id }).populate({
                path: 'car',
                populate: { path: 'owner pickup drop' }
            }).populate('user');
            return bookings;
        });

        const bookings = await Promise.all(bookingPromises);

        const flattenedBookings = bookings.flat();

        if (flattenedBookings.length === 0) {
            return res.status(404).json({ status: 404, message: 'No bookings found for the partner', data: null });
        }

        return res.status(200).json({
            status: 200,
            message: 'Booking retrieved successfully for the partner',
            data: flattenedBookings,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getTopBookedCarsForPartner = async (req, res) => {
    try {
        const userId = req.params.id;

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

exports.getUpcomingBookingsForPartner = async (req, res) => {
    try {
        const partnerId = req.params.id;
        const currentDate = new Date();

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

exports.getCompletedBookingsForPartner = async (req, res) => {
    try {
        const partnerId = req.params.id;

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
        const partnerId = req.params.id;

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
        const partnerId = req.params.id;

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

exports.getApprovedBookingsForPartner = async (req, res) => {
    try {
        const partnerId = req.params.id;

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

exports.getRejectedBookingsForPartner = async (req, res) => {
    try {
        const partnerId = req.params.id;

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
        const tenderApplications = await TenderApplication.find().populate('car user');

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
        const tenderApplication = await TenderApplication.findById(req.params.id).populate('car user');

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

exports.createTdsAmount = async (req, res) => {
    try {
        const { percentage, status } = req.body;

        const TdsAmount = await Tds.create({ percentage, status });

        return res.status(201).json({ status: 201, data: TdsAmount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getAllTdsAmount = async (req, res) => {
    try {
        const TdsAmount = await Tds.find();

        return res.status(200).json({ status: 200, data: TdsAmount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.updateTdsAmount = async (req, res) => {
    try {
        const { id } = req.params;
        const { percentage, status } = req.body;

        const updatedTdsAmount = await Tds.findByIdAndUpdate(id, { percentage, status }, { new: true });

        if (!updatedTdsAmount) {
            return res.status(404).json({ status: 404, message: 'Tds Amount configuration not found' });
        }

        return res.status(200).json({ status: 200, data: updatedTdsAmount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.deleteTdsAmount = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTdsAmount = await Tds.findByIdAndDelete(id);

        if (!deletedTdsAmount) {
            return res.status(404).json({ status: 404, message: 'Tds Amount configuration not found' });
        }

        return res.status(200).json({ status: 200, message: 'Tds Amount configuration deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.createNotification = async (req, res) => {
    try {
        const admin = await User.findById(req.user._id);
        if (!admin) {
            return res.status(404).json({ status: 404, message: "Admin not found" });
        }

        const createNotification = async (userId) => {
            const notificationData = {
                recipient: userId,
                title: req.body.title,
                content: req.body.content,
            };
            return await Notification.create(notificationData);
        };

        if (req.body.total === "ALL") {
            const userData = await User.find({ userType: req.body.sendTo });
            if (userData.length === 0) {
                return res.status(404).json({ status: 404, message: "Users not found" });
            }

            for (const user of userData) {
                await createNotification(user._id);
            }

            await createNotification(admin._id);

            return res.status(200).json({ status: 200, message: "Notifications sent successfully to all users." });
        }

        if (req.body.total === "SINGLE") {
            const user = await User.findById(req.body._id);
            if (!user || user.userType !== req.body.sendTo) {
                return res.status(404).json({ status: 404, message: "User not found or invalid user type" });
            }

            const notificationData = await createNotification(user._id);

            return res.status(200).json({ status: 200, message: "Notification sent successfully.", data: notificationData });
        }

        return res.status(400).json({ status: 400, message: "Invalid 'total' value" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Server error", data: {} });
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

exports.getNotificationsForUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const notifications = await Notification.find({ recipient: userId });

        return res.status(200).json({ status: 200, message: 'Notifications retrieved successfully', data: notifications });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error retrieving notifications', error: error.message });
    }
};

exports.getAllNotificationsForUser = async (req, res) => {
    try {
        const notifications = await Notification.find();

        return res.status(200).json({ status: 200, message: 'Notifications retrieved successfully', data: notifications });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error retrieving notifications', error: error.message });
    }
};

exports.deleteNotificationById = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const deletedNotification = await Notification.findByIdAndDelete(notificationId);

        if (!deletedNotification) {
            return res.status(404).json({ status: 404, message: 'Notification not found' });
        }

        return res.status(200).json({ status: 200, message: 'Notification deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', error: error.message });
    }
};

exports.deleteAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({});
        return res.status(200).json({ status: 200, message: 'All notifications deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', error: error.message });
    }
};

exports.updateUserRoles = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            isDashboard,
            isPrivacyPolicy,
            isOnboardingManage,
            isTermAndConditions,
            isManageCustomer,
            isPushNotification,
            isManagePromoCode,
            isRoleAccessManage
        } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        user.isDashboard = isDashboard || user.isDashboard;
        user.isPrivacyPolicy = isPrivacyPolicy || user.isPrivacyPolicy;
        user.isOnboardingManage = isOnboardingManage || user.isOnboardingManage;
        user.isCarManagement = isCarManagement || user.isCarManagement;
        user.isTermAndConditions = isTermAndConditions || user.isTermAndConditions;
        user.isManageCustomer = isManageCustomer || user.isManageCustomer;
        user.isPushNotification = isPushNotification || user.isPushNotification;
        user.isManagePromoCode = isManagePromoCode || user.isManagePromoCode;
        user.isRoleAccessManage = isRoleAccessManage || user.isRoleAccessManage;

        const updatedUser = await user.save();

        return res.status(200).json({ status: 200, message: 'User roles updated successfully', data: updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
    }
};

exports.createGPSData = async (req, res) => {
    try {
        const { carId, longitude, latitude } = req.body;

        if (!mongoose.Types.ObjectId.isValid(carId)) {
            return res.status(400).json({ status: 400, message: 'Invalid carId' });
        }

        const car = await Car.findOne({ _id: carId });
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

exports.getAllDirectReferralUsers = async (req, res) => {
    try {
        const users = await User.find();

        if (!users || users.length === 0) {
            return res.status(200).json({
                status: 200,
                message: 'No users found',
                data: [],
            });
        }

        const usersWithReferralData = [];

        for (const user of users) {
            const userReferralData = {
                _id: user._id,
                fullName: user.fullName,
                mobileNumber: user.mobileNumber,
                email: user.email,
                referralLevels: user.referralLevels,
                wallet: user.wallet,
                createdAt: user.createdAt
            };

            usersWithReferralData.push(userReferralData);
        }

        return res.status(200).json({
            status: 200,
            message: 'Users with referral data retrieved successfully',
            data: usersWithReferralData,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getDirectReferralUsersByUserId = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        if (!user.referralLevels || user.referralLevels.length === 0) {
            return res.status(200).json({
                status: 200,
                message: 'No direct referral users found',
                data: [],
            });
        }

        const directReferralUsers = [];
        const level1Referrals = user.referralLevels.find(level => level.level === 1);
        if (level1Referrals && level1Referrals.users.length > 0) {
            for (const referralId of level1Referrals.users) {
                const referralUser = await User.findById(referralId);
                if (referralUser) {
                    directReferralUsers.push(referralUser);
                }
            }
        }

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

exports.getAllUserReferralDetails = async (req, res) => {
    try {
        const users = await User.find().populate({
            path: 'referralLevels.users',
            model: 'User'
        });

        if (!users || users.length === 0) {
            return res.status(200).json({
                status: 200,
                message: 'No users found',
                data: [],
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Referral users details populated',
            data: users,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getReferralDetailsByUserId = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId)
            .populate({
                path: 'referralLevels.users',
                model: 'User'
            });

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

exports.getAllUserReferralIncome = async (req, res) => {
    try {
        const users = await User.find();

        if (!users || users.length === 0) {
            return res.status(200).json({
                status: 200,
                message: 'No users found',
                data: [],
            });
        }

        const levelWiseIncome = [];

        for (const user of users) {
            if (user.referralLevels && user.referralLevels.length > 0) {
                for (const level of user.referralLevels) {
                    const levelTransactions = await Transaction.find({ user: { $in: level.users } });

                    const totalIncome = levelTransactions.reduce((acc, curr) => acc + curr.amount, 0);

                    levelWiseIncome.push({ userId: user._id, level: level.level, totalIncome });
                }
            }
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

exports.getReferralIncomeByUserId = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
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
            const levelTransactions = await Transaction.find({ user: { $in: level.users } });
            const totalIncome = levelTransactions.reduce((acc, curr) => acc + curr.amount, 0);
            levelWiseIncome.push({ level: level.level, totalIncome });
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

exports.getTransactionDetailsByUserId = async (req, res) => {
    try {
        const userId = req.params.id;

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
        const userId = req.params.id;

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

exports.getAllRatingsForCars = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const { page = 1, limit = 10 } = req.query;

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            populate: [
                { path: 'user', select: 'fullName mobileNumber email image' },
                { path: 'car' }
            ]
        };

        const ratings = await Review.paginate({}, options);

        return res.status(200).json({ status: 200, data: ratings.docs, totalPages: ratings.totalPages, currentPage: ratings.page });
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

        const car = await Car.findOne({ _id: carId });
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

        const car = await Car.findOne({ _id: carId, });
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

exports.updateReview = async (req, res) => {
    try {
        const { reviewId, rating, comment } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const review = await Review.findOne({ _id: reviewId });
        if (!review) {
            return res.status(404).json({ status: 404, message: 'Review not found or not authorized' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ status: 400, message: 'Invalid rating. Rating should be between 1 and 5.' });
        }

        review.rating = rating;
        review.comment = comment || review.comment;

        await review.save();

        const reviewsForCar = await Review.find({ car: review.car });
        const numOfUserReviews = reviewsForCar.length;

        let totalRating = 0;
        reviewsForCar.forEach(review => {
            totalRating += review.rating;
        });

        const averageRating = totalRating / numOfUserReviews;

        review.numOfUserReviews = numOfUserReviews;
        review.averageRating = Math.round(averageRating);

        await review.save();

        res.status(200).json({ status: 200, message: 'Review updated successfully', data: review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, error: 'Internal Server Error' });
    }
};

exports.getUserAllReview = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const reviews = await UserReview.find();

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

exports.getUserReviewById = async (req, res) => {
    try {
        const { hostId } = req.params;

        const user = await User.findById(hostId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

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

exports.updateUserReview = async (req, res) => {
    try {
        const { reviewId, userRating, userComment } = req.body;

        const userId = req.user._id;

        const review = await UserReview.findOne({ _id: reviewId, host: userId });
        if (!review) {
            return res.status(404).json({ status: 404, message: 'Review not found' });
        }

        if (userRating < 0 || userRating > 5) {
            return res.status(400).json({ status: 400, message: 'Invalid userRating. UserRating should be between 0 and 5.' });
        }

        review.userRating = userRating;
        review.userComment = userComment;

        await review.save();

        const reviewsForCar = await UserReview.find({ host: userId });
        const numOfUserReviews = reviewsForCar.length;

        let totalRating = 0;
        reviewsForCar.forEach(r => {
            totalRating += r.userRating;
        });

        const averageRating = totalRating / numOfUserReviews;

        review.numOfUserReviews = numOfUserReviews;
        review.averageuserRating = Math.round(averageRating);

        await review.save();

        return res.status(200).json({ status: 200, message: 'Review updated successfully', data: review });
    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({ status: 500, message: 'Server error', error: error.message });
    }
};

exports.createAccessoryCategory = async (req, res) => {
    try {
        const { name, description, status } = req.body;

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const existingCategory = await AccessoryCategory.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ status: 400, message: 'Accessory category with this name already exists', data: null });
        }

        const newCategory = await AccessoryCategory.create({ name, description, status, image: req.file.path, });

        return res.status(201).json({ status: 201, message: 'Accessory category created successfully', data: newCategory });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
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

exports.updateAccessoryCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const { name, description, status } = req.body;

        let imagePath;

        if (req.file) {
            imagePath = req.file.path;
        }

        const updatedCategory = await AccessoryCategory.findByIdAndUpdate(
            categoryId,
            { name, description, status, image: imagePath },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ status: 404, message: 'Accessory category not found', data: null });
        }

        return res.status(200).json({ status: 200, message: 'Accessory category updated successfully', data: updatedCategory });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.deleteAccessoryCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        const deletedCategory = await AccessoryCategory.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            return res.status(404).json({ status: 404, message: 'Accessory category not found', data: null });
        }

        return res.status(200).json({ status: 200, message: 'Accessory category deleted successfully', data: deletedCategory });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.createAccessory = async (req, res) => {
    try {
        const { name, description, categoryId, price, stock, size, status } = req.body;

        if (!req.file) {
            return res.status(400).json({ status: 400, error: "Image file is required" });
        }

        const category = await AccessoryCategory.findById(categoryId);
        if (!category) {
            return res.status(400).json({ status: 400, message: 'Invalid accessory category ID', data: null });
        }

        const newAccessory = await Accessory.create({
            name,
            description,
            category: categoryId,
            price,
            stock,
            image: req.file.path,
            size,
            status
        });

        return res.status(201).json({ status: 201, message: 'Accessory created successfully', data: newAccessory });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.getAllAccessories = async (req, res) => {
    try {
        const accessories = await Accessory.find().populate('category');

        if (!accessories) {
            return res.status(404).json({ status: 404, message: 'Accessory not found', data: null });
        }

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

exports.updateAccessory = async (req, res) => {
    try {
        const accessoryId = req.params.accessoryId;
        const { name, description, categoryId, price, stock, size, status } = req.body;

        let imagePath;

        if (req.file) {
            imagePath = req.file.path;
        }

        const category = await AccessoryCategory.findById(categoryId);
        if (!category) {
            return res.status(400).json({ status: 400, message: 'Invalid accessory category ID', data: null });
        }

        const updatedAccessory = await Accessory.findByIdAndUpdate(
            accessoryId,
            { name, description, categoryId, price, stock, size, status, image: imagePath, },
            { new: true }
        ).populate('category');

        if (!updatedAccessory) {
            return res.status(404).json({ status: 404, message: 'Accessory not found', data: null });
        }

        return res.status(200).json({ status: 200, message: 'Accessory updated successfully', data: updatedAccessory });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
    }
};

exports.deleteAccessory = async (req, res) => {
    try {
        const accessoryId = req.params.accessoryId;

        const deletedAccessory = await Accessory.findByIdAndDelete(accessoryId);

        if (!deletedAccessory) {
            return res.status(404).json({ status: 404, message: 'Accessory not found', data: null });
        }

        return res.status(200).json({ status: 200, message: 'Accessory deleted successfully', data: deletedAccessory });
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

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user').populate('items.accessory').populate('shippingAddress');

        const orderCount = await Order.countDocuments();

        return res.status(200).json({
            status: 200,
            message: 'Orders retrieved successfully',
            count: orderCount,
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
        const { status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
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

exports.getAllCounts = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const orderCount = await Order.countDocuments();
        const accessoryCount = await Accessory.countDocuments();
        const carCount = await Car.countDocuments();
        const bookingCount = await Booking.countDocuments();

        return res.status(200).json({
            status: 200,
            message: 'Counts retrieved successfully',
            data: {
                users: userCount,
                orders: orderCount,
                accessories: accessoryCount,
                cars: carCount,
                bookings: bookingCount
            }
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