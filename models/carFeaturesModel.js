const mongoose = require('mongoose');

const carFeaturesSchema = new mongoose.Schema({
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
    },
    totalAirbags: {
        type: String,
    },
    airbags: {
        type: Boolean,
        default: false,
    },
    spareTyres: {
        type: Boolean,
        default: false,
    },
    powerWindows: {
        type: Boolean,
        default: false,
    },
    powerSteering: {
        type: Boolean,
        default: false,
    },
    musicSystem: {
        type: Boolean,
        default: false,
    },
    airConditioning: {
        type: Boolean,
        default: false,
    },
    airFreshener: {
        type: Boolean,
        default: false,
    },
    sunroof: {
        type: Boolean,
        default: false,
    },
    toolkit: {
        type: Boolean,
        default: false,
    },
    auxInput: {
        type: Boolean,
        default: false,
    },
    auxCable: {
        type: Boolean,
        default: false,
    },
    bluetooth: {
        type: Boolean,
        default: false,
    },
    reverseCamera: {
        type: Boolean,
        default: false,
    },
    childSeat: {
        type: Boolean,
        default: false,
    },
    petFriendly: {
        type: Boolean,
        default: false,
    },
    usbCharger: {
        type: Boolean,
        default: false,
    },
    carrierOnTop: {
        type: Boolean,
        default: false,
    },
    fullBootSpace: {
        type: Boolean,
        default: false,
    },
    electricORVM: {
        type: Boolean,
        default: false,
    },
    keylessEntry: {
        type: Boolean,
        default: false,
    },
    pushButtonStart: {
        type: Boolean,
        default: false,
    },
    adas: {
        type: Boolean,
        default: false,
    },
    abs: {
        type: Boolean,
        default: false,
    },
    cruiseControl: {
        type: Boolean,
        default: false,
    },
    panoramicSunroof: {
        type: Boolean,
        default: false,
    },
    tractionControl: {
        type: Boolean,
        default: false,
    },
    voiceControl: {
        type: Boolean,
        default: false,
    },
    airPurifier: {
        type: Boolean,
        default: false,
    },
    ventilatedFrontSeat: {
        type: Boolean,
        default: false,
    },
    camera360View: {
        type: Boolean,
        default: false,
    },
    heatedSeats: {
        type: Boolean,
        default: false,
    },
    heatedSteeringWheel: {
        type: Boolean,
        default: false,
    },
    memorySeats: {
        type: Boolean,
        default: false,
    },
    rainSensingWipers: {
        type: Boolean,
        default: false,
    },
    automaticHeadlights: {
        type: Boolean,
        default: false,
    },
    laneDepartureWarning: {
        type: Boolean,
        default: false,
    },
    blindSpotMonitoring: {
        type: Boolean,
        default: false,
    },
    collisionWarningSystem: {
        type: Boolean,
        default: false,
    },
    ambientLighting: {
        type: Boolean,
        default: false,
    },
    wirelessCharging: {
        type: Boolean,
        default: false,
    },
    describeCar: {
        type: String,
    },

}, { timestamps: true });

const CarFeatures = mongoose.model('CarFeatures', carFeaturesSchema);

module.exports = CarFeatures;
