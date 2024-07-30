const auth = require("../controllers/adminController");
const express = require("express");
const router = express()


const authJwt = require("../middlewares/auth");

const { profileImage, cityImage, brandImage, referenceImage, publishAddImage, animalMelaImage, animalFeedsImage, carDocumentImage, kpUpload0, carDlImage, kpUpload, addressPrrof, carImage, categoryImage, overAllImage, userProfileUpload, cheque, accessoryCategoryImage, accessoryImage
} = require('../middlewares/imageUpload');



module.exports = (app) => {

    // api/v1/admin/

    app.post("/api/v1/admin/registration", auth.registration);
    app.post("/api/v1/admin/login", auth.signin);
    app.put("/api/v1/admin/update", [authJwt.isAdmin], auth.update);
    app.get("/api/v1/admin/profile", [authJwt.isAdmin], auth.getAllUser);
    app.get("/api/v1/admin/profile", [authJwt.isAdmin], auth.getUserProfile);
    app.get("/api/v1/admin/profile/by-userType", [authJwt.isAdmin], auth.getAllUserByType);
    app.get("/api/v1/admin/profile/:userId", [authJwt.isAdmin], auth.getUserById);
    app.delete('/api/v1/admin/users/profile/delete/:id', [authJwt.isAdmin], auth.deleteUser);
    app.put("/api/v1/admin/update/user/:id", [authJwt.isAdmin], auth.updateUserById);
    app.put("/api/v1/admin/upload-profile-picture/:id", [authJwt.isAdmin], profileImage.single('image'), auth.uploadProfilePicture);
    app.put("/api/v1/admin/upload-id-picture/:id", [authJwt.isAdmin], userProfileUpload.single('image'), auth.uploadIdPicture);
    app.put("/api/v1/admin/update-documents/:id", [authJwt.isAdmin], auth.updateDocuments);
    app.put('/api/v1/admin/updateBankDetails/:id', [authJwt.isAdmin], cheque.single('image'), auth.updateBankDetails);
    app.get('/api/v1/admin/users/pending-verification', [authJwt.isAdmin], auth.getPendingVerificationUsers);
    app.put('/api/v1/admin/users/:id/update-verification-status', [authJwt.isAdmin], auth.updateVerificationStatus);
    app.get('/api/v1/admin/verified-users', [authJwt.isAdmin], auth.getVerifiedUsers);
    app.post("/api/v1/admin/partner/registration", auth.registrationPartnerByAdmin);
    app.post("/api/v1/admin/city/cities", [authJwt.isAdmin], cityImage.single('image'), auth.createCity);
    app.get("/api/v1/admin/city/cities", [authJwt.isAdmin], auth.getAllCities);
    app.get("/api/v1/admin/city/cities/:id", [authJwt.isAdmin], auth.getCityById);
    app.put("/api/v1/admin/city/cities/:id", [authJwt.isAdmin], cityImage.single('image'), auth.updateCityById);
    app.delete("/api/v1/admin/city/cities/:id", [authJwt.isAdmin], auth.deleteCityById);
    app.post('/api/v1/admin/brand', [authJwt.isAdmin], brandImage.single('image'), auth.createCarBrand);
    app.get('/api/v1/admin/brand', [authJwt.isAdmin], auth.getCarBrands);
    app.get('/api/v1/admin/brand/:carBrandId', [authJwt.isAdmin], auth.getCarBrandById);
    app.put('/api/v1/admin/brand/:carBrandId', [authJwt.isAdmin], brandImage.single('image'), auth.updateCarBrand);
    app.delete('/api/v1/admin/brand/:carBrandId', [authJwt.isAdmin], auth.deleteCarBrand);
    app.post('/api/v1/admin/coupons', [authJwt.isAdmin], auth.createCoupon);
    app.get('/api/v1/admin/coupons', [authJwt.isAdmin], auth.getAllCoupons);
    app.get('/api/v1/admin/coupons/:id', [authJwt.isAdmin], auth.getCouponById);
    app.put('/api/v1/admin/coupons/:id', [authJwt.isAdmin], auth.updateCouponById);
    app.delete('/api/v1/admin/coupons/:id', [authJwt.isAdmin], auth.deleteCouponById);
    app.post('/api/v1/admin/carImages', [authJwt.isAdmin], referenceImage.array('image'), auth.createCarImage);
    app.get('/api/v1/admin/carImages', [authJwt.isAdmin], auth.getAllCarImages);
    app.get('/api/v1/admin/carImages/:carImageId', [authJwt.isAdmin], auth.getCarImageById);
    app.put('/api/v1/admin/carImages/:carImageId', [authJwt.isAdmin], referenceImage.array('image'), auth.updateCarImageTipsById);
    app.delete('/api/v1/admin/carImages/:carImageId', [authJwt.isAdmin], auth.deleteCarImageById);
    app.post('/api/v1/admin/cars/add', [authJwt.isAdmin], auth.createCar);
    app.get('/api/v1/admin/cars', [authJwt.isAdmin], auth.getAllAddedCars);
    app.get('/api/v1/admin/car/allCars', [authJwt.isAdmin], auth.getAllCars);
    app.get('/api/v1/admin/cars/:carId', [authJwt.isAdmin], auth.getCarById);
    app.put('/api/v1/admin/cars/:carId', [authJwt.isAdmin], auth.updateCarById);
    app.delete('/api/v1/admin/cars/:carId', [authJwt.isAdmin], auth.deleteCarById);
    app.put('/api/v1/admin/cars/:carId/documents', [authJwt.isAdmin], kpUpload0, auth.updateCarDocuments);
    app.put('/api/v1/admin/:carId/updateDLDetails', [authJwt.isAdmin], kpUpload, auth.updateDLDetails);
    app.put('/api/v1/admin/:carId/updateAddressProof', [authJwt.isAdmin], addressPrrof.single('image'), auth.updateAddressProof);
    app.put('/api/v1/admin/:carId/uploadCarImages', [authJwt.isAdmin], carImage.array('image', 15), auth.uploadCarImages);
    app.put('/api/v1/admin/:carId/images/:imageId', [authJwt.isAdmin], carImage.single('image'), auth.updateCarImageById);
    app.get('/api/v1/admin/car/partnerCars/:partnerId', [authJwt.isAdmin], auth.getCarsForPartner);
    app.post('/api/v1/admin/locations/create', [authJwt.isAdmin], auth.createLocation);
    app.get('/api/v1/admin/locations/getAll', [authJwt.isAdmin], auth.getAllLocations);
    app.get('/api/v1/admin/locations/getAllByCar', [authJwt.isAdmin], auth.getAllLocationsByCar);
    app.get('/api/v1/admin/locations/:locationId', [authJwt.isAdmin], auth.getLocationById);
    app.put('/api/v1/admin/locations/:locationId', [authJwt.isAdmin], auth.updateLocationById);
    app.delete('/api/v1/admin/locations/:locationId', [authJwt.isAdmin], auth.deleteLocationById);
    app.get('/api/v1/admin/locations/type/:type', [authJwt.isAdmin], auth.getLocationsByType);
    app.post('/api/v1/admin/policies', [authJwt.isAdmin], auth.createPolicy);
    app.get('/api/v1/admin/policies', [authJwt.isAdmin], auth.getAllFulfilmentPolicy);
    app.get('/api/v1/admin/policies/:id', [authJwt.isAdmin], auth.getPolicyById);
    app.put('/api/v1/admin/policies/:id', [authJwt.isAdmin], auth.updatePolicy);
    app.delete('/api/v1/admin/policies/:id', [authJwt.isAdmin], auth.deletePolicy);
    app.post('/api/v1/admin/cancellationPolicy', [authJwt.isAdmin], auth.createCancellationPolicy);
    app.get('/api/v1/admin/cancellationPolicy', [authJwt.isAdmin], auth.getAllCancellationPolicy);
    app.get('/api/v1/admin/cancellationPolicy/:id', [authJwt.isAdmin], auth.getCancellationPolicyById);
    app.put('/api/v1/admin/cancellationPolicy/:id', [authJwt.isAdmin], auth.updateCancellationPolicy);
    app.delete('/api/v1/admin/cancellationPolicy/:id', [authJwt.isAdmin], auth.deleteCancellationPolicy);
    app.get('/api/v1/admin/host/offers', [authJwt.isAdmin], auth.getAllOffers);
    app.get('/api/v1/admin/host/partner/:userId/offers', [authJwt.isAdmin], auth.getAllOffersForPartner);
    app.get('/api/v1/admin/host/cars/:carId/offers', [authJwt.isAdmin], auth.getOffersByCarId);
    app.get('/api/v1/admin/host/offers/:id', [authJwt.isAdmin], auth.getOfferById);
    app.post('/api/v1/admin/terms-and-conditions', [authJwt.isAdmin], auth.createTermAndCondition);
    app.get('/api/v1/admin/terms-and-conditions', [authJwt.isAdmin], auth.getAllTermAndCondition);
    app.get('/api/v1/admin/terms-and-conditions/:id', [authJwt.isAdmin], auth.getTermAndConditionById);
    app.put('/api/v1/admin/terms-and-conditions/:id', [authJwt.isAdmin], auth.updateTermAndConditionById);
    app.delete('/api/v1/admin/terms-and-conditions/:id', [authJwt.isAdmin], auth.deleteTermAndConditionById);
    app.post('/api/v1/admin/faqs/create', [authJwt.isAdmin], auth.createFAQ);
    app.get('/api/v1/admin/faqs', [authJwt.isAdmin], auth.getAllFAQs);
    app.get('/api/v1/admin/faqs/byType/:type', [authJwt.isAdmin], auth.getAllFAQsByType);
    app.get('/api/v1/admin/faqs/:id', [authJwt.isAdmin], auth.getFAQById);
    app.put('/api/v1/admin/faqs/:id', [authJwt.isAdmin], auth.updateFAQById);
    app.delete('/api/v1/admin/faqs/:id', [authJwt.isAdmin], auth.deleteFAQById);
    app.post('/api/v1/admin/AboutApps', [authJwt.isAdmin], auth.createAboutApps);
    app.get('/api/v1/admin/AboutApps', [authJwt.isAdmin], auth.getAllAboutApps);
    app.get('/api/v1/admin/AboutApps/:id', [authJwt.isAdmin], auth.getAboutAppsById);
    app.put('/api/v1/admin/AboutApps/:id', [authJwt.isAdmin], auth.updateAboutAppsById);
    app.delete('/api/v1/admin/AboutApps/:id', [authJwt.isAdmin], auth.deleteAboutAppsById);
    app.post('/api/v1/admin/Policy', [authJwt.isAdmin], auth.createPolicies);
    app.get('/api/v1/admin/Policy', [authJwt.isAdmin], auth.getAllPolicies);
    app.get('/api/v1/admin/Policy/:id', [authJwt.isAdmin], auth.getPoliciesById);
    app.put('/api/v1/admin/Policy/:id', [authJwt.isAdmin], auth.updatePoliciesById);
    app.delete('/api/v1/admin/Policy/:id', [authJwt.isAdmin], auth.deletePoliciesById);
    app.post('/api/v1/admin/mainCategories', [authJwt.isAdmin], auth.createMainCategory);
    app.get('/api/v1/admin/mainCategories', [authJwt.isAdmin], auth.getAllMainCategories);
    app.get('/api/v1/admin/mainCategories/:mainCategoryId', [authJwt.isAdmin], auth.getMainCategoryById);
    app.put('/api/v1/admin/mainCategories/:mainCategoryId', [authJwt.isAdmin], auth.updateMainCategory);
    app.delete('/api/v1/admin/mainCategories/:mainCategoryId', [authJwt.isAdmin], auth.deleteMainCategory);
    app.post('/api/v1/admin/categories', [authJwt.isAdmin], categoryImage.single('image'), auth.createCategory);
    app.get('/api/v1/admin/categories', [authJwt.isAdmin], auth.getAllCategories);
    app.get('/api/v1/admin/categories/:categoryId', [authJwt.isAdmin], auth.getCategoryById);
    app.put('/api/v1/admin/categories/:categoryId', [authJwt.isAdmin], categoryImage.single('image'), auth.updateCategory);
    app.delete('/api/v1/admin/categories/:categoryId', [authJwt.isAdmin], auth.deleteCategory);
    app.post('/api/v1/admin/subscriptionCategory', [authJwt.isAdmin], auth.createSubscriptionCategory);
    app.get('/api/v1/admin/subscriptionCategory', [authJwt.isAdmin], auth.getAllSubscriptionCategories);
    app.get('/api/v1/admin/subscriptionCategory/:subscriptioncategoryId', [authJwt.isAdmin], auth.getSubscriptionCategoryById);
    app.put('/api/v1/admin/subscriptionCategory/:subscriptioncategoryId', [authJwt.isAdmin], auth.updateSubscriptionCategory);
    app.delete('/api/v1/admin/subscriptionCategory/:subscriptioncategoryId', [authJwt.isAdmin], auth.deleteSubscriptionCategory);
    app.post('/api/v1/admin/offers', [authJwt.isAdmin], auth.createOffer);
    app.get('/api/v1/admin/offers', [authJwt.isAdmin], auth.getAllOffers);
    app.get('/api/v1/admin/offers/:id', [authJwt.isAdmin], auth.getOfferById);
    app.put('/api/v1/admin/offers/:id', [authJwt.isAdmin], auth.updateOfferById);
    app.delete('/api/v1/admin/offers/:id', [authJwt.isAdmin], auth.deleteOfferById);
    app.post('/api/v1/admin/car-prices', [authJwt.isAdmin], auth.createAdminCarPrice);
    app.get('/api/v1/admin/car-prices', [authJwt.isAdmin], auth.getAllAdminCarPrices);
    app.get('/api/v1/admin/car-prices/:id', [authJwt.isAdmin], auth.getAdminCarPriceById);
    app.put('/api/v1/admin/car-prices/:id', [authJwt.isAdmin], auth.updateAdminCarPriceById);
    app.delete('/api/v1/admin/car-prices/:id', [authJwt.isAdmin], auth.deleteAdminCarPriceById);
    app.post('/api/v1/admin/plans', [authJwt.isAdmin], auth.createPlan);
    app.get('/api/v1/admin/plans', [authJwt.isAdmin], auth.getAllPlans);
    app.get('/api/v1/admin/plans/:id', [authJwt.isAdmin], auth.getPlanById);
    app.get('/api/v1/admin/plans/mainCategory/:mainCategory', [authJwt.isAdmin], auth.getPlanByMainCategory);
    app.put('/api/v1/admin/plans/:id', [authJwt.isAdmin], auth.updatePlan);
    app.delete('/api/v1/admin/plans/:id', [authJwt.isAdmin], auth.deletePlanById);
    app.post('/api/v1/admin/admin-packages', [authJwt.isAdmin], auth.createAdminPackage);
    app.get('/api/v1/admin/admin-packages', [authJwt.isAdmin], auth.getAllAdminPackages);
    app.get('/api/v1/admin/admin-packages/:id', [authJwt.isAdmin], auth.getAdminPackageById);
    app.put('/api/v1/admin/admin-packages/:id', [authJwt.isAdmin], auth.updateAdminPackage);
    app.delete('/api/v1/admin/admin-packages/:id', [authJwt.isAdmin], auth.deleteAdminPackage);
    app.post('/api/v1/admin/prices', [authJwt.isAdmin], auth.createPrice);
    app.get('/api/v1/admin/prices', [authJwt.isAdmin], auth.getAllPrices);
    app.get('/api/v1/admin/prices/:id', [authJwt.isAdmin], auth.getPriceById);
    app.put('/api/v1/admin/prices/:id', [authJwt.isAdmin], auth.updatePriceById);
    app.delete('/api/v1/admin/prices/:id', [authJwt.isAdmin], auth.deletePriceById);
    app.post('/api/v1/admin/driverPrices', [authJwt.isAdmin], auth.createDriverPrice);
    app.get('/api/v1/admin/driverPrices', [authJwt.isAdmin], auth.getAllDriverPrice);
    app.get('/api/v1/admin/driverPrices/:id', [authJwt.isAdmin], auth.getDriverPriceById);
    app.put('/api/v1/admin/driverPrices/:id', [authJwt.isAdmin], auth.updateDriverPriceById);
    app.delete('/api/v1/admin/driverPrices/:id', [authJwt.isAdmin], auth.deleteDriverPriceById);
    app.post('/api/v1/admin/cancel-reasons', [authJwt.isAdmin], auth.createCancelReason);
    app.get('/api/v1/admin/cancel-reasons', [authJwt.isAdmin], auth.getAllCancelReasons);
    app.get('/api/v1/admin/cancel-reasons/:id', [authJwt.isAdmin], auth.getCancelReasonById);
    app.put('/api/v1/admin/cancel-reasons/:id', [authJwt.isAdmin], auth.updateCancelReasonById);
    app.delete('/api/v1/admin/cancel-reasons/:id', [authJwt.isAdmin], auth.deleteCancelReasonById);
    app.post('/api/v1/admin/refund-charges', [authJwt.isAdmin], auth.createRefundCharge);
    app.get('/api/v1/admin/refund-charges', [authJwt.isAdmin], auth.getAllRefundCharges);
    app.get('/api/v1/admin/refund-charges/:id', [authJwt.isAdmin], auth.getRefundChargeById);
    app.put('/api/v1/admin/refund-charges/:id', [authJwt.isAdmin], auth.updateRefundChargeById);
    app.delete('/api/v1/admin/refund-charges/:id', [authJwt.isAdmin], auth.deleteRefundChargeById);
    app.put('/api/v1/admin/bookings/updatePaymentStatus/:bookingId', [authJwt.isAdmin], auth.updateRefundPaymentStatus);
    app.get('/api/v1/admin/booking/:bookingId/refund', [authJwt.isAdmin], auth.getRefundStatusAndAmount);
    app.post('/api/v1/admin/subscriptions', [authJwt.isAdmin], auth.createSubscription);
    app.get('/api/v1/admin/subscriptions', [authJwt.isAdmin], auth.getAllSubscriptions);
    app.get('/api/v1/admin/subscriptions/:id', [authJwt.isAdmin], auth.getSubscriptionById);
    app.put('/api/v1/admin/subscriptions/:id', [authJwt.isAdmin], auth.updateSubscriptionById);
    app.delete('/api/v1/admin/subscriptions/:id', [authJwt.isAdmin], auth.deleteSubscriptionById);
    app.post('/api/v1/admin/options', [authJwt.isAdmin], auth.createOption);
    app.get('/api/v1/admin/options', [authJwt.isAdmin], auth.getAllOptions);
    app.get('/api/v1/admin/options/:id', [authJwt.isAdmin], auth.getOptionById);
    app.put('/api/v1/admin/options/:id', [authJwt.isAdmin], auth.updateOption);
    app.delete('/api/v1/admin/options/:id', [authJwt.isAdmin], auth.deleteOption);
    app.post('/api/v1/admin/subScription-faq/create', [authJwt.isAdmin], auth.createSubScriptionFAQ);
    app.get('/api/v1/admin/subScription-faq', [authJwt.isAdmin], auth.getAllSubScriptionFAQ);
    app.get('/api/v1/admin/subScription-faq/:id', [authJwt.isAdmin], auth.getSubScriptionFAQById);
    app.put('/api/v1/admin/subScription-faq/:id', [authJwt.isAdmin], auth.updateSubScriptionFAQById);
    app.delete('/api/v1/admin/subScription-faq/:id', [authJwt.isAdmin], auth.deleteSubScriptionFAQById);
    app.post('/api/v1/admin/addQuackCoin/:carId', [authJwt.isAdmin], auth.addQuackCoinByCarId);
    app.post('/api/v1/admin/call/us', [authJwt.isAdmin], auth.createCallUs);
    app.get('/api/v1/admin/call-us', [authJwt.isAdmin], auth.getAllCallUs);
    app.get('/api/v1/admin/call-us/:id', [authJwt.isAdmin], auth.getCallUsById);
    app.put('/api/v1/admin/call-us/:id', [authJwt.isAdmin], auth.updateCallUs);
    app.delete('/api/v1/admin/call-us/:id', [authJwt.isAdmin], auth.deleteCallUs);
    app.get('/api/v1/admin/feedback', [authJwt.isAdmin], auth.getAllFeedback);
    app.get('/api/v1/admin/feedback/:id', [authJwt.isAdmin], auth.getFeedbackById);
    app.delete('/api/v1/admin/feedback/:id', [authJwt.isAdmin], auth.deleteFeedback);
    app.post('/api/v1/admin/referral-bonus', [authJwt.isAdmin], auth.createReferralBonus);
    app.get('/api/v1/admin/referral-bonus', [authJwt.isAdmin], auth.getAllReferralBonuses);
    app.put('/api/v1/admin/referral-bonus/:id', [authJwt.isAdmin], auth.updateReferralBonus);
    app.delete('/api/v1/admin/referral-bonus/:id', [authJwt.isAdmin], auth.deleteReferralBonus);
    app.post('/api/v1/admin/tax-amount', [authJwt.isAdmin], auth.createTaxAmount);
    app.get('/api/v1/admin/tax-amount', [authJwt.isAdmin], auth.getAllTaxAmount);
    app.put('/api/v1/admin/tax-amount/:id', [authJwt.isAdmin], auth.updateTaxAmount);
    app.delete('/api/v1/admin/tax-amount/:id', [authJwt.isAdmin], auth.deleteTaxAmount);
    app.post('/api/v1/admin/referral-levels', [authJwt.isAdmin], auth.createReferralLevel);
    app.get('/api/v1/admin/referral-levels', [authJwt.isAdmin], auth.getAllReferralLevels);
    app.get('/api/v1/admin/referral-levels/:referralLevelId', [authJwt.isAdmin], auth.getReferralLevelById);
    app.put('/api/v1/admin/referral-levels/:referralLevelId', [authJwt.isAdmin], auth.updateReferralLevelById);
    app.delete('/api/v1/admin/referral-levels/:referralLevelId', [authJwt.isAdmin], auth.deleteReferralLevelById);
    app.get('/api/v1/admin/bookings', [authJwt.isAdmin], auth.getAllBookings);
    app.get('/api/v1/admin/bookings/user/:id', [authJwt.isAdmin], auth.getBookingsByUser);
    app.get('/api/v1/admin/bookings/:bookingId', [authJwt.isAdmin], auth.getBookingsById);
    app.get('/api/v1/admin/bookings/completed/user/:id', [authJwt.isAdmin], auth.getCompletedBookingsByUser);
    app.get('/api/v1/admin/bookings/upcoming/user/:id', [authJwt.isAdmin], auth.getUpcomingBookingsByUser);
    app.get('/api/v1/admin/bookings/partner/:id', [authJwt.isAdmin], auth.getBookingByPartnerId);
    app.get('/api/v1/admin/partner/top-all-booked-car', [authJwt.isAdmin], auth.getAllTopBookedCars);
    app.get('/api/v1/admin/partner/top-booked-car/:id', [authJwt.isAdmin], auth.getTopBookedCarsForPartner);
    app.get('/api/v1/admin/partner/upcoming-bookings/:id', [authJwt.isAdmin], auth.getUpcomingBookingsForPartner);
    app.get('/api/v1/admin/partner/completed-bookings/:id', [authJwt.isAdmin], auth.getCompletedBookingsForPartner);
    app.get('/api/v1/admin/partner/canceled-bookings/:id', [authJwt.isAdmin], auth.getCanceledBookingsForPartner);
    app.get('/api/v1/admin/partner/paymentFalied-bookings/:id', [authJwt.isAdmin], auth.getPaymentFaliedBookingsForPartner);
    app.get('/api/v1/admin/partner/approved-bookings/:id', [authJwt.isAdmin], auth.getApprovedBookingsForPartner);
    app.get('/api/v1/admin/partner/rejected-bookings/:id', [authJwt.isAdmin], auth.getRejectedBookingsForPartner);
    app.put('/api/v1/admin/bookings/:bookingId/prices', [authJwt.isAdmin], auth.updateBookingPrices);
    app.delete('/api/v1/admin/bookings/:bookingId/prices', [authJwt.isAdmin], auth.removeBookingPrices);
    app.post('/api/v1/admin/govt-tendor/add', [authJwt.isAdmin], auth.createTenderApplication);
    app.get('/api/v1/admin/govt-tendor', [authJwt.isAdmin], auth.getAllTenderApplications);
    app.get('/api/v1/admin/govt-tendor/:id', [authJwt.isAdmin], auth.getTenderApplicationById);
    app.put('/api/v1/admin/govt-tendor/:id', [authJwt.isAdmin], auth.updateTenderApplication);
    app.delete('/api/v1/admin/govt-tendor/:id', [authJwt.isAdmin], auth.deleteTenderApplication);
    app.post('/api/v1/admin/tds-amount', [authJwt.isAdmin], auth.createTdsAmount);
    app.get('/api/v1/admin/tds-amount', [authJwt.isAdmin], auth.getAllTdsAmount);
    app.put('/api/v1/admin/tds-amount/:id', [authJwt.isAdmin], auth.updateTdsAmount);
    app.delete('/api/v1/admin/tds-amount/:id', [authJwt.isAdmin], auth.deleteTdsAmount);
    app.post('/api/v1/admin/notifications', [authJwt.isAdmin], auth.createNotification);
    app.put('/api/v1/admin/notifications/:notificationId', [authJwt.isAdmin], auth.markNotificationAsRead);
    app.get('/api/v1/admin/notifications/user/:userId', [authJwt.isAdmin], auth.getNotificationsForUser);
    app.get('/api/v1/admin/notifications/user', [authJwt.isAdmin], auth.getAllNotificationsForUser);
    app.delete('/api/v1/admin/notifications/delete/all', [authJwt.isAdmin], auth.deleteAllNotifications);
    app.delete('/api/v1/admin/notifications/delete/:id', [authJwt.isAdmin], auth.deleteNotificationById);
    app.put('/api/v1/admin/users/:userId/roles', [authJwt.isAdmin], auth.updateUserRoles);
    app.post('/api/v1/admin/cars/gps', [authJwt.isAdmin], auth.createGPSData);
    app.get('/api/v1/admin/cars/getall/gps', [authJwt.isAdmin], auth.getAllCarGPSLocations);
    app.get('/api/v1/admin/cars/:carId/gps', [authJwt.isAdmin], auth.getGPSDataForCar);
    app.delete('/api/v1/admin/cars/:carId/gps', [authJwt.isAdmin], auth.deleteGPSDataForCar);
    app.get('/api/v1/user/direct-referrals/all', [authJwt.isAdmin], auth.getAllDirectReferralUsers);
    app.get('/api/v1/user/direct-referrals/:id', [authJwt.isAdmin], auth.getDirectReferralUsersByUserId);
    app.get('/api/v1/user/all-referrals/all', [authJwt.isAdmin], auth.getAllUserReferralDetails);
    app.get('/api/v1/user/all-referrals/:id', [authJwt.isAdmin], auth.getReferralDetailsByUserId);
    app.get('/api/v1/user/level-wise-income/all', [authJwt.isAdmin], auth.getAllUserReferralIncome);
    app.get('/api/v1/user/level-wise-income/:id', [authJwt.isAdmin], auth.getReferralIncomeByUserId);
    app.get('/api/v1/admin/transactions/user/:id', [authJwt.isAdmin], auth.getTransactionDetailsByUserId);
    app.get('/api/v1/admin/income/user/:id', [authJwt.verifyToken], auth.getIncomeDetailsByUserId);
    app.get('/api/v1/admin/all-ratings', [authJwt.isAdmin], auth.getAllRatingsForCars);
    app.get('/api/v1/admin/ratings/:carId', [authJwt.isAdmin], auth.getAllRatingsByCarId);
    app.get('/api/v1/admin/ratings/:carId/rating/:rating', [authJwt.isAdmin], auth.getRatingsByCarIdAndRating);
    app.put('/api/v1/admin/rating/update', [authJwt.isAdmin], auth.updateReview);
    app.get('/api/v1/admin/user/all-review', [authJwt.isAdmin], auth.getUserAllReview);
    app.get('/api/v1/admin/user/review/:hostId', [authJwt.isAdmin], auth.getUserReviewById);
    app.put('/api/v1/admin/user/review', [authJwt.isAdmin], auth.updateUserReview);
    app.post('/api/v1/admin/accessories/categories', [authJwt.isAdmin], accessoryCategoryImage.single('image'), auth.createAccessoryCategory);
    app.get('/api/v1/admin/accessories/categories', [authJwt.isAdmin], auth.getAllAccessoryCategories);
    app.get('/api/v1/admin/accessories/categories/:categoryId', [authJwt.isAdmin], auth.getAccessoryCategoryById);
    app.put('/api/v1/admin/accessories/categories/:categoryId', [authJwt.isAdmin], accessoryCategoryImage.single('image'), auth.updateAccessoryCategory);
    app.delete('/api/v1/admin/accessories/categories/:categoryId', [authJwt.isAdmin], auth.deleteAccessoryCategory);
    app.post('/api/v1/admin/accessories/add', [authJwt.isAdmin], accessoryImage.single('image'), auth.createAccessory);
    app.get('/api/v1/admin/accessories', [authJwt.isAdmin], auth.getAllAccessories);
    app.get('/api/v1/admin/accessories/:accessoryId', [authJwt.isAdmin], auth.getAccessoryById);
    app.put('/api/v1/admin/accessories/:accessoryId', [authJwt.isAdmin], accessoryImage.single('image'), auth.updateAccessory);
    app.delete('/api/v1/admin/accessories/:accessoryId', [authJwt.isAdmin], auth.deleteAccessory);
    app.get('/api/v1/admin/accessories/category/:categoryId', [authJwt.isAdmin], auth.getAllAccessoriesByCategoryId);
    app.get('/api/v1/admin/order', [authJwt.isAdmin], auth.getAllOrders);
    app.get('/api/v1/admin/order/:orderId', [authJwt.isAdmin], auth.getOrderById);
    app.put('/api/v1/admin/order/:orderId', [authJwt.verifyToken], auth.updateOrder);
    app.delete('/api/v1/admin/order/:orderId', [authJwt.isAdmin], auth.deleteOrder);
    app.get('/api/v1/admin/allcount', [authJwt.isAdmin], auth.getAllCounts);
    app.get('/api/v1/admin/carallcount', [authJwt.isAdmin], auth.getAllCarCounts);
    app.get('/api/v1/admin/inspections', [authJwt.isAdmin], auth.getAllInspections);
    app.get('/api/v1/admin/inspections/byCarId/:carId', [authJwt.isAdmin], auth.getAllInspectionsByCarId);
    app.get('/api/v1/admin/inspections/:inspectionId', [authJwt.isAdmin], auth.getInspectionById);
    app.get('/api/v1/admin/exportUsers', [authJwt.isAdmin], auth.exportsData)




}