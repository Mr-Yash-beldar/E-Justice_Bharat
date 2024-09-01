const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    otp: {
        type: String
    },
    expiresAt: {
        type: Date
    }
});

const OTP = mongoose.model('OTP', otpSchema);
module.exports = OTP;
