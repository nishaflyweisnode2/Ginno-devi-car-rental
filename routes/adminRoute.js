const auth = require("../controllers/adminController");
const express = require("express");
const router = express()


const authJwt = require("../middlewares/auth");

const { profileImage, cityImage, brandImage, referenceImage, publishAddImage, animalMelaImage, animalFeedsImage, carDocumentImage, carDlImage, kpUpload, addressPrrof, carImage, categoryImage } = require('../middlewares/imageUpload');



module.exports = (app) => {

    // api/v1/admin/

    app.post("/api/v1/admin/registration", auth.registration);
    app.post("/api/v1/admin/login", auth.signin);
    app.put("/api/v1/admin/update", [authJwt.isAdmin], auth.update);
    app.get("/api/v1/admin/profile", [authJwt.isAdmin], auth.getAllUser);
    app.get("/api/v1/admin/profile/:userId", [authJwt.isAdmin], auth.getUserById);
    app.delete('/api/v1/admin/users/profile/delete/:id', [authJwt.isAdmin], auth.deleteUser);
    app.get('/api/v1/admin/users/pending-verification', [authJwt.isAdmin], auth.getPendingVerificationUsers);
    app.put('/api/v1/admin/users/:id/update-verification-status', [authJwt.isAdmin], auth.updateVerificationStatus);
    app.get('/api/v1/admin/verified-users', [authJwt.isAdmin], auth.getVerifiedUsers);
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
    app.put('/api/v1/admin/carImages/:carImageId', [authJwt.isAdmin], referenceImage.array('image'), auth.updateCarImageById);
    app.delete('/api/v1/admin/carImages/:carImageId', [authJwt.isAdmin], auth.deleteCarImageById);
    app.post('/api/v1/admin/cars/add', [authJwt.isAdmin], auth.createCar);
    app.get('/api/v1/admin/cars', [authJwt.isAdmin], auth.getAllAddedCars);
    app.get('/api/v1/admin/car/allCars', [authJwt.isAdmin], auth.getAllCars);
    app.get('/api/v1/admin/cars/:carId', [authJwt.isAdmin], auth.getCarById);
    app.put('/api/v1/admin/cars/:carId', [authJwt.isAdmin], auth.updateCarById);
    app.delete('/api/v1/admin/cars/:carId', [authJwt.isAdmin], auth.deleteCarById);
    app.put('/api/v1/admin/cars/:carId/documents', [authJwt.isAdmin], carDocumentImage.single('image'), auth.updateCarDocuments);
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
    app.get('/api/v1/admin/policies', [authJwt.isAdmin], auth.getAllPolicies);
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
    app.post('/api/v1/admin/categories', [authJwt.isAdmin], categoryImage.single('image'), auth.createCategory);
    app.get('/api/v1/admin/categories', [authJwt.isAdmin], auth.getAllCategories);
    app.get('/api/v1/admin/categories/:categoryId', [authJwt.isAdmin], auth.getCategoryById);
    app.put('/api/v1/admin/categories/:categoryId', [authJwt.isAdmin], categoryImage.single('image'), auth.updateCategory);
    app.delete('/api/v1/admin/categories/:categoryId', [authJwt.isAdmin], auth.deleteCategory);

}