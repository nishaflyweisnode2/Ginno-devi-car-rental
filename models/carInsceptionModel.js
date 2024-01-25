const mongoose = require('mongoose');

const InspectionModelSchema = new mongoose.Schema({
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
    },
    exteriors: {
        driverSide: {
            rearQuarterPanel: {
                condition: Boolean,
                images: [String],
            },
            rearTyre: {
                condition: Boolean,
                images: [String],
            },
            rearDoor: {
                condition: Boolean,
                images: [String],
            },
            rearWindow: {
                condition: Boolean,
                images: [String],
            },
            frontDoor: {
                condition: Boolean,
                images: [String],
            },
            rearViewMirror: {
                condition: Boolean,
                images: [String],
            },
            frontWindow: {
                condition: Boolean,
                images: [String],
            },
            frontTyre: {
                condition: Boolean,
                images: [String],
            },
            frontQuarterPanel: {
                condition: Boolean,
                images: [String],
            },
        },
        rear: {
            rearWindshield: {
                condition: Boolean,
                images: [String],
            },
            bootLid: {
                condition: Boolean,
                images: [String],
            },
            tailLights: {
                condition: Boolean,
                images: [String],
            },
            rearBumper: {
                condition: Boolean,
                images: [String],
            },
        },
        passengerSide: {
            frontQuarterPanel: {
                condition: Boolean,
                images: [String],
            },
            frontTyre: {
                condition: Boolean,
                images: [String],
            },
            rearViewMirror: {
                condition: Boolean,
                images: [String],
            },
            frontWindow: {
                condition: Boolean,
                images: [String],
            },
            frontDoor: {
                condition: Boolean,
                images: [String],
            },
            rearWindow: {
                condition: Boolean,
                images: [String],
            },
            rearDoor: {
                condition: Boolean,
                images: [String],
            },
            rearTyre: {
                condition: Boolean,
                images: [String],
            },
            rearQuarterPanel: {
                condition: Boolean,
                images: [String],
            },
        },
        front: {
            frontBumper: {
                condition: Boolean,
                images: [String],
            },
            bonnet: {
                condition: Boolean,
                images: [String],
            },
            windshield: {
                condition: Boolean,
                images: [String],
            },
            headlight: {
                condition: Boolean,
                images: [String],
            },
        },
    },
    interiors: {
        documents: {
            rcCard: Boolean,
            allIndiaPermit: Boolean,
            authorizationCertificate: Boolean,
            emissionTestCertificate: Boolean,
            insurancePolicy: Boolean,
            rentACabScheme: Boolean,
            validRoadTaxCertificate: Boolean,
        },
        essentials: {
            spareTyre: Boolean,
            jacksAndTools: Boolean,
            hornsWiperHeadlamps: Boolean,
            airConditioner: Boolean,
            musicSystem: Boolean,
            cleanInteriors: Boolean,
            carKeys: Boolean,
            carVideo: {
                videoUrl: String,
            },
            dashboardImage: {
                imageUrl: String,
            },
            totalKmsInDashboard: Number,
        },
    },
}, { timestamps: true });

const InspectionModel = mongoose.model('InspectionModel', InspectionModelSchema);

module.exports = InspectionModel;
