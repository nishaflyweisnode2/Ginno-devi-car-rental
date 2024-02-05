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






exports.registration = async (req, res) => {
    const { phone, email } = req.body;
    try {
        req.body.email = email.split(" ").join("").toLowerCase();
        let user = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: phone }] }], userType: "ADMIN" });
        if (!user) {
            req.body.password = bcrypt.hashSync(req.body.password, 8);
            req.body.userType = "ADMIN";
            req.body.accountVerification = true;
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
        const { firstName, lastName, email, mobileNumber, password } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send({ message: "not found" });
        }
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
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

exports.getAllUser = async (req, res) => {
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

        const partnerCars = await Car.find({ owner: userId });

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
            const existingCarWithLicenseNumber = await Car.findOne({ licenseNumber });
            if (existingCarWithLicenseNumber) {
                return res.status(400).json({ message: 'License number already in use' });
            }
        }

        if (req.body.city) {
            const checkCity = await City.findById(city);
            if (!checkCity) {
                return res.status(404).json({ message: 'City not found' });
            }
        }

        if (req.body.brand) {
            const carBrand = await Brand.findById(brand);
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
        const deletedCar = await Car.findByIdAndDelete(req.params.carId);
        if (!deletedCar) {
            return res.status(404).json({ message: 'Car not found' });
        }
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
        const { question, answer } = req.body;
        const newFAQ = await FAQ.create({ question, answer });
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