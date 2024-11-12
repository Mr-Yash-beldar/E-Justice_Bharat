const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp,sendAdvocateOtp,verifyAdvocateOtp } = require('../controllers/otpController');

// Route to send OTP via encrypted user ID
router.get('/sendOtp', sendOtp);

router.get('/sendAdvocateOtp', sendAdvocateOtp);

// Route to verify OTP
router.post('/verifyOtp', verifyOtp);

router.post('/verifyAdvocateOtp', verifyAdvocateOtp);

module.exports = router;
