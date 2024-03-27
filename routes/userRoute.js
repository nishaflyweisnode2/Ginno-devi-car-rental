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
    app.get('/api/v1/user/direct-referrals', [authJwt.verifyToken], auth.getDirectReferralUsers);
    app.get('/api/v1/user/all-referrals', [authJwt.verifyToken], auth.getReferralDetails);
    app.get('/api/v1/user/level-wise-income',[authJwt.verifyToken], auth.getReferralIncome);
    app.put("/api/v1/user/updateLocation", [authJwt.verifyToken], auth.updateLocation);
    app.get("/api/v1/user/city/cities", [authJwt.verifyToken], auth.getAllCities);
    app.get("/api/v1/user/city/cities/:id", [authJwt.verifyToken], auth.getCityById);
    app.get('/api/v1/user/cars', [authJwt.verifyToken], auth.getAllCars);
    app.get('/api/v1/user/cars/:carId', [authJwt.verifyToken], auth.getCarById);
    app.post('/api/v1/user/review/createReview', [authJwt.verifyToken], auth.createReview);
    app.get('/api/v1/user/review/getReviewsByCar/:carId', auth.getReviewsByCar);
    app.post('/api/v1/user/host/review', [authJwt.verifyToken], auth.createHostReview);
    app.get('/api/v1/user/host/review/:hostId', [authJwt.verifyToken], auth.getHostReviewById);
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
    app.post("/api/v1/user/sharing/booking/create", [authJwt.verifyToken], auth.createBookingForSharingCar);
    app.get('/api/v1/user/bookings/user', [authJwt.verifyToken], auth.getBookingsByUser);
    app.get('/api/v1/user/bookings/user/:bookingId', [authJwt.verifyToken], auth.getBookingsById);
    app.get('/api/v1/user/bookings/completed/user', [authJwt.verifyToken], auth.getCompletedBookingsByUser);
    app.get('/api/v1/user/bookings/upcoming/user', [authJwt.verifyToken], auth.getUpcomingBookingsByUser);
    app.put('/api/v1/user/bookings/:id', [authJwt.verifyToken], auth.updateBookingById);
    app.post('/api/v1/user/coupon/apply-coupon', [authJwt.verifyToken], auth.applyCouponToBooking);
    app.post('/api/v1/user/coupon/remove-coupon', [authJwt.verifyToken], auth.removeCouponFromBooking);
    app.post('/api/v1/user/wallet/apply-wallet', [authJwt.verifyToken], auth.applyWalletToBooking);
    app.post('/api/v1/user/Coin/apply-quack-coin', [authJwt.verifyToken], auth.applyQuackCoinToBooking);
    app.post('/api/v1/user/coin/remove-quack-coin', [authJwt.verifyToken], auth.removeQuackCoinFromBooking);
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
    app.get('/api/v1/user/cars-by-plan/:plan', [authJwt.verifyToken], auth.getCarsByPlan);
    app.get('/api/v1/user/car-features/byCar/:carId', [authJwt.verifyToken], auth.getAllCarFeaturesByCarId);
    app.get('/api/v1/user/car-features/:carFeatureId', [authJwt.verifyToken], auth.getCarFeatureById);
    app.get('/api/v1/user/call-us', [authJwt.verifyToken], auth.getAllCallUs);
    app.get('/api/v1/user/call-us/:id', [authJwt.verifyToken], auth.getCallUsById);
    app.post('/api/v1/user/feedback/create', [authJwt.verifyToken], auth.createFeedback);
    app.get('/api/v1/user/feedback', [authJwt.verifyToken], auth.getAllFeedback);
    app.get('/api/v1/user/feedback/:id', [authJwt.verifyToken], auth.getFeedbackById);
    app.put('/api/v1/user/feedback/:id', [authJwt.verifyToken], auth.updateFeedback);
    app.delete('/api/v1/user/feedback/:id', [authJwt.verifyToken], auth.deleteFeedback);
    app.get('/api/v1/user/faqs', [authJwt.verifyToken], auth.getAllFAQs);
    app.get('/api/v1/user/faqs/:id', [authJwt.verifyToken], auth.getFAQById);
    app.get('/api/v1/user/rental/cars/mainCategory/:mainCategoryId', [authJwt.verifyToken], auth.getAllRentalCars);
    app.get('/api/v1/user/subscription/cars/mainCategory/:mainCategoryId', [authJwt.verifyToken], auth.getAllSubscriptionCars);
    app.get('/api/v1/user/transactions/user', [authJwt.verifyToken], auth.getTransactionDetailsByUserId);
    app.get('/api/v1/user/income/user', [authJwt.verifyToken], auth.getIncomeDetailsByUserId);
    app.get('/api/v1/user/Policy', [authJwt.verifyToken], auth.getAllPolicy);
    app.get('/api/v1/user/Policy/:id', [authJwt.verifyToken], auth.getPolicyById);
    app.get('/api/v1/user/bookings/search', [authJwt.verifyToken], auth.searchBookings);
    app.get('/api/v1/user/locations/getAll', [authJwt.verifyToken], auth.getAllLocations);
    app.get('/api/v1/user/locations/:locationId', [authJwt.verifyToken], auth.getLocationById);
    app.get('/api/v1/user/brand', [authJwt.verifyToken], auth.getCarBrands);
    app.get('/api/v1/user/brand/:carBrandId', [authJwt.verifyToken], auth.getCarBrandById);
    app.get('/api/v1/user/booking/upcoming/pending-payments', [authJwt.verifyToken], auth.getPendingUpcomingForSubscriptionPayments);
    app.post('/api/v1/user/booking/payNextMonth', [authJwt.verifyToken], auth.upcomingPaymentsForSubscription);
    app.get('/api/v1/user/referral-bonus', [authJwt.verifyToken], auth.getAllReferralBonuses);
    app.get('/api/v1/user/direct-referral', [authJwt.verifyToken], auth.getDirectReferrals);
    app.get('/api/v1/user/prices', [authJwt.verifyToken], auth.getAllPrices);
    app.get('/api/v1/user/prices/byCategory/:id', [authJwt.verifyToken], auth.getAllPricesByCategoryId);
    app.get('/api/v1/user/prices/:id', [authJwt.verifyToken], auth.getPriceById);
    app.get('/api/v1/user/driverPrices', [authJwt.verifyToken], auth.getAllDriverPrice);
    app.get('/api/v1/user/driverPrices/bycategory/:id', [authJwt.verifyToken], auth.getDriverPriceByCategoryId);
    app.get('/api/v1/user/driverPrices/:id', [authJwt.verifyToken], auth.getDriverPriceById);
    app.post('/api/v1/user/address/create', [authJwt.verifyToken], auth.createAddress);
    app.get('/api/v1/user/address/getAll', [authJwt.verifyToken], auth.getAllAddress);
    app.get('/api/v1/user/address/:id', [authJwt.verifyToken], auth.getAddressById);
    app.put('/api/v1/user/address/:id', [authJwt.verifyToken], auth.updateAddressById);
    app.delete('/api/v1/user/address/:id', [authJwt.verifyToken], auth.deleteAddressById);
    app.get('/api/v1/user/address/type/:type', [authJwt.verifyToken], auth.getAddressByType);
    app.post('/api/v1/user/govt-tendor/add', [authJwt.verifyToken], auth.createTenderApplication);
    app.get('/api/v1/user/govt-tendor', [authJwt.verifyToken], auth.getAllTenderApplications);
    app.get('/api/v1/user/govt-tendor/:id', [authJwt.verifyToken], auth.getTenderApplicationById);
    app.put('/api/v1/user/govt-tendor/:id', [authJwt.verifyToken], auth.updateTenderApplication);
    app.delete('/api/v1/user/govt-tendor/:id', [authJwt.verifyToken], auth.deleteTenderApplication);
    app.put('/api/v1/user/notifications/:notificationId', [authJwt.verifyToken], auth.markNotificationAsRead);
    app.put('/api/v1/user/notifications/markAll/read', [authJwt.verifyToken], auth.markAllNotificationsAsRead);
    app.get('/api/v1/user/notifications/user/:userId', [authJwt.verifyToken], auth.getNotificationsForUser);
    app.get('/api/v1/user/notifications/user', [authJwt.verifyToken], auth.getAllNotificationsForUser);

}
