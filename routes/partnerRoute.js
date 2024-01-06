const auth = require("../controllers/partnerController");
const express = require("express");
const router = express()


const authJwt = require("../middlewares/auth");

const { profileImage, publishAddImage, animalMelaImage, animalFeedsImage, carDocumentImage, carDlImage, kpUpload, addressPrrof, carImage } = require('../middlewares/imageUpload');



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
}