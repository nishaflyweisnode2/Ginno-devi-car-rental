const mongoose = require('mongoose');

const featureImageSchema = new mongoose.Schema({
    featureName: {
        type: String,
        required: true,
        unique: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const FeatureImage = mongoose.model('FeatureImage', featureImageSchema);

module.exports = FeatureImage;




















// const mongoose = require('mongoose');

// const carFeaturesSchema = new mongoose.Schema({
//     car: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Car',
//     },
//     totalAirbags: {
//         type: String,
//     },
//     airbags: {
//         type: Boolean,
//         default: false,
//     },
//     airbagsImage: {
//         type: String,
//     },
//     spareTyres: {
//         type: Boolean,
//         default: false,
//     },
//     spareTyresImage: {
//         type: String,
//     },
//     powerWindows: {
//         type: Boolean,
//         default: false,
//     },
//     powerWindowsImage: {
//         type: String,
//     },
//     powerSteering: {
//         type: Boolean,
//         default: false,
//     },
//     powerSteeringImage: {
//         type: String,
//     },
//     musicSystem: {
//         type: Boolean,
//         default: false,
//     },
//     musicSystemImage: {
//         type: String,
//     },
//     airConditioning: {
//         type: Boolean,
//         default: false,
//     },
//     airConditioningImage: {
//         type: String,
//     },
//     airFreshener: {
//         type: Boolean,
//         default: false,
//     },
//     airFreshenerImage: {
//         type: String,
//     },
//     sunroof: {
//         type: Boolean,
//         default: false,
//     },
//     sunroofImage: {
//         type: String,
//     },
//     toolkit: {
//         type: Boolean,
//         default: false,
//     },
//     toolkitImage: {
//         type: String,
//     },
//     auxInput: {
//         type: Boolean,
//         default: false,
//     },
//     auxInputImage: {
//         type: String,
//     },
//     auxCable: {
//         type: Boolean,
//         default: false,
//     },
//     auxCableImage: {
//         type: String,
//     },
//     bluetooth: {
//         type: Boolean,
//         default: false,
//     },
//     bluetoothImage: {
//         type: String,
//     },
//     reverseCamera: {
//         type: Boolean,
//         default: false,
//     },
//     reverseCameraImage: {
//         type: String,
//     },
//     childSeat: {
//         type: Boolean,
//         default: false,
//     },
//     childSeatImage: {
//         type: String,
//     },
//     petFriendly: {
//         type: Boolean,
//         default: false,
//     },
//     petFriendlyImage: {
//         type: String,
//     },
//     usbCharger: {
//         type: Boolean,
//         default: false,
//     },
//     usbChargerImage: {
//         type: String,
//     },
//     carrierOnTop: {
//         type: Boolean,
//         default: false,
//     },
//     carrierOnTopImage: {
//         type: String,
//     },
//     fullBootSpace: {
//         type: Boolean,
//         default: false,
//     },
//     fullBootSpaceImage: {
//         type: String,
//     },
//     electricORVM: {
//         type: Boolean,
//         default: false,
//     },
//     electricORVMImage: {
//         type: String,
//     },
//     keylessEntry: {
//         type: Boolean,
//         default: false,
//     },
//     keylessEntryImage: {
//         type: String,
//     },
//     pushButtonStart: {
//         type: Boolean,
//         default: false,
//     },
//     pushButtonStartImage: {
//         type: String,
//     },
//     adas: {
//         type: Boolean,
//         default: false,
//     },
//     adasImage: {
//         type: String,
//     },
//     abs: {
//         type: Boolean,
//         default: false,
//     },
//     absImage: {
//         type: String,
//     },
//     cruiseControl: {
//         type: Boolean,
//         default: false,
//     },
//     cruiseControlImage: {
//         type: String,
//     },
//     panoramicSunroof: {
//         type: Boolean,
//         default: false,
//     },
//     panoramicSunroofImage: {
//         type: String,
//     },
//     tractionControl: {
//         type: Boolean,
//         default: false,
//     },
//     tractionControlImage: {
//         type: String,
//     },
//     voiceControl: {
//         type: Boolean,
//         default: false,
//     },
//     voiceControlImage: {
//         type: String,
//     },
//     airPurifier: {
//         type: Boolean,
//         default: false,
//     },
//     airPurifierImage: {
//         type: String,
//     },
//     ventilatedFrontSeat: {
//         type: Boolean,
//         default: false,
//     },
//     ventilatedFrontSeatImage: {
//         type: String,
//     },
//     camera360View: {
//         type: Boolean,
//         default: false,
//     },
//     camera360ViewImage: {
//         type: String,
//     },
//     heatedSeats: {
//         type: Boolean,
//         default: false,
//     },
//     heatedSeatsImage: {
//         type: String,
//     },
//     heatedSteeringWheel: {
//         type: Boolean,
//         default: false,
//     },
//     heatedSteeringWheelImage: {
//         type: String,
//     },
//     memorySeats: {
//         type: Boolean,
//         default: false,
//     },
//     memorySeatsImage: {
//         type: String,
//     },
//     rainSensingWipers: {
//         type: Boolean,
//         default: false,
//     },
//     rainSensingWipersImage: {
//         type: String,
//     },
//     automaticHeadlights: {
//         type: Boolean,
//         default: false,
//     },
//     automaticHeadlightsImage: {
//         type: String,
//     },
//     laneDepartureWarning: {
//         type: Boolean,
//         default: false,
//     },
//     laneDepartureWarningImage: {
//         type: String,
//     },
//     blindSpotMonitoring: {
//         type: Boolean,
//         default: false,
//     },
//     blindSpotMonitoringImage: {
//         type: String,
//     },
//     collisionWarningSystem: {
//         type: Boolean,
//         default: false,
//     },
//     collisionWarningSystemImage: {
//         type: String,
//     },
//     ambientLighting: {
//         type: Boolean,
//         default: false,
//     },
//     ambientLightingImage: {
//         type: String,
//     },
//     wirelessCharging: {
//         type: Boolean,
//         default: false,
//     },
//     wirelessChargingImage: {
//         type: String,
//     },
//     describeCar: {
//         type: String,
//     },

// }, { timestamps: true });

// const CarFeatures = mongoose.model('CarFeatures', carFeaturesSchema);

// module.exports = CarFeatures;
