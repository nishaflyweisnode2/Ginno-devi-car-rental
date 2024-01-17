const auth = require("../controllers/userController");
const express = require("express");
const router = express()


const authJwt = require("../middlewares/auth");

const { profileImage, publishAddImage, animalMelaImage, animalFeedsImage } = require('../middlewares/imageUpload');



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

}
