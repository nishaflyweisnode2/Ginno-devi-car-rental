var multer = require("multer");
require('dotenv').config()
const authConfig = require("../configs/auth.config");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: authConfig.cloud_name, api_key: authConfig.api_key, api_secret: authConfig.api_secret, });



const storage = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "GinnoDeviCar/profileImage", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const profileImage = multer({ storage: storage });
const storage1 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "GinnoDeviCar/brandImage", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const brandImage = multer({ storage: storage1 });
const storage2 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "GinnoDeviCar/cityImage", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF", "jiff", "JIFF", "jfif", "JFIF", "mp4", "MP4", "webm", "WEBM"], }, });
const cityImage = multer({ storage: storage2 });
const storage3 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "GinnoDeviCar/carDocumentImage", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF", "jiff", "JIFF", "jfif", "JFIF", "mp4", "MP4", "webm", "WEBM"], }, });
const carDocumentImage = multer({ storage: storage3 });
const storage4 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "GinnoDeviCar/carDlImage", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF", "jiff", "JIFF", "jfif", "JFIF", "mp4", "MP4", "webm", "WEBM"], }, });
const carDlImage = multer({ storage: storage4 });
var kpUpload = carDlImage.fields([
    { name: 'dlBack', maxCount: 1 },
    { name: 'dlFront', maxCount: 1 },
]);
const storage5 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "GinnoDeviCar/addressPrrof", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF", "jiff", "JIFF", "jfif", "JFIF", "mp4", "MP4", "webm", "WEBM"], }, });
const addressPrrof = multer({ storage: storage5 });
const storage6 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "GinnoDeviCar/carImage", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF", "jiff", "JIFF", "jfif", "JFIF", "mp4", "MP4", "webm", "WEBM"], }, });
const carImage = multer({ storage: storage6 });
const storage7 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "GinnoDeviCar/referenceImage", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF", "jiff", "JIFF", "jfif", "JFIF", "mp4", "MP4", "webm", "WEBM"], }, });
const referenceImage = multer({ storage: storage7 });
const storage8 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "GinnoDeviCar/attachement", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF", "jiff", "JIFF", "jfif", "JFIF", "mp4", "MP4", "webm", "WEBM"], }, });
const attachement = multer({ storage: storage8 });
const storage9 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "GinnoDeviCar/categoryImage", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const categoryImage = multer({ storage: storage9 });
const storage10 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "GinnoDeviCar/overAllImage", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const overAllImage = multer({ storage: storage10 });
const storage11 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "GinnoDeviCar/userProfile", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"], }, });
const userProfileUpload = multer({ storage: storage11 });
const storage12 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "GinnoDeviCar/cheque", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF", "jiff", "JIFF", "jfif", "JFIF", "mp4", "MP4", "webm", "WEBM"], }, });
const cheque = multer({ storage: storage12 })
const storage13 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "innoDeviCar/accessoryImage", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF", "jiff", "JIFF", "jfif", "JFIF", "mp4", "MP4", "webm", "WEBM"], }, });
const accessoryImage = multer({ storage: storage13 });
const storage14 = new CloudinaryStorage({ cloudinary: cloudinary, params: { folder: "Sajid-Bike-Backend/accessoryCategoryImage", allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF", "jiff", "JIFF", "jfif", "JFIF", "mp4", "MP4", "webm", "WEBM"], }, });
const accessoryCategoryImage = multer({ storage: storage14 });

module.exports = { profileImage, cityImage, brandImage, carDocumentImage, carDlImage, kpUpload, addressPrrof, carImage, referenceImage, attachement, categoryImage, overAllImage, userProfileUpload, cheque, accessoryCategoryImage, accessoryImage }