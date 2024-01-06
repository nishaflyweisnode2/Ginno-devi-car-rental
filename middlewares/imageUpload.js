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



module.exports = { profileImage, cityImage, brandImage, carDocumentImage, carDlImage, kpUpload, addressPrrof, carImage, referenceImage }