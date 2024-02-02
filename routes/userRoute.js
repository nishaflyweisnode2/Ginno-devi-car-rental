const auth = require("../controllers/userController");
const express = require("express");
const router = express()


const authJwt = require("../middlewares/auth");

const { profileImage, publishAddImage, animalMelaImage, animalFeedsImage, overAllImage } = require('../middlewares/imageUpload');



module.exports = (app) => {

    // api/v1/user/

    app.post('/api/v1/user/signup', auth.signup)
    app.post("/api/v1/user/loginWithPhone", auth.loginWithPhone);
    app.post("/api/v1/user/:id", auth.verifyOtp);
    app.post("/api/v1/user/resendOtp/:id", auth.resendOTP);
    app.post('/api/v1/user/socialLogin', auth.socialLogin);
    app.put("/api/v1/user/upload-profile-picture", [authJwt.verifyToken], profileImage.single('image'), auth.uploadProfilePicture);
    app.put("/api/v1/user/edit-profile", [authJwt.verifyToken], auth.editProfile);
    app.get("/api/v1/user/profile", [authJwt.verifyToken], auth.getUserProfile);
    app.get("/api/v1/user/profile/:userId", [authJwt.verifyToken], auth.getUserProfileById);
    app.put("/api/v1/user/updateLocation", [authJwt.verifyToken], auth.updateLocation);
    app.get("/api/v1/user/city/cities", [authJwt.verifyToken], auth.getAllCities);
    app.get("/api/v1/user/city/cities/:id", [authJwt.verifyToken], auth.getCityById);
    app.get('/api/v1/user/cars', [authJwt.verifyToken], auth.getAllCars);
    app.get('/api/v1/user/cars/:carId', [authJwt.verifyToken], auth.getCarById);
    app.post('/api/v1/user/review/createReview', [authJwt.verifyToken], auth.createReview);
    app.get('/api/v1/user/review/getReviewsByCar/:carId', auth.getReviewsByCar);
    app.post('/api/v1/user/host/review', [authJwt.verifyToken], auth.createHostReview);
    app.get('/api/v1/user/host/review/:hostId', auth.getHostReviewById);
    app.get('/api/v1/user/mainCategories', [authJwt.verifyToken], auth.getAllMainCategories);
    app.get('/api/v1/user/mainCategories/:mainCategoryId', [authJwt.verifyToken], auth.getMainCategoryById);
    app.get('/api/v1/user/categories', [authJwt.verifyToken], auth.getAllCategories);
    app.get('/api/v1/user/mainCategories/:id/category', [authJwt.verifyToken], auth.getCategoryByMainCategory);
    app.get('/api/v1/user/categories/:categoryId', [authJwt.verifyToken], auth.getCategoryById);
    app.get('/api/v1/user/subscriptionCategory', [authJwt.verifyToken], auth.getAllSubscriptionCategories);
    app.get('/api/v1/user/mainCategories/:id/subcategories', [authJwt.verifyToken], auth.getSubcategoriesByMainCategory);
    app.get('/api/v1/user/subscriptionCategory/:subscriptioncategoryId', [authJwt.verifyToken], auth.getSubscriptionCategoryById);
    app.get('/api/v1/user/offers', [authJwt.verifyToken], auth.getAllOffers);
    app.get('/api/v1/user/offers/:id', [authJwt.verifyToken], auth.getOfferById);
    app.get('/api/v1/user/coupons', [authJwt.verifyToken], auth.getAllCoupons);
    app.get('/api/v1/user/coupons/:id', [authJwt.verifyToken], auth.getCouponById);
    app.get('/api/v1/user/admin-packages', [authJwt.verifyToken], auth.getAllAdminPackages);
    app.get('/api/v1/user/admin-packages/:id', [authJwt.verifyToken], auth.getAdminPackageById);
    app.get('/api/v1/user/plans', [authJwt.verifyToken], auth.getAllPlans);
    app.get('/api/v1/user/plans/:id', [authJwt.verifyToken], auth.getPlanById);
    app.get('/api/v1/user/plans/mainCategory/:mainCategory', [authJwt.verifyToken], auth.getPlanByMainCategory);
    app.get('/api/v1/user/car/availability', [authJwt.verifyToken], auth.checkCarAvailability);
    app.get('/api/v1/user/car/sharing/availability', [authJwt.verifyToken], auth.checkSharingCarAvailability);
    app.post("/api/v1/user/booking/create", [authJwt.verifyToken], auth.createBooking);
    app.get('/api/v1/user/bookings/user', [authJwt.verifyToken], auth.getBookingsByUser);
    app.get('/api/v1/user/bookings/user/:bookingId', [authJwt.verifyToken], auth.getBookingsById);
    app.get('/api/v1/user/bookings/completed/user', [authJwt.verifyToken], auth.getCompletedBookingsByUser);
    app.get('/api/v1/user/bookings/upcoming/user', [authJwt.verifyToken], auth.getUpcomingBookingsByUser);
    app.put('/api/v1/user/bookings/:id', [authJwt.verifyToken], auth.updateBookingById);
    app.post('/api/v1/user/coupon/apply-coupon', [authJwt.verifyToken], auth.applyCouponToBooking);
    app.post('/api/v1/user/coupon/remove-coupon', [authJwt.verifyToken], auth.removeCouponFromBooking);
    app.post('/api/v1/user/wallet/apply-wallet', [authJwt.verifyToken], auth.applyWalletToBooking);
    app.put('/api/v1/user/bookings/updatePaymentStatus/:bookingId', [authJwt.verifyToken], auth.updatePaymentStatus);
    app.post('/api/v1/user/bookings/:bookingId/extend', [authJwt.verifyToken], auth.extendBooking);
    app.put('/api/v1/user/bookings/:bookingId/cancel', [authJwt.verifyToken], auth.cancelBooking);
    app.get('/api/v1/user/booking/:bookingId/refund', [authJwt.verifyToken], auth.getRefundStatusAndAmount);
    app.get('/api/v1/user/bookings/cancel/user', [authJwt.verifyToken], auth.getCancelBookingsByUser);
    app.get('/api/v1/user/cancel-reasons', [authJwt.verifyToken], auth.getAllCancelReasons);
    app.get('/api/v1/user/cancel-reasons/:id', [authJwt.verifyToken], auth.getCancelReasonById);
    app.post('/api/v1/user/upload/image', [authJwt.verifyToken], overAllImage.array('image'), auth.uploadImage);
    app.post('/api/v1/user/inspections/exterior', [authJwt.verifyToken], auth.createInspectionExterior);
    app.put('/api/v1/user/inspections/interior/:inspectionId', [authJwt.verifyToken], auth.updateCarInspectionById);
    app.get('/api/v1/user/inspections', [authJwt.verifyToken], auth.getAllInspections);
    app.get('/api/v1/user/inspections/:inspectionId', [authJwt.verifyToken], auth.getInspectionById);
    app.put('/api/v1/user/inspections/:inspectionId', [authJwt.verifyToken], auth.updateInspectionById);
    app.delete('/api/v1/user/inspections/:inspectionId', [authJwt.verifyToken], auth.deleteInspectionById);
    app.get('/api/v1/user/options', [authJwt.verifyToken], auth.getAllOptions);
    app.get('/api/v1/user/options/:id', [authJwt.verifyToken], auth.getOptionById);
    app.get('/api/v1/user/subScription-faq', [authJwt.verifyToken], auth.getAllSubScriptionFAQ);
    app.get('/api/v1/user/subScription-faq/:id', [authJwt.verifyToken], auth.getSubScriptionFAQById);
    app.get('/api/v1/user/best-subscribed-cars', [authJwt.verifyToken], auth.getMostSubscribeCar);
    app.get('/api/v1/user/cars-by-main-category/:mainCategory', [authJwt.verifyToken], auth.getCarsByMainCategory);
    app.get('/api/v1/user/cars-by-category/:category', [authJwt.verifyToken], auth.getCarsByCategory);


}
