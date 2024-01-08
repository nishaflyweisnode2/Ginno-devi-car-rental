const auth = require("../controllers/adminController");
const express = require("express");
const router = express()


const authJwt = require("../middlewares/auth");

const { profileImage, cityImage, brandImage, referenceImage, publishAddImage, animalMelaImage, animalFeedsImage, carDocumentImage, carDlImage, kpUpload, addressPrrof, carImage } = require('../middlewares/imageUpload');



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

}