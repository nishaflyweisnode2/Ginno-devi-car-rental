const auth = require("../controllers/partnerController");
const express = require("express");
const router = express()


const authJwt = require("../middlewares/auth");

const { profileImage, carDocumentImage, kpUpload, addressPrrof, carImage, attachement } = require('../middlewares/imageUpload');



module.exports = (app) => {

    // api/v1/partner/

    app.post("/api/v1/partner/signup", auth.signup)
    app.post("/api/v1/partner/loginWithPhone", auth.loginWithPhone);
    app.post("/api/v1/partner/:id", auth.verifyOtp);
    app.post("/api/v1/partner/resendOtp/:id", auth.resendOTP);
    app.post('/api/v1/partner/socialLogin', auth.socialLogin);
    app.put("/api/v1/partner/upload-profile-picture", [authJwt.isPartner], profileImage.single('image'), auth.uploadProfilePicture);
    app.put("/api/v1/partner/edit-profile", [authJwt.isPartner], auth.editProfile);
    app.get("/api/v1/partner/profile", [authJwt.isPartner], auth.getUserProfile);
    app.get("/api/v1/partner/profile/:userId", [authJwt.isPartner], auth.getUserProfileById);
    app.put("/api/v1/partner/updateLocation", [authJwt.isPartner], auth.updateLocation);
    app.get("/api/v1/partner/city/cities", [authJwt.isPartner], auth.getAllCities);
    app.get("/api/v1/partner/city/cities/:id", [authJwt.isPartner], auth.getCityById);
    app.post('/api/v1/partner/cars/add', [authJwt.isPartner], auth.createCar);
    app.get('/api/v1/partner/cars', [authJwt.isPartner], auth.getAllCars);
    app.get('/api/v1/partner/cars/:carId', [authJwt.isPartner], auth.getCarById);
    app.put('/api/v1/partner/cars/:carId', [authJwt.isPartner], auth.updateCarById);
    app.delete('/api/v1/partner/cars/:carId', [authJwt.isPartner], auth.deleteCarById);
    app.put('/api/v1/partner/cars/:carId/documents', [authJwt.isPartner], carDocumentImage.single('image'), auth.updateCarDocuments);
    app.put('/api/v1/partner/:carId/updateDLDetails', [authJwt.isPartner], kpUpload, auth.updateDLDetails);
    app.put('/api/v1/partner/:carId/updateAddressProof', [authJwt.isPartner], addressPrrof.single('image'), auth.updateAddressProof);
    app.put('/api/v1/partner/:carId/uploadCarImages', [authJwt.isPartner], carImage.array('image', 15), auth.uploadCarImages);
    app.put('/api/v1/partner/:carId/images/:imageId', [authJwt.isPartner], carImage.single('image'), auth.updateCarImageById);
    app.get('/api/v1/partner/carImages', [authJwt.isPartner], auth.getAllCarImages);
    app.get('/api/v1/partner/carImages/:carImageId', [authJwt.isPartner], auth.getCarImageById);
    app.get('/api/v1/partner/car/partnerCars', [authJwt.isPartner], auth.getCarsForPartner);
    app.put('/api/v1/partner/cars/:carId/update-is-fast-tag', [authJwt.isPartner], auth.updateIsFastTag);
    app.get('/api/v1/partner/newly-listed', [authJwt.isPartner], auth.getNewlyListedCarsForPartner);
    app.post('/api/v1/partner/locations/create', [authJwt.isPartner], auth.createLocation);
    app.get('/api/v1/partner/locations/getAll', [authJwt.isPartner], auth.getAllLocations);
    app.get('/api/v1/partner/locations/getAllByCar', [authJwt.isPartner], auth.getAllLocationsByCar);
    app.get('/api/v1/partner/locations/:locationId', [authJwt.isPartner], auth.getLocationById);
    app.put('/api/v1/partner/locations/:locationId', [authJwt.isPartner], auth.updateLocationById);
    app.delete('/api/v1/partner/locations/:locationId', [authJwt.isPartner], auth.deleteLocationById);
    app.get('/api/v1/partner/locations/type/:type', [authJwt.isPartner], auth.getLocationsByType);
    app.get('/api/v1/partner/policies', [authJwt.isPartner], auth.getAllPolicies);
    app.get('/api/v1/partner/policies/:id', [authJwt.isPartner], auth.getPolicyById);
    app.get('/api/v1/partner/cancellationPolicy', [authJwt.isPartner], auth.getAllCancellationPolicy);
    app.get('/api/v1/partner/cancellationPolicy/:id', [authJwt.isPartner], auth.getCancellationPolicyById);
    app.post('/api/v1/partner/host/offers', [authJwt.isPartner], auth.createOffer);
    app.get('/api/v1/partner/host/offers', [authJwt.isPartner], auth.getAllOffers);
    app.get('/api/v1/partner/host/partner/offers', [authJwt.isPartner], auth.getAllOffersForPartner);
    app.get('/api/v1/partner/host/cars/:carId/offers', [authJwt.isPartner], auth.getOffersByCarId);
    app.get('/api/v1/partner/host/offers/:id', [authJwt.isPartner], auth.getOfferById);
    app.put('/api/v1/partner/host/offers/:id', [authJwt.isPartner], auth.updateOffer);
    app.put('/api/v1/partner/cars/:carId/offers/:offerId/updateFlags', [authJwt.isPartner], auth.updateOfferFlags);
    app.delete('/api/v1/partner/host/offers/:id', [authJwt.isPartner], auth.deleteOffer);
    app.post('/api/v1/partner/:carId/car-features', [authJwt.isPartner], auth.createCarFeature);
    app.get('/api/v1/partner/car-features', [authJwt.isPartner], auth.getAllCarFeatures);
    app.get('/api/v1/partner/car-features/:id', [authJwt.isPartner], auth.getCarFeatureById);
    app.put('/api/v1/partner/cars/:carId/car-features/:id', [authJwt.isPartner], auth.updateCarFeature);
    app.delete('/api/v1/partner/car-features/:id', [authJwt.isPartner], auth.deleteCarFeature);
    app.post('/api/v1/partner/contact/us', [authJwt.isPartner], attachement.single('image'), auth.createContactUs);
    app.get('/api/v1/partner/contact-us', [authJwt.isPartner], auth.getAllContactUsEntries);
    app.get('/api/v1/partner/contact-us/:id', [authJwt.isPartner], auth.getContactUsEntryById);
    app.put('/api/v1/partner/contact-us/:id', [authJwt.isPartner], attachement.single('image'), auth.updateContactUsEntry);
    app.delete('/api/v1/partner/contact-us/:id', [authJwt.isPartner], auth.deleteContactUsEntry);
    app.get('/api/v1/partner/terms-and-conditions', [authJwt.isPartner], auth.getAllTermAndCondition);
    app.get('/api/v1/partner/terms-and-conditions/:id', [authJwt.isPartner], auth.getTermAndConditionById);
    app.get('/api/v1/partner/faqs', [authJwt.isPartner], auth.getAllFAQs);
    app.get('/api/v1/partner/faqs/:id', [authJwt.isPartner], auth.getFAQById);
    app.get('/api/v1/partner/AboutApps', [authJwt.isPartner], auth.getAllAboutApps);
    app.get('/api/v1/partner/AboutApps/:id', [authJwt.isPartner], auth.getAboutAppsById);
    app.get('/api/v1/partner/Policy', [authJwt.isPartner], auth.getAllPolicy);
    app.get('/api/v1/partner/Policy/:id', [authJwt.isPartner], auth.getPolicyById);
    app.put('/api/v1/partner/cars/update/host-pricing', [authJwt.isPartner], auth.updateHostCarPricing);
    app.put('/api/v1/partner/cars/:id/update/host-pricing', [authJwt.isPartner], auth.updateHostCarPricingByCarId);
    app.get('/api/v1/partner/cars/host/pricing', [authJwt.isPartner], auth.getHostCarPricing);
    app.get('/api/v1/partner/upcoming-bookings', [authJwt.isPartner], auth.getUpcomingBookingsForPartner);
    app.get('/api/v1/partner/bookings/:bookingId', [authJwt.isPartner], auth.getBookingByIdForPartner);
    app.get('/api/v1/partner/completed-bookings', [authJwt.isPartner], auth.getCompletedBookingsForPartner);
    app.get('/api/v1/partner/canceled-bookings', [authJwt.isPartner], auth.getCanceledBookingsForPartner);
    app.get('/api/v1/partner/paymentFalied-bookings', [authJwt.isPartner], auth.getPaymentFaliedBookingsForPartner);
    app.put('/api/v1/partner/bookings/:bookingId/approve', [authJwt.isPartner], auth.approveBookingStatus);
    app.post("/api/v1/partner/bookings/verify/:bookingId", [authJwt.isPartner], auth.approveBookingVerifyOtp);
    app.post("/api/v1/partner/bookings/resendOtp/:id", [authJwt.isPartner], auth.approveBookingResendOTP);
    app.get('/api/v1/partner/approved-bookings', [authJwt.isPartner], auth.getApprovedBookingsForPartner);
    app.put('/api/v1/partner/bookings/:bookingId/reject', [authJwt.isPartner], auth.rejectBookingStatus);
    app.post("/api/v1/partner/bookings/cancleBooking/verify/:bookingId", [authJwt.isPartner], auth.rejectBookingVerifyOtp);
    app.post("/api/v1/partner/bookings/cancleBooking/resendOtp/:id", [authJwt.isPartner], auth.rejectBookingResendOTP);
    app.get('/api/v1/partner/rejected-bookings', [authJwt.isPartner], auth.getRejectedBookingsForPartner);
    app.put('/api/v1/partner/bookings/:bookingId/trip-end-details', [authJwt.isPartner], auth.updateTripEndDetails);
    app.post("/api/v1/partner/bookings/trip-end-details/verify/:bookingId", [authJwt.isPartner], auth.approveTripEndDetailsVerifyOtp);
    app.post("/api/v1/partner/bookings/trip-end-details/resendOtp/:id", [authJwt.isPartner], auth.approveTripEndDetailsResendOTP);

}