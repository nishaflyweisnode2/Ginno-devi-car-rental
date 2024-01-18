const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    licenseNumber: {
        type: String,
        unique: true,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
    },
    model: {
        type: String,
    },
    variant: {
        type: String,
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
    },
    yearOfRegistration: {
        type: Number,
    },
    fuelType: {
        type: String,
        enum: ['Diesel', 'Petrol', 'EV'],
    },
    transmissionType: {
        type: String,
        enum: ['Automatic', 'Manual'],
    },
    kmDriven: {
        type: Number,
    },
    chassisNumber: {
        type: String,
        unique: true,
    },
    sharingFrequency: {
        type: String,
        enum: ['0-10', '10-20', '20-25', '25+'],
        default: '0-10',
    },
    carDocuments: {
        type: String,
    },
    isCarDocumentsUpload: {
        type: Boolean,
        default: false
    },
    dlFront: {
        type: String,
    },
    dlBack: {
        type: String,
    },
    isDlUpload: {
        type: Boolean,
        default: false
    },
    addressProof: {
        name: {
            type: String,
        },
        email: {
            type: String,
        },
        yourAddress: {
            type: String,
        },
        mobileNumber: {
            type: String,
        },
        pincode: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        district: {
            type: String,
        },
        alternateMobileNumber: {
            type: String,
        },
        officeAddressProof: {
            type: String,
        },
        isUploadAddress: {
            type: Boolean,
            default: false,
        },
    },
    images: [
        {
            img: {
                type: String
            }
        }
    ],
    status: {
        type: Boolean,
        default: false,
    },
    isFastTag: {
        type: Boolean,
        default: false,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    depositMoney: {
        type: Number,
    },
    rentalPrice: {
        type: Number,
    },
    rentalExtendedPrice: {
        type: Number,
    },
    rentalStart: {
        type: Date,
        default: null,
    },
    rentalEnd: {
        type: Date,
        default: null,
    },
    rentalCount: {
        type: Number,
        default: 0,
    },
    isOnTrip: {
        type: Boolean,
        default: false,
    },
    pickup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
    },
    drop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
    },
   

}, { timestamps: true });

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
