const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp } = require('../controllers/otpController');

// Route to send OTP via encrypted user ID
router.get('/sendOtp', sendOtp);

// Route to verify OTP
router.post('/verifyOtp', verifyOtp);

module.exports = router;
