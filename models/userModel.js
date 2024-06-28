const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
    },
    mobileNumber: {
        type: String,
    },
    image: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    bio: {
        type: String,
    },
    occupation: {
        type: String,
    },
    otp: {
        type: String,
    },
    otpExpiration: {
        type: Date,
    },
    accountVerification: {
        type: Boolean,
        default: false
    },
    completeProfile: {
        type: Boolean,
        default: false,
    },
    currentLocation: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        },
    },
    state: {
        type: String
    },
    isState: {
        type: String,
        default: false
    },
    city: {
        type: String
    },
    isCity: {
        type: String,
        default: false
    },
    userType: {
        type: String,
        enum: ["ADMIN", "USER", "PARTNER", "SUB-ADMIN"],
        default: "USER"
    },
    uploadId: {
        aadharCardNo: {
          type: String,
          default: null,
        },
        frontImage: {
          type: String,
          default: null,
        },
        backImage: {
          type: String,
          default: null,
        },
        isAadharCardUpload: {
          type: Boolean,
          default: false
        },
        panNumber: {
          type: String
        },
        panName: {
          type: String
        },
        panImage: {
          type: String
        },
        isPanCardUpload: {
          type: Boolean,
          default: false
        },
      },
      bankDetails: {
        bankName: {
            type: String,
        },
        accountNumber: {
            type: String,
        },
        reAccountNumber: {
            type: String,
        },
        accountHolderName: {
            type: String,
        },
        ifscCode: {
            type: String,
        },
        cheque: {
            type: String,
        },
        isUploadbankDetails: {
            type: Boolean,
            default: false,
        },
    },
    refferalCode: {
        type: String,
    },
    referredBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    }],
    referralLevels: [{
        level: {
            type: Number,
        },
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }]
    }],
    wallet: {
        type: Number,
        default: 0,
    },
    carReferral: {
        type: Number,
        default: 0,
    },
    userReferral: {
        type: Number,
        default: 0,
    },
    royaltyReward: {
        type: Number,
        default: 0,
    },
    coin: {
        type: Number,
        default: 0,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    socialType: {
        type: String,
    },
    isDashBoard: {
        type: Boolean,
        default: false
    },
    isPrivacyPolicy: {
        type: Boolean,
        default: false
    },
    isOnBoardingManage: {
        type: Boolean,
        default: false
    },
    isCarManagement: {
        type: Boolean,
        default: false
    },
    isTermAndConditions: {
        type: Boolean,
        default: false
    },
    ismanageCustomer: {
        type: Boolean,
        default: false
    },
    isPushNotification: {
        type: Boolean,
        default: false
    },
    isManagePromoCode: {
        type: Boolean,
        default: false
    },
    isRoleAccessManage: {
        type: Boolean,
        default: false
    },
    role: [
        {
            type: String,
            enum: ["ADMIN", "USER", "PARTNER", "SUB-ADMIN"],
        }
    ],
    currentRole: {
        type: String,
        enum: ["ADMIN", "USER", "PARTNER", "SUB-ADMIN"],
    },

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
